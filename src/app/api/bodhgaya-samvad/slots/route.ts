import { NextRequest, NextResponse } from 'next/server';
import { samvadStore, TABLE } from '@/lib/bodhgaya-samvad/server';
import { SLOT_TIMES, slotLabel, slotStart, validBookingDate } from '@/lib/bodhgaya-samvad/slots';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get('date') ?? '';
  const month = request.nextUrl.searchParams.get('month') ?? '';
  if (month) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return NextResponse.json({ error: 'Invalid month' }, { status: 400 });
    const [year, monthNumber] = month.split('-').map(Number);
    const days = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
    const dates = Array.from({ length: days }, (_, index) => `${month}-${String(index + 1).padStart(2, '0')}`).filter((day) => validBookingDate(day));
    if (!dates.length) return NextResponse.json({ error: 'Choose a month within the next 90 days' }, { status: 400 });
    try {
      const start = slotStart(dates[0], SLOT_TIMES[0])!;
      const end = slotStart(dates[dates.length - 1], SLOT_TIMES[SLOT_TIMES.length - 1])!;
      const { data, error } = await samvadStore().from(TABLE).select('agreed_slot,status')
        .gte('agreed_slot', start).lte('agreed_slot', end).not('status', 'in', '(DECLINED,CANCELLED)');
      if (error) throw error;
      const booked = new Set((data ?? []).map((row) => new Date(row.agreed_slot).toISOString()));
      const availability = Object.fromEntries(dates.map((day) => [day, SLOT_TIMES.map((time) => {
        const startsAt = slotStart(day, time)!;
        return { time, label: slotLabel(time), available: !booked.has(startsAt) && Date.parse(startsAt) > Date.now() + 15 * 60000 };
      })]));
      return NextResponse.json({ month, dates: availability }, { headers: { 'Cache-Control': 'no-store' } });
    } catch {
      return NextResponse.json({ error: 'Availability is temporarily unavailable' }, { status: 503 });
    }
  }
  if (!validBookingDate(date)) return NextResponse.json({ error: 'Choose a date within the next 90 days' }, { status: 400 });
  try {
    const start = slotStart(date, SLOT_TIMES[0])!;
    const end = slotStart(date, SLOT_TIMES[SLOT_TIMES.length - 1])!;
    const { data, error } = await samvadStore().from(TABLE).select('agreed_slot,status')
      .gte('agreed_slot', start).lte('agreed_slot', end).not('status', 'in', '(DECLINED,CANCELLED)');
    if (error) throw error;
    const booked = new Set((data ?? []).map((row) => new Date(row.agreed_slot).toISOString()));
    const slots = SLOT_TIMES.map((time) => {
      const startsAt = slotStart(date, time)!;
      return { time, label: slotLabel(time), available: !booked.has(startsAt) && Date.parse(startsAt) > Date.now() + 15 * 60000 };
    });
    return NextResponse.json({ date, timeZone: 'Asia/Kolkata', slots }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Availability is temporarily unavailable' }, { status: 503 });
  }
}
