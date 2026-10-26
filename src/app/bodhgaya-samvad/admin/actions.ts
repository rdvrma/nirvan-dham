'use server';

import { revalidatePath } from 'next/cache';
import { isSamvadAdmin, samvadStore, TABLE } from '@/lib/bodhgaya-samvad/server';

export async function reviewSamvad(formData: FormData) {
  if (!(await isSamvadAdmin())) throw new Error('Not authorized');
  const id = String(formData.get('id') ?? '');
  const action = String(formData.get('action') ?? '');
  const note = String(formData.get('internalNote') ?? '').trim().slice(0, 2000);
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuid.test(id)) throw new Error('Invalid request');
  const store = samvadStore();
  const { data: current, error: readError } = await store.from(TABLE)
    .select('status,requested_slot_text,agreed_slot,payment_status').eq('id', id).single();
  if (readError || !current) throw new Error('Request unavailable');
  const update: Record<string, string | number | null> = { updated_at: new Date().toISOString() };
  if (['accept', 'decline', 'review'].includes(action)) update.internal_note = note || null;
  if (action === 'accept' && ['NEW', 'REVIEWING'].includes(current.status)) update.status = 'ACCEPTED';
  else if (action === 'decline' && ['NEW', 'REVIEWING', 'ACCEPTED'].includes(current.status)) update.status = 'DECLINED';
  else if (action === 'review' && current.status === 'NEW') update.status = 'REVIEWING';
  else if (action === 'slot' && current.status === 'ACCEPTED') {
    const input = String(formData.get('agreedSlot') ?? '');
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(input)) throw new Error('Use a date and time in India time');
    const slot = new Date(`${input}:00+05:30`);
    if (!Number.isFinite(slot.getTime()) || slot.getTime() < Date.now()) throw new Error('Choose a future time');
    update.agreed_slot = slot.toISOString();
  } else if (action === 'confirm' && current.status === 'ACCEPTED' && current.agreed_slot) {
    // A team member must first match this payment ID, amount, and request reference in Razorpay.
    if (formData.get('verifiedInRazorpay') !== 'on') throw new Error('Verify payment in Razorpay first');
    const paymentId = String(formData.get('paymentId') ?? '').trim();
    if (!/^pay_[A-Za-z0-9]{8,40}$/.test(paymentId)) throw new Error('Invalid Razorpay payment ID');
    update.status = 'CONFIRMED';
    update.payment_status = 'PAID';
    update.payment_reference = paymentId;
    update.payment_amount_paise = 250000;
    update.payment_verified_at = new Date().toISOString();
    update.confirmed_at = new Date().toISOString();
  } else throw new Error('Invalid status transition');
  const { error } = await store.from(TABLE).update(update).eq('id', id).eq('status', current.status);
  if (error) throw new Error(error.code === '23505' ? 'Payment ID was already used' : 'Request could not be updated');
  revalidatePath('/bodhgaya-samvad/admin');
}
