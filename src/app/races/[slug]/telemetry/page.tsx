import { ApiError, openf1 } from "@/lib/api/openf1";
import TelemetryClient from "./telemetry.client";
import type { Metadata } from "next";
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
        title: `${race[0].circuit_short_name} ${race[0].year} · телеметрія сесії "${race[0].session_name}"`,
        description: `${race[0].circuit_short_name} ${race[0].year} ${race[0].session_name} - сторінка телеметрії, дозволяє аналізувати швидкість, газ та гальма кожного пілота протягом усієї сесії по колах`,
    } 
}

export default async function TelemetryPage({ params }: Props) {
    const { slug } = await params;
    return (
        <TelemetryClient sessionKey={slug}/>
    )
}