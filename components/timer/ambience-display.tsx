import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { RingControl } from '@/components/timer/ring-control';
import { useRingMetrics } from '@/components/timer/ring-metrics';
import { SelectDialog } from '@/components/ui/select-dialog';
import { useAmbienceOptions } from '@/hooks/use-ambience-options';
import { useStrings } from '@/contexts/locale-context';

const MAX_FONT_SIZE = 15;
/**
 * Below this the name stops being readable, so it holds while everything around
 * it shrinks. A phone in landscape gives the ring its smallest size and this its
 * largest share of it.
 */
const MIN_FONT_SIZE = 11;
const LINE_HEIGHT_RATIO = 21 / 15;
const MAX_PADDING_X = 12;
const MAX_PADDING_Y = 5;

interface AmbienceDisplayProps {
  /** Whether the bed can be changed now — see RingControl. */
  editable?: boolean;
}

/**
 * The bed playing under the session, named under the clock inside the ring.
 *
 * It reads as what is playing rather than as a control, which is what it becomes
 * once the session starts: the pill goes and the name stays, the same way the
 * clock keeps its number. Subordinate to the clock in size and weight, since the
 * time is what you are looking at and this is what you are hearing.
 */
export function AmbienceDisplay({ editable }: AmbienceDisplayProps) {
  const { options, value, title, select } = useAmbienceOptions();
  const strings = useStrings();
  const { size, scale } = useRingMetrics();

  const [open, setOpen] = useState(false);

  const fontSize = Math.max(MIN_FONT_SIZE, Math.round(MAX_FONT_SIZE * scale));
  const lineHeight = Math.round(fontSize * LINE_HEIGHT_RATIO);

  return (
    <>
      <RingControl
        accessibilityLabel={`${strings.ambience.label}: ${title}`}
        onPress={() => setOpen(true)}
        editable={editable}
        lineHeight={lineHeight}
        paddingHorizontal={Math.round(MAX_PADDING_X * scale)}
        paddingVertical={Math.round(MAX_PADDING_Y * scale)}
        maxWidth={Math.round(size / Math.SQRT2)}>
        <ThemedText numberOfLines={1} style={[styles.name, { fontSize, lineHeight }]}>
          {title}
        </ThemedText>
      </RingControl>

      <SelectDialog
        visible={open}
        title={strings.ambience.label}
        options={options}
        value={value}
        onSelect={select}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  name: {
    fontWeight: '400',
    opacity: 0.6,
  },
});
