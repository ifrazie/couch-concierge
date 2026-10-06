import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createHandler} from '../concierge.mjs';

const catalog = [
  {id: 'bunny', title: 'Bunny', genres: ['family'], durationMin: 10},
  {id: 'sintel', title: 'Sintel', genres: ['fantasy'], durationMin: 15},
];
const request = {
  profiles: [{id: 'sam', name: 'Sam', likes: ['family'], dislikes: ['action']}],
  vibe: 'A relaxed evening',
  timeBudgetMin: 20,
};
const eventFor = (value = request) => ({
  requestContext: {http: {method: 'POST'}},
  headers: {'content-type': 'application/json'},
  body: JSON.stringify(value),
});
const plan = {
  summary: 'A relaxed evening for Sam.',
  items: [{itemId: 'bunny', reason: 'A short family film fits your evening.'}],
};
const toolPlan = {
  summary: plan.summary,
  planId: 'plan-1',
  reasons: [plan.items[0].reason],
};
const modelResponse = (value = toolPlan) => ({
  stopReason: 'tool_use',
  output: {message: {content: [{toolUse: {name: 'submit_plan', input: value}}]}},
});
const handlerFor = (response = modelResponse()) =>
  createHandler({catalog, modelId: 'test-model', invoke: async () => response});

test('returns grounded IDs and derives duration from the trusted catalog', async () => {
  const result = await handlerFor()(eventFor());
  assert.equal(result.statusCode, 200);
  assert.deepEqual(JSON.parse(result.body), {...plan, totalMin: 10, source: 'bedrock'});
});

test('sends structured user data and forces a catalog-constrained tool', async () => {
  let input;
  const handler = createHandler({catalog, modelId: 'test-model', invoke: async (value) => {
    input = value;
    return modelResponse();
  }});
  await handler(eventFor());
  assert.deepEqual(input.toolConfig.toolChoice, {tool: {name: 'submit_plan'}});
  assert.deepEqual(JSON.parse(input.messages[0].content[0].text).request, request);
  assert.equal(input.modelId, 'test-model');
  assert.equal(input.inferenceConfig.maxTokens, 900);
  const payload = JSON.parse(input.messages[0].content[0].text);
  assert.deepEqual(payload.plans, [
    {id: 'plan-1', itemIds: ['bunny'], totalMin: 10},
    {id: 'plan-2', itemIds: ['sintel'], totalMin: 15},
  ]);
  assert.deepEqual(input.toolConfig.tools[0].toolSpec.inputSchema.json.properties.planId.enum,
    payload.plans.map((candidate) => candidate.id));
});

for (const [label, value] of [
  ['missing viewers', {...request, profiles: []}],
  ['bad genre', {...request, profiles: [{...request.profiles[0], likes: ['unknown']}]}],
  ['duplicate viewers', {...request, profiles: [request.profiles[0], request.profiles[0]]}],
  ['excessive mood', {...request, vibe: 'x'.repeat(501)}],
  ['negative budget', {...request, timeBudgetMin: -1}],
  ['fractional budget', {...request, timeBudgetMin: 20.5}],
  ['excessive budget', {...request, timeBudgetMin: 181}],
  ['null input', null],
]) {
  test(`rejects ${label} before calling Bedrock`, async () => {
    let called = false;
    const handler = createHandler({catalog, modelId: 'test-model', invoke: async () => {
      called = true;
      return modelResponse();
    }});
    assert.equal((await handler(eventFor(value))).statusCode, 400);
    assert.equal(called, false);
  });
}

test('rejects malformed JSON and oversized bodies', async () => {
  assert.equal((await handlerFor()({...eventFor(), body: '{broken'})).statusCode, 400);
  assert.equal((await handlerFor()({...eventFor(), body: 'x'.repeat(8193)})).statusCode, 413);
});

test('supports base64-encoded Lambda request bodies', async () => {
  const event = eventFor();
  event.body = Buffer.from(event.body).toString('base64');
  event.isBase64Encoded = true;
  assert.equal((await handlerFor()(event)).statusCode, 200);
});

test('only accepts JSON POSTs', async () => {
  assert.equal((await handlerFor()({...eventFor(), requestContext: {http: {method: 'GET'}}})).statusCode, 405);
  assert.equal((await handlerFor()({...eventFor(), headers: {'content-type': 'text/plain'}})).statusCode, 415);
});

for (const [label, value] of [
  ['invented schedule IDs', {...toolPlan, planId: 'invented'}],
  ['empty schedule IDs', {...toolPlan, planId: ''}],
  ['mismatched rationale count', {...toolPlan, reasons: ['One.', 'Another.']}],
  ['empty rationale array', {...toolPlan, reasons: []}],
  ['missing rationale', {...toolPlan, reasons: ['']}],
  ['unexpected URLs', {...toolPlan, videoUrl: 'https://example.com/evil'}],
]) {
  test(`rejects model output with ${label}`, async () => {
    assert.equal((await handlerFor(modelResponse(value))(eventFor())).statusCode, 502);
  });
}

test('offers only distinct, grounded, within-budget schedules', async () => {
  let offered;
  const handler = createHandler({catalog, modelId: 'test-model', invoke: async (input) => {
    offered = JSON.parse(input.messages[0].content[0].text).plans;
    return modelResponse();
  }});
  await handler(eventFor({...request, timeBudgetMin: 40}));
  assert.ok(offered.some((candidate) => candidate.itemIds.length === 2));
  for (const candidate of offered) {
    const titles = candidate.itemIds.map((id) => catalog.find((item) => item.id === id));
    assert.equal(new Set(candidate.itemIds).size, candidate.itemIds.length);
    assert.ok(titles.every(Boolean));
    assert.equal(candidate.totalMin, titles.reduce((sum, item) => sum + item.durationMin, 0));
    assert.ok(candidate.totalMin <= 40);
  }
});

test('does not invoke Bedrock when no catalog title fits the budget', async () => {
  let invoked = false;
  const handler = createHandler({catalog, modelId: 'test-model', invoke: async () => {
    invoked = true;
    return modelResponse();
  }});
  assert.equal((await handler(eventFor({...request, timeBudgetMin: 1}))).statusCode, 422);
  assert.equal(invoked, false);
});

test('rejects truncated or text-only model responses', async () => {
  assert.equal((await handlerFor({...modelResponse(), stopReason: 'max_tokens'})(eventFor())).statusCode, 502);
  assert.equal((await handlerFor({output: {message: {content: [{text: '{}'}]}}})(eventFor())).statusCode, 502);
});

test('reports missing model configuration without making a request', async () => {
  const handler = createHandler({catalog, modelId: '', invoke: async () => {throw new Error('unused');}});
  assert.equal((await handler(eventFor())).statusCode, 503);
});

test('does not expose upstream error details in a response', async () => {
  const handler = createHandler({catalog, modelId: 'test-model', invoke: async () => {
    throw new Error('private account detail');
  }});
  const result = await handler(eventFor());
  assert.equal(result.statusCode, 502);
  assert.equal(result.body.includes('private account detail'), false);
});
