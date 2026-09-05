package expo.modules.meditationsession

import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class TimelineItemRecord : Record {
  @Field var kind: String = "silence"
  @Field var uri: String? = null
  @Field var ms: Double = 0.0
  @Field var cueIndex: Int = -1
}

class StartOptionsRecord : Record {
  @Field var sessionId: String = ""
  @Field var durationSeconds: Double = 0.0
  @Field var items: List<TimelineItemRecord> = emptyList()
  @Field var voiceVolume: Double = 1.0
  @Field var bedUri: String? = null
  @Field var bedVolume: Double = 0.6
  @Field var meditationId: String? = null
  @Field var title: String? = null
}

/**
 * The app's handle on a meditation that runs without it.
 *
 * Deliberately thin. Everything the session depends on to reach its end lives in
 * `MeditationService`; what crosses back here is only what a screen needs in
 * order to draw — which line is being spoken, how far along we are — and one
 * message saying it finished. If this side of the boundary goes to sleep, and on
 * a locked Android device it will, nothing about the meditation is affected.
 */
class MeditationSessionModule : Module() {

  private val context: Context
    get() = requireNotNull(appContext.reactContext) { "module used without a react context" }

  /**
   * The running service, if there is one — and a note in the log when there is
   * not. A control that silently does nothing because the service went away is
   * worth seeing.
   */
  private fun service(what: String): MeditationService? {
    val running = MeditationService.instance
    Log.i(TAG, "$what (service=" + (if (running != null) "up" else "GONE") + ")")
    return running
  }

  override fun definition() = ModuleDefinition {
    Name("MeditationSession")

    Events("onProgress", "onItemChanged", "onStateChanged", "onCompleted", "onError")

    OnCreate {
      MeditationService.listener = object : MeditationService.Listener {
        override fun onItemChanged(index: Int, cueIndex: Int) {
          sendEvent("onItemChanged", mapOf("index" to index, "cueIndex" to cueIndex))
        }

        override fun onStateChanged(state: String) {
          sendEvent("onStateChanged", mapOf("state" to state))
        }

        override fun onProgress(positionMs: Long) {
          sendEvent("onProgress", mapOf("positionMs" to positionMs.toDouble()))
        }

        override fun onCompleted(sessionId: String, endedAt: Long) {
          sendEvent("onCompleted", mapOf("sessionId" to sessionId, "endedAt" to endedAt.toDouble()))
        }

        override fun onError(message: String) {
          sendEvent("onError", mapOf("message" to message))
        }
      }
    }

    OnDestroy {
      MeditationService.listener = null
    }

    AsyncFunction("start") { options: StartOptionsRecord ->
      val spec = SessionSpec(
        sessionId = options.sessionId,
        durationSeconds = options.durationSeconds,
        items = options.items.map {
          TimelineItem(
            kind = it.kind,
            uri = it.uri,
            durationMs = it.ms.toLong(),
            cueIndex = it.cueIndex,
          )
        },
        voiceVolume = options.voiceVolume.toFloat(),
        bedUri = options.bedUri,
        bedVolume = options.bedVolume.toFloat(),
        meditationId = options.meditationId,
        title = options.title,
      )

      val running = MeditationService.instance
      val where = if (running != null) "already running" else "cold start"
      Log.i(TAG, "start requested: session=" + spec.sessionId
        + " items=" + spec.items.size + " (" + where + ")")

      if (running != null) {
        running.startSession(spec)
      } else {
        // Always called from the foreground — the user just pressed play — so
        // starting a foreground service here is allowed.
        MeditationService.pendingSpec = spec
        val intent = Intent(context, MeditationService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          context.startForegroundService(intent)
        } else {
          context.startService(intent)
        }
      }

      // startForegroundService hands back a ComponentName, and whatever an
      // AsyncFunction evaluates to is what it tries to send across to
      // JavaScript. Returning nothing keeps the bridge out of it.
      return@AsyncFunction
    }.runOnQueue(Queues.MAIN)

    /*
     * Everything that touches a player runs on the main queue.
     *
     * ExoPlayer refuses to be used from anywhere else, and Expo runs an
     * AsyncFunction body on a background queue by default — so without this a
     * control throws "Player is accessed on the wrong thread" and the promise
     * rejects, while the meditation carries on playing underneath.
     *
     * Each of these ends in an explicit return.
     *
     * Whatever an AsyncFunction evaluates to is what it tries to send back to
     * JavaScript, and a safe call on a service that may not be running evaluates
     * to a nullable Unit, which has no representation to send. The promise then
     * rejects even though the control itself worked perfectly — a failure that
     * looks alarming and means nothing.
     */
    AsyncFunction("pause") {
      service("pause requested")?.pauseSession()
      Unit
    }.runOnQueue(Queues.MAIN)

    AsyncFunction("resume") {
      service("resume requested")?.resumeSession()
      Unit
    }.runOnQueue(Queues.MAIN)

    AsyncFunction("stop") {
      service("stop requested")?.let {
        it.stopSession()
        it.stopSelf()
      }
      MeditationService.pendingSpec = null
      Unit
    }.runOnQueue(Queues.MAIN)

    /**
     * What the service is playing, if anything.
     *
     * Asked on the way in, so a screen that has just been rebuilt can show the
     * session that never stopped rather than an idle player.
     */
    AsyncFunction("getState") { MeditationService.instance?.snapshot() }
      .runOnQueue(Queues.MAIN)

    AsyncFunction("setProgressUpdates") { enabled: Boolean ->
      MeditationService.instance?.setProgressUpdates(enabled)
      Unit
    }.runOnQueue(Queues.MAIN)

    /**
     * Hand over every sit the service finished, and forget them.
     *
     * Read-then-clear rather than clear-on-acknowledge: the app writes them to
     * its own history keyed by session id, so the worst a lost race can do is
     * record the same sit twice, which that key already makes harmless.
     */
    AsyncFunction("drainCompletions") {
      val completions = CompletionStore.read(context)
      CompletionStore.clear(context)
      Log.i(TAG, "drained " + completions.size + " finished session(s)")
      completions.map {
        mapOf(
          "sessionId" to it.sessionId,
          "endedAt" to it.endedAt.toDouble(),
          "durationSeconds" to it.durationSeconds,
          "meditationId" to it.meditationId,
          "title" to it.title,
        )
      }
    }
  }
}
