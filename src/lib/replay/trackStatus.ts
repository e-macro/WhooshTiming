import type { RaceControl } from "../types/openf1";

export type TrackStatus = 'green' | 'yellow' | 'sc' | 'vsc' | 'red' | 'chequered';
export type TrackStatusMilestone = { t: number, status: TrackStatus };

function toTransition(msg: RaceControl): TrackStatus | null {
    if(msg.category === 'SafetyCar') {
        return msg.message === 'VIRTUAL SAFETY CAR DEPLOYED' ? 'vsc'
            : msg.message === 'SAFETY CAR DEPLOYED' ? 'sc'
            : null
    }
    if (msg.category === 'Flag' && msg.scope === 'Track') {
        return msg.flag === 'RED' ? 'red'
            : msg.flag === 'YELLOW' || msg.flag === 'DOUBLE YELLOW' ? 'yellow'
            : msg.flag === 'GREEN' || msg.flag === 'CLEAR' ? 'green'
            : msg.flag === 'CHEQUERED' ? 'chequered'
            : null
    }
    return null
}

export function buildTrackStatus(messages: RaceControl[], startMs: number): TrackStatusMilestone[] {
    const points = messages.map(msg => ({
        t: new Date(msg.date).getTime() - startMs,
        status: toTransition(msg)
    }))
    points.sort((a, b) => a.t - b.t)
    const statuses: { t: number, status: TrackStatus }[] = []
    let current: TrackStatus = 'green'
    for(const p of points) {
        const next = p.status
        if (next !== null && next !== current) {
            if (current === 'chequered') {
                break
            }
            statuses.push({ t: p.t, status: next })
            current = next
        }
    }
    return statuses
}