/**
 * Calculates the number of working days between two dates, excluding Fridays and Saturdays.
 * @param startStr Start date string (YYYY-MM-DD)
 * @param endStr End date string (YYYY-MM-DD)
 * @returns Number of working days
 */
export const calculateWorkingDaysExcludingFriSat = (startStr: string, endStr: string): number => {
  if (!startStr || !endStr) return 0;
  const start = new Date(startStr + 'T00:00:00');
  const end = new Date(endStr + 'T00:00:00');
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 0;

  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const day = cur.getDay(); // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
    if (day !== 5 && day !== 6) { // Minus Fridays and Saturdays
      count++;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return count;
};

/**
 * Formats a date to ISO string (YYYY-MM-DD)
 */
export const formatToIsoDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Gets today's date in YYYY-MM-DD format
 */
export const getTodayIso = (): string => {
  return formatToIsoDate(new Date());
};
