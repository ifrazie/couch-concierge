# Hackathon submission pack

Source: [Build, Ship, Shape official rules](https://amazonappdev2026.devpost.com/rules),
reviewed October 6, 2026. Re-check the rules before submitting.

- **Deadline:** October 23, 2026, **12:00 noon Pacific Time**.
- Primary track: **Fire TV** (Vega OS).
- Mini challenges intended: **AWS Builder**, **Open Source**.
- A project can win one track prize and one mini-challenge prize, even when
  entering both mini challenges.

## Pending before submission

- [x] Select Sonnet 4.5; deploy the proxy in us-east-2 and set `src/config.ts`
  to the Function URL.
- [x] Run the deployed proxy smoke check and validate a real Bedrock response.
- [ ] Observe **Amazon Bedrock** in the native app on the target device.
  Local demo/fallback is not evidence of AWS inference.
- [x] Install and launch the Release app on the Vega x86_64 simulator;
  CLI confirms `com.myorg.VegaProject.main` is running.
- [ ] Verify D-pad focus, viewer selection, on-screen keyboard/quick picks, scrolling, playback,
  play/pause, and return-to-plan. Unit tests do not verify these native paths.
- [ ] Resolve or assess the W3C media package compatibility-metadata diagnostic
  from the release build against the target device/SDK.
- [ ] Review inherited Vega/RN dependency audit findings and compatible fixes;
  `npm audit --omit=dev` reported 33 high / 14 moderate issues. The proxy audit
  reported zero. Do not force an SDK downgrade to satisfy npm's suggested fix.
- [x] Publish the main repository with the MIT license visible on GitHub.
- [x] Publish the additional standalone proxy project during the submission
  window; GitHub reports both repositories PUBLIC with the MIT license.
- [ ] Verify video/poster/music rights and required credits, especially the
  Google sample clips; public hosting is not itself a content license.
- [ ] Record a public English YouTube/Vimeo video **under 3 minutes**, showing
  the app on Fire TV or the Vega simulator. Add its URL below.
- [ ] Finalize product feedback from actual device and cloud use, including
  onboarding and whether you would use each tool again.
- [ ] Fill repository/contribution URLs, dates, GitHub username, and Devpost
  fields. Keep evaluation access available through November 20, 2026.

## Verification — October 6, 2026

| Check | Observed result |
| --- | --- |
| App lint | Zero errors; two existing SDL informational warnings |
| App TypeScript | `npm run typecheck` passed |
| App Jest | 27 tests passed across four suites |
| Proxy Node tests | 24 tests passed; model boundary stubbed |
| Lambda entry point | Imports successfully with pinned AWS SDK |
| Node syntax checks | Entry point, validation module, and smoke script passed |
| SAM packaging | `sam build --template-file template.yaml` succeeded |
| Current CloudFormation schema lint | Passed using an isolated current cfn-lint |
| Vega release packaging | Produced aarch64, armv7, x86_64 packages; exit 0 with the W3C compatibility ERROR noted above |
| Proxy dependency audit | Zero reported vulnerabilities |
| Existing app dependency audit | 33 high / 14 moderate reported; review pending |
| Live AWS inference | Sonnet 4.5 succeeded with IAM; deployed proxy smoke passed with three titles / 12 minutes for a 20-minute budget |
| Live Function URL input validation | Verified 405, 400, 415, and 413 responses without model calls |
| CloudFormation deployment | `couch-concierge` stack reached CREATE_COMPLETE in us-east-2 |
| Native installation/launch | Release package installed on x86_64 Vega Virtual Device; CLI confirmed app running; SDK 0.24.12044 |
| GitHub publication | App and additional proxy repositories are PUBLIC; GitHub detects MIT in both |
| Device playback / public video | Not yet verified |

The configured endpoint now points to the live Sonnet 4.5 demo proxy. Set it to
`''` for local-only recommendations. Native functional testing and the public
platform demo video are still outstanding.

## Project description draft

### Elevator pitch

One couch, different tastes, one plan: Couch Concierge helps a household agree
on something to watch within the time they actually have.

### What it does

Select who's watching, choose a mood and a time budget, and review a short
viewing plan with an explanation for each choice. Each recommendation is a
playable title from a small curated catalog. The TV experience uses D-pad
focusable controls, large text, and native Vega media playback.

### How it works

The React Native for Vega app posts selected taste profiles, mood, and available
minutes to a Node.js Lambda proxy in us-east-2. The server precomputes schedules
that fit the approximate catalog runtime budget. Amazon Bedrock Converse lets
Sonnet 4.5 choose among those feasible schedules and explain each title through
a constrained tool schema. Server and client validation reject invented IDs,
missing explanations, or invalid time sums. The app resolves media URLs locally,
so the model never chooses a streaming URL. AWS credentials remain in Lambda's
IAM role.

Plans show their source: Amazon Bedrock, Local demo, or Local fallback. If AWS is
unavailable, a deterministic local recommender keeps the app usable without
misrepresenting its output as AI. Users can retry composition or play any pick.

### Customer need and potential impact

Shared viewing means negotiating several tastes, not optimizing a recommendation
for one person. A time-boxed plan with explanations makes the compromise visible
and shortens the journey from choosing to watching. The demo uses four seeded
profiles and seven titles. A broader service would need editable/persistent
profiles, verified content suitability, a licensed catalog, authenticated API
access, and user research to measure whether decision time actually improves.
These are future directions, not shipped features or proven impact claims.

### What changed during this work

The local prototype already contained the five-screen flow, seeded catalog,
household profiles, native media player, and local recommender. This iteration
adds:

- Real Bedrock SDK/Converse integration behind an HTTPS Lambda boundary.
- Catalog-grounded structured output and server/client validation.
- Feasible-schedule enumeration after live testing exposed incorrect model arithmetic.
- Timeout handling and explicitly labelled local fallback.
- Retry/recompose controls and a regression fix for tiny-budget recommendations.
- MIT licensing, run/deploy instructions, proxy packaging, tests, and submission
  materials.

Explain any work predating August 31, 2026 if applicable. Do not present the
existing prototype as entirely new work without confirming its history.

## AWS Builder integration write-up

Services implemented:

- **Amazon Bedrock Runtime:** `proxy/index.mjs` creates `BedrockRuntimeClient`
  and sends `ConverseCommand`; `proxy/concierge.mjs` builds the prompt/tool schema
  over feasible schedules and validates the returned selection. Sonnet 4.5 is
  the approved default; the model ID remains configurable.
- **AWS Lambda:** Node.js 22 Function URL serves the native app's HTTPS POSTs.
  `proxy/template.yaml` packages the function and declares both URL invocation
  permissions, deadlines, and reserved concurrency.
- **IAM:** the execution role invokes only the configured Bedrock resources;
  credentials are never placed in the Vega bundle.
- **AWS SAM / CloudFormation:** reproducible packaging and stack definition.

Runtime evidence:

| Evidence | Value |
| --- | --- |
| Selected model/profile ID | `us.anthropic.claude-sonnet-4-5-20250929-v1:0` |
| Lambda source region | us-east-2 |
| Allowed cross-region destinations from the profile | us-east-1, us-east-2, us-west-2; destination of individual requests was not measured |
| CloudFormation stack | `couch-concierge` |
| Deployed proxy smoke result/date | Passed October 6, 2026: three distinct titles, 12 minutes, source `bedrock` |
| Public Function URL | `https://6oociknvb76x6sxyuvqvl4zmue0ojdum.lambda-url.us-east-2.on.aws/` |
| Fire TV/Vega demo video timestamp showing Bedrock plan | **PENDING** |

## Open Source contribution

The rules ask for a **new, additional** project or contribution alongside the
primary-track app. A public main repo plus MIT alone does not establish that
requirement. The separately usable `proxy/` component includes its own license,
lockfile, docs, tests, SAM template, and live-check script; publish it as an
additional integration project or submit it as a meaningful contribution to an
appropriate public repository.

- Project repository URL: https://github.com/ifrazie/couch-concierge
- Additional proxy repository URL: https://github.com/ifrazie/couch-concierge-bedrock-proxy
- GitHub username: **ifrazie** (approved publication account)
- Contribution date: **October 6, 2026**, within the submission window.
- Contribution URL: https://github.com/ifrazie/couch-concierge-bedrock-proxy/commit/2adee3a8def0fc86f785912a4e42db4893ca967a

Contribution description draft:

> A reusable Node.js Bedrock-to-TV integration adapter that generates
> catalog-grounded viewing plans, validates model output and time budgets, and
> deploys as a credential-free client-facing Lambda boundary. It includes tests,
> a standalone SAM deployment, and a live smoke check. Other developers can
> replace the trusted catalog or reuse the handler factory without a Vega SDK.

Publication completed. For future updates, commit the app changes and regenerate
the standalone proxy branch when files under `proxy/` change:

```bash
git status
git diff
# Stage only the intended changes, then review them before committing:
git add proxy README.md SUBMISSION.md FRICTION_LOG.md
git diff --cached
git commit -m "docs: update deployment and submission evidence"
git push origin main

# Produce a separately publishable proxy history without copying node_modules:
git subtree split --prefix=proxy --branch proxy-open-source
git push https://github.com/ifrazie/couch-concierge-bedrock-proxy.git \
  proxy-open-source:main
```

Keep the main app's `proxy/` copy available so judges can reproduce the whole
project. Include a
direct contribution URL and the reason the additional project helps other
developers. For a public submission, private collaborator invitations are not
required.

## Demo script — target 2:40

| Time | Show | Narration |
| --- | --- | --- |
| 0:00–0:15 | App visibly running on Fire TV/Vega simulator | “One couch, different tastes, twenty minutes before dinner.” |
| 0:15–0:40 | D-pad selection of Sam and Riley | Show the two different taste profiles. |
| 0:40–1:00 | Mood quick pick / text input and time preset | Explain the shared mood and available minutes. |
| 1:00–1:35 | Loading, then **Amazon Bedrock** plan | Read one concrete trade-off; show total duration and source label. |
| 1:35–2:05 | Native playback, pause, return to plan | Demonstrate the device experience with permission-cleared footage. |
| 2:05–2:25 | Architecture diagram / code seam | “Lambda keeps AWS credentials off the TV; validation grounds every pick.” |
| 2:25–2:40 | Public repo, contribution, credits | Explain reuse, mention real friction findings, show required content credits. |

If inference fails, show the Local fallback honestly, troubleshoot, and re-record
the AWS portion after a successful call. Do not dub simulated output over a
local plan. Leave room below three minutes for titles and credits.

- Public YouTube/Vimeo URL: **PENDING**
- Installed target: **Vega Virtual Device, x86_64, SDK 0.24.12044**.
- Recorded demo device/version: **PENDING — fill when recording**.

## Product feedback worksheet

These are evidence-based draft notes. Cloud deployment and live inference were
verified; native playback has not yet been verified. Complete first-person onboarding and
“would build again” answers from your own experience before submitting.

| Tool / API / SDK | Used for / worked well | Needs work / observed friction | Onboarding / use again |
| --- | --- | --- | --- |
| Vega SDK / RN for Vega 0.83 | Three release architectures were packaged; manifest validation passed; Release app installed and running on the simulator | W3C media `2.3.4-rn-83` reports a compatibility mapping error despite the command exiting successfully; simulator initially disconnected before install | **PENDING:** full UI/playback testing, first-person onboarding, and Yes/No reuse decision |
| Vega W3C media | Existing player uses the native surface and lifecycle API | Published prerelease version absent from its own compatibility map; real playback still needs device verification | **PENDING:** measure actual initialization, playback, cleanup; answer Yes/No |
| Amazon Devices Builder Tools MCP / Agent Skills | Documentation search, RN-version guidance, networking and build guidance informed implementation | Some CLI reference guidance describes older SDK/RN generations; version-specific checks remain necessary | **PENDING:** describe your onboarding and whether the guidance accelerated work |
| React / TypeScript / Jest / React Native Testing Library | App tests cover grounding, timeout, fallback, budget regression, and retry UI | Native media is mocked in Jest; passing tests cannot establish simulator/device playback | **PENDING:** summarize your workflow and reuse decision |
| Bedrock / AWS SDK for JS v3 | Live Sonnet 4.5 inference and forced-tool selection succeeded; deterministic feasible schedules keep arithmetic grounded | Initial unconstrained model picks totaled 23 min for a 20-min request; a local bearer setting also caused an authentication error until the check used IAM | **PENDING:** summarize quality/user testing and your Yes/No reuse decision; one successful direct composition took about 5.1 seconds, not a benchmark |
| Lambda / IAM / Function URLs | Deployed arm64 Node.js function; live smoke and 400/405/413/415 input checks passed; AWS credentials stay in its role | Public demo URL is not user authentication; protect it for a wider release | **PENDING:** reliability/cost observations over longer use and Yes/No |
| AWS SAM / CloudFormation / cfn-lint | SAM packaging and stack creation succeeded; current cfn-lint accepted the template | SAM 1.141.0's older validator rejects the current `InvokedViaFunctionUrl` property | **PENDING:** first-person deployment onboarding and use-again decision |

Include which AWS services were used **and how** in the submitted feedback answer,
not just the architecture field. Transfer observed entries from
[FRICTION_LOG.md](FRICTION_LOG.md) if submitting the optional friction log.

## Optional feature requests

- **Important:** a validated RN 0.83 media/network starter with sample Lambda
  deployment and documented compatibility mappings; reduces setup guesswork.
- **Important:** build validation errors should produce a clear failing status
  or an explicit recoverability warning; avoids treating incompatible libraries
  as a clean release.
- **Nice-to-have:** concise per-region model-profile selection in TV+Bedrock
  examples; avoids obsolete hardcoded model IDs.
