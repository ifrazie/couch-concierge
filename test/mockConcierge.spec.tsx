import {mockConcierge} from '../src/services/mockConcierge';
import {profiles} from '../src/data/profiles';
import {EveningRequest} from '../src/services/types';

const requestFor = (
  ids: string[],
  vibe: string,
  timeBudgetMin: number,
): EveningRequest => ({
  profiles: profiles.filter((p) => ids.includes(p.id)),
  vibe,
  timeBudgetMin,
});

describe('mockConcierge', () => {
  it('respects a tiny budget even when the preferred genres only match longer films', async () => {
    const plan = await mockConcierge.compose({
      profiles: [{id: 'drama', name: 'Drama fan', avatar: 'D', likes: ['drama'], dislikes: []}],
      vibe: 'moving drama',
      timeBudgetMin: 1,
    });
    expect(plan.items.length).toBeGreaterThan(0);
    expect(plan.totalMin).toBeLessThanOrEqual(1);
  });

  it('fits the plan within the time budget', async () => {
    const plan = await mockConcierge.compose(
      requestFor(['sam', 'leo'], 'something funny', 40),
    );
    expect(plan.items.length).toBeGreaterThan(0);
    expect(plan.totalMin).toBeLessThanOrEqual(40);
    expect(plan.totalMin).toBe(
      plan.items.reduce((sum, p) => sum + p.item.durationMin, 0),
    );
  });

  it('always returns at least one pick even for a tiny budget', async () => {
    const plan = await mockConcierge.compose(
      requestFor(['sam'], 'anything', 2),
    );
    expect(plan.items.length).toBeGreaterThanOrEqual(1);
  });

  it('gives every pick a viewer-facing rationale', async () => {
    const plan = await mockConcierge.compose(
      requestFor(['riley', 'mia'], 'epic sci-fi adventure', 60),
    );
    for (const {reason} of plan.items) {
      expect(reason.length).toBeGreaterThan(0);
    }
  });
});
