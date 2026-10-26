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
    <p>Only signed-in, explicitly allowed administrators can read these bookings. A selected slot is booked when the form is submitted; payment is optional. Formspree sends the booking details by email.</p>
    {(data ?? []).map((item) => <article key={item.id} style={{ border: '1px solid #685a34', margin: '24px 0', padding: 24, maxWidth: 900 }}>
      <h2>{requestReference(item.id)} · {item.status}</h2><p>{item.name} · {item.email} · {item.phone} · {item.country}</p>
      <p>Language: {item.preferred_language} · Format: {item.meeting_type} · Bodhgaya: {item.travel_dates}</p>
      {item.primary_question && <p><strong>Question:</strong> {item.primary_question}</p>}{item.why_in_person && <p><strong>Why in person:</strong> {item.why_in_person}</p>}
      {item.note && <p><strong>Optional note:</strong> {item.note}</p>}
      <p>Booked time: {item.agreed_slot || 'No time set'} · Formspree: {item.formspree_notified_at ? 'sent' : 'pending'}</p>
      <p>Private seeker link: <Link style={{ color: '#e0bb68' }} href={`/bodhgaya-samvad/request/${item.booking_token}`}>Open booking</Link> · <a style={{ color: '#e0bb68' }} href={`mailto:${encodeURIComponent(item.email)}?subject=${encodeURIComponent(`Bodhgaya Samvad booking ${requestReference(item.id)}`)}&body=${encodeURIComponent(`Dear ${item.name},\n\nYour Bodhgaya Samvad time is booked. View your private booking here:\nhttps://www.nirvandham.in/bodhgaya-samvad/request/${item.booking_token}\n\nPayment is optional and does not affect this booking.\n\nNirvan Dham`)}`}>Prepare booking email</a></p>
      {!item.agreed_slot && <form action={reviewSamvad} style={{ display: 'grid', gap: 12, maxWidth: 620 }}><input name="id" type="hidden" value={item.id} />
        <label>Internal note<br /><textarea name="internalNote" defaultValue={item.internal_note || ''} rows={3} maxLength={2000} style={{ width: '100%' }} /></label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{(['review', 'accept', 'decline'] as const).map((action) => <button key={action} name="action" value={action} type="submit">{action}</button>)}</div>
      </form>}
      {item.status === 'ACCEPTED' && !item.agreed_slot && <form action={reviewSamvad} style={{ marginTop: 16 }}><input name="id" type="hidden" value={item.id} /><input name="action" type="hidden" value="slot" /><label>Agreed time (India time, IST) <input type="datetime-local" name="agreedSlot" required /></label> <button type="submit">Set time</button></form>}
    </article>)}
  </main>;
}
