"use client";

import { useReplayStore } from "@/store/replayStore";
import styles from "./ReplayControls.module.css";
import { formatTime } from "@/lib/format";
import { useRef } from "react";

const SPEEDS = [1, 10, 30] as const;

export default function ReplayControls() {
  const isPlaying = useReplayStore(s => s.isPlaying);
  const play = useReplayStore(s => s.play);
  const pause = useReplayStore(s => s.pause);
  const speed = useReplayStore(s => s.speed);
  const setSpeed = useReplayStore(s => s.setSpeed);
  const cursor = useReplayStore(s => s.cursor)
  const duration = useReplayStore(s => s.duration)
  const seek = useReplayStore(s => s.seek)
  const progress = (cursor / duration)*100
  // const isDraggingRef = useRef(false)
  return (
    <div className={`card ${styles.bar}`}>
      <button className={styles.play} aria-label={isPlaying ? 'Зупинити' : "Відтворити"} onClick={isPlaying ? pause : play}>
        {isPlaying ? "⏸" : "▶"}
      </button>
      <div className={styles.track} role="slider" aria-label="Позиція реплею"
          aria-valuemin={0} aria-valuemax={duration} aria-valuenow={cursor} tabIndex={0}
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            const sub = (e.clientX - rect.left) / rect.width
            seek(sub*duration)
          }}
          >
        <div className={styles.progress} style={{ width: `${progress}%` }} />
      </div>

      <span className={`${styles.time} tnum`}>{formatTime(cursor)}</span>

      <div className={styles.speeds}>
        {SPEEDS.map((s) => (
          <button key={s} className={`${styles.speed} ${s === speed ? styles.active : ""} tnum`} onClick={() => setSpeed(s)}>
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}
