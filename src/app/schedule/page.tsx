import styles from "./schedule.module.css";

// Stub page — season calendar with upcoming sessions (future scope).
export default function SchedulePage() {
  return (
    <section className={styles.page}>
      <h1 className={styles.title}>Календар</h1>
      <div className={`card ${styles.placeholder}`}>
        <p>Тут буде розклад сезону з датами та часом сесій.</p>
        <p className={styles.dim}>У розробці.</p>
      </div>
    </section>
  );
}
