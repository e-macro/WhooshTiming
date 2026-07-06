/** FIA points for race finishing positions (P1 → P10). */
export const RACE_POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] as const;

export function pointsForPosition(position: number): number {
  return RACE_POINTS[position - 1] ?? 0;
}
