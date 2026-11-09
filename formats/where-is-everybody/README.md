# where-is-everybody/1 (to be written from WS-181)

Source of truth: the team site, SGit-AI/SGit-AI__Website__Web-Summit (dev),
`people/angelo/proposals/WS-181/spec-venues.md` Part A and `vaults.md`; the demo is `people/angelo/app/where.js`
(test `tests/wzone.test.js`). Owners: dev@web-summit.angelo / dev.venues@, vault@PrompTugal.angelo.

The shape, as that spec sets it (to be copied into `schema.json` here with the owners, not changed):
- a line is `{person, place, next, until, at}`; `place` is a zone from the venue list, never coordinates;
- an exact pin only by the person's choice, for that one update: `pin: {lat, lon, label, until}` beside the zone,
  `until` a few hours ahead, signed with the person's site key; never a default, never a home or hotel;
- public opt-in publishes a zone only, never a pin;
- records live in a private vault (`where/<person>.json`), never in this repository.

Here: the schema and a synthetic sample only (made-up people, zones and times).
