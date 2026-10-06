import React, {useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {ScreenContainer} from '../components/ScreenContainer';
import {ProfileCard} from '../components/ProfileCard';
import {FocusableButton} from '../components/FocusableButton';
import {profiles} from '../data/profiles';
import {colors, spacing, type} from '../theme/theme';
import {Navigation} from '../navigation/types';

interface Props {
  navigation: Navigation;
}

/** "Who's watching?" — multi-select the viewers whose tastes to reconcile. */
export const ProfilesScreen = ({navigation}: Props) => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  return (
    <ScreenContainer
      title="Who's watching?"
      subtitle="Pick everyone on the couch — I'll balance their tastes."
      navigation={navigation}
      showBack>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}>
        {profiles.map((profile, i) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            selected={selected.includes(profile.id)}
            onToggle={() => toggle(profile.id)}
            hasTVPreferredFocus={i === 0}
            testID={`profile-${profile.id}`}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.count}>
          {selected.length === 0
            ? 'Select at least one viewer'
            : `${selected.length} selected`}
        </Text>
        <FocusableButton
          label="Next"
          primary
          disabled={selected.length === 0}
          onPress={() =>
            navigation.navigate({name: 'vibe', selectedProfileIds: selected})
          }
          testID="btn-next"
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  count: {
    ...type.body,
    color: colors.textSecondary,
  },
});
