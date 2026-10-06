# Couch Concierge Bedrock Proxy

A standalone, MIT-licensed Node.js adapter that turns household tastes, mood, and
a time budget into a **catalog-grounded** viewing plan using Bedrock Converse.
Published as an additional open-source integration project at
https://github.com/ifrazie/couch-concierge-bedrock-proxy.
The companion Vega app is https://github.com/ifrazie/couch-concierge.
No Vega SDK is required to build or test this component.

## What it does

- Validates JSON input: 1–8 distinct viewers, genre vocabulary, mood up to 500
  characters, and an integer budget of 1–180 minutes. Body limit: 8 KiB.
- Provides its own trusted catalog metadata; clients cannot inject URLs or films.
- Precomputes feasible schedules of 1–3 distinct catalog titles within the budget.
- Uses Converse's forced `submit_plan` tool with a schedule-ID enum; the model
  chooses a feasible schedule and explains each title in its supplied order.
- Independently validates the schedule ID and explanation count/length. Runtime is approximate
  catalog metadata, not a guarantee of exact playback duration.
- Returns IDs and explanations; the TV app owns URL resolution and playback.
- Uses a Lambda IAM role rather than AWS credentials in the client.
- Does not log household requests or return AWS exception/account details.

## Test and package

Use Node.js 22.14+ (Lambda runtime: `nodejs22.x`), AWS CLI, and a current AWS SAM
CLI. From this directory, or from a clone of the standalone proxy repository:

```bash
npm ci
npm test
sam validate --lint --region us-east-2 --template-file template.yaml
sam build --template-file template.yaml
```

The dependency is pinned in `package-lock.json`. SAM packages the entry point,
catalog, validation module, license, and dependencies. Local unit tests inject a
stub at the Bedrock boundary and make **no model calls**; they are not proof of
deployed inference.

Older validators can reject `InvokedViaFunctionUrl` despite it being a current
CloudFormation property. SAM CLI 1.141.0 exhibited that problem in this session;
a current `cfn-lint` validated the template, and SAM packaging succeeded. Upgrade
the validator rather than removing the Function URL invocation restriction.

## Choose a model in us-east-2

The approved default is **Claude Sonnet 4.5**,
`us.anthropic.claude-sonnet-4-5-20250929-v1:0`. It is configurable through the
`ModelId` template parameter. The original proposal used Claude 3.5 Sonnet, which
is absent from the current Sonnet inference-profile list returned in us-east-2.
For another model, verify Converse forced-tool support and account model access.

```bash
aws bedrock list-inference-profiles --region us-east-2 \
  --type-equals SYSTEM_DEFINED \
  --query "inferenceProfileSummaries[?contains(inferenceProfileId, 'sonnet')].[inferenceProfileId,status]" \
  --output table
```

Sonnet 4.5 inference and the deployed Lambda endpoint were verified on October 6,
2026. Re-check availability, access, pricing, and lifecycle for your own deployment.

## Deploy using SAM

From this directory, set `MODEL_ID` to your selected US inference-profile ID.
Read the profile to obtain **all** required destination model ARNs. The template
accepts explicit resource ARNs instead of granting `bedrock:*` on `*`.

```bash
MODEL_ID='us.anthropic.claude-sonnet-4-5-20250929-v1:0'
PROFILE_ARN=$(aws bedrock get-inference-profile --region us-east-2 \
  --inference-profile-identifier "$MODEL_ID" --query inferenceProfileArn --output text)
MODEL_ARNS=$(aws bedrock get-inference-profile --region us-east-2 \
  --inference-profile-identifier "$MODEL_ID" --query 'join(`,`, models[].modelArn)' --output text)

sam build --template-file template.yaml
sam deploy --guided --region us-east-2 --stack-name couch-concierge \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides "ModelId=$MODEL_ID" "BedrockResources=$PROFILE_ARN,$MODEL_ARNS"
```

Confirm the CloudFormation changeset when SAM prompts. IAM permissions allow
only `bedrock:InvokeModel` for the supplied profile/model ARNs; SAM also supplies
Lambda logging permissions. Organization SCPs must permit all destinations of
the chosen profile. US cross-region inference can process data outside Ohio;
us-east-2 is the Lambda deployment and API source region, not a restriction on
every model inference destination.

Get the deployed URL:

