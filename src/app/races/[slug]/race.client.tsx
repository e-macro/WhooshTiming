"use client";

import styles from "./race.module.css";
import { useQuery } from "@tanstack/react-query";
import { openf1 } from "@/lib/api/openf1";
import { useReplayStore } from "@/store/replayStore";
import { useEffect } from "react";
import { useReplayTick } from "@/lib/hooks/useReplayTick";
import RaceView from "@/components/RaceView/RaceView";

type Props = { sessionKey: string };

export default function RaceClient({ sessionKey }: Props) {
  const reset = useReplayStore(s => s.reset)
  useEffect(() => {
    reset()
  }, [sessionKey, reset])
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
  const intervals = useQuery({
    queryKey: ['intervals', sessionKey],
    queryFn: () => openf1.intervals(Number(sessionKey)),
  })
  const pits = useQuery({
    queryKey: ['pits', sessionKey],
    queryFn: () => openf1.pits(Number(sessionKey)),
  })
  const driversStandings = useQuery({
    queryKey: ['driversStandings', sessionKey],
    queryFn: () => openf1.championshipDrivers(Number(sessionKey)),
  })
  const teamsStandings = useQuery({
    queryKey: ['teamsStandings', sessionKey],
    queryFn: () => openf1.championshipTeams(Number(sessionKey)),
  })
  const raceControl = useQuery({
    queryKey: ['raceControl', sessionKey],
    queryFn: () => openf1.raceControl(Number(sessionKey)),
  })
  const stints = useQuery({
    queryKey: ['stints', sessionKey],
    queryFn: () => openf1.stints(Number(sessionKey)),
  })
  const queries = [drivers, positions, laps, session, intervals, pits, driversStandings, teamsStandings, raceControl, stints];
  const isPending = queries.some(q => q.isPending);
  const isError = queries.some(q => q.isError);
  useReplayTick()
  useEffect(() => {
    if (!session.data?.[0] || !positions.data) {
      return
    }
    const startMs = new Date(session.data[0].date_start).getTime()
    const endMs = positions.data.reduce((acc, n) => Math.max(acc, new Date(n.date).getTime()), 0)
    if(endMs === 0) {
      return
    }
    const duration = endMs - startMs;
    setDuration(duration);
  }, [setDuration, session.data, positions.data])

  if (isPending) {
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
  if (isError) {
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
  // Invariant: guards above returned for any pending/error query,
  // so every .data below is defined.
  const startMs = new Date(session.data![0].date_start).getTime()
  const totalLaps = laps.data!.reduce((acc, n) => Math.max(acc, n.lap_number), 0)
  return (
    <RaceView 
    drivers={drivers.data!}
    positions={positions.data!} 
    intervals={intervals.data!} 
    sessionKey={sessionKey} 
    totalLaps={totalLaps} 
    sessionStartMs={startMs}
    laps={laps.data!}
    pits={pits.data!}
    championshipDrivers={driversStandings.data!}
    championshipTeams={teamsStandings.data!}
    raceControl={raceControl.data!}
    stints={stints.data!}/>
  );
}
