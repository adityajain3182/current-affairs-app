// Date helpers that resolve to India Standard Time, regardless of where the
// cron runner lives (GitHub Actions runs in UTC).

const IST = 'Asia/Kolkata';

/** Current date in IST as YYYY-MM-DD. */
export function istDateISO(d = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: IST,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
  return parts; // en-CA yields YYYY-MM-DD
}

/** ISO week label like "2026-W29" for the current IST date. */
export function istWeekLabel(d = new Date()) {
  const iso = istDateISO(d);
  const date = new Date(iso + 'T00:00:00Z');
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/** Array of the last `days` IST dates as YYYY-MM-DD (including today). */
export function daysInWindow(days, from = new Date()) {
  const todayISO = istDateISO(from);
  const base = new Date(todayISO + 'T00:00:00Z');
  const out = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(base.getTime() - i * 86_400_000);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export function prettyIST(iso) {
  const d = new Date(iso + 'T00:00:00Z');
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d);
}
