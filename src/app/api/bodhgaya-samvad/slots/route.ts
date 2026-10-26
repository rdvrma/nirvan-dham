import { NextRequest, NextResponse } from 'next/server';
import { samvadStore, TABLE } from '@/lib/bodhgaya-samvad/server';
import { SLOT_TIMES, slotLabel, slotStart, validBookingDate } from '@/lib/bodhgaya-samvad/slots';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get('date') ?? '';
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
