/**
 * Which edges a tab screen insets itself against.
 *
 * Bottom is deliberately absent. The tab bar already reaches into the home
 * indicator's inset and pads its own contents clear of it, so a screen that
 * insets its bottom edge as well leaves a band of dead background standing above
 * the bar — invisible once the bar shares the app's colour, but still eating the
 * height. react-navigation does not zero that inset for its scenes, so each
 * screen has to decline it.
 *
 * Screens outside the tab navigator — the guided player, which is a stack route
 * with nothing below it — still want all four.
 */
export const TAB_SCREEN_EDGES = ['top', 'left', 'right'] as const;

/**
 * How wide a column of content is allowed to get.
 *
 * Android 16 ignores the portrait lock on large screens, so these layouts now
 * have to hold up on a tablet and an unfolded foldable. Left to stretch, a
 * centred timer drifts apart and a line of text runs the full width of the
 * slab; capped, the app reads the same at any size and simply sits in the
 * middle of a wider screen.
 */
export const CONTENT_MAX_WIDTH = 560;

/** Dialogs keep their phone width and gain a margin, rather than stretching. */
export const DIALOG_MAX_WIDTH = 320;
