import { useState } from 'react';

import { FieldRow } from '@/components/ui/field-row';
import { ClockPickerModal } from '@/components/settings/clock-picker-modal';
import { useMeditation, useMeditationDispatch } from '@/contexts/meditation-context';
import { useStrings } from '@/contexts/locale-context';

/**
 * Sets how long an unguided session runs.
 *
 * Lives beside the timer rather than in settings: it is the one thing you choose
 * before sitting down, and the guided meditations — which carry their own
 * lengths — have had their own screen since they stopped sharing this one.
 *
 * Only editable while idle. Choosing a duration resets the timer, which is the
 * right thing when you are setting up and quietly destructive once you have
 * started, so mid-session the row shows what was chosen and declines the press.
 */
export function DurationField() {
  const { durationSeconds, timerState } = useMeditation();
  const dispatch = useMeditationDispatch();
  const strings = useStrings();

  const [pickerVisible, setPickerVisible] = useState(false);
  const minutes = durationSeconds / 60;

  return (
    <>
      <FieldRow
        title={strings.timer.sessionLength}
        value={strings.duration.minutes(minutes)}
        disabled={timerState !== 'idle'}
        onPress={() => setPickerVisible(true)}
      />
      <ClockPickerModal
        visible={pickerVisible}
        currentMinutes={minutes}
        onConfirm={(chosen) => {
          dispatch({ type: 'SET_DURATION', payload: chosen * 60 });
          setPickerVisible(false);
        }}
        onCancel={() => setPickerVisible(false)}
      />
    </>
  );
}
