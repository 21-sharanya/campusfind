// Common words that say nothing about WHICH item it is, so they are ignored when comparing titles.
const STOP_WORDS = new Set([
  'the', 'and', 'with', 'for', 'near', 'from', 'lost', 'found', 'my', 'his', 'her', 'one', 'new', 'old',
])

// 7 days in milliseconds is not needed here; one day in milliseconds is used to convert time differences into days.
const DAY_MS = 24 * 60 * 60 * 1000

// Turn a title into a Set of meaningful lowercase words.
const keywords = (text) =>
  new Set(
    text
      // "Black HP Calculator!" becomes "black hp calculator!"
      .toLowerCase()
      // Split on anything that is not a letter or digit.
      .split(/[^a-z0-9]+/)
      // Keep words of 3+ letters that are not stop words.
      .filter((word) => word.length >= 3 && !STOP_WORDS.has(word)),
  )

// Compare two items and return how likely they are the same object.
// Maximum score is 9: category 3 + location 2 + keywords up to 3 + dates 1.
// "reasons" explains the score in plain words, so the UI can show why two items were matched.
export function scoreMatch(a, b) {
  let score = 0
  const reasons = []

  // Same category is the strongest signal.
  if (a.category === b.category) {
    score += 3
    reasons.push('Same category')
  }

  // Same campus location.
  if (a.location === b.location) {
    score += 2
    reasons.push('Same location')
  }

  // Count words that appear in both titles.
  const wordsA = keywords(a.title)
  const wordsB = keywords(b.title)
  let shared = 0
  wordsA.forEach((word) => {
    if (wordsB.has(word)) shared += 1
  })
  if (shared > 0) {
    // Cap at 3 points, so a long title can't dominate the score.
    score += Math.min(shared, 3)
    reasons.push('Similar title')
  }

  // Subtracting two dates gives milliseconds. Math.abs ignores which one is earlier.
  const daysApart = Math.abs(new Date(a.dateOccurred) - new Date(b.dateOccurred)) / DAY_MS
  if (daysApart <= 7) {
    score += 1
    reasons.push('Dates are close')
  }

  return { score, reasons }
}