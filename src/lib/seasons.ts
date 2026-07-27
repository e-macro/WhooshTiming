export const SEASONS = [2023, 2024, 2025, 2026]

export function parseSeason(season: string | undefined): number {
    const raw = Number(season)
    return SEASONS.includes(raw) ? raw : SEASONS.at(-1)!
}