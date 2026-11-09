# The bridge (draft, bridge version 1)

One small interface between the shared HTML/JS and the native app, with the **same op names in Kotlin and Swift**.

## Starting point: what already exists

- **iOS (PTWeb, `Packages/PTWeb/Sources/PTWeb/Bridge/`)**: `window.ptApp = {version, ops, call(op, args)}`,
  request `{id, op, args}`, reply `{id, ok, result | error}`, 120 s timeout, handler `pt` in content world
  `PrompTugalBridge`, gated to main frame, https, allowed host, known op. Ops today: `schedule.get`,
  `schedule.set`, `identity.get`, `notify.plan`, `meter.topup`.
- **Android**: a hardened WebView for the bundled site (`features/site/`, `WebViewAssetLoader` on `/assets/`
  only, no file access, no DOM storage) with **no JS bridge yet**.

This draft keeps the iOS envelope and the `domain.verb` naming, so PTWeb's bridge is version 0 of this one
and the existing ops stay as they are.

## Envelope

Page to native: `ptApp.call(op, args) -> Promise<result>`; on the wire `{"id": "pt<seq>.<ts>", "op": "...", "args": {...}}`.
Native to page, reply: `{"id": "...", "ok": true, "result": ...}` or `{"id": "...", "ok": false, "error": {"code": "...", "message": "..."}}`.
Native to page, events (streams): `{"event": "llm.token", "stream": "<id>", "data": {...}}`, delivered as a
DOM `CustomEvent("pt:event")`, read with `ptApp.on(event, fn)`.

Error codes: `unknown_op`, `bad_args`, `not_allowed` (origin, feature or ABP), `no_model`, `too_long`,
`load_failed`, `inference_failed`, `cancelled`, `timeout`, `internal`.

Transport: iOS `WKScriptMessageHandlerWithReply` in its own content world; Android
`WebViewCompat.addWebMessageListener` with an allowed-origin rule (`https://appassets.androidplatform.net`),
not `addJavascriptInterface`.

## Ops, version 1

| op | args | result | notes |
|---|---|---|---|
| `app.info` | | `{platform, app_id, version, bridge, features[], locale}` | first call of every page |
| `llm.models` | | `[{id, runtime, on_device, context_tokens, size_bytes, state}]` | on-device only: runtime `litert-lm`, `apple-fm`, `mlx` |
| `llm.count` | `{model, messages[], tools[]}` | `{tokens, context_tokens, fits}` | the prompt budget, before sending |
| `llm.generate` | `{model, messages[], tools[], sampling{temperature,top_k,top_p,seed}, max_tokens, schema?}` | `{text, json?, tool_calls[], stats}` | one answer, collected. `schema` (flat JSON schema) asks for guided output: Apple Foundation Models guided generation natively; on LiteRT-LM a JSON instruction plus StrictJson check, reported in `stats.guided: native\|checked` |
| `llm.stream` | same as `llm.generate` | `{stream}` | then events `llm.token{text}`, `llm.tool_call{name,args}`, `llm.done{stats}`, `llm.error{code,message}` |
| `llm.cancel` | `{stream}` | `{}` | |
| `llm.tools` | | `[{name, effect, description, parameters}]` | the native tools this app can run for the model (flat JSON schema) |
| `tool.run` | `{name, args, policy}` | `{verdict, executed, result}` | native runs `abp.check` first; `hold` returns without running |
| `abp.check` | `{policy, call{name,args}, scenario?}` | `{action: allow\|hold\|block, rule, reason}` | the same engine as `tool.run` uses |
| `abp.final` | `{policy, text, context}` | `{flags[]}` | answer-level checks (citations, state consistency) |
| `vault.read` | `{path}` | `{text \| json, sha256}` | read only, under the paths the feature manifest allows |
| `vault.list` | `{prefix}` | `[{path, size}]` | |
| `store.get` / `store.put` | `{key}` / `{key, value}` | | app-private, per feature, excluded from backup |
| `device.stats` | | `{memory_mb, battery_pct, charging, thermal}` | |
| `results.export` | `{format, data}` | `{}` | always behind a native share sheet a person taps |

`messages[]`: `{role: system|user|assistant|tool, text, tool_name?, tool_calls?}` (Android's `LlmMessage`).
`stats`: `{model, runtime, backend, prompt_tokens, output_tokens, ttft_ms, prefill_tps, decode_tps, total_ms, load_ms, stop}`
(Android's `LlmStats`, plus `runtime` and `stop`).

### Cloud, kept apart: `cloud.*`

Cloud models are never mixed into `llm.*` (conductor.android's ruling, adopted here): `cloud.models`,
`cloud.count`, `cloud.generate`, `cloud.stream`, `cloud.cancel` take the same args and give the same results,
plus `provider` ("openrouter.ai") in `stats`. A feature must list `cloud.*` in the manifest to get them, so a
page cleared for the device model cannot reach the network by accident. Every answer is labelled by the page
from its op: "On device" for `llm.*`, "Cloud · <model> via openrouter.ai" for `cloud.*`. Cloud judges use
`cloud.generate`. The key stays native (iOS `AIKeyStore`, Android's own store).

## Apple Intelligence (devices: iPad Air 11-inch M4, iPhone 16 Plus)

The Apple mode is more than a chat: `apple-fm` in `llm.models` (Foundation Models, guided generation, its own
tool calling), and native-only surfaces outside the bridge: App Intents (Siri, Spotlight, Shortcuts) that call
the same shared prompts and ABPs, Writing Tools and Visual Intelligence where they fit. Each is checked against
Apple's current documentation before it is built and gets a workbench scenario.

## Native side, same names

Kotlin `interface PtBridge { suspend fun call(op: String, args: JsonObject): JsonElement }` dispatching to
`LlmOps`, `AbpOps`, `VaultOps`, ...; Swift `protocol PtBridge { func call(_ op: String, _ args: JSONValue) async throws -> JSONValue }`.
Below it each app keeps its runtimes behind one seam: Android `LlmService` (LiteRT-LM today), iOS a new
`LlmService` protocol with LiteRT-LM, Foundation Models and OpenRouter (`PTAsk.OpenRouterClient`) implementations.

## Security

- Bridge only for local origins: Android `appassets.androidplatform.net` (bundle or verified snapshot), iOS a
  custom scheme handler. Remote sites keep PTWeb's current op set only.
- Every op is checked against the feature manifest (which feature may call which op).
- Model output is text; pages render it as text, never as HTML.
- Keys, tokens and vault keys never cross the bridge.

## Delivery

1. **Rebuilt at release (now).** Each app's CI fetches a tagged release of PrompTugal__App__Mobile, checks its
   SHA-256 against a pin in the app repo, and bundles it (`assets/mobile/` on Android, a resource bundle on
   iOS). A change lands in both apps by bumping one pin in each.
2. **Fetched at run time (next): JSON and content.** A release manifest (files, sizes, SHA-256, `version`,
   `bridge_min`) signed with Ed25519; the public key is built into the apps, the private key is a CI secret
   Dinis adds. The app verifies, caches content-addressed (as iOS PTSync does), and falls back to the bundled
   snapshot. Unsigned or `bridge_min` above the app: ignored.
3. **JavaScript over the air**: the staff apps (team, RiskMandate) only, by the same signed path, never the
   App Store news app.
