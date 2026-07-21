import type { Meeting, Session } from "@/lib/types/openf1"

export type RaceListItem = {
    slug: string,
    name: string,
    circuit: string,
    country: string,
    dateStart: string,
    round: number,
    status: 'past' | 'upcoming' | 'cancelled'
}

export function toRaceListItem(meeting: Meeting, session: Session, round: number, nowMs: number): RaceListItem {
    return {
        slug: String(session.session_key),
        name: meeting.meeting_name,
        circuit: meeting.circuit_short_name,
        country: meeting.country_name,
        dateStart: meeting.date_start.slice(0, 10),
        round,
        status: meeting.is_cancelled ? 'cancelled'
            : new Date(session.date_start).getTime() > nowMs ? 'upcoming'
            : 'past'
    }
}

export function findLastPastSession(sessions: Session[], nowMs: number): Session | null {
    let best: Session | null = null
    for (const session of sessions) {
        const dateStart = new Date(session.date_start).getTime()
        if(dateStart > nowMs) {
            continue
        } 
        else if (best === null || dateStart > new Date(best.date_start).getTime()) {
            best = session
        }
    }
    return best
}