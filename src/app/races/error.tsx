'use client'

import Link from "next/link"
import styles from "./error.module.css"
import { useEffect } from "react"

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return(
    <div className={styles.wrap}>
      <h1 className={styles.title}>Ця сторінка зійшла з дистанції</h1>
      <p className={styles.hint}>
        Не вдалося завантажити дані. Можливо, зараз триває сесія Формули 1 — тоді джерело
        закриває доступ навіть до архівних гонок. Або це технічний збій.
      </p>
      <div className={styles.actions}>
        <button type="button" onClick={reset} className={styles.retry}>
          Спробувати ще раз
        </button>
        <Link href="/" className={styles.back}>
          Повернутись у бокси
        </Link>
      </div>
      {error.digest && (
        <p className={`${styles.digest} tnum`}>Код помилки: {error.digest}</p>
      )}
    </div>
  )
}
