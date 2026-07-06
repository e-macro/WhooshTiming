import styles from "./loading.module.css";

export default function Loading() {
  return (
    <div className={styles.wrap} role="status" aria-label="Завантаження">
      <div className={styles.lights}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={styles.light} style={{ animationDelay: `${i * 0.18}s` }} />
        ))}
      </div>
      <p className={styles.label}>Завантаження…</p>
    </div>
  );
}
