import Link from "next/link";
import styles from "./RaceCard.module.css";
import type { RaceListItem } from "@/lib/models/race";

type Props = RaceListItem & {
  /** The nearest upcoming race gets the "Незабаром" badge; others are just muted. */
  isNext?: boolean;
};

export default function RaceCard({ slug, name, circuit, country, dateStart, round, status, isNext }: Props) {
  const badge =
    status === "cancelled" ? "Скасовано"
    : status === "upcoming" && isNext ? "Незабаром"
    : null;

  const content = (
    <>
      <span className={styles.top}>
        <span className={`${styles.round} tnum`}>R{String(round).padStart(2, "0")}</span>
        {badge && <span className={styles.badge}>{badge}</span>}
      </span>
      <h2 className={styles.name}>{name}</h2>
      <p className={styles.meta}>
        {circuit} · {country}
      </p>
      <time className={`${styles.date} tnum`} dateTime={dateStart}>
        {dateStart}
      </time>
    </>
  );

  if (status === "past") {
    return (
      <Link href={`/races/${slug}`} className={`card ${styles.card}`}>
        {content}
      </Link>
    );
  }

  return (
    <div className={`card ${styles.card}`} data-status={status}>
      {content}
    </div>
  );
}
