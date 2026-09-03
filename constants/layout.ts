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
