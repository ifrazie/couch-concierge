import {createBedrockConcierge} from '../src/services/bedrockConcierge';
import {createConcierge} from '../src/services/concierge';
import {catalog} from '../src/data/catalog';
import {profiles} from '../src/data/profiles';
import proxyCatalog from '../proxy/catalog.json';

const request = {profiles: [profiles[0]], vibe: 'Something funny', timeBudgetMin: 20};
const response = {
  summary: 'A light evening for Sam.',
  items: [{itemId: catalog[0].id, reason: 'Comedy for Sam in ten minutes.'}],
  totalMin: 10,
  source: 'bedrock',
};
const responseFrom = (body: unknown, ok = true) =>
  ({ok, json: async () => body} as Awaited<ReturnType<typeof fetch>>);

describe('Bedrock concierge boundary', () => {
  it('resolves server IDs to local media and marks real AI output', async () => {
    const fetcher = jest.fn().mockResolvedValue(responseFrom(response));
    const plan = await createBedrockConcierge('https://example.com/', fetcher).compose(request);
    expect(plan.items[0].item).toEqual(catalog[0]);
    expect(plan.source).toBe('bedrock');
    const body = JSON.parse(fetcher.mock.calls[0][1].body);
    expect(body.profiles[0].avatar).toBeUndefined();
    expect(body.vibe).toBe(request.vibe);
  });

  it.each([
    {...response, items: [{itemId: 'unknown', reason: 'A pick.'}]},
    {...response, items: [response.items[0], response.items[0]], totalMin: 20},
    {...response, totalMin: 1},
    {...response, items: []},
    {...response, items: [{...response.items[0], reason: ''}]},
    {...response, items: [{...response.items[0], videoUrl: 'https://evil.example'}]},
    {...response, source: 'local'},
    null,
  ])('rejects malformed or ungrounded output %#', async (body) => {
    const fetcher = jest.fn().mockResolvedValue(responseFrom(body));
    await expect(createBedrockConcierge('https://example.com/', fetcher).compose(request)).rejects.toThrow();
  });

  it('rejects a valid title that exceeds the requested budget', async () => {
    const fetcher = jest.fn().mockResolvedValue(responseFrom(response));
    await expect(createBedrockConcierge('https://example.com/', fetcher)
      .compose({...request, timeBudgetMin: 1})).rejects.toThrow();
  });

  it('rejects HTTP errors and invalid JSON', async () => {
    const fetcher = jest.fn().mockResolvedValue(responseFrom(response, false));
    await expect(createBedrockConcierge('https://example.com/', fetcher).compose(request)).rejects.toThrow();
    fetcher.mockResolvedValue({ok: true, json: async () => {throw new Error('Bad JSON');}});
    await expect(createBedrockConcierge('https://example.com/', fetcher).compose(request)).rejects.toThrow();
  });

  it('does not send requests to cleartext or credential-bearing endpoints', async () => {
    const fetcher = jest.fn();
    for (const endpoint of ['http://example.com/', 'https://user:secret@example.com/']) {
      await expect(createBedrockConcierge(endpoint, fetcher).compose(request)).rejects.toThrow();
    }
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('bounds the entire request including slow JSON decoding and aborts on timeout', async () => {
    jest.useFakeTimers();
    try {
      const fetcher = jest.fn().mockResolvedValue({ok: true, json: () => new Promise(() => {})});
      const result = createBedrockConcierge('https://example.com/', fetcher, 100).compose(request);
      const settled = result.then(() => 'Unexpected success', (error: Error) => error.message);
      await jest.advanceTimersByTimeAsync(100);
      await expect(settled).resolves.toBe('Concierge request timed out');
      expect(fetcher.mock.calls[0][1].signal.aborted).toBe(true);
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('concierge selection', () => {
  it('runs labelled local recommendations without an endpoint or network call', async () => {
    const fetcher = jest.fn();
    const plan = await createConcierge('', fetcher).compose(request);
    expect(plan.source).toBe('local');
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('falls back honestly on a network failure', async () => {
    const fetcher = jest.fn().mockRejectedValue(new Error('Disconnected'));
    const plan = await createConcierge('https://example.com/', fetcher).compose(request);
    expect(plan.source).toBe('fallback');
    expect(plan.items.length).toBeGreaterThan(0);
    expect(plan.totalMin).toBeLessThanOrEqual(request.timeBudgetMin);
  });

  it('returns successful Bedrock plans without relabelling', async () => {
    const fetcher = jest.fn().mockResolvedValue(responseFrom(response));
    expect((await createConcierge('https://example.com/', fetcher).compose(request)).source).toBe('bedrock');
  });
});

it('keeps the proxy catalog metadata synchronized with the unchanged app catalog', () => {
  expect(proxyCatalog).toEqual(catalog.map(({id, title, synopsis, genres, durationMin}) =>
    ({id, title, synopsis, genres, durationMin})));
});
