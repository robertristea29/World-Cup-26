/**
 * Calculates points for a single prediction against an actual result.
 *
 * Rules:
 *   Exact score                           → 5 points
 *   Correct result + one correct score    → 3 points
 *   Correct result only (1/X/2)           → 2 points
 *   One correct team score, wrong result  → 1 point
 *   Nothing correct                       → 0 points
 */
export function calculatePoints(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number
): number {
  const exactScore = predictedHome === actualHome && predictedAway === actualAway
  if (exactScore) return 5

  const predictedResult = Math.sign(predictedHome - predictedAway) // -1, 0, 1
  const actualResult = Math.sign(actualHome - actualAway)
  const correctResult = predictedResult === actualResult

  const correctHomeGoals = predictedHome === actualHome
  const correctAwayGoals = predictedAway === actualAway

  if (correctResult && (correctHomeGoals || correctAwayGoals)) return 3
  if (correctResult) return 2
  if (correctHomeGoals || correctAwayGoals) return 1

  return 0
}
