# Observed developer friction

Recorded October 6, 2026. Entries describe observed build/tool behavior and live
AWS integration. Deployed inference and HTTP validation passed; device playback,
deployed latency benchmarking, and CORS failures are not claimed.

## 1. W3C media version fails its own compatibility mapping

- **Task:** build the existing RN 0.83 app for release.
- **Steps:** ran `npm run lint`, `npm test -- --runInBand`, and
  `npm run build:release` with installed `@amazon-devices/react-native-w3cmedia`
  version `2.3.4-rn-83`.
- **Expected:** the published media package maps its installed version to a
  supported Vega runtime interface, or an incompatible build stops clearly.
- **Actual:** the build scanner reports an ERROR that `2.3.4-rn-83` is absent
  from that package's `kepler-compatibility.json`. The map contains `2.3.4` but
  not the RN 0.83 prerelease. The command continues, validates the manifest, and
  produces aarch64, armv7, and x86_64 packages with exit code 0.
- **Severity:** Important — successful packaging is ambiguous as a release gate.
- **Workaround/status:** did not edit vendor files or suppress validation.
  Packages can be inspected, but target-device compatibility remains pending.
- **Actionable suggestion:** publish a corrected RN 0.83 compatibility map and
  make unrecoverable validation failures return a nonzero exit code; distinguish
  recoverable metadata diagnostics explicitly.

## 2. Informational SDL warnings repeat during lint

- **Task:** lint a Vega app that imports system-distributed libraries.
- **Steps:** ran `npm run lint` with kepler and W3C media imports.
- **Expected:** compatibility guidance is easy to distinguish from code errors.
- **Actual:** two repeated warnings explain system-distributed-library versions;
  ESLint reports zero errors. The message itself says this is not an error.
- **Severity:** Nice-to-have — repeated output adds noise after initial onboarding.
- **Workaround/status:** kept the warnings visible and consulted the build/runtime
  version guidance rather than globally disabling checks.
- **Actionable suggestion:** include an explicit one-time acknowledgement/example
  config in the SDK starter, retaining actual incompatibility checks.

## 3. Older SAM validation rejects a current Lambda permission property

- **Task:** validate a Function URL template with both invocation permissions.
- **Steps:** ran `sam validate --lint --region us-east-2 --template-file template.yaml`
  using installed SAM CLI 1.141.0.
- **Expected:** accept the documented `AWS::Lambda::Permission`
  `InvokedViaFunctionUrl` property, which restricts public invocation to the URL.
- **Actual:** the bundled validator rejects the property as unexpected.
  The current AWS CloudFormation reference lists it.
- **Severity:** Important — a stale validator suggests removing a useful restriction.
- **Workaround/status:** validated with a current isolated `cfn-lint`; validation
  passed. `sam build --template-file template.yaml` also packaged successfully.
  The same template subsequently deployed successfully in us-east-2.
- **Actionable suggestion:** document the validator version needed for Function
  URL policies and emit a schema-age diagnostic before rejecting newer properties.
- **Reference:** https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-lambda-permission.html

## 4. Old model recommendation does not match current region catalog

- **Task:** select the originally suggested Claude 3.5 Sonnet model for Ohio.
- **Steps:** queried Bedrock `list-inference-profiles` in `us-east-2`, filtered
  to Sonnet IDs, and reviewed model lifecycle documentation.
- **Expected:** the originally suggested model ID can be selected for deployment.
- **Actual:** current Sonnet profile results list newer generations, not Claude
  3.5 Sonnet. This is a mismatch in the earlier recommendation, not evidence of
  a Bedrock service outage or an inference failure.
- **Severity:** Important — hardcoding an unavailable model would block the demo.
- **Workaround/status:** kept `BEDROCK_MODEL_ID` configurable. The developer
  approved Sonnet 4.5; IAM inference and the deployed proxy smoke check passed.
- **Actionable suggestion:** examples should link to model lifecycle/region checks
  and use configurable IDs rather than timeless defaults.

## 5. Model arithmetic violated the viewing budget

- **Task:** compose a real Bedrock plan for a 20-minute demo request.
- **Steps:** invoked the actual proxy handler using Sonnet 4.5, with the trusted
  catalog and forced tool schema.
- **Expected:** distinct catalog titles whose approximate total runtime is at
  most 20 minutes.
- **Actual:** the first live check returned HTTP 502. Diagnostic inspection
  showed the model selected titles totaling 23 minutes while its summary claimed
  18. Server-side validation correctly rejected the result.
- **Severity:** Important — valid-looking AI output would break the core promise.
- **Workaround/status:** the server now enumerates feasible schedules first;
  the model chooses a schedule ID and supplies one reason per title. Added tests
  for grounded schedules and no-fit budgets. Direct inference and the deployed
  smoke check then passed.
- **Actionable suggestion:** Bedrock starter examples for constraint-heavy use
  cases should separate deterministic constraints from model judgement, with
  tool schemas plus boundary validation.

## 6. Local bearer configuration overrode IAM authentication

- **Task:** verify model access using the same IAM-based approach as Lambda.
- **Steps:** created a Bedrock Runtime SDK client in the local shell while an
  existing `AWS_BEARER_TOKEN_BEDROCK` environment setting was present.
- **Expected:** use the working AWS IAM credentials.
- **Actual:** Bedrock returned a 403 authentication error referring to an invalid
  API key, despite working STS and Bedrock control-plane CLI calls.
- **Severity:** Important — the error initially looked like missing model access.
- **Workaround/status:** checked only whether the bearer variable was present,
  without displaying its value; ran the SDK check with that variable omitted from
  the child process. IAM inference succeeded. The Lambda environment uses its
  execution role and has no bearer setting.
- **Actionable suggestion:** SDK diagnostics and quickstarts should make the
  active authentication mode and credential precedence clear without printing
  secrets.
- **Reference:** https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys-use.html

## Add a real device/cloud entry after testing

### Simulator connection did not persist until installation

- **Task:** install the Release app on a Vega Virtual Device.
- **Steps:** started the default GUI virtual device, observed it in
  `vega device list`, then attempted release installation from the next command.
- **Expected:** the booted simulator stays connected for installation.
- **Actual:** installation reported device not found; a follow-up device list
  was empty. This happened before any application could be installed.
- **Severity:** Important — blocked native verification after a successful boot.
- **Workaround/status:** launched with `setsid vega virtual-device start`;
  the simulator remained connected across later commands. Used single-device
  auto-selection for install/launch. Installation succeeded and the CLI confirmed
  the app running. The initial shutdown's exact cause was not independently proven.
- **Actionable suggestion:** clarify launcher process-lifetime behavior for agent
  shells and distinguish displayed guest identity from VDA transport identifiers.
- **Target:** x86_64 Vega Virtual Device, SDK 0.24.12044. Playback and full native
  interaction testing remain pending.

For each new observation record: task; exact steps; expected outcome; actual
outcome; severity; workaround; actionable suggestion. Keep credentials, account
identifiers, personal data, and token-bearing URLs out of the submission log.
