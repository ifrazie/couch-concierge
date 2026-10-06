import {catalog} from '../data/catalog';
import {CONCIERGE_TIMEOUT_MS} from '../config';
import {Concierge, EveningPlan, PlanItem} from './types';

const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const isText = (value: unknown, max: number): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= max;

function parsePlan(value: unknown, budget: number): EveningPlan {
  if (
    !isObject(value) || value.source !== 'bedrock' || !isText(value.summary, 300) ||
    !Array.isArray(value.items) || value.items.length < 1 || value.items.length > 3
  ) {
    throw new Error('Invalid concierge response');
  }
  const ids = new Set<string>();
  const items: PlanItem[] = value.items.map((pick: unknown) => {
    if (
      !isObject(pick) || !isText(pick.reason, 280) ||
      Object.keys(pick).some((key) => key !== 'itemId' && key !== 'reason')
    ) {
      throw new Error('Invalid concierge pick');
    }
    const item = catalog.find((candidate) => candidate.id === pick.itemId);
    if (!item || ids.has(item.id)) throw new Error('Unknown or repeated title');
    ids.add(item.id);
    return {item, reason: pick.reason.trim()};
  });
  const totalMin = items.reduce((sum, pick) => sum + pick.item.durationMin, 0);
  if (totalMin !== value.totalMin || totalMin > budget) {
    throw new Error('Invalid plan duration');
  }
  return {summary: value.summary.trim(), items, totalMin, source: 'bedrock'};
}

/** Reject on failure; concierge.ts provides the explicitly labelled fallback. */
export function createBedrockConcierge(
  endpoint: string,
  fetcher: typeof fetch = (...args) => fetch(...args),
  timeoutMs = CONCIERGE_TIMEOUT_MS,
): Concierge {
  return {
    async compose(request) {
      // RN for Vega's URL surface is partial; validate the configured HTTPS
      // authority without depending on unsupported username/protocol accessors.
      if (!/^https:\/\/[a-z0-9.-]+(?::\d{1,5})?(?:[/?#]\S*)?$/i.test(endpoint)) {
        throw new Error('Concierge endpoint must be HTTPS without credentials');
      }
      const controller = new AbortController();
      let timer: ReturnType<typeof setTimeout> | undefined;
      const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error('Concierge request timed out'));
          controller.abort();
        }, timeoutMs);
      });
      try {
        const operation = (async () => {
          const response = await fetcher(endpoint, {
            method: 'POST',
            headers: {Accept: 'application/json', 'Content-Type': 'application/json'},
            signal: controller.signal,
            body: JSON.stringify({
              profiles: request.profiles.map(({id, name, likes, dislikes}) =>
                ({id, name, likes, dislikes})),
              vibe: request.vibe,
              timeBudgetMin: request.timeBudgetMin,
            }),
          });
          if (!response.ok) throw new Error('Concierge service unavailable');
          return parsePlan(await response.json(), request.timeBudgetMin);
        })();
        return await Promise.race([operation, timeout]);
      } finally {
        if (timer !== undefined) clearTimeout(timer);
      }
    },
  };
}
