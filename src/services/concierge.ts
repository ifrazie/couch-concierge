import {CONCIERGE_ENDPOINT} from '../config';
import {createBedrockConcierge} from './bedrockConcierge';
import {mockConcierge} from './mockConcierge';
import {Concierge} from './types';

export function createConcierge(endpoint: string, fetcher?: typeof fetch): Concierge {
  if (!endpoint.trim()) return mockConcierge;
  const bedrock = createBedrockConcierge(endpoint.trim(), fetcher);
  return {
    async compose(request) {
      try {
        return await bedrock.compose(request);
      } catch {
        const plan = await mockConcierge.compose(request);
        return {...plan, source: 'fallback'};
      }
    },
  };
}

export const concierge = createConcierge(CONCIERGE_ENDPOINT);
