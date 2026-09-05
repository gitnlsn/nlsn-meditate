import { requireOptionalNativeModule, type NativeModule } from 'expo-modules-core';

import type {
  CompletedSession,
  MeditationSessionEvents,
  SessionSnapshot,
  StartOptions,
} from './MeditationSession.types';

declare class MeditationSessionModule extends NativeModule<MeditationSessionEvents> {
  start(options: StartOptions): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  stop(): Promise<void>;
  /** Hand over every session the service finished, and forget them. */
  drainCompletions(): Promise<CompletedSession[]>;
  /** What is playing right now, or null. */
  getState(): Promise<SessionSnapshot | null>;
  /**
   * Whether progress events are worth sending. Turned off while the app is in
   * the background: nothing is drawing, and each event needlessly wakes the JS
   * thread the service was built to stop depending on.
   */
  setProgressUpdates(enabled: boolean): Promise<void>;
}

/**
 * Null on any platform without the native service — today, everything but
 * Android. Callers branch on it rather than crashing, so the app still builds
 * and runs elsewhere on the JavaScript timeline it used to use everywhere.
 */
export default requireOptionalNativeModule<MeditationSessionModule>('MeditationSession');
