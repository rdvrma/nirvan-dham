import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isSamvadAdmin, requestReference, samvadStore, TABLE } from '@/lib/bodhgaya-samvad/server';
import { reviewSamvad } from './actions';

export const dynamic = 'force-dynamic';

export default async function SamvadAdmin() {
  if (!(await isSamvadAdmin())) notFound();
  const { data, error } = await samvadStore().from(TABLE).select('*').order('created_at', { ascending: false }).limit(100);
  if (error) throw new Error('Samvad requests could not be loaded');
  return <main style={{ minHeight: '100vh', background: '#07140e', color: '#efe9d9', padding: 'clamp(20px,5vw,70px)', fontFamily: 'Arial,sans-serif' }}>
    <p style={{ color: '#cbb77b' }}>NIRVAN DHAM · PRIVATE REVIEW</p><h1>Bodhgaya Samvad requests</h1>
    <p>Only signed-in, explicitly allowed administrators can read and change these requests. After accepting, share the private link with the seeker. Payment verification is manual in Razorpay before confirmation.</p>
    {(data ?? []).map((item) => <article key={item.id} style={{ border: '1px solid #685a34', margin: '24px 0', padding: 24, maxWidth: 900 }}>
      <h2>{requestReference(item.id)} · {item.status}</h2><p>{item.name} · {item.email} · {item.phone} · {item.country}</p>
      <p>Language: {item.preferred_language} · Format: {item.meeting_type} · Bodhgaya: {item.travel_dates}</p>
      <p><strong>Question:</strong> {item.primary_question}</p><p><strong>Why in person:</strong> {item.why_in_person}</p>
      {item.note && <p><strong>Optional note:</strong> {item.note}</p>}
      <p>Requested time: {item.requested_slot_text || 'Not yet supplied'} · Agreed time: {item.agreed_slot || 'Not yet agreed'}</p>
      <p>Payment: {item.payment_status} {item.payment_reference || ''}</p>
      {item.status === 'ACCEPTED' || item.status === 'CONFIRMED' ? <p>Private seeker link: <Link style={{ color: '#e0bb68' }} href={`/bodhgaya-samvad/request/${item.booking_token}`}>Open link to share</Link> · <a style={{ color: '#e0bb68' }} href={`mailto:${encodeURIComponent(item.email)}?subject=${encodeURIComponent(`Bodhgaya Samvad request ${requestReference(item.id)}`)}&body=${encodeURIComponent(`Dear ${item.name},\n\nYour Bodhgaya Samvad request has been accepted. Please use your private link to request or view the agreed time:\nhttps://www.nirvandham.in/bodhgaya-samvad/request/${item.booking_token}\n\nA meeting is confirmed only after a genuine time is agreed and your ₹2,500 contribution is verified.\n\nNirvan Dham`)}`}>Prepare acceptance email</a></p> : null}
      <form action={reviewSamvad} style={{ display: 'grid', gap: 12, maxWidth: 620 }}><input name="id" type="hidden" value={item.id} />
        <label>Internal note<br /><textarea name="internalNote" defaultValue={item.internal_note || ''} rows={3} maxLength={2000} style={{ width: '100%' }} /></label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{(['review', 'accept', 'decline'] as const).map((action) => <button key={action} name="action" value={action} type="submit">{action}</button>)}</div>
      </form>
      {item.status === 'ACCEPTED' && <form action={reviewSamvad} style={{ marginTop: 16 }}><input name="id" type="hidden" value={item.id} /><input name="action" type="hidden" value="slot" /><label>Genuinely agreed time (India time, IST) <input type="datetime-local" name="agreedSlot" required /></label> <button type="submit">Set agreed time</button></form>}
      {item.status === 'ACCEPTED' && item.agreed_slot && <form action={reviewSamvad} style={{ display: 'grid', gap: 10, marginTop: 16 }}><input name="id" type="hidden" value={item.id} /><input name="action" type="hidden" value="confirm" /><label>Razorpay payment ID <input name="paymentId" required pattern="pay_[A-Za-z0-9]{8,40}" /></label><label><input name="verifiedInRazorpay" type="checkbox" required /> I verified the captured ₹2,500 payment, this seeker, and the approved reference in Razorpay.</label><button type="submit">Confirm booking after verification</button></form>}
    </article>)}
  </main>;
}
