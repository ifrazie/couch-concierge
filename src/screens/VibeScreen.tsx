import React, {useState} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import {ScreenContainer} from '../components/ScreenContainer';
import {FocusableButton} from '../components/FocusableButton';
import {profiles as allProfiles} from '../data/profiles';
import {colors, radius, spacing, type} from '../theme/theme';
import {Navigation, Route} from '../navigation/types';

interface Props {
  route: Extract<Route, {name: 'vibe'}>;
  navigation: Navigation;
}

/** Quick-pick vibe prompts so the demo doesn't depend on the on-screen keyboard. */
const VIBE_SUGGESTIONS = [
  'Something funny and light',
  'Epic sci-fi adventure',
  'A moving, emotional story',
  'Wholesome for the whole family',
];

/** Time-budget presets — far friendlier on a remote than numeric entry. */
const TIME_PRESETS = [20, 40, 60, 90];

export const VibeScreen = ({route, navigation}: Props) => {
  const [vibe, setVibe] = useState('');
  const [timeBudgetMin, setTimeBudgetMin] = useState(40);

  const selectedProfiles = allProfiles.filter((p) =>
    route.selectedProfileIds.includes(p.id),
  );

  const compose = () => {
    navigation.navigate({
      name: 'plan',
      request: {
        profiles: selectedProfiles,
        vibe: vibe.trim() || 'Something we’ll all enjoy',
        timeBudgetMin,
      },
    });
  };

  return (
    <ScreenContainer
      title="What's the vibe?"
      subtitle={`Watching with ${selectedProfiles
        .map((p) => p.name)
        .join(', ')}`}
      navigation={navigation}
      showBack>
      <TextInput
        style={styles.input}
        placeholder="e.g. something funny and short before dinner"
        placeholderTextColor={colors.textMuted}
        value={vibe}
        onChangeText={setVibe}
        returnKeyType="done"
        testID="input-vibe"
      />

      <Text style={styles.sectionLabel}>Or pick a starting point</Text>
      <View style={styles.chipRow}>
        {VIBE_SUGGESTIONS.map((s, i) => (
          <FocusableButton
            key={s}
            label={s}
            hasTVPreferredFocus={i === 0}
            onPress={() => setVibe(s)}
            style={styles.chip}
            testID={`vibe-chip-${i}`}
          />
        ))}
      </View>

      <Text style={styles.sectionLabel}>How much time?</Text>
      <View style={styles.chipRow}>
        {TIME_PRESETS.map((m) => (
          <FocusableButton
            key={m}
            label={`${m} min`}
            primary={m === timeBudgetMin}
            onPress={() => setTimeBudgetMin(m)}
            style={styles.chip}
            testID={`time-${m}`}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <FocusableButton
          label="Compose our evening"
          primary
          onPress={compose}
          testID="btn-compose"
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  input: {
    ...type.body,
    color: colors.textPrimary,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.cardFocused,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 64,
  },
  sectionLabel: {
    ...type.label,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: spacing.md,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    marginTop: spacing.xl,
  },
});
