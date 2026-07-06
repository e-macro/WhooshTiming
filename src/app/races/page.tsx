import RaceCard from "@/components/RaceCard/RaceCard";
import styles from "./races.module.css";
import { openf1 } from "@/lib/api/openf1";
import type { Session } from "@/lib/types/openf1";
import { toRaceListItem, type RaceListItem } from "@/lib/models/race";

export default async function RacesPage() {
  
  const SEASON = 2025;
  const [meetings, sessions] = await Promise.all([openf1.meetings(SEASON), openf1.raceSessions(SEASON)])
  const sessionByMeeting = new Map<number, Session>()
  for (const session of sessions) {
    sessionByMeeting.set(session.meeting_key, session)
  }
  const races: RaceListItem[] = []
  for (const meeting of meetings) {
    const session = sessionByMeeting.get(meeting.meeting_key)
    if (!session) {
      continue
    }
    races.push(toRaceListItem(meeting, session, races.length+1))
  }
  
  return (
    <section className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>Гонки</h1>
        {/* TODO: season selector (2023 / 2024 / 2025 ...) */}
        <span className={`${styles.season} tnum`}>Сезон 2025</span>
      </header>
      <div className={styles.grid}>
        {races.toReversed().map((race) => (
          <RaceCard key={race.slug} {...race} />
        ))}
      </div>
    </section>
  );
}
