'use client'

import Link from "next/link"
import styles from "./error.module.css"
import { useEffect } from "react"

export default function ErrorPage({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return(
    <div className={styles.wrap}>
      <p className={`${styles.code} tnum`}>401</p>
      <h1 className={styles.title}>Ця сторінка зійшла з дистанції</h1>
      <p className={styles.hint}>Ймовірно зараз йде активна сесія гонки - історичні повтори інших сесій недоступні.</p>
      <Link href="/" className={styles.back}>
        Повернутись у бокси
      </Link>
    </div>
  )
}

