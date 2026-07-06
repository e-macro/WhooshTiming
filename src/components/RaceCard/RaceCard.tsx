import Link from "next/link";
import styles from "./RaceCard.module.css";
import type { RaceListItem } from "@/lib/models/race";


export default function RaceCard({ slug, name, circuit, country, dateStart, round }: RaceListItem) {
  return (
    <Link href={`/races/${slug}`} className={`card ${styles.card}`}>
      <span className={`${styles.round} tnum`}>R{String(round).padStart(2, "0")}</span>
      <h2 className={styles.name}>{name}</h2>
      <p className={styles.meta}>
        {circuit} · {country}
      </p>
      <time className={`${styles.date} tnum`} dateTime={dateStart}>
        {dateStart}
      </time>
    </Link>
  );
}
