import { Tabs, router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStrings } from '@/contexts/locale-context';
import { useSessionGuard } from '@/hooks/use-session-guard';

/** Where each tab leads once leaving the timer has been confirmed. */
const TAB_PATHS = {
  guided: '/guided',
  history: '/history',
  settings: '/settings',
} as const;

type LeavableTab = keyof typeof TAB_PATHS;

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const s = useStrings();

  /*
   * The timer has no back button to intercept — it is a tab, and you leave it
   * by pressing another one. So the question the guided player asks on the way
   * out is asked here instead, on the press itself, and the tab you were
   * heading for is held until it is answered.
   */
  const { timerActive, endTimer } = useSessionGuard();
  const [pendingTab, setPendingTab] = useState<LeavableTab | null>(null);

  /*
   * Read through a ref, not the closure: screenListeners is built once per
   * screen and would otherwise go on seeing whatever the timer was doing at
   * that moment for the rest of the session.
   */
  const timerActiveRef = useRef(timerActive);
  useEffect(() => {
    timerActiveRef.current = timerActive;
  }, [timerActive]);

  const leave = () => {
    const tab = pendingTab;
    setPendingTab(null);
    endTimer();
    if (tab) router.navigate(TAB_PATHS[tab]);
  };

  return (
    <>
      <Tabs
        screenListeners={({ navigation, route }) => ({
          tabPress: (e) => {
            if (!(route.name in TAB_PATHS)) return; // heading *to* the timer
            if (!timerActiveRef.current) return;
            const state = navigation.getState();
            // Only leaving the timer counts; the other tabs have nothing running.
            if (state.routes[state.index]?.name !== 'index') return;
            e.preventDefault();
            setPendingTab(route.name as LeavableTab);
          },
        })}
        screenOptions={{
          tabBarActiveTintColor: colors.tint,
          headerShown: false,
          tabBarButton: HapticTab,
          /*
           * The bar came with three marks of its own, and the pale band above the
           * tabs was all of them at once: a hairline top border, a background
           * taken from the navigation theme's card colour rather than this app's
           * (pure white against #F7F8FA in light, near-black against the blue-grey
           * in dark), and an Android elevation shadow. None of them separate
           * anything here — the app is one flat colour throughout and the icons
           * already read as a bar — so the bar just sits on the same ground as
           * every screen above it.
           */
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopWidth: 0,
            elevation: 0,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: s.tabs.timer,
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="timer" color={color} />,
          }}
        />
        <Tabs.Screen
          name="guided"
          options={{
            title: s.tabs.guided,
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="waveform" color={color} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: s.tabs.history,
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: s.tabs.settings,
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
          }}
        />
      </Tabs>

      <ConfirmDialog
        visible={pendingTab !== null}
        title={s.session.endTitle}
        message={s.session.endMessage}
        confirmLabel={s.session.endConfirm}
        cancelLabel={s.session.endCancel}
        onConfirm={leave}
        onCancel={() => setPendingTab(null)}
      />
    </>
  );
}
