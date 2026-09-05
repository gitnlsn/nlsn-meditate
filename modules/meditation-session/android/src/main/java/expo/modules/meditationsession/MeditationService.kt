package expo.modules.meditationsession

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.media3.common.AudioAttributes
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.session.MediaSession
import androidx.media3.session.MediaSessionService

internal const val TAG = "MeditationSession"

/**
 * The meditation, running.
 *
 * Everything that used to live in JavaScript timers lives here instead. The
 * reason is not tidiness: on Android the display going dark stops vsync, and
 * React Native's timers ride the Choreographer, so a session sequenced in
 * JavaScript simply stops advancing the moment the screen locks. No service and
 * no permission brings those timers back — the timeline has to be somewhere the
 * OS will keep running, and a media playback service is that place.
 *
 * Two players: the voice walks the timeline, the bed loops underneath. Being a
 * foreground service is what stops Android reclaiming the app mid-sit, which
 * until now it was free to do.
 */
class MeditationService : MediaSessionService() {

  /**
   * What the module talks to.
   *
   * The service and the module share a process, so they find each other through
   * here rather than through binder round trips. `START_NOT_STICKY` keeps this
   * honest: the system never resurrects the service on its own, so a live
   * instance always has the session that created it.
   */
  internal companion object {
    @Volatile var instance: MeditationService? = null
    @Volatile var pendingSpec: SessionSpec? = null
    @Volatile var listener: Listener? = null

    const val CHANNEL_ID = "meditation-session"
    const val NOTIFICATION_ID = 8601
  }

  internal interface Listener {
    fun onItemChanged(index: Int, cueIndex: Int)
    fun onStateChanged(state: String)
    fun onProgress(positionMs: Long)
    fun onCompleted(sessionId: String, endedAt: Long)
    fun onError(message: String)
  }

  /**
   * Everything the service tells JavaScript goes through here.
   *
   * A null listener means nothing reaches the screen — no captions, no progress,
   * no completion — while the meditation itself plays on perfectly. That is a
   * confusing thing to look at, so it is logged rather than dropped in silence.
   */
  private fun emit(what: String, block: (Listener) -> Unit) {
    val target = listener
    if (target == null) {
      Log.w(TAG, "no listener attached; dropped $what")
      return
    }
    block(target)
  }

  private var player: ExoPlayer? = null
  private var bed: ExoPlayer? = null
  private var session: MediaSession? = null
  private var spec: SessionSpec? = null
  private var finished = false
  private var promoted = false

  private val handler = Handler(Looper.getMainLooper())
  private var progressEnabled = false
  private val progressTick = object : Runnable {
    override fun run() {
      if (!progressEnabled) return
      emit("onProgress") { it.onProgress(positionMs()) }
      handler.postDelayed(this, PROGRESS_INTERVAL_MS)
    }
  }

  override fun onCreate() {
    super.onCreate()
    instance = this
    createChannel()
    Log.i(TAG, "service created")
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    /*
     * Promoted before anything else is attempted.
     *
     * Android allows five seconds between startForegroundService() and
     * startForeground(), and kills the app outright if they are not met. Nothing
     * about preparing a player is guaranteed to fit in that budget — and if the
     * timeline turns out to be unplayable, Media3 would never post a
     * notification at all and the app would die for a reason that has nothing to
     * do with the real fault. So the promotion happens first, unconditionally,
     * and playback is set up inside a service that is already safe.
     */
    promote()

    val next = pendingSpec
    pendingSpec = null
    if (next != null) {
      startSession(next)
    } else if (spec == null) {
      Log.w(TAG, "started with nothing to play; standing down")
      stopSelf()
    }

    super.onStartCommand(intent, flags, startId)
    return START_NOT_STICKY
  }

  override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaSession? = session

  override fun onUpdateNotification(session: MediaSession, startInForegroundRequired: Boolean) {
    if (startInForegroundRequired) promote() else notifyOnly()
  }

  override fun onDestroy() {
    Log.i(TAG, "service destroyed")
    teardown()
    instance = null
    super.onDestroy()
  }

  /**
   * The user swiped the app away mid-sit.
   *
   * Taken as ending the session rather than as something to survive: they are
   * done, and a bed still playing from a dismissed app is a bug, not a feature.
   * Nothing is recorded, because the meditation did not finish.
   */
  override fun onTaskRemoved(rootIntent: Intent?) {
    Log.i(TAG, "task removed; ending the session")
    stopSession()
    stopSelf()
  }

