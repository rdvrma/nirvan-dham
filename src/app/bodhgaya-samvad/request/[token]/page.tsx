import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PAYMENT_URL, requestReference, samvadStore, TABLE } from '@/lib/bodhgaya-samvad/server';
import { requestTime } from './actions';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Your Bodhgaya Samvad booking | Nirvan Dham', robots: { index: false, follow: false } };

export default async function PrivateRequest({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token)) notFound();
  const { data: item, error } = await samvadStore().from(TABLE)
    .select('id,name,preferred_language,meeting_type,status,requested_slot_text,agreed_slot')
    .eq('booking_token', token).single();
  if (error || !item || !['NEW', 'REVIEWING', 'ACCEPTED', 'CONFIRMED'].includes(item.status)) notFound();

  const hi = item.preferred_language === 'Hindi';
  const reference = requestReference(item.id);
  const agreed = item.agreed_slot
    ? new Intl.DateTimeFormat(hi ? 'hi-IN' : 'en-IN', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Asia/Kolkata' }).format(new Date(item.agreed_slot))
    : null;

  return <main lang={hi ? 'hi' : 'en'} style={{ minHeight: '100vh', background: '#07150e', color: '#eee7d5', padding: 'clamp(40px,8vw,110px) 20px' }}>
    <div style={{ maxWidth: 720, margin: 'auto', border: '1px solid #665e3e', padding: 'clamp(25px,5vw,55px)', fontFamily: 'Arial,sans-serif' }}>
      <p style={{ color: '#d8b869', letterSpacing: 3, fontSize: 12 }}>NIRVAN DHAM · BODHGAYA SAMVAD</p>
      <h1 style={{ fontFamily: 'Georgia,serif', fontWeight: 400, fontSize: 'clamp(2.3rem,6vw,4.5rem)', lineHeight: 1.05 }}>
        {agreed ? (hi ? 'आपका स्लॉट बुक हो गया है।' : 'Your slot is booked.') : (hi ? 'आपका अनुरोध मिल गया है।' : 'Your request was received.')}
      </h1>
      <p>{hi ? 'नमस्ते' : 'Dear'} {item.name},</p>
      <p style={{ color: '#d8b869' }}>{hi ? 'बुकिंग संदर्भ' : 'Booking reference'} · <strong>{reference}</strong></p>
      {agreed ? <>
        <div style={{ borderTop: '1px solid #665e3e', borderBottom: '1px solid #665e3e', padding: '24px 0', margin: '32px 0' }}>
          <p style={{ fontSize: 20, margin: 0 }}>{agreed} · {hi ? 'दो घंटे' : 'two hours'}</p>
          <p style={{ marginBottom: 0, color: '#a9d5a2' }}>{hi ? 'समय बुक है · भुगतान न करने पर भी बुक रहेगा' : 'Booked · your slot stays booked even without payment'}</p>
        </div>
        <p>{hi ? 'फ़ॉर्म भेजते ही आपका स्लॉट बुक हो गया और निर्वाण धाम को विवरण ईमेल से भेज दिया गया। बोधगया में सटीक स्थान निजी रूप से साझा किया जाएगा। सहायता के लिए +91 9334325558 पर संपर्क करें।' : 'Your slot was booked when you submitted the form and the details were emailed to Nirvan Dham. The exact Bodhgaya location will be shared privately. For assistance, call +91 9334325558.'}</p>
        <p>{hi ? 'यदि आप चाहें तो नीचे मौजूदा Razorpay पेज पर ₹2,500 का योगदान दे सकते हैं। भुगतान इस बुकिंग की शर्त नहीं है और स्वैच्छिक दान से अलग है।' : 'If you wish, you can make the ₹2,500 contribution on the existing Razorpay page below. Payment is not a condition of this booking and is separate from voluntary donations.'}</p>
        <a href={PAYMENT_URL} style={{ display: 'inline-block', background: '#d8b869', color: '#07150e', padding: '17px 24px', marginTop: 16, textDecoration: 'none', fontWeight: 700 }}>{hi ? 'Razorpay पेज खोलें' : 'Open Razorpay page'} ↗</a>
      </> : <>
        <p>{hi ? 'उपलब्ध समय तय होने पर यहाँ बुकिंग दिखाई देगी।' : 'Your booking will appear here once a time is agreed.'}</p>
        {item.status === 'ACCEPTED' && <form action={requestTime} style={{ display: 'grid', gap: 14, marginTop: 35 }}>
          <input type="hidden" name="token" value={token} />
          <label>{hi ? 'आपकी पसंद का समय और तिथि (भारतीय समय)' : 'Your preferred date and time (India time)'}
            <textarea name="requestedTime" required minLength={12} maxLength={240} defaultValue={item.requested_slot_text || ''} rows={4} style={{ display: 'block', width: '100%', marginTop: 10, padding: 12 }} />
          </label>
          <button type="submit" style={{ padding: 14, background: '#d9b55f', color: '#07140e', border: 0, cursor: 'pointer' }}>{hi ? 'समय का अनुरोध भेजें' : 'Request this time'}</button>
        </form>}
      </>}
      <p style={{ color: '#aaa696', fontSize: 12, marginTop: 38 }}>{hi ? 'यह लिंक निजी है; इसे सार्वजनिक रूप से साझा न करें।' : 'This is a private link. Do not share it publicly.'}</p>
    </div>
  </main>;
}
