import Link from "next/link";
import styles from "./Header.module.css";

const NAV = [
  { href: "/races", label: "Гонки" },
  { href: "/standings", label: "Залік" },
];

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          ВЖЖЖ<span className={styles.logoAccent}>Таймінг</span>
        </Link>
        <nav className={styles.nav}>
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className={styles.link}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
