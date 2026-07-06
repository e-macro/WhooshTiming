import RaceClient from "./race.client";

type Props = { params: Promise<{ slug: string }> };

// Server component: resolves the slug (session_key), later will prefetch
// session meta on the server and pass it down.
export default async function RacePage({ params }: Props) {
  const { slug } = await params;
  return <RaceClient sessionKey={slug} />;
}
