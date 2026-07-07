"use client";

import ReplayControls from "@/components/ReplayControls/ReplayControls";
import TimingTable from "@/components/TimingTable/TimingTable";
import StandingsSidebar from "@/components/StandingsSidebar/StandingsSidebar";
import styles from "./race.module.css";
import { useQuery } from "@tanstack/react-query";
import { openf1 } from "@/lib/api/openf1";
import { useReplayStore } from "@/store/replayStore";
import { useEffect } from "react";

type Props = { sessionKey: string };

export default function RaceClient({ sessionKey }: Props) {
  const setDuration = useReplayStore(s => s.setDuration)
  const drivers = useQuery({
    queryKey: ['drivers', sessionKey],
    queryFn: () => openf1.drivers(Number(sessionKey)),
  })
  const positions = useQuery({
    queryKey: ['positions', sessionKey],
    queryFn: () => openf1.positions(Number(sessionKey)),
  })
  const laps = useQuery({
    queryKey: ['laps', sessionKey],
    queryFn: () => openf1.laps(Number(sessionKey)),
  })
  const session = useQuery({
    queryKey: ['session', sessionKey],
    queryFn: () => openf1.session(Number(sessionKey)),
  })
  useEffect(() => {
    if (!session.data?.[0] || !positions.data) {
      return
    }
    const startMs = new Date(session.data[0].date_start).getTime()
    const endMs = positions.data.reduce((acc, n) => Math.max(acc, new Date(n.date).getTime()), 0)
    const duration = endMs - startMs;
    setDuration(duration);
    
  }, [setDuration, session.data, positions.data])
  if (drivers.isPending || positions.isPending || laps.isPending || session.isPending) {
    return (
      <div className={styles.state} data-variant="loading" role="status">
        <span className={styles.stateBadge}>
          <span className={styles.stateDot} />
          Loading session
        </span>
        <p className={styles.stateText}>Чекаємо на не обляпані брітіш баясом дані з гонки</p>
      </div>
    );
  }
  if (drivers.isError || positions.isError || laps.isError || session.isError) {
    return (
      <div className={styles.state} data-variant="error" role="alert">
        <span className={styles.stateBadge}>
          <span className={styles.stateDot} />
          Data error
        </span>
        <p className={styles.stateText}>Ох йойки! Щось пішло не так. Володя скоро вирішить проблему!</p>
      </div>
    );
  }
  
  const totalLaps = laps.data.reduce((acc, n) => Math.max(acc, n.lap_number), 0)
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
        <span className={`${styles.lap} tnum`}>LAP 32 / {totalLaps}</span>
      </header>

      <ReplayControls />
      <div className={styles.grid}>
        <TimingTable />
        <StandingsSidebar />
      </div>
    </div>
  );
}
