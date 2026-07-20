import {
  type Meeting, type Session, type Driver, type Position, type Interval, type Lap,
  type Pit,
  ChampionshipDriver,
  type ChampionshipTeam,
  type RaceControl,
  type Stint,
} from "@/lib/types/openf1";

const BASE = "https://api.openf1.org/v1";
const REQUEST_INTERVAL_MS = 350;

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))
let queueTail: Promise<void> = Promise.resolve()
/**
 * Thin typed fetch wrapper.
 * Free tier limits: 3 req/s, 30 req/min — batch requests and cache
 * aggressively via TanStack Query (historical data never changes).
 * It now makes a query queue and bypasses poisoned caches to avoid HTTP 429 error
 */
async function get<T>(path: string, params: Record<string, string | number>, opts?: CacheOpts): Promise<T[]> {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  );
  const myTurn = queueTail.then(() => sleep(REQUEST_INTERVAL_MS));
  queueTail = myTurn;
  await myTurn
  const init = opts?.revalidate !== undefined
    ? { next: { revalidate: opts.revalidate}}
    : { cache: 'force-cache' as const}
  let res = await fetch(`${BASE}/${path}?${qs}`, init);
  if (!res.ok) {
    await sleep(REQUEST_INTERVAL_MS)
    res = await fetch(`${BASE}/${path}?${qs}`, { cache: "reload" });  // bypass poisoned cache, force network
  }
  if (!res.ok) throw new ApiError(`OpenF1 ${path}: ${res.status}`, res.status);
  return res.json();
}

export const openf1 = {
  meetings: (year: number, opts?: CacheOpts) => get<Meeting>("meetings", { year }, opts),
  meeting: (meetingKey: number) => get<Meeting>('meetings', { meeting_key: meetingKey}),
  sessions: (meetingKey: number) => get<Session>("sessions", { meeting_key: meetingKey }),
  raceSessions: (year: number, opts?: CacheOpts) => get<Session>("sessions", { year, session_name: "Race" }, opts),
  sessionsByYear: (year: number) => get<Session>('sessions', { year }),
  drivers: (sessionKey: number) => get<Driver>("drivers", { session_key: sessionKey }),
  positions: (sessionKey: number) => get<Position>("position", { session_key: sessionKey }),
  intervals: (sessionKey: number) => get<Interval>("intervals", { session_key: sessionKey }),
  laps: (sessionKey: number) => get<Lap>("laps", { session_key: sessionKey }),
  session: (sessionKey: number) => get<Session>("sessions", { session_key: sessionKey }),
  pits: (sessionKey: number) => get<Pit>('pit', {session_key: sessionKey}),
  championshipDrivers: (sessionKey: number) => get<ChampionshipDriver>('championship_drivers', {session_key: sessionKey}),
  championshipTeams: (sessionKey: number) => get<ChampionshipTeam>('championship_teams', {session_key: sessionKey}),
  raceControl: (sessionKey: number) => get<RaceControl>('race_control', {session_key: sessionKey}),
  stints: (sessionKey: number) => get<Stint>('stints', { session_key: sessionKey})
  // NOTE: /v1/location is huge (~0.5M records per race).
  // Fetch in time windows (date>=...&date<=...) — never all at once.
};

export type CacheOpts = {
  revalidate?: number
}
export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message)
  }
}