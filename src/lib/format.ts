export const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds%3600)/60)
    const seconds = totalSeconds%60
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

export const formatGap = (value: number | string | null, nullText: string): string => {
    if (value === null) return nullText;
    if (typeof value === 'number') return `+${value.toFixed(3)}`
    return value
}

export function formatLapTime(seconds: number): string {
    const totalMs = Math.round(seconds * 1000);
    const minutes = Math.floor(totalMs / 60000)
    const secs = Math.floor(totalMs % 60000 / 1000)
    const ms = Math.floor(totalMs % 1000)
    return `${minutes}:${String(secs).padStart(2, "0")}.${String(ms).padStart(3, "0")}`
}