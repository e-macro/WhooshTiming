---
name: openf1
description: OpenF1 API reference for this project — endpoint semantics, rate-limit strategy, and data quirks discovered by inspecting real responses. Use before adding or debugging anything that touches api.openf1.org.
---

# OpenF1 API — hard-won notes

Base: `https://api.openf1.org/v1`. Typed helpers: `src/lib/api/openf1.ts`.
Free tier is **historical only** (sessions become available ~30 min after they end).

**Golden rule of this file: every claim below was verified against real responses.** When
something behaves unexpectedly, `curl` the endpoint and look before theorising — several "bugs" in
this project turned out to be API semantics, and at least one confident hypothesis was wrong.

## Rate limits and the request queue

- **3 req/s and 30 req/min.** The per-minute cap is the one that actually bites.
- `get()` in `openf1.ts` serialises every request through a **promise-chain queue**
  (`REQUEST_INTERVAL_MS = 350`): each call links itself behind the current tail *synchronously*,
  then awaits. Booking the slot before the `await` is what prevents two callers grabbing the same
  slot.
- The queue paces **starts**, not completions — a slow response never blocks the next request.
- Retry policy (`providers.tsx`): 4xx is not retried **except 429**, which gets up to 4 attempts
  with growing delays. 5xx/network gets 2.
- During UI scrubbing, requests are throttled further by debouncing the *input* (window index in
  `useLocationWindows`), not by slowing the queue.

### Cache poisoning (a real incident)

`get()` uses `cache: "force-cache"`. The browser will happily cache a **429 response** and then
serve it from disk forever — symptom: repeated instant failures with `(disk cache)` and 1–2 ms
timing in DevTools, and retries that never reach the network. `get()` therefore retries once with
`cache: "reload"` when the first response is not ok. **Only cache success.**

## Date filtering: strict operators only

```
date>=  DOES NOT EXIST
date>   works
```

In a query string the **first `=` splits key from value**, so `date>=2024-…` is parsed as key
`date>` with value `2024-…`. Encoded properly (`URLSearchParams` → `date%3E`), only the
single-character operators work. Both `Z` and `+00:00` are accepted — same instant, different
spelling.

## Endpoint semantics

| Endpoint | Shape | Notes |
|---|---|---|
| `meetings`, `sessions` | one record per event | `sessions` has no `meeting_name`; join on `meeting_key`. `?year=` works here but **not** on `session_result`. |
| `position` | event-based | A record only when a position changes — **and classification reshuffles produce records for retired cars too**. Never use as an "is the car alive" signal. |
| `intervals` | ~every 4 s | `gap_to_leader` / `interval` are `number \| string \| null` — `"+1 LAP"` appears as a string, `null` early in the race before gaps settle. |
| `laps` | one per lap per driver | `lap_duration` is `null` for in/out laps — filter before indexing. `date_start` is the lap start, so lap *completion* = `date_start + lap_duration`. |
| `pit` | one per stop | **`date` is the pit-lane exit, not entry.** Shift by `-pit_duration` to get the entry moment. |
| `stints` | lap ranges | `lap_end` may be `null` for an ongoing stint. Tyre age = `tyre_age_at_start + (currentLap - lap_start)`. |
| `race_control` | messages | `category`: `Flag` / `SafetyCar` / `Drs` / `Other` / `SessionStatus`. `flag` is `null` for non-flag categories. `scope`: `Track` / `Sector` / `Driver` / `None`. |
| `location` | x/y/z at ~3.7 Hz | ~0.5M records per race — always fetch in windows. |
| `car_data` | ~3.6 Hz | `speed`, `throttle` (real 0–100 %), `brake` (**binary 0/100, not pressure**), `drs` (coded), `n_gear`, `rpm`. One lap ≈ 300 records. |
| `championship_drivers` / `championship_teams` | beta | Query by `session_key`. Gives `points_start` / `points_current` — no need to aggregate `session_result` yourself. |

