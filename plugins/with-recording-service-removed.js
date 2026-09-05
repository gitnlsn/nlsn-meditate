const { withAndroidManifest } = require('expo/config-plugins');

const TOOLS_NAMESPACE = 'http://schemas.android.com/tools';
const RECORDING_SERVICE = 'expo.modules.audio.service.AudioRecordingService';

/**
 * Drops expo-audio's recording service from the merged manifest.
 *
 * expo-audio ships two foreground services and its own plugin only manages
 * permissions, so `recordAudioAndroid: false` strips RECORD_AUDIO but leaves the
 * `microphone` service declared. The app never records, and Play flags both
 * services as reachable from expo-notifications' BOOT_COMPLETED receiver — the
 * one that reschedules daily reminders after a reboot. A microphone service the
 * app cannot use is worth deleting rather than explaining.
 *
 * The playback service is left alone, though nothing here starts it: it only
 * runs if something calls `setActiveForLockScreen`, and nothing does. What keeps
 * a meditation running with the screen off is our own MeditationService, in
 * modules/meditation-session.
 *
 * `tools:node="remove"` is a merger instruction, so this cannot be done by
 * editing android/ — that directory is generated and gitignored.
 */
module.exports = function withRecordingServiceRemoved(config) {
  return withAndroidManifest(config, (config) => {
    const { manifest } = config.modResults;

    manifest.$['xmlns:tools'] = TOOLS_NAMESPACE;

    const application = manifest.application?.[0];
    if (!application) return config;

    application.service = application.service ?? [];
    const declared = application.service.some(
      (service) => service.$?.['android:name'] === RECORDING_SERVICE,
    );
    if (!declared) {
      application.service.push({
        $: { 'android:name': RECORDING_SERVICE, 'tools:node': 'remove' },
      });
    }

    return config;
  });
};
