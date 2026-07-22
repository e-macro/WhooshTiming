const WINDOWS_MS = 120000 
// gives 15 fetches per minute instead of traditional 30/minute if 60000 used for 30x speed multiplier
// like 60 seconds / (WINDOWS_MS / 30x multiplier) = 1800 / WINDOWS_MS

export function windowIndexesFor(cursorMs: number): number[] {
    const current = Math.floor(Math.max(cursorMs, 0) / WINDOWS_MS)
    return [current, current + 1, current + 2]
}

export function windowBounds(index: number, sessionStartMs: number): { from: string, to: string} {
    const from = new Date(sessionStartMs + index * WINDOWS_MS).toISOString()
    const to = new Date(new Date(from).getTime() + WINDOWS_MS).toISOString()
    return { from, to }
}