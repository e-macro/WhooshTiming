import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.wrap}>
      <p className={`${styles.code} tnum`}>404</p>
      <h1 className={styles.title}>Ця сторінка зійшла з дистанції</h1>
      <p className={styles.hint}>DNF — сторінку не знайдено або її не існує.</p>
      <Link href="/" className={styles.back}>
        Повернутись у бокси
      </Link>
    </div>
  );
}