  // MARK: - controls, called from the module

  internal fun startSession(next: SessionSpec) {
    Log.i(
      TAG,
      "start session=${next.sessionId} items=${next.items.size} " +
        "duration=${next.durationSeconds}s bed=${next.bedUri ?: "none"}",
    )
    next.items.forEachIndexed { i, item ->
      Log.d(TAG, "  [$i] ${item.kind} ${item.durationMs}ms cue=${item.cueIndex} ${item.uri ?: ""}")
    }

    teardown()
    spec = next
    finished = false

    val attributes = AudioAttributes.Builder()
      .setUsage(C.USAGE_MEDIA)
      .setContentType(C.AUDIO_CONTENT_TYPE_SPEECH)
      .build()

    val voice = ExoPlayer.Builder(this).build().apply {
      setAudioAttributes(attributes, /* handleAudioFocus = */ true)
      volume = next.voiceVolume
      setMediaSources(buildMediaSources(this@MeditationService, next))
      addListener(playerListener)
      prepare()
      play()
    }
    player = voice

    val built = MediaSession.Builder(this, voice)
      .setId("meditation-${next.sessionId}")
      .build()
    // Without this the service does not know it has a session, never asks for a
    // notification, and never reaches the foreground.
    addSession(built)
    session = built

    next.bedUri?.let { uri ->
      bed = ExoPlayer.Builder(this).build().apply {
        setAudioAttributes(attributes, /* handleAudioFocus = */ false)
        volume = next.bedVolume
        // The bed is mastered to loop on itself, so the OS can repeat it
        // forever without anything in the app having to notice the wrap.
        repeatMode = Player.REPEAT_MODE_ONE
        setMediaItem(MediaItem.fromUri(uri))
        addListener(bedListener)
        prepare()
        play()
      }
    }

    promote()
    emit("onStateChanged") { it.onStateChanged("running") }
    emit("onItemChanged") { it.onItemChanged(0, next.items.firstOrNull()?.cueIndex ?: -1) }
    startProgress()
  }

  internal fun pauseSession() {
    Log.i(TAG, "pause at ${positionMs()}ms")
    player?.pause()
    bed?.pause()
    stopProgress()
    emit("onStateChanged") { it.onStateChanged("paused") }
  }

  internal fun resumeSession() {
    Log.i(TAG, "resume at ${positionMs()}ms")
    player?.play()
    bed?.play()
    startProgress()
    emit("onStateChanged") { it.onStateChanged("running") }
  }

  internal fun stopSession() {
    Log.i(TAG, "stop at ${positionMs()}ms (session=${spec?.sessionId ?: "none"})")
    val had = spec != null
    teardown()
    if (had) emit("onStateChanged") { it.onStateChanged("idle") }
  }

  internal fun setProgressUpdates(enabled: Boolean) {
    if (enabled) startProgress() else stopProgress()
  }

  /**
   * What the service is doing right now, for a screen that has just appeared.
   *
   * The session outlives the app that started it — that is the whole point — so
   * a rebuilt JavaScript runtime comes back knowing nothing, while the
   * meditation carries on underneath. Without this it would show a play button
   * over a session already halfway through. Null when nothing is playing.
   */
  internal fun snapshot(): Map<String, Any?>? {
    val s = spec ?: return null
    val p = player ?: return null
    val index = p.currentMediaItemIndex
    return mapOf(
      "sessionId" to s.sessionId,
      "state" to if (p.playWhenReady) "running" else "paused",
      "positionMs" to positionMs().toDouble(),
      "index" to index,
      "cueIndex" to (s.items.getOrNull(index)?.cueIndex ?: -1),
      "durationSeconds" to s.durationSeconds,
      "meditationId" to s.meditationId,
      "title" to s.title,
    )
  }

  internal fun positionMs(): Long {
    val p = player ?: return 0
    val s = spec ?: return 0
    val offset = s.startOffsetsMs.getOrNull(p.currentMediaItemIndex) ?: return 0
    return offset + p.currentPosition.coerceAtLeast(0)
  }

  // MARK: - internals

  private fun teardown() {
    stopProgress()
    session?.let { removeSession(it); it.release() }
    session = null
    player?.let { it.removeListener(playerListener); it.release() }
    player = null
    bed?.let { it.removeListener(bedListener); it.release() }
    bed = null
    spec = null
  }

