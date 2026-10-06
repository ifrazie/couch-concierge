import React, {useEffect, useState} from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, Text, View} from 'react-native';
import {ScreenContainer} from '../components/ScreenContainer';
import {PlanItemCard} from '../components/PlanItemCard';
import {FocusableButton} from '../components/FocusableButton';
import {concierge} from '../services/concierge';
import {EveningPlan} from '../services/types';
import {colors, spacing, type} from '../theme/theme';
import {Navigation, Route} from '../navigation/types';

interface Props {
  route: Extract<Route, {name: 'plan'}>;
  navigation: Navigation;
}

const sourceLabels: Record<EveningPlan['source'], string> = {
  bedrock: 'Amazon Bedrock',
  fallback: 'Local fallback',
  local: 'Local demo',
};

/**
 * Asks the concierge to compose an evening for the request, shows an honest
 * loading state during composition, then renders the
 * sequenced plan with its rationale.
 */
export const PlanScreen = ({route, navigation}: Props) => {
  const [plan, setPlan] = useState<EveningPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setPlan(null);
    setError(null);
    concierge
      .compose(route.request)
      .then((result) => active && setPlan(result))
      .catch(() => active && setError('Could not compose an evening. Try again.'));
    return () => {
      active = false;
    };
  }, [route.request, attempt]);

  if (error) {
    return (
      <ScreenContainer title="Hmm." navigation={navigation} showBack>
        <Text style={styles.message}>{error}</Text>
        <FocusableButton
          label="Try again"
          primary
          hasTVPreferredFocus
          onPress={() => setAttempt((value) => value + 1)}
          testID="btn-retry-plan"
        />
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
      <View style={styles.provenance}>
        <Text style={styles.source}>{sourceLabels[plan.source]}</Text>
        {plan.source !== 'bedrock' ? (
          <Text style={styles.note}>
            {plan.source === 'fallback'
              ? 'AI unavailable — showing local recommendations. Try another plan to reconnect.'
              : 'Configure the AWS endpoint to enable AI recommendations.'}
          </Text>
        ) : null}
      </View>
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
          label="Try another plan"
          onPress={() => setAttempt((value) => value + 1)}
          testID="btn-recompose-plan"
        />
        <FocusableButton
          label="Play first title"
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
  provenance: {
    marginBottom: spacing.md,
  },
  source: {
    ...type.label,
    color: colors.accent,
  },
  note: {
    ...type.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
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
