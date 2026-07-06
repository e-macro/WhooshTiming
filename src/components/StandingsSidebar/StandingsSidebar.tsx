"use client";

import styles from "./StandingsSidebar.module.css";

// TODO: theoretical points = pre-race standings + points for current positions
// (base from /v1/championship standings, live delta from replay cursor)
const MOCK_DRIVERS = [
  { acronym: "VER", points: 393, delta: +25, teamColor: "#3671C6" },
  { acronym: "NOR", points: 371, delta: +18, teamColor: "#FF8000" },
  { acronym: "LEC", points: 340, delta: +15, teamColor: "#E8002D" },
  { acronym: "PIA", points: 291, delta: +8,  teamColor: "#FF8000" },
];

const MOCK_TEAMS = [
  { name: "McLaren",  points: 662, delta: +26, teamColor: "#FF8000" },
  { name: "Red Bull", points: 589, delta: +25, teamColor: "#3671C6" },
  { name: "Ferrari",  points: 584, delta: +27, teamColor: "#E8002D" },
];

export default function StandingsSidebar() {
  return (
    <aside className={styles.wrap} aria-label="Theoretical standings">
      <section className={`card ${styles.block}`}>
        <h2 className={styles.heading}>Теоретичний залік</h2>
        {MOCK_DRIVERS.map((d, i) => (
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
        {MOCK_TEAMS.map((t, i) => (
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
