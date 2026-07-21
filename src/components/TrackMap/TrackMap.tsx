import styles from "./TrackMap.module.css";

// Placeholder — replaced once /v1/location is wired up (track outline + live car dots).
export default function TrackMap() {
  return (
    <section className={`card ${styles.placeholder}`} aria-label="Карта траси">
      <span className={styles.title}>Карта траси</span>
      <p className={styles.text}>У розробці — з&apos;явиться разом із даними позицій машин на трасі.</p>
    </section>
  );
}
