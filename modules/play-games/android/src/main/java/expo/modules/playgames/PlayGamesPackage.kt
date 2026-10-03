package expo.modules.playgames

import android.app.Application
import android.content.Context
import android.util.Log
import com.google.android.gms.games.PlayGamesSdk
import expo.modules.core.interfaces.ApplicationLifecycleListener
import expo.modules.core.interfaces.Package

/**
 * Starts the Play Games SDK with the application, which is where Google asks
 * for it to happen — it signs the player in automatically from there.
 *
 * Skipped when the build has no project id (see `isConfigured`), so a build
 * made before Play Console is set up runs exactly as it did without this.
 */
class PlayGamesPackage : Package {
  override fun createApplicationLifecycleListeners(context: Context): List<ApplicationLifecycleListener> =
    listOf(object : ApplicationLifecycleListener {
      override fun onCreate(application: Application) {
        if (!isConfigured(application)) {
          Log.i(TAG, "no Play Games project id in this build; not starting the SDK")
          return
        }
        PlayGamesSdk.initialize(application)
      }
    })
}

internal const val TAG = "PlayGames"
internal const val APP_ID_KEY = "com.google.android.gms.games.APP_ID"

/** Whether the manifest carries the project id the config plugin writes. */
internal fun isConfigured(context: Context): Boolean {
  val info = context.packageManager.getApplicationInfo(
    context.packageName,
    android.content.pm.PackageManager.GET_META_DATA,
  )
  return info.metaData?.get(APP_ID_KEY) != null
}
