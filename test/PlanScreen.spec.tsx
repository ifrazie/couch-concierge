import React from 'react';
import {fireEvent, render, waitFor} from '@testing-library/react-native';
import {PlanScreen} from '../src/screens/PlanScreen';
import {concierge} from '../src/services/concierge';
import {catalog} from '../src/data/catalog';
import {profiles} from '../src/data/profiles';
import {EveningPlan} from '../src/services/types';

jest.mock('../src/services/concierge', () => ({concierge: {compose: jest.fn()}}));
const compose = concierge.compose as jest.Mock;
const route = {
  name: 'plan' as const,
  request: {profiles: [profiles[0]], vibe: 'funny', timeBudgetMin: 20},
};
const navigation = {navigate: jest.fn(), goBack: jest.fn(), canGoBack: true};
const plan: EveningPlan = {
  source: 'bedrock', summary: 'For Sam.', totalMin: 10,
  items: [{item: catalog[0], reason: 'Comedy for Sam.'}],
};

beforeEach(() => jest.clearAllMocks());

it.each([
  ['bedrock', 'Amazon Bedrock'],
  ['local', 'Local demo'],
  ['fallback', 'Local fallback'],
])('labels %s plan provenance', async (source, label) => {
  compose.mockResolvedValue({...plan, source});
  const view = render(<PlanScreen route={route} navigation={navigation} />);
  expect(await view.findByText(label)).toBeTruthy();
});

it('allows recovery after a composition failure', async () => {
  compose.mockRejectedValueOnce(new Error('Failure')).mockResolvedValueOnce(plan);
  const view = render(<PlanScreen route={route} navigation={navigation} />);
  fireEvent.press(await view.findByTestId('btn-retry-plan'));
  expect(await view.findByText('Amazon Bedrock')).toBeTruthy();
});

it('recomposes the same request from the completed plan', async () => {
  compose.mockResolvedValue(plan);
  const view = render(<PlanScreen route={route} navigation={navigation} />);
  fireEvent.press(await view.findByTestId('btn-recompose-plan'));
  await waitFor(() => expect(compose).toHaveBeenCalledTimes(2));
  expect(compose).toHaveBeenLastCalledWith(route.request);
});
