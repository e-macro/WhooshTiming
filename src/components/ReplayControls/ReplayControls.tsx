"use client";

import styles from "./ReplayControls.module.css";

// TODO: wire to replayStore (isPlaying, cursor, speed, seek)
const SPEEDS = [1, 10, 30] as const;

export default function ReplayControls() {
  return (
    <div className={`card ${styles.bar}`}>
      <button className={styles.play} aria-label="Відтворити">
        ▶
      </button>

      {/* TODO: seek slider bound to session time range */}
      <div className={styles.track} role="slider" aria-label="Позиція реплею"
           aria-valuemin={0} aria-valuemax={100} aria-valuenow={55} tabIndex={0}>
        <div className={styles.progress} style={{ width: "55%" }} />
      </div>

      <span className={`${styles.time} tnum`}>1:02:47</span>

      <div className={styles.speeds}>
        {SPEEDS.map((s) => (
          <button key={s} className={`${styles.speed} ${s === 10 ? styles.active : ""} tnum`}>
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}
