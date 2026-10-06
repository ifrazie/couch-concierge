import {BedrockRuntimeClient, ConverseCommand} from '@aws-sdk/client-bedrock-runtime';
import catalog from './catalog.json' with {type: 'json'};
import {createHandler} from './concierge.mjs';

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-2',
  maxAttempts: 1,
});

export const handler = createHandler({
  catalog,
  modelId: process.env.BEDROCK_MODEL_ID,
  invoke: (input) => client.send(new ConverseCommand(input), {
    abortSignal: AbortSignal.timeout(18000),
  }),
});
