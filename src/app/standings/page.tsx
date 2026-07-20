import Image from "next/image";
import Link from "next/link";
import { openf1 } from "@/lib/api/openf1";
import styles from "./standings.module.css";
import { findLastPastSession } from "@/lib/models/race";

type Props = {
  searchParams: Promise<{ season?: string }>
}
type DriverStandingsRow = {
  position: number,
  fullName: string,
  team: string,
  teamColor: string,
  points: number,
  headshotUrl: string | null
}
type TeamStandingsRow = {
  name: string,
  teamColor: string,
  points: number
}

const SEASONS = [2023, 2024, 2025, 2026]

function initials(fullName: string): string {
  return fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function SeasonPicker({ active }: { active: number }) {
  return (
    <nav className={styles.seasons} aria-label="Вибір сезону">
      {SEASONS.map((year) => (
        <Link
          key={year}
          href={`/standings?season=${year}`}
          className={`${styles.chip} ${year === active ? styles.chipActive : ""} tnum`}
        >
          {year}
        </Link>
      ))}
    </nav>
  );
}

function DriverAvatar({ row }: { row: DriverStandingsRow }) {
  if (row.headshotUrl) {
    return (
      <Image
        className={styles.avatar}
        src={row.headshotUrl}
        alt=""
        width={32}
        height={32}
      />
    );
  }
  return (
    <span className={styles.avatarFallback} style={{ background: row.teamColor }}>
      {initials(row.fullName)}
    </span>
  );
}

function DriversTable({ rows }: { rows: DriverStandingsRow[] }) {
  return (
    <section className={`card ${styles.block}`}>
      <h2 className={styles.heading}>Залік пілотів</h2>
      {rows.map((row) => (
        <div key={row.fullName} className={styles.driverRow}>
          {row.position > 0 && <span className={`${styles.pos} tnum`}>{row.position}</span>}
          <DriverAvatar row={row} />
          <i className={styles.teamBar} style={{ background: row.teamColor }} />
          <span className={styles.driverInfo}>
            <span className={styles.driverName}>{row.fullName}</span>
            <span className={styles.driverTeam}>{row.team}</span>
          </span>
          <span className={`${styles.points} tnum`}>{row.points}</span>
        </div>
      ))}
    </section>
  );
}

function TeamsTable({ rows }: { rows: TeamStandingsRow[] }) {
  return (
    <section className={`card ${styles.block}`}>
      <h2 className={styles.heading}>Кубок конструкторів</h2>
      {rows.map((row) => (
        <div key={row.name} className={styles.teamRow}>
          <i className={styles.teamBar} style={{ background: row.teamColor }} />
          <span className={styles.teamName}>{row.name}</span>
          <span className={`${styles.points} tnum`}>{row.points}</span>
        </div>
      ))}
    </section>
  );
}

export default async function StandingsPage({ searchParams }: Props) {
  const { season } = await searchParams
  const raw = Number(season)
  const validSeason = SEASONS.includes(raw) ? raw : SEASONS.at(-1)!
  // eslint-disable-next-line react-hooks/purity
  const nowMs = Date.now()
  const sessions = await openf1.raceSessions(validSeason)
  const allSessions = await openf1.sessionsByYear(validSeason)
  const lastSession = findLastPastSession(sessions, nowMs)

  if (!lastSession) {
    const latestPastSession = findLastPastSession(allSessions, nowMs)

    if (!latestPastSession) {
      return (
        <section className={styles.page}>
          <header className={styles.head}>
            <h1 className={styles.title}>Залік сезону</h1>
            <SeasonPicker active={validSeason} />
          </header>
          <div className={`card ${styles.placeholder}`}>
            <p>Сезон {validSeason} ще не розпочався.</p>
            <p className={styles.dim}>Залік з&apos;явиться, щойно відбудеться перша сесія.</p>
          </div>
        </section>
      );
    }

    const drivers = await openf1.drivers(latestPastSession.session_key)
    const driversStandings: DriverStandingsRow[] = []
    for (const driver of drivers) {
      driversStandings.push({
        position: 0,
        fullName: driver.full_name,
        team: driver.team_name,
        teamColor: `#${driver.team_colour}`,
        points: 0,
        headshotUrl: driver.headshot_url || null
      })
    }
    driversStandings.sort((a, b) => a.fullName.localeCompare(b.fullName))

    return (
      <section className={styles.page}>
        <header className={styles.head}>
          <h1 className={styles.title}>Залік сезону</h1>
          <SeasonPicker active={validSeason} />
        </header>
        <p className={styles.dim}>
          Гонки сезону {validSeason} ще не відбувались — склад пілотів за алфавітом, очки з&apos;являться після першого етапу.
        </p>
        <div className={styles.grid}>
          <DriversTable rows={driversStandings} />
        </div>
      </section>
    );
  }

  const [drivers, driversStandings, teamsStandings] = await Promise.all([
    openf1.drivers(lastSession.session_key),
    openf1.championshipDrivers(lastSession.session_key),
    openf1.championshipTeams(lastSession.session_key)
  ])
  const driverRows: DriverStandingsRow[] = []
  const teamRows: TeamStandingsRow[] = []
  for (const entry of driversStandings) {
    const driver = drivers.find(d => d.driver_number === entry.driver_number)
    if (!driver) {
      continue
    }
    driverRows.push({
      position: entry.position_current,
      fullName: driver.full_name,
      team: driver.team_name,
      teamColor: `#${driver.team_colour}`,
      points: entry.points_current,
      headshotUrl: driver.headshot_url || null
    })
  }
  driverRows.sort((a, b) => b.points - a.points)
  for (const entry of teamsStandings) {
    const driver = drivers.find(d => d.team_name === entry.team_name)
    if (!driver) {
      continue
    }
    teamRows.push({
      name: entry.team_name,
      teamColor: `#${driver.team_colour}`,
      points: entry.points_current
    })
  }
  teamRows.sort((a, b) => b.points - a.points)

  return (
    <section className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>Залік сезону</h1>
        <SeasonPicker active={validSeason} />
      </header>
      <div className={styles.grid}>
        <DriversTable rows={driverRows} />
        <TeamsTable rows={teamRows} />
      </div>
    </section>
  );
}
