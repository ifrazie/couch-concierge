import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, ViewStyle} from 'react-native';
import {colors, radius, spacing, type} from '../theme/theme';

export interface FocusableButtonProps {
  label: string;
  onPress: () => void;
  /** Renders as the primary accent-filled button when true. */
  primary?: boolean;
  hasTVPreferredFocus?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

/**
 * A D-pad-focusable button with a clear focus state, meeting the 48dp minimum
 * touch target. Every interactive control in the app routes through this so
 * focus behavior and styling stay consistent.
 */
export const FocusableButton = ({
  label,
  onPress,
  primary = false,
  hasTVPreferredFocus,
  disabled = false,
  style,
  testID,
  accessibilityLabel,
}: FocusableButtonProps) => {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      disabled={disabled}
      hasTVPreferredFocus={hasTVPreferredFocus}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={[
        styles.base,
        primary ? styles.primary : styles.secondary,
        focused && (primary ? styles.primaryFocused : styles.secondaryFocused),
        disabled && styles.disabled,
        style,
      ]}>
      <Text
        style={[
          styles.label,
          primary ? styles.primaryLabel : styles.secondaryLabel,
          focused && styles.labelFocused,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    minWidth: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: colors.card,
  },
  primaryFocused: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.focusRing,
    transform: [{scale: 1.06}],
  },
  secondaryFocused: {
    backgroundColor: colors.cardFocused,
    borderColor: colors.focusRing,
    transform: [{scale: 1.06}],
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    ...type.label,
  },
  primaryLabel: {
    color: '#111111',
  },
  secondaryLabel: {
    color: colors.textPrimary,
  },
  labelFocused: {
    color: colors.textPrimary,
  },
});
