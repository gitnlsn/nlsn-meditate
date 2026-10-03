package expo.modules.playgames

import android.app.Activity
import android.util.Log
import com.google.android.gms.games.PlayGames
import com.google.android.gms.tasks.Task
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * A thin bridge onto the Play Games v2 clients.
 *
 * Holds no state of its own: what to submit is worked out in JavaScript from
 * the history, and every call here is idempotent on Google's side, so the app
 * can simply resend the whole picture whenever it changes.
 */
class PlayGamesModule : Module() {

  private val configured by lazy {
    appContext.reactContext?.let { isConfigured(it) } ?: false
  }

  private fun activity(): Activity =
    appContext.currentActivity ?: throw CodedException("ERR_NO_ACTIVITY", "no activity to attach Play Games to", null)

  override fun definition() = ModuleDefinition {
    Name("PlayGames")

    Function("isConfigured") { configured }

    AsyncFunction("isAuthenticated") { promise: Promise ->
      if (!configured) return@AsyncFunction promise.resolve(false)
      PlayGames.getGamesSignInClient(activity()).isAuthenticated
        .addOnCompleteListener { task ->
          promise.resolve(task.isSuccessful && task.result.isAuthenticated)
        }
    }

    AsyncFunction("signIn") { promise: Promise ->
      if (!configured) return@AsyncFunction promise.resolve(false)
      PlayGames.getGamesSignInClient(activity()).signIn()
        .addOnCompleteListener { task ->
          if (!task.isSuccessful) Log.w(TAG, "sign-in failed", task.exception)
          promise.resolve(task.isSuccessful && task.result.isAuthenticated)
        }
    }

    AsyncFunction("unlock") { id: String ->
      if (configured) PlayGames.getAchievementsClient(activity()).unlock(id)
    }

    AsyncFunction("submitScore") { id: String, score: Double ->
      if (configured) PlayGames.getLeaderboardsClient(activity()).submitScore(id, score.toLong())
    }

    AsyncFunction("showAchievements") { promise: Promise ->
      launch(PlayGames.getAchievementsClient(activity()).achievementsIntent, promise)
    }

    AsyncFunction("showLeaderboards") { promise: Promise ->
      launch(PlayGames.getLeaderboardsClient(activity()).allLeaderboardsIntent, promise)
    }
  }

  /** Opens one of Google's own screens; there is nothing to read back from it. */
  private fun launch(intent: Task<android.content.Intent>, promise: Promise) {
    if (!configured) return promise.resolve(null)
    intent.addOnCompleteListener { task ->
      if (task.isSuccessful) {
        activity().startActivityForResult(task.result, REQUEST_CODE)
        promise.resolve(null)
      } else {
        promise.reject(CodedException("ERR_PLAY_GAMES_UI", "could not open Play Games", task.exception))
      }
    }
  }

  companion object {
    private const val REQUEST_CODE = 9003
  }
}
