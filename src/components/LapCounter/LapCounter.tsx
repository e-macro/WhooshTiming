import styles from './LapCounter.module.css'
import { buildLapMilestones, searchLatest, type CompletedLap } from "@/lib/replay/timeIndex"
import { useReplayStore } from "@/store/replayStore"
import { useMemo } from "react"

type Props = {
    completedLaps: CompletedLap[],
    sessionStartMs: number,
    totalLaps: number
}

const LapCounter = ({ completedLaps, sessionStartMs, totalLaps}: Props) => {
    const milestones = useMemo(
        () => buildLapMilestones(completedLaps, sessionStartMs),
        [completedLaps, sessionStartMs]
    )
    const cursor = useReplayStore(s => s.cursor)
    const laps = searchLatest(milestones, cursor)
    const currentLap = Math.min((laps?.lapNumber ?? 0) + 1, totalLaps) 
    return (
        <span className={`${styles.lap} tnum`}>LAP {currentLap} / {totalLaps}</span>
    )
}

export default LapCounter