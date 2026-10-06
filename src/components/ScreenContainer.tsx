import React, {ReactNode} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {TVFocusGuideView} from '@amazon-devices/react-native-kepler';
import {colors, spacing, type} from '../theme/theme';
import {Navigation} from '../navigation/types';
import {FocusableButton} from './FocusableButton';

interface ScreenContainerProps {
  title: string;
  subtitle?: string;
  navigation?: Navigation;
  /** Show a Back control in the header when the stack can pop. */
  showBack?: boolean;
  children: ReactNode;
}

/**
 * Consistent 10-foot screen chrome: generous margins, a large title block,
 * and an optional Back control. Wraps content in a TVFocusGuideView so D-pad
 * focus is trapped sensibly per screen.
 */
export const ScreenContainer = ({
  title,
  subtitle,
  navigation,
  showBack = false,
  children,
}: ScreenContainerProps) => (
  <View style={styles.root}>
    <View style={styles.header}>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {showBack && navigation?.canGoBack ? (
        <FocusableButton
          label="‹ Back"
          onPress={navigation.goBack}
          testID="btn-back"
        />
      ) : null}
    </View>
    <TVFocusGuideView style={styles.body}>{children}</TVFocusGuideView>
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  titleBlock: {
    flex: 1,
    flexShrink: 1,
    paddingRight: spacing.lg,
  },
  title: {
    ...type.title,
    color: colors.textPrimary,
  },
  subtitle: {
    ...type.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  body: {
    flex: 1,
  },
});
