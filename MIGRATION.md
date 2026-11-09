# What moves here, from where (mapped 9 Nov 2026: Android dev 1dab5fa, iOS dev cf8214c v0.4.26)

## Already shareable as it is (Android)

| today | moves to | note |
|---|---|---|
| `eval/FORMATS.md` (scenario, run record, recording, loop export) | `scenarios/FORMATS.md` | **moved** 9 Nov from Android dev 73d585e |
| `app/src/main/assets/feature_lab/scenarios/*.json` (5, `abp-eval-scenario/1`) | `scenarios/abp/` | |
| `app/src/main/assets/feature_lab/graph/sample-graph.json` | `scenarios/graphs/` | |
| `app/src/main/assets/feature_lab/recordings/**` | `scenarios/recordings/` | |
| `eval/golden/abp-vectors.json` (54 vectors) | `abp/golden/` | **moved** 9 Nov (dev 73d585e). Python `eval/abpeval/abp.py` and Kotlin `AbpChecks.kt` pass them; a Swift port must too |
| `ChatModel.BASE_SYSTEM` / `assets/prompts/riskmandate_base.v1.txt`, the grounding texts `res/raw/feature_chat_*.txt` | `prompts/` | **moved** 9 Nov (dev 73d585e): `riskmandate_base.v1.txt` (identical to `base-system.riskmandate.json`'s text), `grounding/`. v2 (no on-device claim, for cloud requests) follows once it is on Android dev |
| `ToolProtocol.kt` text tool-call protocol and limits | `prompts/tool-protocol.json` + `bridge/conformance/` | |
| dev.lab's tool-test cases (`abp-tooltest/1`, 9 kinds) and the judge prompt (`abp-judge-prompt/1`) | `scenarios/tool-tests/`, `prompts/judges/` | **moved** 9 Nov from Android work/dev.lab c8ccb63; dev.lab owns the format |
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
