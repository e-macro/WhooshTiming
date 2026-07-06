import styles from "./standings.module.css";

// Stub page — full season standings will live here (not a current target).
export default function StandingsPage() {
  return (
    <section className={styles.page}>
      <h1 className={styles.title}>Залік сезону</h1>
      <div className={`card ${styles.placeholder}`}>
        <p>Тут буде повний залік пілотів і Кубок конструкторів.</p>
        <p className={styles.dim}>У розробці — наразі залік доступний на сторінці гонки.</p>
      </div>
    </section>
  );
}
