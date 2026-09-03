import { useState, useRef, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  Pressable,
  PanResponder,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStrings } from '@/contexts/locale-context';
import { Colors } from '@/constants/theme';
import { DIALOG_MAX_WIDTH } from '@/constants/layout';

const MAX_CLOCK_SIZE = 256;
const MIN_CLOCK_SIZE = 176;
/** Title, selected value, buttons and padding, above and below the face. */
const DIALOG_CHROME_HEIGHT = 240;
const LABEL_SIZE = 48;
const LABELS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];

const numberRadius = (clockSize: number) => clockSize / 2.5;

interface ClockPickerModalProps {
  visible: boolean;
  currentMinutes: number;
  onConfirm: (minutes: number) => void;
  onCancel: () => void;
}

function getAngle(x: number, y: number, center: number): number {
  // x, y relative to center; 12 o'clock = 0 degrees, clockwise positive
  const dx = x - center;
  const dy = y - center;
  let angle = Math.atan2(dx, -dy); // atan2(x, -y) gives angle from 12 o'clock clockwise
  if (angle < 0) angle += 2 * Math.PI;
  return angle;
}

function getMinutes(angle: number): number {
  const raw = Math.round((angle / (2 * Math.PI)) * 60);
  const snapped = Math.round(raw / 5) * 5;
  return snapped === 0 ? 60 : snapped;
}

function getLabelPosition(index: number, clockSize: number) {
  // index 0 = 5 min, at 30 degrees (π/6) from 12 o'clock
  const center = clockSize / 2;
  const radius = numberRadius(clockSize);
  const angle = ((index + 1) * 2 * Math.PI) / 12 - Math.PI / 2;
  const x = Math.round(center + radius * Math.cos(angle));
  const y = Math.round(center + radius * Math.sin(angle));
  return { x, y };
}

export function ClockPickerModal({
  visible,
  currentMinutes,
  onConfirm,
  onCancel,
}: ClockPickerModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const strings = useStrings();
  const colors = Colors[colorScheme];

  /*
   * The face shrinks to fit rather than overflowing. Android 16 ignores the
   * portrait lock on large screens, so this dialog now has to open on a phone
   * held sideways, where the height left over after the title and buttons is
   * less than the face's full 256.
   */
  const { width, height } = useWindowDimensions();
  const clockSize = Math.round(
    Math.max(
      MIN_CLOCK_SIZE,
      Math.min(MAX_CLOCK_SIZE, width - 96, height - DIALOG_CHROME_HEIGHT),
    ),
  );
  const center = clockSize / 2;

  const [selected, setSelected] = useState(currentMinutes);
  const lastHapticMinute = useRef(currentMinutes);

  // Reset selected when modal opens with new value
  const prevVisible = useRef(false);
  if (visible && !prevVisible.current) {
    // Modal just opened
    setSelected(currentMinutes);
    lastHapticMinute.current = currentMinutes;
  }
  prevVisible.current = visible;

  const handleTouch = useCallback(
    (locationX: number, locationY: number) => {
      const angle = getAngle(locationX, locationY, center);
      const minutes = getMinutes(angle);
      setSelected(minutes);
      if (minutes !== lastHapticMinute.current) {
        lastHapticMinute.current = minutes;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [center],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          handleTouch(
            evt.nativeEvent.locationX,
            evt.nativeEvent.locationY,
          );
        },
        onPanResponderMove: (evt) => {
          handleTouch(
            evt.nativeEvent.locationX,
            evt.nativeEvent.locationY,
          );
        },
      }),
    [handleTouch],
  );

  const selectorAngle = -90 + selected * 6; // degrees, 12 o'clock = -90

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable
          style={[styles.dialog, { backgroundColor: colors.background }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/*
            * The face has a size below which its numbers stop being reachable,
            * so on a short screen the dialog scrolls rather than shrinking past
            * that and putting OK off the bottom. A drag on the face itself still
            * sets the time: a child pan responder wins the gesture over an
            * enclosing scroll view.
            */}
          <ScrollView
            contentContainerStyle={styles.dialogContent}
            showsVerticalScrollIndicator={false}
          >
            <ThemedText style={styles.dialogTitle}>{strings.picker.selectDuration}</ThemedText>
            <ThemedText style={styles.selectedValue}>{strings.duration.minutes(selected)}</ThemedText>

            {/* Clock face */}
            <View
              style={[
                styles.clockFace,
                {
                  backgroundColor: colors.chipBackground,
                  width: clockSize,
                  height: clockSize,
                  borderRadius: center,
                },
              ]}
              {...panResponder.panHandlers}
            >
              {/* Center dot */}
              <View
                style={[
                  styles.centerDot,
                  { backgroundColor: colors.progressRing, left: center - 4, top: center - 4 },
                ]}
              />

              {/* Selector arm */}
              <View
                style={[
                  styles.selectorArm,
                  {
                    backgroundColor: colors.progressRing,
                    width: numberRadius(clockSize),
                    left: center,
                    top: center - 1,
                    transform: [{ rotate: `${selectorAngle}deg` }],
                  },
                ]}
              />

              {/* Number labels */}
              {LABELS.map((minutes, index) => {
                const pos = getLabelPosition(index, clockSize);
                const isSelected = selected === minutes;
                return (
                  <View
                    key={minutes}
                    pointerEvents="none"
                    style={[
                      styles.labelContainer,
                      {
                        left: pos.x - LABEL_SIZE / 2,
                        top: pos.y - LABEL_SIZE / 2,
                        backgroundColor: isSelected
                          ? colors.progressRing
                          : 'transparent',
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.labelText,
                        {
                          color: isSelected
                            ? colors.chipSelectedText
                            : colors.text,
                        },
                      ]}
                    >
                      {minutes}
                    </ThemedText>
                  </View>
                );
              })}
            </View>

            {/* Button row */}
            <View style={styles.buttonRow}>
              <Pressable onPress={onCancel} style={styles.button}>
                <ThemedText style={[styles.buttonText, { color: colors.tint }]}>
                  {strings.picker.cancel}
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => onConfirm(selected)}
                style={styles.button}
              >
                <ThemedText style={[styles.buttonText, { color: colors.tint }]}>
                  {strings.picker.ok}
                </ThemedText>
              </Pressable>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  dialog: {
    borderRadius: 28,
    // Keeps its phone width and gains a margin on anything larger, rather than
    // stretching across a tablet.
    width: '100%',
    maxWidth: DIALOG_MAX_WIDTH,
    maxHeight: '100%',
    flexShrink: 1,
  },
  dialogContent: {
    padding: 24,
    alignItems: 'center',
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  selectedValue: {
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 40,
    marginBottom: 16,
  },
  // Sized in the render: the face shrinks with the window.
  clockFace: {
    position: 'relative',
  },
  centerDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    zIndex: 2,
  },
  selectorArm: {
    position: 'absolute',
    height: 2,
    transformOrigin: 'left center',
    zIndex: 1,
  },
  labelContainer: {
    position: 'absolute',
    width: LABEL_SIZE,
    height: LABEL_SIZE,
    borderRadius: LABEL_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    marginTop: 20,
    gap: 16,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
