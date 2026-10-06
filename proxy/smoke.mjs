import assert from 'node:assert/strict';
import request from './example-request.json' with {type: 'json'};
import catalog from './catalog.json' with {type: 'json'};

const endpoint = process.env.CONCIERGE_ENDPOINT;
if (!endpoint?.startsWith('https://')) {
  throw new Error('Set CONCIERGE_ENDPOINT to the deployed HTTPS Lambda Function URL.');
}
const response = await fetch(endpoint, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify(request),
  signal: AbortSignal.timeout(25000),
});
assert.equal(response.ok, true, `Proxy returned HTTP ${response.status}`);
const plan = await response.json();
assert.equal(plan.source, 'bedrock', 'Local fallback is not a live Bedrock verification');
assert.equal(typeof plan.summary, 'string');
assert.ok(plan.summary.trim().length > 0);
assert.ok(Array.isArray(plan.items) && plan.items.length >= 1 && plan.items.length <= 3);
assert.equal(new Set(plan.items.map((pick) => pick.itemId)).size, plan.items.length);
let duration = 0;
for (const pick of plan.items) {
  const item = catalog.find((candidate) => candidate.id === pick.itemId);
  assert.ok(item, 'Proxy returned an unknown title');
  assert.ok(typeof pick.reason === 'string' && pick.reason.trim().length > 0);
  duration += item.durationMin;
}
assert.equal(plan.totalMin, duration);
assert.ok(duration <= request.timeBudgetMin);
console.log(`Live Bedrock verification passed: ${plan.items.length} titles, ${duration} minutes.`);
