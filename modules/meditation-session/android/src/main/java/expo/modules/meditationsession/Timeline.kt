package expo.modules.meditationsession

import android.content.Context
import androidx.media3.common.MediaItem
import androidx.media3.datasource.DefaultDataSource
import androidx.media3.exoplayer.source.MediaSource
import androidx.media3.exoplayer.source.ProgressiveMediaSource
import androidx.media3.exoplayer.source.SilenceMediaSource

/**
 * A meditation, laid out end to end.
 *
 * The app hands this over once and then stops being responsible for it. Silences
 * are not waits to be timed — they are stretches of the timeline, generated on
 * the spot by `SilenceMediaSource`, which is why they cost no asset and why they
 * keep running with the app asleep.
 */
internal data class TimelineItem(
  val kind: String,
  val uri: String?,
  val durationMs: Long,
  /** The segment a caption should show, or -1 through a silence. */
  val cueIndex: Int,
)

internal data class SessionSpec(
  val sessionId: String,
  val durationSeconds: Double,
  val items: List<TimelineItem>,
  val voiceVolume: Float,
  val bedUri: String?,
  val bedVolume: Float,
  val meditationId: String?,
  val title: String?,
) {
  /**
   * Where each item begins, measured from the start of the session.
   *
   * A player only ever knows how far into the current item it is, so reporting
   * overall position means adding back everything already behind it.
   */
  val startOffsetsMs: LongArray = LongArray(items.size).also { offsets ->
    var running = 0L
    items.forEachIndexed { i, item ->
      offsets[i] = running
      running += item.durationMs
    }
  }
}

internal fun buildMediaSources(context: Context, spec: SessionSpec): List<MediaSource> {
  val progressive = ProgressiveMediaSource.Factory(DefaultDataSource.Factory(context))
  return spec.items.map { item ->
    when (item.kind) {
      "silence" ->
        SilenceMediaSource.Factory()
          .setDurationUs(item.durationMs * 1_000)
          .createMediaSource()
      else ->
        progressive.createMediaSource(MediaItem.fromUri(requireNotNull(item.uri) {
          "a ${item.kind} item needs a uri"
        }))
    }
  }
}
