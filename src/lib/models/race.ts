import type { Meeting, Session } from "@/lib/types/openf1"

export type RaceListItem = {
    slug: string,
    name: string,
    circuit: string,
    country: string,
    dateStart: string,
    round: number
}

export function toRaceListItem(meeting: Meeting, session: Session, round: number): RaceListItem {
    return {
        slug: String(session.session_key),
        name: meeting.meeting_name,
        circuit: meeting.circuit_short_name,
        country: meeting.country_name,
        dateStart: meeting.date_start.slice(0, 10),
        round
    }
}