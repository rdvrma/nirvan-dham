export const TIME_ZONE = 'Asia/Kolkata';
export const SLOT_TIMES = ['07:00', '09:15', '11:30', '13:45'] as const;
export const SLOT_DURATION_MINUTES = 120;

export function indiaDateToday(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now);
}

export function validBookingDate(date: string, now = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T00:00:00+05:30`);
  if (Number.isNaN(parsed.getTime()) || indiaDateToday(parsed) !== date) return false;
  const today = new Date(`${indiaDateToday(now)}T00:00:00+05:30`);
  return parsed.getTime() >= today.getTime() && parsed.getTime() <= today.getTime() + 90 * 86400000;
}

export function slotStart(date: string, time: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !SLOT_TIMES.includes(time as typeof SLOT_TIMES[number])) return null;
  const parsed = new Date(`${date}T${time}:00+05:30`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export function slotLabel(time: string): string {
  const [hour, minute] = time.split(':').map(Number);
  const end = hour * 60 + minute + SLOT_DURATION_MINUTES;
  const format = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
  return `${format(hour * 60 + minute)}–${format(end)}`;
}
