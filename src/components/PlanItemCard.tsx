import React, {useState} from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, radius, spacing, type} from '../theme/theme';
import {PlanItem} from '../services/types';

interface Props {
  planItem: PlanItem;
  index: number;
  onPlay: () => void;
  hasTVPreferredFocus?: boolean;
  testID?: string;
}

/**
 * A row in the composed evening: poster, title/meta, and the concierge's
 * rationale. The whole row is one focusable target that starts playback.
 */
export const PlanItemCard = ({
  planItem,
  index,
  onPlay,
  hasTVPreferredFocus,
  testID,
}: Props) => {
  const [focused, setFocused] = useState(false);
  const {item, reason} = planItem;

  return (
    <Pressable
      onPress={onPlay}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      hasTVPreferredFocus={hasTVPreferredFocus}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`Play ${item.title}, ${item.durationMin} minutes`}
      style={[styles.card, focused && styles.focused]}>
      <Image
        source={{uri: item.posterUrl}}
        style={styles.poster}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.step}>{`STEP ${index + 1}`}</Text>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.meta}>
          {`${item.durationMin} min · ${item.genres
            .filter((g) => g !== 'short')
            .join(' · ')}`}
        </Text>
        <Text style={styles.reason} numberOfLines={2}>
          {reason}
        </Text>
      </View>
      <View style={styles.playCol}>
        <Text style={[styles.play, focused && styles.playFocused]}>▶</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  focused: {
    backgroundColor: colors.cardFocused,
    borderColor: colors.focusRing,
    transform: [{scale: 1.02}],
  },
  poster: {
    width: 200,
    height: 112,
    borderRadius: radius.sm,
    backgroundColor: colors.bgElevated,
  },
  info: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  step: {
    ...type.caption,
    color: colors.accent,
    letterSpacing: 2,
  },
  title: {
    ...type.heading,
    color: colors.textPrimary,
  },
  meta: {
    ...type.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  reason: {
    ...type.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  playCol: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  play: {
    fontSize: 40,
    color: colors.textMuted,
  },
  playFocused: {
    color: colors.accent,
  },
});
