import RaceCard from "@/components/RaceCard/RaceCard";
import styles from "./races.module.css";
import { openf1 } from "@/lib/api/openf1";
import type { Session } from "@/lib/types/openf1";
import { toRaceListItem, type RaceListItem } from "@/lib/models/race";
import Link from "next/link";

type Props = {
  searchParams: Promise<{ season?: string }>
}

const SEASONS = [2023, 2024, 2025, 2026]

export default async function RacesPage({ searchParams }: Props) {
  const { season } = await searchParams
  const raw = Number(season)
  const validSeason = SEASONS.includes(raw) ? raw : SEASONS.at(-1)!
  // Request time: this is a server component, rendered once per request —
  // Date.now() here is a per-request input, not a render-instability source.
  // eslint-disable-next-line react-hooks/purity
  const nowMs = Date.now()
  const cacheOpts = validSeason === new Date(nowMs).getFullYear() ? { revalidate: 3600 } : undefined;
  const [meetings, sessions] = await Promise.all([openf1.meetings(validSeason, cacheOpts), openf1.raceSessions(validSeason, cacheOpts)])
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
    races.push(toRaceListItem(meeting, session, races.length+1, nowMs))
  }
  const nextSlug = races.find(r => r.status === 'upcoming')?.slug
  return (
    <section className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>Гонки</h1>
        <nav className={styles.seasons} aria-label="Вибір сезону">
          {SEASONS.map((year) => (
            <Link
              key={year}
              href={`/races?season=${year}`}
              className={`${styles.chip} ${year === validSeason ? styles.chipActive : ""} tnum`}
            >
              {year}
            </Link>
          ))}
        </nav>
      </header>
      <div className={styles.grid}>
        {races.toReversed().map((race) => (
          <RaceCard key={race.slug} {...race} isNext={race.slug === nextSlug}/>
        ))}
      </div>
    </section>
  );
}
