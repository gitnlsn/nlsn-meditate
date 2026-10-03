import { requireOptionalNativeModule, type NativeModule } from 'expo-modules-core';

declare class PlayGamesModule extends NativeModule {
  /**
   * Whether the build carries a Play Games project id at all. False until the
   * id is set in app.json, and every other call then quietly does nothing.
   */
  isConfigured(): boolean;
  /** Whether the player is signed in — Play Games tries this itself at launch. */
  isAuthenticated(): Promise<boolean>;
  /** Asks the player to sign in. Resolves with whether they now are. */
  signIn(): Promise<boolean>;
  /** Unlocking one already unlocked is a no-op on Google's side. */
  unlock(achievementId: string): Promise<void>;
  /** Google keeps the best score per time span, so resubmitting is harmless. */
  submitScore(leaderboardId: string, score: number): Promise<void>;
  showAchievements(): Promise<void>;
  showLeaderboards(): Promise<void>;
}

/**
 * Null everywhere but Android: Play Games has no iOS or web SDK. Callers branch
 * on it, and the in-app progress works the same without it.
 */
export default requireOptionalNativeModule<PlayGamesModule>('PlayGames');
