// node --test formats/schedule-rules/
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { RULES, travelMinutes, showsAs, clashes, toICS, splitKey } from "./schedule-rules.mjs";

const here = (f) => new URL(f, import.meta.url);
const cases = JSON.parse(readFileSync(here("cases.json"), "utf8"));
const rules = JSON.parse(readFileSync(here("rules.json"), "utf8"));

test("RULES match rules.json", () => {
  assert.deepEqual(RULES.travel.summit_place_keywords, rules.travel.summit_place_keywords);
  assert.equal(RULES.travel.within_summit_minutes, rules.travel.within_summit_minutes);
  assert.equal(RULES.travel.elsewhere_minutes, rules.travel.elsewhere_minutes);
  assert.equal(RULES.default_duration_minutes, rules.default_duration_minutes);
  assert.deepEqual(RULES.shows_as.fallback_free_title_patterns, rules.shows_as.fallback_free_title_patterns);
  assert.equal(RULES.shows_as.fallback_free_min_minutes, rules.shows_as.fallback_free_min_minutes);
});

test("travel", () => { for (const c of cases.travel) assert.equal(travelMinutes(c.a, c.b), c.minutes, `${c.a} -> ${c.b}`); });
test("shows_as", () => { for (const c of cases.shows_as) assert.equal(showsAs(c.item, c.toggles), c.expect, c.item.id); });
test("clashes", () => {
  for (const c of cases.clashes) assert.deepEqual(clashes(c.items, { toggles: c.toggles, splits: c.splits }), c.expect, c.name);
});
test("splitKey is order-free", () => assert.equal(splitKey("e", "d"), "d|e"));

test("ics", () => {
  const items = [
    { id: "a", title: "Talk; A, with \\ and\nnewline", start: "2026-11-10T10:00:00+00:00", place: "Centre Stage", url: "https://promptugal.news/e/a" },
    { id: "r", title: "Registration " + "é".repeat(60), start: "2026-11-10T09:00:00+00:00", end: "2026-11-10T19:00:00+00:00" },
  ];
  const ics = toICS(items, { now: "2026-11-09T12:00:00Z" });
  assert.ok(ics.endsWith("END:VCALENDAR\r\n"));
  assert.ok(!/[^\r]\n/.test(ics), "CRLF only");
  for (const line of ics.split("\r\n")) assert.ok(new TextEncoder().encode(line).length <= 75, "folded");
  const unfolded = ics.replace(/\r\n /g, "");
  assert.ok(unfolded.includes(String.raw`SUMMARY:Talk\; A\, with \\ and\nnewline`), "escaped");
  assert.match(unfolded, /DTSTART:20261110T100000Z\r\nDTEND:20261110T103000Z/);
  assert.match(unfolded, /UID:r@promptugal.news[\s\S]*TRANSP:TRANSPARENT/);
  assert.match(unfolded, /UID:a@promptugal.news[\s\S]*TRANSP:OPAQUE/);
  assert.ok(unfolded.indexOf("UID:r@") < unfolded.indexOf("UID:a@"), "sorted by start");
});
