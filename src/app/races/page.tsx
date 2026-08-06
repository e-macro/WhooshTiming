import RaceCard from "@/components/RaceCard/RaceCard";
import styles from "./races.module.css";
import { openf1 } from "@/lib/api/openf1";
import { buildRaceList } from "@/lib/models/race";
import Link from "next/link";
import { parseSeason, SEASONS } from "@/lib/seasons";
import type { Metadata } from "next";

type Props = {
  searchParams: Promise<{ season?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { season } = await searchParams
  const validSeason = parseSeason(season)
  return {
    title: `Гонки · сезон ${validSeason}`,
    description: `Обирай будь-яку гонку сезона ${validSeason} року`,
  }
}

export default async function RacesPage({ searchParams }: Props) {
  const { season } = await searchParams
  const validSeason = parseSeason(season)
  // Request time: this is a server component, rendered once per request —
  // Date.now() here is a per-request input, not a render-instability source.
  // eslint-disable-next-line react-hooks/purity
  const nowMs = Date.now()
  const cacheOpts = validSeason === new Date(nowMs).getFullYear() ? { revalidate: 3600 } : undefined;
  const [meetings, sessions] = await Promise.all([openf1.meetings(validSeason, cacheOpts), openf1.raceSessions(validSeason, cacheOpts)])
  const races = buildRaceList(sessions, meetings, nowMs)
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
