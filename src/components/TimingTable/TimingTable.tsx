"use client";

import styles from "./TimingTable.module.css";

// TODO: rows come from replay store (positions/intervals filtered by cursor)
// Mock data shaped like the future view-model:
type TimingRow = {
  position: number;
  driverNumber: number;
  acronym: string;
  teamColor: string; // hex from /v1/drivers team_colour
  gap: string;       // "LEADER" | "+1.234" | "+1 LAP"
  interval: string;
  lastLap: string;
  lapState: "fastest" | "pb" | "normal";
  inPit: boolean;
};

const MOCK_ROWS: TimingRow[] = [
  { position: 1, driverNumber: 1,  acronym: "VER", teamColor: "#3671C6", gap: "LEADER",  interval: "—",      lastLap: "1:26.734", lapState: "normal",  inPit: false },
  { position: 2, driverNumber: 4,  acronym: "NOR", teamColor: "#FF8000", gap: "+2.351",  interval: "+2.351", lastLap: "1:26.512", lapState: "fastest", inPit: false },
  { position: 3, driverNumber: 16, acronym: "LEC", teamColor: "#E8002D", gap: "+5.807",  interval: "+3.456", lastLap: "1:26.998", lapState: "pb",      inPit: false },
  { position: 4, driverNumber: 44, acronym: "HAM", teamColor: "#E8002D", gap: "+8.112",  interval: "+2.305", lastLap: "1:27.204", lapState: "normal",  inPit: false },
  { position: 5, driverNumber: 63, acronym: "RUS", teamColor: "#27F4D2", gap: "+12.440", interval: "+4.328", lastLap: "1:27.410", lapState: "normal",  inPit: true  },
  { position: 6, driverNumber: 81, acronym: "PIA", teamColor: "#FF8000", gap: "+14.023", interval: "+1.583", lastLap: "1:27.155", lapState: "pb",      inPit: false },
];

export default function TimingTable() {
  return (
    <section className={`card ${styles.wrap}`} aria-label="Live timing">
      <div className={`${styles.row} ${styles.head}`}>
        <span>POS</span>
        <span>DRIVER</span>
        <span className={styles.right}>GAP</span>
        <span className={styles.right}>INT</span>
        <span className={styles.right}>LAST LAP</span>
      </div>

      {MOCK_ROWS.map((row) => (
        <div key={row.driverNumber} className={styles.row}>
          <span className={`${styles.pos} tnum`}>{row.position}</span>
          <span className={styles.driver}>
            <i className={styles.teamBar} style={{ background: row.teamColor }} />
            <b>{row.acronym}</b>
            <span className={`${styles.num} tnum`}>{row.driverNumber}</span>
            {row.inPit && <span className={styles.pit}>PIT</span>}
          </span>
          <span className={`${styles.right} tnum`}>{row.gap}</span>
          <span className={`${styles.right} ${styles.dim} tnum`}>{row.interval}</span>
          <span className={`${styles.right} ${styles[row.lapState]} tnum`}>{row.lastLap}</span>
        </div>
      ))}
    </section>
  );
}
