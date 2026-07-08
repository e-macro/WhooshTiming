import { useReplayStore } from "@/store/replayStore"
import { useEffect, useRef } from "react"

export function useReplayTick() {
    const isPlaying = useReplayStore(s => s.isPlaying)
    const lastTimeRef = useRef<number | null>(null)
    useEffect(() => {
        if (!isPlaying) {
            return
        }
        let rafId: number
        function frame(timestamp: number) {
            if(lastTimeRef.current !== null) {
                const delta = Math.min(timestamp - lastTimeRef.current, 100)
                useReplayStore.getState().tick(delta)
            }
            lastTimeRef.current = timestamp
            rafId = requestAnimationFrame(frame)
        }
        rafId = requestAnimationFrame(frame)
        return () => {
                cancelAnimationFrame(rafId)
                lastTimeRef.current = null
        }
    }, [isPlaying])
}