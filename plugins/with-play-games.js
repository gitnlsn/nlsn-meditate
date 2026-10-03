const { AndroidConfig, withAndroidManifest, withStringsXml } = require('expo/config-plugins');

const APP_ID_KEY = 'com.google.android.gms.games.APP_ID';
const STRING_NAME = 'game_services_project_id';

/**
 * Hands the Play Games project id to the Android build.
 *
 * Play Games reads it from a manifest meta-data entry pointing at a string
 * resource — a number given straight in the manifest is parsed as one and
 * rejected. Both live in android/, which is generated and gitignored, so they
 * have to be written here.
 *
 * With no id (or the placeholder) nothing is written at all, and the native
 * module reports itself unconfigured rather than letting the SDK fail. That is
 * what lets the app build before Play Console has been set up.
 *
 * The id is the numeric "Project ID" on Play Console's Play Games Services
 * configuration page — see docs/play-games-setup.md.
 */
module.exports = function withPlayGames(config, { projectId } = {}) {
  const id = String(projectId ?? '').trim();
  if (!/^\d+$/.test(id)) return config;

  config = withStringsXml(config, (config) => {
    config.modResults = AndroidConfig.Strings.setStringItem(
      [{ $: { name: STRING_NAME, translatable: 'false' }, _: id }],
      config.modResults,
    );
    return config;
  });

  return withAndroidManifest(config, (config) => {
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);
    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      application,
      APP_ID_KEY,
      `@string/${STRING_NAME}`,
    );
    return config;
  });
};
