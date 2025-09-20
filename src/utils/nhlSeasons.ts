/**
 * Calculate the current NHL season in YYYYZZZZ format
 * Hockey runs from September to June
 */
export function getCurrentSeason(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // January is 0

  // If we're in September or later, we're in a season that ends next year
  if (month >= 9) {
    return `${year}${year + 1}`;
  } else {
    // Otherwise we're in a season that started last year (January-June)
    return `${year - 1}${year}`;
  }
}

/**
 * Get available seasons (current season and previous 2 seasons)
 */
export function getAvailableSeasons(): { value: string; label: string }[] {
  const currentSeason = getCurrentSeason();
  const currentYear = parseInt(currentSeason.substring(0, 4));

  return [
    {
      value: currentSeason,
      label: `${currentYear}-${(currentYear + 1).toString().substring(2)} (Current)`,
    },
    {
      value: `${currentYear - 1}${currentYear}`,
      label: `${currentYear - 1}-${currentYear.toString().substring(2)}`,
    },
    {
      value: `${currentYear - 2}${currentYear - 1}`,
      label: `${currentYear - 2}-${(currentYear - 1).toString().substring(2)}`,
    },
  ];
}