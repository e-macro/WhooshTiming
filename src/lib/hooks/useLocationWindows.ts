import { useReplayStore } from "@/store/replayStore";
import type { Location } from "../types/openf1";
import { windowBounds, windowIndexesFor } from "../replay/locationWindows";
import { useQueries } from "@tanstack/react-query";
import { openf1 } from "../api/openf1";
import { useDebouncedValue } from "./useDebouncedValue";

export function useLocationWindows(sessionKey: number, sessionStartMs: number): Location[] {
    const cursor = useReplayStore(s => s.cursor)
    const rawIndex = windowIndexesFor(cursor)[0]
    const stableIndex = useDebouncedValue(rawIndex, 400)
    const indexes = [stableIndex, stableIndex + 1, stableIndex + 2]
    return useQueries({
        queries: indexes.map(i => {
            const { from, to } = windowBounds(i, sessionStartMs)
            return {
                queryKey: ['locationWindow', sessionKey, i],
                queryFn: () => openf1.locationWindow(sessionKey, from, to),
                staleTime: Infinity
            }
        }),
        combine: results => results.flatMap(r => r.data ?? [])
    })
}