import { useState, useRef, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  Pressable,
  PanResponder,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStrings } from '@/contexts/locale-context';
import { Colors } from '@/constants/theme';

const CLOCK_SIZE = 256;
const NUMBER_RADIUS = CLOCK_SIZE / 2.5; // ~102px
const LABEL_SIZE = 48;
const CENTER = CLOCK_SIZE / 2;
const LABELS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];

interface ClockPickerModalProps {
  visible: boolean;
  currentMinutes: number;
  onConfirm: (minutes: number) => void;
  onCancel: () => void;
}

function getAngle(x: number, y: number): number {
  // x, y relative to center; 12 o'clock = 0 degrees, clockwise positive
  const dx = x - CENTER;
  const dy = y - CENTER;
  let angle = Math.atan2(dx, -dy); // atan2(x, -y) gives angle from 12 o'clock clockwise
  if (angle < 0) angle += 2 * Math.PI;
  return angle;
}

function getMinutes(angle: number): number {
  const raw = Math.round((angle / (2 * Math.PI)) * 60);
  const snapped = Math.round(raw / 5) * 5;
  return snapped === 0 ? 60 : snapped;
}

function getLabelPosition(index: number) {
  // index 0 = 5 min, at 30 degrees (π/6) from 12 o'clock
  const angle = ((index + 1) * 2 * Math.PI) / 12 - Math.PI / 2;
  const x = Math.round(CENTER + NUMBER_RADIUS * Math.cos(angle));
  const y = Math.round(CENTER + NUMBER_RADIUS * Math.sin(angle));
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
      const angle = getAngle(locationX, locationY);
      const minutes = getMinutes(angle);
      setSelected(minutes);
      if (minutes !== lastHapticMinute.current) {
        lastHapticMinute.current = minutes;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [],
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
          <ThemedText style={styles.dialogTitle}>{strings.picker.selectDuration}</ThemedText>
          <ThemedText style={styles.selectedValue}>{strings.duration.minutes(selected)}</ThemedText>

          {/* Clock face */}
          <View
            style={[
              styles.clockFace,
              { backgroundColor: colors.chipBackground },
            ]}
            {...panResponder.panHandlers}
          >
            {/* Center dot */}
            <View
              style={[styles.centerDot, { backgroundColor: colors.progressRing }]}
            />

            {/* Selector arm */}
            <View
              style={[
                styles.selectorArm,
                {
                  backgroundColor: colors.progressRing,
                  width: NUMBER_RADIUS,
                  transform: [{ rotate: `${selectorAngle}deg` }],
                },
              ]}
            />

            {/* Number labels */}
            {LABELS.map((minutes, index) => {
              const pos = getLabelPosition(index);
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
  },
  dialog: {
    borderRadius: 28,
    padding: 24,
    width: 320,
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
  clockFace: {
    width: CLOCK_SIZE,
    height: CLOCK_SIZE,
    borderRadius: CLOCK_SIZE / 2,
    position: 'relative',
  },
  centerDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    left: CENTER - 4,
    top: CENTER - 4,
    zIndex: 2,
  },
  selectorArm: {
    position: 'absolute',
    height: 2,
    left: CENTER,
    top: CENTER - 1,
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