## Endpoints do not cover the same set of drivers

**Never assume that a driver listed by one endpoint appears in another.** `/v1/drivers` is the
*entry list*, not the set of drivers with data:

- China 2026 (`11245`) lists 22 drivers, but only **18** have any lap with a `lap_duration`;
  driver #1 — the *first* entry returned — has no lap records at all (`404`).
- Monaco 2026 (`11299`) has `location` for some drivers and time windows and not others.
- `position` records exist for retired cars long after they stop (classification reshuffles).

Consequence: any "pick the first driver" default must be taken from the **intersection** with the
data you actually need, not from `drivers[0]`. Drivers outside that intersection should be shown
but disabled, so the roster stays honest.

## Data quirks that caused real bugs

- **`(0,0,0)` in `location` is a sentinel**, not a position: it means "no signal". Retired cars
  either send that or keep sending **frozen real coordinates** — the stream never stops and never
  returns `null`. So "data ended" is not a usable retirement signal.
- **Retirement is detected from laps, not positions or location.** `isDriverOut()` asks: *how many
  laps has the leader completed since this driver last completed one?* A time threshold breaks on
  zero-lap crashes and under red flags; an absolute lap-gap breaks on lapped-but-running cars.
- **Session `date_start`/`date_end` is the scheduled slot** (often exactly 2 h), not the actual
  race length. Derive the real duration from the last `position` record.
- **Location quality varies per session.** HU-2026 (`11342`): 315 records per lap but only **26
  unique** coordinates; HU-2025 (`9928`) on the same circuit: 297/297. Hence `hasUsableOutline`
  gates the track map on the **ratio** of unique points (ratio, not an absolute count — point
  count scales with lap duration).
- **The highest `lap_number` in the data was never completed by anyone.** Spa 2026 (`11334`): raw
  max is **45**, max with a non-null `lap_duration` is **44** — the leader started lap 45 and the
  session ended. So any "list of laps" UI must be built from *completed* laps, not from the raw
  range. Trimming the last element instead is a positional hack that breaks when the count differs.
- **Sector durations are lengths, not marks.** The S2/S3 boundary is
  `duration_sector_1 + duration_sector_2`, cumulative.
- **`location` coverage can be patchy within a session.** Monaco 2026 (`11299`) returns 200 for
  some windows and **404 for most**, including the fastest-lap window — so a session that clearly
  has location data can still fail for the exact slice you ask for. Treat a 404 here as "no data",
  not as an error worth retrying, and make sure the UI can tell "request failed" apart from "still
  loading": `?? []` collapses both into an empty array and leaves the map spinning forever.

## Reference sessions for testing

- **Interlagos 2024 (`9636`)** — wet chaos: VSC, SC, red flag, retirements. Exercises every track
  status and DNF path.
- **Hungaroring 2026 (`11342`)** — degraded location feed; use to test the outline quality guard.
- **Spa 2026 (`11334`)** — the retirement spread, useful for any "is this driver available at lap
  N" logic: RUS #63 zero completed laps (broke the original time-based DNF logic), PER #11 out
  after lap 13, STR #18 after 25, ALO #14 after 42, BOT #77 after 43, everyone else 44.

## Window loading pattern

`location` (and any high-rate stream) is loaded lazily around the replay cursor:

- `WINDOW_MS = 120_000` — chosen so that at 30× playback the app issues ~15 req/min, half the cap.
  The formula: `requests/min = 1800 / WINDOW_SECONDS`.
- `useLocationWindows` computes the current window index from the cursor, **debounces it** (400 ms)
  so scrubbing does not fire a request per intermediate window, and feeds `useQueries`.
- `combine` memoises the flattened result, which keeps downstream `useMemo` indexes stable.
- Windows are deliberately **excluded from IndexedDB persistence** (`shouldDehydrateQuery`) — they
  are huge, lazy and cheap to refetch, unlike the blocking per-session queries.
