/**
 * One step of a meditation, as the native service plays it.
 *
 * A session is a flat list of these. The list is handed over once, at the
 * start, and the service walks it on its own — which is the whole point: a
 * timeline held in JavaScript stops advancing the moment the screen goes off.
 */
export type TimelineItem =
  /** A spoken line. `cueIndex` points back at the segment the caption reads. */
  | { kind: 'clip'; uri: string; ms: number; cueIndex: number }
  /** A held silence. Generated natively, so it costs no asset. */
  | { kind: 'silence'; ms: number }
  /** The closing bell. */
  | { kind: 'gong'; uri: string; ms: number };

/**
 * Every item carries `ms` — how long it runs — even the clips, whose length the
 * manifest already knows. The service adds them up to report where the session
 * is overall, since a player only ever knows its position within the item it is
 * currently playing.
 */

export interface StartOptions {
  /** Identity for this sit, so recording it twice is harmless. */
  sessionId: string;
  /** What the whole timeline adds up to. Recorded with the finished session. */
  durationSeconds: number;
  items: TimelineItem[];
  /** 0..1, applied to the voice. */
  voiceVolume: number;
  /** The background bed, looped natively for as long as the session runs. */
  bedUri?: string;
  bedVolume?: number;
  /** Carried through to the completion record; guided sessions only. */
  meditationId?: string;
  title?: string;
}

export type SessionState = 'idle' | 'running' | 'paused' | 'complete';

/**
 * A sit the service saw through to its end.
 *
 * Written natively the instant the timeline finishes, then collected by the app
 * whenever it next runs. A session that ended while the app was asleep — or
 * after Android had killed it — is still in here.
 */
export interface CompletedSession {
  sessionId: string;
  /** Epoch ms the timeline ended. */
  endedAt: number;
  durationSeconds: number;
  meditationId?: string;
  title?: string;
}

/**
 * What the service is playing, asked rather than remembered.
 *
 * A session survives the app being rebuilt around it, so on the way back in the
 * screen has to find out where the meditation got to instead of assuming it
 * never started.
 */
export interface SessionSnapshot {
  sessionId: string;
  state: 'running' | 'paused';
  positionMs: number;
  index: number;
  cueIndex: number;
  durationSeconds: number;
  meditationId?: string | null;
  title?: string | null;
}

export interface ProgressEvent {
  positionMs: number;
}

export interface ItemChangedEvent {
  index: number;
  /** The segment being spoken, or -1 through a silence. */
  cueIndex: number;
}

export interface StateChangedEvent {
  state: SessionState;
}

export interface CompletedEvent {
  sessionId: string;
  endedAt: number;
}

/**
 * Something went wrong inside the service.
 *
 * Worth surfacing rather than swallowing: a clip that will not open stops the
 * whole meditation, and the likeliest cause is a bundled asset resolving to a
 * URI the player cannot read — which behaves differently in a release build than
 * in development, and so is exactly the kind of fault that only shows up late.
 */
export interface ErrorEvent {
  message: string;
}

export type MeditationSessionEvents = {
  onProgress: (event: ProgressEvent) => void;
  onItemChanged: (event: ItemChangedEvent) => void;
  onStateChanged: (event: StateChangedEvent) => void;
  onCompleted: (event: CompletedEvent) => void;
  onError: (event: ErrorEvent) => void;
};
