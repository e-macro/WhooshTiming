import { searchLatest } from "@/lib/replay/timeIndex";
import type { TrackStatusMilestone } from "@/lib/replay/trackStatus";
import { useReplayStore } from "@/store/replayStore";
import styles from './TrackStatusFrame.module.css'

type Props = { milestones: TrackStatusMilestone[]; children: React.ReactNode };
const FLASH_WINDOW_MS = 15000;

export default function TrackStatusFrame({ milestones, children }: Props) {
    const cursor = useReplayStore(s => s.cursor)
    const rec = searchLatest(milestones, cursor)
    const status = rec?.status ?? 'green'
    const flash = status === 'green' && rec && cursor - rec.t < FLASH_WINDOW_MS
    return (
        <div className={styles.frame} data-status={status}>
            {flash && <div key={rec.t} className={styles.flash}></div>}
            {children}
        </div>
    )
}