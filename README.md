# Couch Concierge

**One couch. Different tastes. An evening that fits.**

[App repository](https://github.com/ifrazie/couch-concierge) ·
[Standalone open-source proxy](https://github.com/ifrazie/couch-concierge-bedrock-proxy)

A React Native for Vega Fire TV app that turns a household's viewing preferences,
a mood, and a time budget into a short, explained viewing plan. Pick the viewers,
choose a vibe, review the recommendations, and play a title with Vega's native
W3C media player.

Target: **Fire TV**, with **AI-enhanced viewing** and **family entertainment** as
the product focus. Intended mini challenges: **AWS Builder** and **Open Source**.
These are submission targets, not claims of completed eligibility. See
[SUBMISSION.md](SUBMISSION.md) for evidence and outstanding requirements.

## Run the app

Prerequisites:

- Vega SDK with React Native **0.83** support, installed and activated in your shell.
- Node.js **22.14 or newer** and access to the Amazon Devices npm packages.
- A compatible Vega Virtual Device or Fire TV running Vega OS for runtime testing.

From the repository root:

```bash
npm ci
npm run lint
npm run typecheck
npm test -- --runInBand
npm run test:proxy
npm run build:release
```

For a compatible simulator/device, use the Vega CLI from the activated SDK:

```bash
vega device list
# If needed, start the simulator first:
vega virtual-device start
vega device install-app --dir . -b Release
vega device launch-app --dir .
vega device is-app-running --appName com.myorg.VegaProject.main
```

Use `--device <serial>` for install/launch when more than one device is connected.
For a single connected simulator, use the auto-selection commands above. In this
session the Linux simulator was **x86_64**; check the actual target architecture
rather than assuming every virtual device is aarch64.
The package identifier is `com.myorg.VegaProject`; the displayed name is
**Couch Concierge**. A standard web or mobile emulator is not a Fire TV demo.

The app supports local recommendations without an AWS account. Streaming video
and poster images still require internet access; local recommendations do not
mean offline video playback.

## Enable Bedrock recommendations

Deploy the Node.js proxy using [proxy/README.md](proxy/README.md). Lambda and its
Bedrock client run in **us-east-2**. Set the resulting HTTPS Function URL in
`src/config.ts`, then rebuild the app. AWS credentials stay in Lambda's IAM role.

The approved model is **Claude Sonnet 4.5**, using
`us.anthropic.claude-sonnet-4-5-20250929-v1:0`. The proxy is deployed and its live
smoke check passed on October 6, 2026. `src/config.ts` points to that demo endpoint;
set it to `''` for local-only recommendations or to your own deployed URL.
The template model ID remains configurable. Claude 3.5 Sonnet is absent from
the current Ohio Sonnet profile list, which is why the newer model was selected.
US cross-region profiles can route inference outside us-east-2 even though the
Lambda and originating Bedrock client use us-east-2.

## Architecture

```text
Vega UI → Concierge interface → HTTPS POST → Lambda → Bedrock Converse
                                      ↓
                        validated title IDs + explanations
                                      ↓
                       local catalog → native media player
```

- `src/screens/`: Home → viewers → mood/time → plan → player.
- `src/services/types.ts`: shared app domain contracts.
- `src/services/mockConcierge.ts`: deterministic local recommendations.
- `src/services/bedrockConcierge.ts`: HTTPS client with validation and timeout.
- `src/services/concierge.ts`: endpoint selection and labelled fallback.
- `src/data/`: seven curated titles and four seeded household taste profiles.
- `proxy/`: reusable Node.js Bedrock adapter, server-side validation, tests,
  and deployable AWS SAM template.

The backend computes feasible catalog schedules, then asks Bedrock to choose
one and explain the trade-offs. It supplies catalog IDs, never playable URLs.
The app resolves IDs to its own catalog and verifies the time sum. Both
boundaries reject invalid selections. AI output is advisory: seeded genre preferences do not imply
parental controls or verified age suitability.

With no endpoint configured, the UI labels plans **Local demo**. If a configured
endpoint fails or times out, the UI labels the result **Local fallback**. A
successful proxy response is labelled **Amazon Bedrock**. Only that last mode is
evidence of the AWS runtime integration for the hackathon video.

## Content and licensing

The application's original code is [MIT licensed](LICENSE). Third-party SDKs,
assets, films, music, and trademarks retain their own terms. An MIT license for
this repository does not relicense any third-party content.

The catalog is preserved from the existing prototype:

| Title | Attribution supplied in the catalog |
| --- | --- |
| Big Buck Bunny | Blender Foundation — CC BY 3.0 |
| Sintel | Blender Foundation — CC BY 3.0 |
| Tears of Steel | Blender Foundation — CC BY 3.0 |
| Elephants Dream | Blender Foundation — CC BY 2.5 |
| For Bigger Blazes / Fun / Escapes | Google sample media |

Videos and posters are hosted in Google's public sample bucket. Public hosting
alone is **not** proof of a redistribution or demo-video license. Before
recording, verify film/image/music permissions and attribution against the
original publisher, especially the Google sample clips. This repository does
not claim those clips are public domain. Playback shows the supplied attribution;
include the applicable attribution and license links in the demo credits.

## Verification and submission

The existing Vega/React Native dependency graph reports npm audit findings
(33 high and 14 moderate with `--omit=dev` on October 6). The new proxy dependency
graph reports zero findings. Root findings include tooling distributed within
SDK dependencies; runtime reachability and a compatible SDK update still need
review. A forced audit fix proposes an incompatible Vega dependency downgrade,
so it was not applied. Review these before broader release.

See [SUBMISSION.md](SUBMISSION.md) for the Devpost description, AWS integration
write-up, demo outline, publishing steps, and live verification checklist.
[FRICTION_LOG.md](FRICTION_LOG.md) records observed tool friction rather than
invented cloud or device testing results.

The Release app was installed and confirmed running on the Vega simulator
(SDK 0.24.12044). Full native navigation/playback testing and demo recording
remain pending. When starting from a short-lived agent command session, launching
with `setsid vega virtual-device start` kept the simulator connected across
subsequent commands in this session.

Sources:

- [Hackathon overview](https://amazonappdev2026.devpost.com/)
- [Official rules](https://amazonappdev2026.devpost.com/rules)
- [Vega 0.83 networking](https://developer.amazon.com/docs/react-native-vega/0.83/network)
- [Bedrock Converse](https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference.html)
- [Bedrock model lifecycle](https://docs.aws.amazon.com/bedrock/latest/userguide/model-lifecycle-legacy.html)
