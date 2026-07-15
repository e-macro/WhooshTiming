/**
 * OpenF1 API response types — https://openf1.org/docs
 * Field names mirror the API exactly (snake_case) so raw responses
 * can be typed without mapping. Create view-models separately.
 */

export interface Meeting {
  meeting_key: number;
  meeting_name: string;
  meeting_official_name: string;
  circuit_key: number;
  circuit_short_name: string;
  country_name: string;
  country_code: string;
  location: string;
  date_start: string; // ISO 8601
  year: number;
  is_cancelled: boolean,
}

export interface Session {
  session_key: number;
  meeting_key: number;
  session_name: string;          // "Race" | "Qualifying" | "Sprint" | ...
  session_type: string;          // "Race" | "Qualifying" | "Practice"
  date_start: string;
  date_end: string;
  circuit_short_name: string;
  country_name: string;
  year: number;
}

export interface Driver {
  driver_number: number;
  session_key: number;
  broadcast_name: string;        // "M VERSTAPPEN"
  name_acronym: string;          // "VER"
  full_name: string;
  team_name: string;
  team_colour: string;           // hex WITHOUT '#', e.g. "3671C6"
  headshot_url: string | null;
  country_code: string;
}

/** Event-based: a record is emitted when a driver's position changes. */
export interface Position {
  session_key: number;
  driver_number: number;
  position: number;
  date: string;
}

/** Race only; updated ~every 4 seconds. */
export interface Interval {
  session_key: number;
  driver_number: number;
  gap_to_leader: number | string | null; // number of seconds | "+1 LAP" | null
  interval: number | string | null;
  date: string;
}

export interface Lap {
  session_key: number;
  driver_number: number;
  lap_number: number;
  lap_duration: number | null;   // seconds; null for in/out laps
  duration_sector_1: number | null;
  duration_sector_2: number | null;
  duration_sector_3: number | null;
  is_pit_out_lap: boolean;
  date_start: string;
}

export interface Pit {
  session_key: number;
  driver_number: number;
  pit_duration: number;
  lap_number: number;
  date: string;
}

export interface ChampionshipDriver {
  driver_number: number;
  meeting_key: number;
  points_current: number;
  points_start: number;
  position_current: number;
  position_start: number;
  session_key: number
}

export interface ChampionshipTeam {
  meeting_key: number;
  points_current: number;
  points_start: number;
  position_current: number;
  position_start: number;
  sessin_key: number,
  team_name: string
}

/** ~3.7 Hz car coordinates — for the future track map. */
export interface Location {
  session_key: number;
  driver_number: number;
  x: number;
  y: number;
  z: number;
  date: string;
}

export interface RaceControl {
  category: string,
  date: string,
  driver_number: number | null,
  flag: string | null,
  lap_number: number,
  meeting_key: number,
  message: string,
  qualifying_phase: number | null,
  scope: string | null,
  sector: number | null,
  session_key: number
}