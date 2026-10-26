'use server';

import { revalidatePath } from 'next/cache';
import { samvadStore, TABLE } from '@/lib/bodhgaya-samvad/server';

export async function requestTime(formData: FormData) {
  const token = String(formData.get('token') ?? '');
  const requested = String(formData.get('requestedTime') ?? '').trim().slice(0, 240);
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuid.test(token) || requested.length < 12) throw new Error('Please describe your preferred date and time');
  const store = samvadStore();
  const { data: current, error } = await store.from(TABLE)
    .select('status,agreed_slot').eq('booking_token', token).single();
  if (error || current.status !== 'ACCEPTED' || current.agreed_slot) throw new Error('Time request is unavailable');
  const { error: updateError } = await store.from(TABLE)
    .update({ requested_slot_text: requested, updated_at: new Date().toISOString() })
    .eq('booking_token', token).eq('status', 'ACCEPTED').is('agreed_slot', null);
  if (updateError) throw new Error('Time request could not be saved');
  revalidatePath(`/bodhgaya-samvad/request/${token}`);
}
