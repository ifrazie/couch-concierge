import React, {useEffect, useState} from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, Text, View} from 'react-native';
import {ScreenContainer} from '../components/ScreenContainer';
import {PlanItemCard} from '../components/PlanItemCard';
import {FocusableButton} from '../components/FocusableButton';
import {mockConcierge} from '../services/mockConcierge';
import {EveningPlan} from '../services/types';
import {colors, spacing, type} from '../theme/theme';
import {Navigation, Route} from '../navigation/types';

interface Props {
  route: Extract<Route, {name: 'plan'}>;
  navigation: Navigation;
}

/**
 * Asks the concierge to compose an evening for the request, shows an honest
 * loading state during the (currently mocked) model call, then renders the
 * sequenced plan with its rationale.
 */
export const PlanScreen = ({route, navigation}: Props) => {
  const [plan, setPlan] = useState<EveningPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setPlan(null);
    setError(null);
    mockConcierge
      .compose(route.request)
      .then((result) => active && setPlan(result))
      .catch(() => active && setError('Could not compose an evening. Try again.'));
    return () => {
      active = false;
    };
  }, [route.request]);

  if (error) {
    return (
      <ScreenContainer title="Hmm." navigation={navigation} showBack>
        <Text style={styles.message}>{error}</Text>
      </ScreenContainer>
    );
  }

  if (!plan) {
    return (
      <ScreenContainer
        title="Composing your evening…"
        subtitle={`"${route.request.vibe}" · ${route.request.timeBudgetMin} min`}
        navigation={navigation}
        showBack>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>
            Balancing everyone's tastes and your time…
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      title="Your evening"
      subtitle={plan.summary}
      navigation={navigation}
      showBack>
      <ScrollView showsVerticalScrollIndicator={false}>
        {plan.items.map((planItem, i) => (
          <PlanItemCard
            key={planItem.item.id}
            planItem={planItem}
            index={i}
            hasTVPreferredFocus={i === 0}
            onPlay={() => navigation.navigate({name: 'player', item: planItem.item})}
            testID={`plan-item-${planItem.item.id}`}
          />
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <Text style={styles.total}>{`${plan.totalMin} min total`}</Text>
        <FocusableButton
          label="Start from the top"
          primary
          onPress={() =>
            navigation.navigate({name: 'player', item: plan.items[0].item})
          }
          testID="btn-play-all"
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...type.body,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  message: {
    ...type.body,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  total: {
    ...type.label,
    color: colors.textSecondary,
  },
});
