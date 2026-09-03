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
/** Title, the time being set, the buttons and padding, above and below the face. */
const DIALOG_CHROME_HEIGHT = 250;
const LABEL_SIZE = 48;

const numberRadius = (clockSize: number) => clockSize / 2.5;

const HOUR_LABELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTE_LABELS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

interface TimePickerModalProps {
  visible: boolean;
  onConfirm: (hour: number, minute: number) => void;
  onCancel: () => void;
}

function getAngle(x: number, y: number, center: number): number {
  const dx = x - center;
  const dy = y - center;
  let angle = Math.atan2(dx, -dy);
  if (angle < 0) angle += 2 * Math.PI;
  return angle;
}

function getHour(angle: number): number {
  const raw = Math.round((angle / (2 * Math.PI)) * 12);
  return raw === 0 ? 12 : raw;
}

function getMinuteValue(angle: number): number {
  const raw = Math.round((angle / (2 * Math.PI)) * 60);
  const snapped = Math.round(raw / 5) * 5;
  return snapped >= 60 ? 0 : snapped;
}

function getLabelPosition(index: number, isMinute: boolean, clockSize: number) {
  // Hours: index 0 = "1" at 1 o'clock (offset +1)
  // Minutes: index 0 = "00" at 12 o'clock (no offset)
  const center = clockSize / 2;
  const radius = numberRadius(clockSize);
  const slot = isMinute ? index : index + 1;
  const angle = (slot * 2 * Math.PI) / 12 - Math.PI / 2;
  const x = Math.round(center + radius * Math.cos(angle));
  const y = Math.round(center + radius * Math.sin(angle));
  return { x, y };
}

function hourToAngleDeg(hour: number): number {
  return -90 + hour * 30;
}

function minuteToAngleDeg(minute: number): number {
  return -90 + minute * 6;
}

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

export function TimePickerModal({
  visible,
  onConfirm,
  onCancel,
}: TimePickerModalProps) {
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

  const [phase, setPhase] = useState<'hour' | 'minute'>('hour');
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const lastHapticValue = useRef(9);

  // Reset state when modal opens
  const prevVisible = useRef(false);
  if (visible && !prevVisible.current) {
    setPhase('hour');
    setSelectedHour(9);
    setSelectedMinute(0);
    setPeriod('AM');
    lastHapticValue.current = 9;
  }
  prevVisible.current = visible;

  const handleTouch = useCallback(
    (locationX: number, locationY: number) => {
      const angle = getAngle(locationX, locationY, center);
      if (phase === 'hour') {
        const hour = getHour(angle);
        setSelectedHour(hour);
        if (hour !== lastHapticValue.current) {
          lastHapticValue.current = hour;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      } else {
        const minute = getMinuteValue(angle);
        setSelectedMinute(minute);
        if (minute !== lastHapticValue.current) {
          lastHapticValue.current = minute;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    },
    [phase, center],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          handleTouch(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
        },
        onPanResponderMove: (evt) => {
          handleTouch(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
        },
        onPanResponderRelease: () => {
          if (phase === 'hour') {
            setPhase('minute');
            lastHapticValue.current = -1;
          }
        },
      }),
    [handleTouch, phase],
  );

  const labels = phase === 'hour' ? HOUR_LABELS : MINUTE_LABELS;
  const selectorAngle =
    phase === 'hour'
      ? hourToAngleDeg(selectedHour)
      : minuteToAngleDeg(selectedMinute);

  const selectedValue = phase === 'hour' ? selectedHour : selectedMinute;

  function handleOk() {
    if (phase === 'hour') {
      setPhase('minute');
      lastHapticValue.current = -1;
    } else {
      const hour24 = (selectedHour % 12) + (period === 'PM' ? 12 : 0);
      onConfirm(hour24, selectedMinute);
    }
  }

  function handleCancel() {
    onCancel();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <Pressable style={styles.overlay} onPress={handleCancel}>
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
            <ThemedText style={styles.dialogTitle}>{strings.picker.selectTime}</ThemedText>

            {/* Time display with AM/PM */}
            <View style={styles.timeRow}>
              <View style={styles.timeDisplay}>
                <Pressable onPress={() => { setPhase('hour'); lastHapticValue.current = -1; }}>
                  <ThemedText
                    style={[
                      styles.timeDigit,
                      { color: phase === 'hour' ? colors.tint : colors.text },
                    ]}
                  >
                    {pad2(selectedHour)}
                  </ThemedText>
                </Pressable>
                <ThemedText style={styles.timeColon}>:</ThemedText>
                <Pressable onPress={() => { setPhase('minute'); lastHapticValue.current = -1; }}>
                  <ThemedText
                    style={[
                      styles.timeDigit,
                      { color: phase === 'minute' ? colors.tint : colors.text },
                    ]}
                  >
                    {pad2(selectedMinute)}
                  </ThemedText>
                </Pressable>
              </View>
              <View style={styles.periodRow}>
              <Pressable
                style={[
                  styles.periodButton,
                  {
                    backgroundColor:
                      period === 'AM' ? colors.tint : colors.chipBackground,
                    borderTopLeftRadius: 8,
                    borderBottomLeftRadius: 8,
                  },
                ]}
                onPress={() => setPeriod('AM')}
              >
                <ThemedText
                  style={[
                    styles.periodText,
                    { color: period === 'AM' ? colors.chipSelectedText : colors.text },
                  ]}
                >
                  AM
                </ThemedText>
              </Pressable>
              <Pressable
                style={[
                  styles.periodButton,
                  {
                    backgroundColor:
                      period === 'PM' ? colors.tint : colors.chipBackground,
                    borderTopRightRadius: 8,
                    borderBottomRightRadius: 8,
                  },
                ]}
                onPress={() => setPeriod('PM')}
              >
                <ThemedText
                  style={[
                    styles.periodText,
                    { color: period === 'PM' ? colors.chipSelectedText : colors.text },
                  ]}
                >
                  PM
                </ThemedText>
              </Pressable>
              </View>
            </View>

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
              {labels.map((value, index) => {
                const pos = getLabelPosition(index, phase === 'minute', clockSize);
                const isSelected = selectedValue === value;
                return (
                  <View
                    key={value}
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
                      {phase === 'minute' ? pad2(value) : value}
                    </ThemedText>
                  </View>
                );
              })}
            </View>

            {/* Button row */}
            <View style={styles.buttonRow}>
              <Pressable onPress={handleCancel} style={styles.button}>
                <ThemedText style={[styles.buttonText, { color: colors.tint }]}>
                  {strings.picker.cancel}
                </ThemedText>
              </Pressable>
              <Pressable onPress={handleOk} style={styles.button}>
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
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeDigit: {
    fontSize: 40,
    fontWeight: '300',
    lineHeight: 48,
  },
  timeColon: {
    fontSize: 40,
    fontWeight: '300',
    lineHeight: 48,
    marginHorizontal: 2,
  },
  periodRow: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
  },
  periodButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
  },
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
