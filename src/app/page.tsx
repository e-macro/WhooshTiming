import Link from "next/link";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <section className={styles.hero}>
      <p className={styles.eyebrow}>Session replay · OpenF1 data</p>
      <h1 className={styles.title}>
        Будь-яка гонка.
        <br />
        Таймінг як наживо.
      </h1>
      <p className={styles.lede}>
        Обери Гран-прі — і дивись, як змінюються позиції, інтервали та
        теоретичний залік, коло за колом.
      </p>
      <div className={styles.actions}>
        <Link href="/races" className={styles.primary}>
          Обрати гонку
        </Link>
        <Link href="/standings" className={styles.secondary}>
          Залік сезону
        </Link>
      </div>
    </section>
  );
}
