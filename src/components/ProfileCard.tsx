import React, {useState} from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import {colors, radius, spacing, type} from '../theme/theme';
import {Profile} from '../services/types';

interface Props {
  profile: Profile;
  selected: boolean;
  onToggle: () => void;
  hasTVPreferredFocus?: boolean;
  testID?: string;
}

/** A focusable, toggle-able avatar card for the "who's watching" step. */
export const ProfileCard = ({
  profile,
  selected,
  onToggle,
  hasTVPreferredFocus,
  testID,
}: Props) => {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      onPress={onToggle}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      hasTVPreferredFocus={hasTVPreferredFocus}
      testID={testID}
      accessibilityRole="checkbox"
      accessibilityState={{checked: selected}}
      accessibilityLabel={`${profile.name}${selected ? ', selected' : ''}`}
      style={[
        styles.card,
        selected && styles.selected,
        focused && styles.focused,
      ]}>
      <Text style={styles.avatar}>{profile.avatar}</Text>
      <Text style={styles.name}>{profile.name}</Text>
      <Text style={styles.likes} numberOfLines={1}>
        {profile.likes.slice(0, 3).join(' · ')}
      </Text>
      {selected ? <Text style={styles.check}>✓</Text> : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 220,
    height: 260,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    padding: spacing.md,
    marginRight: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: colors.accent,
  },
  focused: {
    backgroundColor: colors.cardFocused,
    borderColor: colors.focusRing,
    transform: [{scale: 1.06}],
  },
  avatar: {
    fontSize: 84,
    lineHeight: 96,
  },
  name: {
    ...type.heading,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  likes: {
    ...type.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  check: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.md,
    ...type.heading,
    color: colors.accent,
  },
});
