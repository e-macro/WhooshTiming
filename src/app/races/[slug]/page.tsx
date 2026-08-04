import type { Metadata } from "next";
import RaceClient from "./race.client";
import { ApiError, openf1 } from "@/lib/api/openf1";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const race = await openf1.session(Number(slug))
  .catch((e) => {
    if (e instanceof ApiError && e.status === 404) {
      notFound()
    } 
    throw e
  })
  
  return {
    title: `${race[0].circuit_short_name} ${race[0].year} · сесія "${race[0].session_name}"`,
    description: `${race[0].circuit_short_name} ${race[0].year} ${race[0].session_name} - дивись наживо або через контроль повтору будь-який момент протягом самої сесії!`,
  }
}
// Server component: resolves the slug (session_key), later will prefetch
// session meta on the server and pass it down.
export default async function RacePage({ params }: Props) {
  const { slug } = await params;
  return <RaceClient sessionKey={slug} />;
}
