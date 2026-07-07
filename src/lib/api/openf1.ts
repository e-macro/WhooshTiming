import type {
  Meeting, Session, Driver, Position, Interval, Lap,
} from "@/lib/types/openf1";

const BASE = "https://api.openf1.org/v1";

/**
 * Thin typed fetch wrapper.
 * Free tier limits: 3 req/s, 30 req/min — batch requests and cache
 * aggressively via TanStack Query (historical data never changes).
 */
async function get<T>(path: string, params: Record<string, string | number>): Promise<T[]> {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  );
  const res = await fetch(`${BASE}/${path}?${qs}`, {cache: 'force-cache'});
  if (!res.ok) throw new ApiError(`OpenF1 ${path}: ${res.status}`, res.status);
  return res.json();
}

export const openf1 = {
  meetings: (year: number) => get<Meeting>("meetings", { year }),
  sessions: (meetingKey: number) => get<Session>("sessions", { meeting_key: meetingKey }),
  raceSessions: (year: number) => get<Session>("sessions", { year, session_name: "Race" }),
  drivers: (sessionKey: number) => get<Driver>("drivers", { session_key: sessionKey }),
  positions: (sessionKey: number) => get<Position>("position", { session_key: sessionKey }),
  intervals: (sessionKey: number) => get<Interval>("intervals", { session_key: sessionKey }),
  laps: (sessionKey: number) => get<Lap>("laps", { session_key: sessionKey }),
  session: (sessionKey: number) => get<Session>("sessions", { session_key: sessionKey })
  // NOTE: /v1/location is huge (~0.5M records per race).
  // Fetch in time windows (date>=...&date<=...) — never all at once.
};

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message)
  }
}