  private fun createChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    if (manager.getNotificationChannel(CHANNEL_ID) != null) return
    manager.createNotificationChannel(
      // Low importance: this notification exists so the system keeps the
      // session alive, not to interrupt anyone who is meditating.
      NotificationChannel(CHANNEL_ID, "Meditação", NotificationManager.IMPORTANCE_LOW).apply {
        setShowBadge(false)
        enableVibration(false)
        setSound(null, null)
      },
    )
  }

  private fun buildNotification() = NotificationCompat.Builder(this, CHANNEL_ID)
    .setSmallIcon(applicationInfo.icon)
    .setContentTitle(spec?.title ?: applicationInfo.loadLabel(packageManager))
    .setContentIntent(launchIntent())
    .setPriority(NotificationCompat.PRIORITY_LOW)
    .setOngoing(true)
    .setSilent(true)
    .build()

  private fun launchIntent(): PendingIntent? {
    val intent = packageManager.getLaunchIntentForPackage(packageName) ?: return null
    return PendingIntent.getActivity(
      this, 0, intent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
    )
  }

  private fun promote() {
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        startForeground(
          NOTIFICATION_ID,
          buildNotification(),
          ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK,
        )
      } else {
        startForeground(NOTIFICATION_ID, buildNotification())
      }
      if (!promoted) Log.i(TAG, "promoted to foreground")
      promoted = true
    } catch (e: Exception) {
      Log.e(TAG, "could not go foreground", e)
      emit("onError") { it.onError("foreground: ${e.message}") }
    }
  }

  private fun notifyOnly() {
    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    manager.notify(NOTIFICATION_ID, buildNotification())
  }

  private fun startProgress() {
    if (progressEnabled) return
    progressEnabled = true
    handler.post(progressTick)
  }

  private fun stopProgress() {
    progressEnabled = false
    handler.removeCallbacks(progressTick)
  }

  private val bedListener = object : Player.Listener {
    override fun onPlayerError(error: PlaybackException) {
      Log.e(TAG, "bed failed: ${error.errorCodeName}", error)
      emit("onError") { it.onError("bed: ${error.errorCodeName}") }
    }
  }

  private val playerListener = object : Player.Listener {
    override fun onMediaItemTransition(mediaItem: MediaItem?, reason: Int) {
      val p = player ?: return
      val s = spec ?: return
      val index = p.currentMediaItemIndex
      val item = s.items.getOrNull(index)
      Log.d(TAG, "item $index/${s.items.size} ${item?.kind} cue=${item?.cueIndex} reason=$reason")
      emit("onItemChanged") { it.onItemChanged(index, item?.cueIndex ?: -1) }
    }

    override fun onPlayerError(error: PlaybackException) {
      /*
       * A clip that will not open stops the whole meditation, so it is worth
       * being loud about. The most likely cause by far is the URI: bundled
       * assets resolve differently in a release build than in development.
       */
      val index = player?.currentMediaItemIndex ?: -1
      val item = spec?.items?.getOrNull(index)
      Log.e(TAG, "playback failed at item $index (${item?.kind} ${item?.uri}): ${error.errorCodeName}", error)
      emit("onError") { it.onError("${error.errorCodeName} at item $index: ${item?.uri ?: item?.kind}") }
    }

    override fun onPlaybackStateChanged(state: Int) {
      Log.d(TAG, "playback state ${stateName(state)}")
      if (state != Player.STATE_ENDED) return
      val s = spec ?: return
      if (finished) return
      finished = true

      val endedAt = System.currentTimeMillis()
      Log.i(TAG, "session=${s.sessionId} finished after ${s.durationSeconds}s; recording it")

      // Recorded here, on the spot, because this is the one moment the app
      // itself may well be gone. It is collected whenever the app next runs.
      CompletionStore.record(
        this@MeditationService,
        CompletionStore.Completed(
          sessionId = s.sessionId,
          endedAt = endedAt,
          durationSeconds = s.durationSeconds,
          meditationId = s.meditationId,
          title = s.title,
        ),
      )
      emit("onProgress") { it.onProgress((s.durationSeconds * 1000).toLong()) }
      emit("onCompleted") { it.onCompleted(s.sessionId, endedAt) }
      stopSession()
      stopSelf()
    }
  }
}

private fun stateName(state: Int) = when (state) {
  Player.STATE_IDLE -> "idle"
  Player.STATE_BUFFERING -> "buffering"
  Player.STATE_READY -> "ready"
  Player.STATE_ENDED -> "ended"
  else -> "unknown($state)"
}

private const val PROGRESS_INTERVAL_MS = 250L
