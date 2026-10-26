import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PAYMENT_URL, requestReference, samvadStore, TABLE } from '@/lib/bodhgaya-samvad/server';
import { markPaymentPending, requestTime } from './actions';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Your Bodhgaya Samvad request | Nirvan Dham', robots: { index: false, follow: false } };

export default async function PrivateRequest({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token)) notFound();
  const { data: item, error } = await samvadStore().from(TABLE)
    .select('id,name,preferred_language,meeting_type,status,requested_slot_text,agreed_slot,payment_status')
    .eq('booking_token', token).single();
  if (error || !item || !['ACCEPTED', 'CONFIRMED'].includes(item.status)) notFound();
  const hi = item.preferred_language === 'Hindi';
  const reference = requestReference(item.id);
  const agreed = item.agreed_slot ? new Intl.DateTimeFormat(hi ? 'hi-IN' : 'en-IN', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Asia/Kolkata' }).format(new Date(item.agreed_slot)) : null;
  return <main lang={hi ? 'hi' : 'en'} style={{ minHeight: '100vh', background: '#06130c', color: '#f0ebdf', padding: 'clamp(28px,8vw,100px) 20px', fontFamily: 'Arial,sans-serif' }}>
    <div style={{ maxWidth: 720, margin: 'auto' }}><p style={{ letterSpacing: 3, color: '#d1b367' }}>NIRVAN DHAM · BODHGAYA SAMVAD</p>
      <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(2.5rem,6vw,4.5rem)', fontWeight: 400 }}>{item.status === 'CONFIRMED' ? (hi ? 'संवाद की पुष्टि हुई' : 'Samvad confirmed') : (hi ? 'आपका अनुरोध स्वीकृत हुआ' : 'Your request was accepted')}</h1>
      <p>{hi ? 'नमस्ते' : 'Dear'} {item.name},</p>
      <p>{hi ? 'निजी अनुरोध संदर्भ' : 'Private request reference'}: <strong>{reference}</strong></p>
      {item.status === 'CONFIRMED' ? <section style={{ borderTop: '1px solid #7a6945', paddingTop: 25 }}><p>{hi ? 'समय' : 'Time'}: <strong>{agreed}</strong></p><p>{hi ? 'भाषा' : 'Language'}: {item.preferred_language} · {hi ? 'स्वरूप' : 'Format'}: {item.meeting_type}</p><p>{hi ? 'बोधगया में सटीक स्थान मुलाकात से पहले निजी रूप से साझा किया जाएगा। सहायता के लिए +91 9334325558 पर संपर्क करें।' : 'The exact Bodhgaya meeting location will be shared privately before the Samvad. For assistance, contact +91 9334325558.'}</p></section> : <>
        <p>{hi ? 'अब एक वास्तविक समय तय करना है। भुगतान केवल समय तय होने के बाद करें।' : 'The next step is to agree a genuine time. Please pay only after that time is shown here.'}</p>
        {!agreed ? <form action={requestTime} style={{ display: 'grid', gap: 14, marginTop: 35 }}><input type="hidden" name="token" value={token} /><label>{hi ? 'आपकी पसंद का समय और तिथि (भारतीय समय)' : 'Your preferred date and time (India time)'}<textarea name="requestedTime" required minLength={12} maxLength={240} defaultValue={item.requested_slot_text || ''} rows={4} style={{ display: 'block', width: '100%', marginTop: 10, padding: 12 }} /></label><button type="submit" style={{ padding: 14, background: '#d9b55f', color: '#07140e', border: 0, cursor: 'pointer' }}>{hi ? 'समय का अनुरोध भेजें' : 'Request this time'}</button>{item.requested_slot_text && <p>{hi ? 'आपका समय अनुरोध प्राप्त हुआ है; पुष्टि की प्रतीक्षा करें।' : 'Your time request is saved. Please wait for agreement.'}</p>}</form> : <section style={{ borderTop: '1px solid #7a6945', paddingTop: 25 }}><h2>{hi ? 'सहमति से तय समय' : 'Agreed time'}</h2><p>{agreed}</p><p>{hi ? '₹2,500 प्रतिबद्धता योगदान स्वैच्छिक दान से अलग है। Razorpay page पर यही approved request reference और अपने सही संपर्क विवरण भरें। भुगतान के बाद हमारी टीम Razorpay में राशि और संदर्भ जाँचेगी; केवल तभी बुकिंग पक्की होगी।' : 'The ₹2,500 commitment contribution is separate from any voluntary donation. Enter this approved request reference and your own contact details on the Razorpay page. Our team will verify the payment and reference in Razorpay before confirming the booking.'}</p><p><strong>{reference}</strong></p><a href={PAYMENT_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '15px 24px', background: '#d9b55f', color: '#07140e', textDecoration: 'none' }}>{hi ? 'Razorpay पर ₹2,500 भुगतान करें ↗' : 'Pay ₹2,500 on Razorpay ↗'}</a><p>{hi ? 'भुगतान विफल होने पर यहाँ फिर लौट सकते हैं; अनुरोध और तय समय सुरक्षित रहेंगे।' : 'If payment fails, you can return here and retry. Your request and agreed time remain saved.'}</p><form action={markPaymentPending}><input type="hidden" name="token" value={token} /><button type="submit" style={{ marginTop: 15, color: '#e4c478', background: 'transparent', border: '1px solid #79683d', padding: '12px 16px', cursor: 'pointer' }}>{hi ? 'मैंने भुगतान किया है — जाँच का अनुरोध करें' : 'I have paid — request verification'}</button></form>{item.payment_status === 'PENDING' && <p role="status">{hi ? 'भुगतान जाँच का अनुरोध मिल गया। सत्यापन के बाद यहाँ पुष्टि दिखाई देगी।' : 'Payment review requested. Confirmation will appear here after verification.'}</p>}</section>}
      </>}
      <p style={{ marginTop: 45, fontSize: 13, color: '#c7c1ac' }}>{hi ? 'यह निजी लिंक है। इसे सार्वजनिक रूप से साझा न करें।' : 'This link is private. Please do not share it publicly.'}</p>
    </div>
  </main>;
}