```bash
aws cloudformation describe-stacks --stack-name couch-concierge --region us-east-2 \
  --query 'Stacks[0].Outputs[?OutputKey==`Endpoint`].OutputValue' --output text
```

Set it as `CONCIERGE_ENDPOINT` in the TV app's `src/config.ts` and rebuild.
The URL is public configuration, not an AWS credential.

### Public demo endpoint

This template intentionally creates a publicly invokable Function URL with
`AuthType: NONE`, matching the credential-free hackathon client. Both required
URL invocation permissions are included. CORS is omitted because the client is
native React Native, not a browser.

Requests from anyone who knows the URL can incur Bedrock/Lambda charges. Limits
are 2 concurrent invocations, 900 output tokens, an 18-second model deadline,
and a 22-second Lambda timeout. These bound each request and concurrency; they
are **not authentication or a daily spending limit**. Monitor billing and quotas.
For a wider release, add user authentication and rate controls before opening
access. Keep judging access available through November 20, then remove the demo
stack when it is no longer needed:

```bash
sam delete --stack-name couch-concierge --region us-east-2
```

## Live verification

From this directory:

```bash
CONCIERGE_ENDPOINT='https://YOUR_URL.lambda-url.us-east-2.on.aws/' node smoke.mjs
```

This makes a real request and requires a valid `source: "bedrock"` response with
catalog-grounded IDs and a valid time sum. Then run the same request flow on the
Vega simulator/device: confirm the **Amazon Bedrock** label, explanations, and
working playback. A local fallback does not satisfy this live-verification step.

## HTTP contract

`POST /` with `Content-Type: application/json`. Request example:
[example-request.json](example-request.json). The app sends only `id`, `name`,
`likes`, and `dislikes` for each viewer; avatar/media URLs are not transmitted.

```json
{
  "summary": "A light evening for Sam.",
  "items": [{"itemId": "big-buck-bunny", "reason": "A short comedy matches Sam's taste."}],
  "totalMin": 10,
  "source": "bedrock"
}
```

All errors use `{"error":{"code":"...","message":"..."}}`:

| Status | Meaning |
| --- | --- |
| 400 | Invalid/malformed request |
| 405 | Not a POST |
| 413 | Request body too large |
| 415 | Not JSON |
| 422 | No catalog title fits the requested budget |
| 503 | No model configured |
| 502 | Inference unavailable or model output failed validation |

`createHandler({catalog, modelId, invoke})` in `concierge.mjs` supports reusing the
adapter with another trusted metadata catalog and a different runtime. The
current app/backend metadata are synchronized by the root Jest suite.

## Verified deployment — October 6, 2026

- Stack: `couch-concierge`, region: `us-east-2`.
- Runtime: Node.js 22, arm64; timeout: 22 seconds; reserved concurrency: 2.
- Model: `us.anthropic.claude-sonnet-4-5-20250929-v1:0`.
- Profile destinations: us-east-1, us-east-2, us-west-2.
- Endpoint: `https://6oociknvb76x6sxyuvqvl4zmue0ojdum.lambda-url.us-east-2.on.aws/`.
- Live smoke: passed; three distinct catalog titles, 12 minutes, `source: "bedrock"`.

The endpoint is public and belongs to this demo deployment. For a separate clone
or long-term reuse, deploy your own stack. Native Fire TV/Vega playback remains a
separate verification step.

For local **direct SDK** checks using IAM, an inherited
`AWS_BEARER_TOKEN_BEDROCK` can cause API-key authentication to take precedence.
An invalid local bearer setting produced a 403 here; running that check with
`env -u AWS_BEARER_TOKEN_BEDROCK` allowed IAM authentication to succeed. The
Lambda template supplies no bearer key and uses the execution role. The HTTP
smoke script does not use AWS credentials or the bearer variable.

## Sources

- [Converse](https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference.html)
- [Inference profiles](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles-support.html)
- [Model lifecycle](https://docs.aws.amazon.com/bedrock/latest/userguide/model-lifecycle-legacy.html)
- [Function URL access](https://docs.aws.amazon.com/lambda/latest/dg/urls-auth.html)
- [Function URL permission property](https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-lambda-permission.html)

Code license: [MIT](LICENSE). Catalog metadata references third-party films;
no media is bundled and the code license does not grant rights to those films.
