# PrompTugal__App__Mobile

mobile.app.promptugal.news

The shared layer of PrompTugal's mobile apps: what is the same on Android (Kotlin) and iOS/iPadOS (Swift).
Native code stays native. What is here is data, content, HTML/JS and the contract both apps implement.

**Status:** draft layout and bridge v1 by mobile@promptugal.ai.dinis, 9 November 2026 (first written on
`work/mobile` of PrompTugal__App__Android). Public repository: schemas, synthetic samples and public content
only; no keys, tokens, personal data or real locations.
Issue WS-177. Brief: PrompTugal__News__Website `board/briefs/2026-11-09-the-on-device-llm-workbench.md`.

## Layout

| path | what | read by |
|---|---|---|
| `manifest.json` | the feature manifest: which shared features exist, per app, with the minimum bridge version each needs | both apps at start |
| `bridge/` | the bridge contract: `BRIDGE.md` (ops, envelope, errors, security), `ops.json` (machine-readable, both apps generate or test against it), `js/pt-bridge.js` (the one page-side client), `conformance/` (request/reply cases both apps' unit tests run against fakes) | both apps, the UI |
| `prompts/` | prompts as JSON (`mobile-prompt/1`): the base system block per app, presets, judge prompts | both apps, the workbench |
| `scenarios/` | workbench scenarios and evals (`abp-eval-scenario/1`, extended by `judges[]`), tool-test cases, graphs, curated recordings | the workbench on both apps, `eval/` harness |
| `abp/` | the agent behaviour policies for the apps' models, and `golden/` vectors every ABP engine must pass (Python eval, Kotlin, Swift) | both native ABP engines, eval |
| `ui/` | HTML/JS/CSS screens both apps load in a web view (workbench, request builder, results); calls only `pt-bridge.js` | both apps' web views |
| `content/` | articles, release notes, copy (en, pt-PT) | both apps |
| `formats/` | shared data shapes both platforms read, schema plus a synthetic sample each: `feature-toggles/1` (per app, per person, per feature, with who decided and when) and `where-is-everybody/1` (live position, history, next moves, from WS-181's design; iOS has `WhereIsEveryoneView` and the `where_is_everyone` tool today). Decisions and votes next. Formats and synthetic samples only: no real people or places in this public repo | both apps, the bridge (`toggles.get`, `people.where`, to add) |
| `learnt/` | "what each app learnt": prompts, models, speed figures, eval results, refreshed daily | both teams |

## Rules of the shared layer

1. **One contract, two implementations.** An op is added to `bridge/ops.json` and `BRIDGE.md` first, with conformance cases; then Kotlin and Swift implement it under the same name.
2. **The model proposes, native code decides.** Tools run only in native code, only after `abp.check` passes there. Keys (OpenRouter, vault) never reach JavaScript.
3. **Pages are local.** Only pages served from the app's own bundle or a verified shared-layer snapshot get the bridge. Remote websites never get `llm.*`, `vault.*` or `tool.*`.
4. **Same files, same results.** A scenario run on the Idea Tab Plus and on the iPad is the same JSON, with the same hash, judged by the same checks; results use `abp-eval-run/1`.
5. **Versioned.** Every JSON file has `format` and `version`; the repo is released with tags `v<major>.<minor>.<patch>`; `manifest.json` carries `bridge_min`.

## How a change reaches both apps

See `bridge/BRIDGE.md` section "Delivery". In short: rebuilt at release first (each app's CI vendors a tagged
snapshot); then JSON and content fetched at run time, signed and versioned, falling back to the bundled snapshot;
JavaScript UI over the air only for the staff apps (team, RiskMandate), never the App Store news app.

## Where things come from today

See `MIGRATION.md`.
