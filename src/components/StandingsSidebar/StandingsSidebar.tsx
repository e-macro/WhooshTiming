"use client";

import type { ChampionshipDriver, ChampionshipTeam, Driver } from "@/lib/types/openf1";
import styles from "./StandingsSidebar.module.css";
import type { useSessionIndexes } from "@/lib/hooks/useSessionIndexes";
import { useReplayStore } from "@/store/replayStore";
import { latestAt } from "@/lib/replay/timeIndex";
import { pointsForPosition } from "@/lib/points";

type DriverRow = {
  acronym: string;
  points: number;
  delta: number;
  teamColor: string,
  positionStart: number,
}

type TeamRow = {
  name: string;
  points: number;
  delta: number;
  teamColor: string,
  positionStart: number,
}

const MOCK_TEAMS = [
  { name: "McLaren",  points: 662, delta: +26, teamColor: "#FF8000" },
  { name: "Red Bull", points: 589, delta: +25, teamColor: "#3671C6" },
  { name: "Ferrari",  points: 584, delta: +27, teamColor: "#E8002D" },
];

type Props = {
  drivers: Driver[],
  positionIndex: ReturnType<typeof useSessionIndexes>['positionIndex'],
  championshipDrivers: ChampionshipDriver[]
  championshipTeams: ChampionshipTeam[]
}

export default function StandingsSidebar({drivers, positionIndex, championshipDrivers, championshipTeams}: Props) {
  const cursor = useReplayStore(s => s.cursor)
  const driversRow: DriverRow[] = []
  const teamRow: TeamRow[] = []
  const teamDeltas: Record<string, number> = {}
  for (const entry of championshipDrivers) {
    const driver = drivers.find(d => d.driver_number === entry.driver_number)
    if (!driver) {
      continue
    }
    const position = latestAt(positionIndex, driver.driver_number, cursor)
    const delta = position ? pointsForPosition(position.position) : 0
    const total = entry.points_start + delta
    const teamName = driver.team_name
    teamDeltas[teamName] = (teamDeltas[teamName] ?? 0) + delta
    driversRow.push({
      acronym: driver.name_acronym,
      points: total,
      delta: delta,
      teamColor: `#${driver.team_colour}`,
      positionStart: entry.position_start ?? 99
    })
  }
  driversRow.sort((a, b) => b.points - a.points || a.positionStart - b.positionStart)
  for (const entry of championshipTeams) {
    const driver = drivers.find(d => d.team_name === entry.team_name)
    if (!driver) {
      continue
    }
    const total = entry.points_start + (teamDeltas[entry.team_name] ?? 0)
    teamRow.push({
      name: entry.team_name,
      points: total,
      delta: teamDeltas[entry.team_name],
      teamColor: `#${driver?.team_colour}`,
      positionStart: entry.position_start
    })
  }
  teamRow.sort((a, b) => b.points - a.points || a.positionStart - b.positionStart)
  return (
    <aside className={styles.wrap} aria-label="Theoretical standings">
      <section className={`card ${styles.block}`}>
        <h2 className={styles.heading}>Теоретичний залік</h2>
        {driversRow.map((d, i) => (
          <div key={d.acronym} className={styles.row}>
            <span className={`${styles.pos} tnum`}>{i + 1}</span>
            <i className={styles.teamBar} style={{ background: d.teamColor }} />
            <span className={styles.name}>{d.acronym}</span>
            <span className={`${styles.delta} tnum`}>+{d.delta}</span>
            <span className={`${styles.points} tnum`}>{d.points}</span>
          </div>
        ))}
      </section>

      <section className={`card ${styles.block}`}>
        <h2 className={styles.heading}>Кубок конструкторів</h2>
        {teamRow.map((t, i) => (
          <div key={t.name} className={styles.row}>
            <span className={`${styles.pos} tnum`}>{i + 1}</span>
            <i className={styles.teamBar} style={{ background: t.teamColor }} />
            <span className={styles.name}>{t.name}</span>
            <span className={`${styles.delta} tnum`}>+{t.delta}</span>
            <span className={`${styles.points} tnum`}>{t.points}</span>
          </div>
        ))}
      </section>
    </aside>
  );
}
