'use client'

import type { Location } from "@/lib/types/openf1";
import { boundaryTick, findSectorBoundaryIndexes, normalizeTrackPoints } from "@/lib/replay/trackMap";
import styles from "./TrackMap.module.css";
import type { TrackStatusMilestone } from "@/lib/replay/trackStatus";
import { useReplayStore } from "@/store/replayStore";
import { searchLatest, type CompletedLap } from "@/lib/replay/timeIndex";
import { useMemo } from "react";

const VIEW_BOX_SIZE = 500;
/* Track stroke is centered on the path, so half of it pokes past the
   outermost points — widen the "camera" instead of shrinking the world. */
const VIEW_BOX_PAD = 12;
/* Sector-boundary cut: half-length of the background-coloured tick that
   "erases" a constant-width slice of the stroke (track is 10 wide). */
const TICK_HALF_LEN = 9;

/* Broadcast-style status wording (timing-screen terms stay English). */
const STATUS_LABEL = {
  yellow: "YELLOW FLAG",
  sc: "SAFETY CAR",
  vsc: "VIRTUAL SAFETY CAR",
  red: "RED FLAG",
  chequered: "CHEQUERED FLAG",
} as const;

type Props = {
  location: Location[],
  milestones: TrackStatusMilestone[],
  fastestLap: CompletedLap | null
}

export default function TrackMap({ location, milestones, fastestLap }: Props) {
  const cursor = useReplayStore(s => s.cursor)
  const rec = searchLatest(milestones, cursor)
  const boundaries = useMemo(() => fastestLap ? findSectorBoundaryIndexes(location, fastestLap) : null, [location, fastestLap])
  const points = useMemo(() => normalizeTrackPoints(location, VIEW_BOX_SIZE), [location]);
  const segments = useMemo(() => {
    const toAttr = (pts: {x: number, y: number}[]) => pts.map(p => `${p.x},${p.y}`).join(" ")
    if (points.length === 0) {
      return []
    }
    // Close the loop: the lap ends where it started, so the outline is a ring
    // and every visible gap is painted by a background-coloured tick.
    if(boundaries === null) {
      return [toAttr([...points, points[0]])]
    }
    // Segments share the boundary point — the visual gap is painted by the
    // background-coloured tick, so its size is constant on every track.
    const [i1, i2] = boundaries
    return [
      toAttr(points.slice(0, i1 + 1)),
      toAttr(points.slice(i1, i2 + 1)),
      toAttr([...points.slice(i2), points[0]])
    ]
  }, [points, boundaries])
  const ticks = useMemo(() => {
    if (points.length < 2) {
      return []
    }
    // Start/finish cut always exists; sector cuts join it when data allows.
    const startFinish = boundaryTick(points, 0, TICK_HALF_LEN)
    if (boundaries === null) {
      return [startFinish]
    }
    return [startFinish, ...boundaries.map((idx) => boundaryTick(points, idx, TICK_HALF_LEN))]
  }, [points, boundaries])
  const status = rec?.status ?? 'green'
  // Secondary data (progressive enhancement): may still be loading.
  if (location.length === 0) {
    return (
      <section className={`card ${styles.placeholder}`} aria-label="Карта траси">
        <span className={styles.heading}>Карта траси</span>
        <p className={styles.text}>Завантажується контур траси…</p>
      </section>
    );
  }

  return (
    <section className={`card ${styles.wrap}`} aria-label="Карта траси">
      <div className={styles.headRow}>
        <span className={styles.heading}>Карта траси</span>
        {status !== "green" && (
          <span className={styles.statusLabel} data-status={status} role="status">
            {STATUS_LABEL[status]}
          </span>
        )}
      </div>
      <svg
        className={styles.svg}
        viewBox={`-${VIEW_BOX_PAD} -${VIEW_BOX_PAD} ${VIEW_BOX_SIZE + VIEW_BOX_PAD * 2} ${VIEW_BOX_SIZE + VIEW_BOX_PAD * 2}`}
        role="img"
        aria-label="Контур траси"
        data-status={status}
      >
        {segments.map((attr, i) => (
          <polyline key={i} points={attr} className={styles.track} />
        ))}
        {ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} className={styles.cut} />
        ))}
      </svg>
    </section>
  );
}
