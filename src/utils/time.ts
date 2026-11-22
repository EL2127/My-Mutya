// src/utils/time.ts

/** Usage: await wait(500) */
export const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** Adds the right ending: 1st, 2nd, 3rd, 4th, 11th, 22nd, 23rd... */
export function ordinal(n: number): string {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  const suffixes: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' };
  return `${n}${suffixes[n % 10] ?? 'th'}`;
}

export interface Elapsed {
  years: number;
  months: number;
  days: number;
  /** Full months since the start date */
  totalMonths: number;
}

/**
 * Time since `startDate`. A month only counts once the day-of-month has been reached
 * (e.g. started on the 21st -> the new month is counted on the 21st).
 */
export function elapsedSince(startDate: string, now: Date = new Date()): Elapsed {
  const start = new Date(startDate);
  let totalMonths = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (now.getDate() < start.getDate()) totalMonths--;
  const days = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  return { years: Math.floor(totalMonths / 12), months: totalMonths % 12, days, totalMonths };
}
