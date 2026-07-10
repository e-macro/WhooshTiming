import type { Driver, Interval, Lap, Position } from '@/lib/types/openf1';
import styles from './RaceView.module.css'
import ReplayControls from '../ReplayControls/ReplayControls';
import TimingTable from '../TimingTable/TimingTable';
import StandingsSidebar from '../StandingsSidebar/StandingsSidebar';
import { useSessionIndexes } from '@/lib/hooks/useSessionIndexes';
import LapCounter from '../LapCounter/LapCounter';

type Props = {
    drivers: Driver[],
    positions: Position[],
    intervals: Interval[],
    laps: Lap[],
    sessionStartMs: number
    totalLaps: number,
    sessionKey: string
}

const RaceView = ({drivers, positions, intervals, laps, sessionStartMs, totalLaps, sessionKey}: Props) => {
    const { positionIndex, intervalIndex, lapIndex, sessionBest, completedLaps } = useSessionIndexes(positions, intervals, laps, sessionStartMs)
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
        <LapCounter completedLaps={completedLaps} sessionStartMs={sessionStartMs} totalLaps={totalLaps}/>
        </header>

        <ReplayControls />
        <div className={styles.grid}>
        <TimingTable 
            drivers={drivers} 
            positionIndex={positionIndex} 
            intervalIndex={intervalIndex} 
            lapIndex={lapIndex} 
            sessionBest={sessionBest}/>
        <StandingsSidebar />
        </div>
    </div>
    );
}

export default RaceView