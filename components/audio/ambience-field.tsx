import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AMBIENCES, findAmbience } from '@/constants/ambiences';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAudioSettings, useUpdateAudioSettings } from '@/contexts/audio-settings-context';

const SILENCE_TITLE = 'Silêncio';

interface AmbienceFieldProps {
  label?: string;
}

/**
 * Picks the background bed.
 *
 * A row showing the current choice, opening a list of all of them. The previous
 * version was a horizontal strip of chips, which hid most of the options
 * off-screen — you could not see what was on offer without scrolling sideways,
 * and it cost a full row on every screen that used it. A field plus a dialog
 * costs one line, shows everything at once when open, and matches the picker
 * pattern the settings screen already uses.
 */
export function AmbienceField({ label = 'Som de fundo' }: AmbienceFieldProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { settings } = useAudioSettings();
  const update = useUpdateAudioSettings();

  const [open, setOpen] = useState(false);

  const current = findAmbience(settings.ambienceId);
  const options = [{ id: null as string | null, title: SILENCE_TITLE }, ...AMBIENCES];

  const select = (id: string | null) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    update({ ambienceId: id });
    setOpen(false);
  };

  return (
    <>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setOpen(true);
        }}
        style={({ pressed }) => [
          styles.field,
          {
            backgroundColor: colors.chipBackground,
            borderColor: colors.icon + '4D',
            opacity: pressed ? 0.7 : 1,
          },
        ]}>
        <ThemedText style={styles.label}>{label}</ThemedText>
        <View style={styles.value}>
          <ThemedText type="defaultSemiBold">{current?.title ?? SILENCE_TITLE}</ThemedText>
          <IconSymbol name="chevron.right" size={16} color={colors.icon} />
        </View>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable
            style={[styles.dialog, { backgroundColor: colors.background }]}
            onPress={(event) => event.stopPropagation()}>
            <ThemedText style={styles.dialogTitle}>{label}</ThemedText>

            <ScrollView style={styles.options}>
              {options.map((option) => {
                const selected = option.id === settings.ambienceId;
                return (
                  <Pressable
                    key={option.id ?? 'silence'}
                    onPress={() => select(option.id)}
                    style={({ pressed }) => [styles.option, { opacity: pressed ? 0.6 : 1 }]}>
                    <ThemedText style={selected ? undefined : styles.optionIdle}>
                      {option.title}
                    </ThemedText>
                    {selected && <IconSymbol name="checkmark" size={18} color={colors.tint} />}
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.buttonRow}>
              <Pressable style={styles.button} onPress={() => setOpen(false)}>
                <ThemedText style={[styles.buttonText, { color: colors.tint }]}>Fechar</ThemedText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  label: { opacity: 0.6 },
  value: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    borderRadius: 28,
    padding: 24,
    width: 320,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  // Capped so a long list scrolls inside the dialog instead of growing past the
  // screen; ten beds already overflow a small phone.
  options: { maxHeight: 380 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  optionIdle: { opacity: 0.7 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    marginTop: 12,
  },
  button: { paddingHorizontal: 12, paddingVertical: 8 },
  buttonText: { fontSize: 16, fontWeight: '500' },
});
