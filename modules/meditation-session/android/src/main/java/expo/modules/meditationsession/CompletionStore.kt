package expo.modules.meditationsession

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

/**
 * The record that a sit was seen through to its end.
 *
 * Written by the service, not by JavaScript, because the moment a meditation
 * ends is exactly the moment the app is least likely to be awake to notice. A
 * session that finished with the screen locked — or after Android had reclaimed
 * the app entirely — is still recorded here, and the app collects it whenever it
 * next runs.
 *
 * Nothing is written until the timeline actually ends, so a sit that was cut
 * short leaves nothing behind. That is the intended behaviour: an interrupted
 * meditation is not a meditation, and it should not appear in the calendar.
 */
internal object CompletionStore {
  private const val PREFS = "expo.modules.meditationsession.completions"
  private const val KEY = "pending"

  data class Completed(
    val sessionId: String,
    val endedAt: Long,
    val durationSeconds: Double,
    val meditationId: String?,
    val title: String?,
  )

  private fun prefs(context: Context) =
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

  @Synchronized
  fun record(context: Context, completed: Completed) {
    val existing = read(context)
    // The service can reach the end more than once for one sit if it is
    // restarted mid-teardown; the app dedupes too, but not writing it twice is
    // cheaper than reconciling it later.
    if (existing.any { it.sessionId == completed.sessionId }) return

    val array = JSONArray()
    for (item in existing + completed) {
      array.put(
        JSONObject().apply {
          put("sessionId", item.sessionId)
          put("endedAt", item.endedAt)
          put("durationSeconds", item.durationSeconds)
          item.meditationId?.let { put("meditationId", it) }
          item.title?.let { put("title", it) }
        }
      )
    }
    // commit, not apply: the process may be gone moments from now.
    prefs(context).edit().putString(KEY, array.toString()).commit()
  }

  @Synchronized
  fun read(context: Context): List<Completed> {
    val json = prefs(context).getString(KEY, null) ?: return emptyList()
    return try {
      val array = JSONArray(json)
      (0 until array.length()).mapNotNull { i ->
        val o = array.optJSONObject(i) ?: return@mapNotNull null
        Completed(
          sessionId = o.optString("sessionId").ifEmpty { return@mapNotNull null },
          endedAt = o.optLong("endedAt"),
          durationSeconds = o.optDouble("durationSeconds"),
          meditationId = if (o.has("meditationId")) o.optString("meditationId") else null,
          title = if (o.has("title")) o.optString("title") else null,
        )
      }
    } catch (e: Exception) {
      // Unreadable is the same as empty. Losing a record is bad; refusing to
      // start because of one is worse.
      emptyList()
    }
  }

  @Synchronized
  fun clear(context: Context) {
    prefs(context).edit().remove(KEY).commit()
  }
}
