import type { Meeting, Session } from "@/lib/types/openf1"

export type RaceListItem = {
    slug: string,
    name: string,
    circuit: string,
    country: string,
    dateStart: string,
    round: number | null,
    status: 'past' | 'upcoming' | 'cancelled'
}

export function toRaceListItem(meeting: Meeting, session: Session, nowMs: number): Omit<RaceListItem, 'round'> {
    return {
        slug: String(session.session_key),
        name: meeting.meeting_name,
        circuit: meeting.circuit_short_name,
        country: meeting.country_name,
        dateStart: meeting.date_start.slice(0, 10),
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

export function buildRaceList(sessions: Session[], meetings: Meeting[], nowMs: number): RaceListItem[] {
    const sessionByMeeting = new Map<number, Session>()
    for (const session of sessions) {
        sessionByMeeting.set(session.meeting_key, session)
    }
    const races: RaceListItem[] = []
    let counter = 0
    const ordered = meetings.toSorted((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime())
    for (const meeting of ordered) {
        const session = sessionByMeeting.get(meeting.meeting_key)
        if (!session) {
            continue
        }
        const base = toRaceListItem(meeting, session, nowMs)
        const round = base.status === 'cancelled' ? null : ++counter
        races.push({ ...base, round})
    }
    return races
}