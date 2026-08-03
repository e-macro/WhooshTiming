import TelemetryClient from "./telemetry.client";

type Props = { params: Promise<{ slug: string }> };

export default async function TelemetryPage({ params }: Props) {
    const { slug } = await params;
    return (
        <TelemetryClient sessionKey={slug}/>
    )
}