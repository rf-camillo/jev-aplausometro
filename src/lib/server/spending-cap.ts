/** What one evaluation costs at TypeSafe, measured: about 2,750 input tokens of Jev. */
const COST_PER_EVALUATION_USD = 0.00012;
/** The most the audience may spend in a day, in each server instance. */
const DAILY_BUDGET_USD = 5;
/** And in a minute, so a burst cannot spend the day at once. */
export const EVALUATIONS_PER_MINUTE_CAP = 300;

const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;

export interface SpendingCap {
  spend(): boolean;
}

export interface SpendingCapOptions {
  perMinute: number;
  perDay: number;
  now?: () => number;
}

/**
 * A circuit breaker on what the paid API may cost, whoever is asking: past the budget, every
 * evaluation is refused until the minute or the day (in UTC) turns. It lives in the memory of
 * one server instance, so each instance has its own budget; a limit set at TypeSafe itself is
 * the only one shared by all.
 */
export function createSpendingCap({
  perMinute,
  perDay,
  now = Date.now,
}: SpendingCapOptions): SpendingCap {
  let minute = -1;
  let day = -1;
  let inMinute = 0;
  let inDay = 0;
  return {
    spend() {
      const time = now();
      const thisMinute = Math.floor(time / MINUTE_MS);
      const thisDay = Math.floor(time / DAY_MS);
      if (thisMinute !== minute) [minute, inMinute] = [thisMinute, 0];
      if (thisDay !== day) [day, inDay] = [thisDay, 0];
      if (inMinute >= perMinute || inDay >= perDay) return false;
      inMinute += 1;
      inDay += 1;
      return true;
    },
  };
}

export function evaluationsPerDay(budgetUsd = DAILY_BUDGET_USD): number {
  return Math.floor(budgetUsd / COST_PER_EVALUATION_USD);
}
