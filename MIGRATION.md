# What moves here, from where (mapped 9 Nov 2026: Android dev 1dab5fa, iOS dev cf8214c v0.4.26)

## Already shareable as it is (Android)

| today | moves to | note |
|---|---|---|
| `eval/FORMATS.md` (scenario, run record, recording, loop export) | `scenarios/FORMATS.md` | the formats are platform-free JSON already |
| `app/src/main/assets/feature_lab/scenarios/*.json` (5, `abp-eval-scenario/1`) | `scenarios/abp/` | |
| `app/src/main/assets/feature_lab/graph/sample-graph.json` | `scenarios/graphs/` | |
| `app/src/main/assets/feature_lab/recordings/**` | `scenarios/recordings/` | |
| `eval/golden/abp-vectors.json` (54 vectors) | `abp/golden/` | Python `eval/abpeval/abp.py` and Kotlin `AbpChecks.kt` pass them today; a Swift port must too |
| `ChatModel.BASE_SYSTEM`, the grounded-preset block | `prompts/` | first copy: `prompts/base-system.riskmandate.json` |
| `ToolProtocol.kt` text tool-call protocol and limits | `prompts/tool-protocol.json` + `bridge/conformance/` | |
| the Workbench brief's ~20 tool-test cases (not written yet) | `scenarios/tool-tests/` | written here first, so both apps start from them |
| `eval/models.json` | `scenarios/models.json` | add on-device entries (Gemma 4 E2B/E4B litertlm, Apple FM) |
| `assets/feature_site/*.html` | stays per app for now | the bundled riskmandate.ai copy; shareable once iOS RiskMandate shows it |

## Already shareable (iOS)

| today | moves to | note |
|---|---|---|
| PTWeb bridge envelope and `window.ptApp` JS (Swift strings in `BridgeScripts.swift`) | `bridge/js/pt-bridge.js` | becomes a file both apps bundle; iOS injects it, Android serves it |
| `Tools/bridge-e2e/` (runs the bridge JS in Chromium) | `bridge/e2e/` | the cross-platform test of the page side |
| PTAsk `AIContextAssembler.systemPrompt`, `AIPrompts` starters | `prompts/` | as data, so Android's team-style Ask can use them |
| PTAsk tool list (`now`, `search_agenda`, ... read-only) | `bridge/ops.json` `llm.tools` examples | |
| PTSync manifest (files, size, SHA-256, version; no signature) | the signed run-time manifest | add the signature |

## Stays native

Runtimes (LiteRT-LM; Foundation Models; OpenRouter client), model download and verification, key stores,
SGitVault crypto, managed configuration, stand/kiosk, the web view hardening.

## Gaps

- iOS has no on-device model and no ABP engine yet: the Swift ABP port is checked by `abp/golden/`.
- Android has no JS bridge yet: the Workbench UI as HTML needs it (`addWebMessageListener`).
- Neither app has a judge layer: `judges[]` in the scenario format, `llm.generate` for the local and cloud judge.
