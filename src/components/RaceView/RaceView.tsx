import type { ChampionshipDriver, ChampionshipTeam, Driver, Interval, Lap, Pit, Position, RaceControl, Stint } from '@/lib/types/openf1';
import styles from './RaceView.module.css'
import ReplayControls from '../ReplayControls/ReplayControls';
import TimingTable from '../TimingTable/TimingTable';
import StandingsSidebar from '../StandingsSidebar/StandingsSidebar';
import { useSessionIndexes } from '@/lib/hooks/useSessionIndexes';
import LapCounter from '../LapCounter/LapCounter';
import { useMemo } from 'react';
import { buildTrackStatus } from '@/lib/replay/trackStatus';
import TrackStatusFrame from '../TrackStatusFrame/TrackStatusFrame';

type Props = {
    drivers: Driver[],
    positions: Position[],
    intervals: Interval[],
    laps: Lap[],
    pits: Pit[]
    championshipDrivers: ChampionshipDriver[],
    championshipTeams: ChampionshipTeam[],
    raceControl: RaceControl[],
    stints: Stint[],
    meetingName: string | undefined,
    sessionName: string,
    sessionStartMs: number,
    totalLaps: number,
    sessionKey: string
}

const RaceView = ({drivers, positions, intervals, laps, pits, championshipDrivers, championshipTeams, raceControl, stints, meetingName, sessionName, sessionStartMs, totalLaps, sessionKey}: Props) => {
    const { positionIndex, intervalIndex, lapIndex, sessionBest, completedLaps, pitIndex, stintIndex } = useSessionIndexes(positions, intervals, laps, pits, stints, sessionStartMs)
    const statusMilestones = useMemo(() => buildTrackStatus(raceControl, sessionStartMs), [raceControl, sessionStartMs])
    return (
    <div className={styles.page}>
        <header className={styles.head}>
        <div>
            <p className={styles.eyebrow}>Race replay</p>
            <h1 className={styles.title}>
            {meetingName ?? `Session #${sessionKey}`} - {sessionName}
            </h1>
        </div>
        {/* TODO: lap counter — current lap / total from replay cursor */}
        <LapCounter completedLaps={completedLaps} sessionStartMs={sessionStartMs} totalLaps={totalLaps}/>
        </header>

        <ReplayControls />
        <div className={styles.grid}>
        <TrackStatusFrame milestones={statusMilestones}>
        <TimingTable 
            drivers={drivers} 
            positionIndex={positionIndex} 
            intervalIndex={intervalIndex} 
            lapIndex={lapIndex} 
            sessionBest={sessionBest}
            pitIndex={pitIndex}
            stintIndex={stintIndex}
        />
        </TrackStatusFrame>
        <StandingsSidebar drivers={drivers} positionIndex={positionIndex} championshipDrivers={championshipDrivers} championshipTeams={championshipTeams}/>
        </div>
    </div>
    );
}

export default RaceView