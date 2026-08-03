import { ApiError } from "@/lib/api/openf1";
import styles from "./QueryState.module.css";

/**
 * Minimal shape a TanStack query result needs to satisfy — declared locally so
 * this module doesn't depend on the query library's generics.
 */
type QueryLike = {
  isPending: boolean;
  isError: boolean;
  failureCount: number;
  failureReason: unknown;
};

/** Pure summary of a group of queries: what to show while they settle. */
export function queryStateOf(queries: QueryLike[]) {
  const isPending = queries.some((q) => q.isPending);
  const isError = queries.some((q) => q.isError);
  const retryCount = Math.max(0, ...queries.map((q) => q.failureCount));
  const rateLimited = queries.some(
    (q) => q.failureReason instanceof ApiError && q.failureReason.status === 429,
  );

  const loadingText =
    retryCount === 0
      ? "Завантажуються дані гонки"
      : rateLimited
        ? `Забагато запитів до джерела — повторюємо автоматично (спроба ${retryCount + 1})`
        : `Джерело не відповідає — повторюємо автоматично (спроба ${retryCount + 1})`;

  return { isPending, isError, retryCount, loadingText };
}

export default function QueryStateCard({
  variant,
  text,
}: {
  variant: "loading" | "error";
  text: string;
}) {
  return (
    <div
      className={styles.state}
      data-variant={variant}
      role={variant === "error" ? "alert" : "status"}
    >
      <span className={styles.stateBadge}>
        <span className={styles.stateDot} />
        {variant === "loading" ? "Loading session" : "Data error"}
      </span>
      <p className={styles.stateText}>{text}</p>
    </div>
  );
}
