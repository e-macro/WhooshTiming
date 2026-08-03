"use client";

import { useQuery } from "@tanstack/react-query";
import { openf1 } from "@/lib/api/openf1";
import QueryStateCard, { queryStateOf } from "@/components/QueryState/QueryState";
import { useReplayStore } from "@/store/replayStore";
import { useEffect } from "react";
import { useReplayTick } from "@/lib/hooks/useReplayTick";
import RaceView from "@/components/RaceView/RaceView";
import { findFastestLap } from "@/lib/replay/trackMap";
import type { CompletedLap } from "@/lib/replay/timeIndex";

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
  const meeting = useQuery({
    queryKey: ['meeting', session.data?.[0]?.meeting_key],
    queryFn: () => openf1.meeting(session.data![0].meeting_key),
    enabled: !!session.data?.[0]
  })
  
  const completedLap = laps.data?.filter((l): l is CompletedLap => l.lap_duration !== null) ?? []
  const fastestLap = findFastestLap(completedLap)
  const location = useQuery({
    queryKey: ['location', sessionKey, fastestLap?.driver_number, fastestLap?.lap_number],
    queryFn: () => {
      const dateFrom = fastestLap!.date_start
      const dateTo = new Date(new Date(fastestLap!.date_start).getTime() + fastestLap!.lap_duration! * 1000).toISOString()
      return openf1.location(Number(sessionKey), fastestLap!.driver_number, dateFrom, dateTo)
    },
    enabled: !!fastestLap
  })
  const queries = [drivers, positions, laps, session, intervals, pits, driversStandings, teamsStandings, raceControl, stints];
  const state = queryStateOf(queries)
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
  
  if (state.isPending) {
    return <QueryStateCard variant="loading" text={state.loadingText} />
  }
  if (state.isError) {
    return <QueryStateCard variant="error" text="Ох йойки! Щось пішло не так. Скоро вирішимо проблему!" />
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
    laps={laps.data!}
    pits={pits.data!}
    championshipDrivers={driversStandings.data!}
    championshipTeams={teamsStandings.data!}
    raceControl={raceControl.data!}
    stints={stints.data!}
    meetingName={meeting.data?.[0]?.meeting_name}
    sessionName={session.data![0].session_name}
    location={location.data ?? []}
    fastestLap={fastestLap}
    sessionKey={sessionKey} 
    totalLaps={totalLaps} 
    sessionStartMs={startMs}
    />
  );
}
