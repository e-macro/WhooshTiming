"use client";

import ReplayControls from "@/components/ReplayControls/ReplayControls";
import TimingTable from "@/components/TimingTable/TimingTable";
import StandingsSidebar from "@/components/StandingsSidebar/StandingsSidebar";
import styles from "./race.module.css";

type Props = { sessionKey: string };

export default function RaceClient({ sessionKey }: Props) {
  // TODO: TanStack Query — load session data (positions, intervals, laps)
  // TODO: feed loaded data into replay store (src/store/replayStore.ts)
  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <p className={styles.eyebrow}>Race replay</p>
          <h1 className={styles.title}>
            Session <span className="tnum">#{sessionKey}</span>
          </h1>
        </div>
        {/* TODO: lap counter — current lap / total from replay cursor */}
        <span className={`${styles.lap} tnum`}>LAP 32 / 58</span>
      </header>

      <ReplayControls />

      <div className={styles.grid}>
        <TimingTable />
        <StandingsSidebar />
      </div>
    </div>
  );
}
