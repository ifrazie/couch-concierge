import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, spacing, type} from '../theme/theme';
import {Navigation} from '../navigation/types';
import {FocusableButton} from '../components/FocusableButton';

interface Props {
  navigation: Navigation;
}

/**
 * Landing screen: sets the premise and kicks off the flow with a single,
 * unmissable call to action (pre-focused for D-pad users).
 */
export const HomeScreen = ({navigation}: Props) => (
  <View style={styles.root}>
    <View style={styles.hero}>
      <Text style={styles.kicker}>COUCH CONCIERGE</Text>
      <Text style={styles.title}>What are we in the mood for tonight?</Text>
      <Text style={styles.subtitle}>
        Tell me who's watching and the vibe. I'll compose an evening that fits
        your time — and everyone on the couch.
      </Text>
    </View>
    <View style={styles.cta}>
      <FocusableButton
        label="Plan our evening"
        primary
        hasTVPreferredFocus
        onPress={() => navigation.navigate({name: 'profiles'})}
        testID="btn-start"
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
    justifyContent: 'center',
  },
  hero: {
    maxWidth: 1100,
  },
  kicker: {
    ...type.label,
    color: colors.accent,
    letterSpacing: 4,
    marginBottom: spacing.md,
  },
  title: {
    ...type.hero,
    color: colors.textPrimary,
  },
  subtitle: {
    ...type.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    maxWidth: 900,
  },
  cta: {
    flexDirection: 'row',
    marginTop: spacing.xl,
  },
});
