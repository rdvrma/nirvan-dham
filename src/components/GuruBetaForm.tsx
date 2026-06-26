'use client';

import { FormEvent, useState } from 'react';
import styles from './NirvanShaktiSnanPage.module.css';

interface FormState {
  name: string;
  organization_name: string;
  tradition: string;
  primary_language: string;
  tester_count: string;
  disciple_language: string;
  whatsapp: string;
  email: string;
  disciple_private_testing: string;
  internal_beta_listing_permission: string;
  donation_support_preference: string;
  future_interest: string[];
  tradition_safety_notes: string;
  test_question_notes: string;
  additional_notes: string;
  consent: boolean;
  website: string;
}

const initialState: FormState = {
  name: '', organization_name: '', tradition: '', primary_language: '', tester_count: '', disciple_language: '', whatsapp: '', email: '', disciple_private_testing: '', internal_beta_listing_permission: '', donation_support_preference: '', future_interest: [], tradition_safety_notes: '', test_question_notes: '', additional_notes: '', consent: false, website: '',
};

export default function GuruBetaForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleCheckboxChange = (option: string, checked: boolean) => {
    setForm(prev => {
      const interests = new Set(prev.future_interest);
      if (checked) interests.add(option);
      else interests.delete(option);
      return { ...prev, future_interest: Array.from(interests) };
    });
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    setMessage('');

    try {
      const response = await fetch('/api/guru-beta/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'अभी आवेदन भेजने में समस्या आ रही है। कृपया थोड़ी देर बाद पुनः प्रयास करें या निर्वाण धाम से सीधे संपर्क करें।');
      setStatus('success');
      setMessage('आपका आवेदन सुरक्षित रूप से प्राप्त हो गया है। निर्वाण धाम की ओर से आपसे शीघ्र संपर्क किया जाएगा। प्रणाम।');
      setForm(initialState);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'अभी आवेदन भेजने में समस्या आ रही है। कृपया थोड़ी देर बाद पुनः प्रयास करें या निर्वाण धाम से सीधे संपर्क करें।');
    }
  }

  return (
    <form className={styles.entryForm} onSubmit={submit}>
      <div className={styles.profileFields}>
        <label><span>आपका नाम *</span><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" /></label>
        <label><span>आश्रम / संस्था / समुदाय / चैनल का नाम</span><input value={form.organization_name} onChange={(e) => setForm({ ...form, organization_name: e.target.value })} /></label>
        <label><span>WhatsApp नंबर *</span><input required type="tel" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} autoComplete="tel" /></label>
        <label><span>ईमेल</span><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" /></label>
      </div>

      <label className={styles.consent}>
        <span>आपका मार्ग या परंपरा *</span>
        <select required value={form.tradition} onChange={(e) => setForm({ ...form, tradition: e.target.value })} style={{ width: '100%', padding: '0.8rem', background: 'transparent', color: 'inherit', border: '1px solid rgba(212,168,67,0.4)' }}>
          <option value="" disabled>चुनें...</option>
          <option value="अद्वैत / आत्म-जिज्ञासा">अद्वैत / आत्म-जिज्ञासा</option>
          <option value="योग / ध्यान">योग / ध्यान</option>
          <option value="भक्ति / सत्संग">भक्ति / सत्संग</option>
          <option value="तंत्र / शक्ति साधना">तंत्र / शक्ति साधना</option>
          <option value="बौद्ध मार्ग">बौद्ध मार्ग</option>
          <option value="सिख परंपरा">सिख परंपरा</option>
          <option value="जैन परंपरा">जैन परंपरा</option>
          <option value="ईसाई आध्यात्मिकता">ईसाई आध्यात्मिकता</option>
          <option value="सूफी / इस्लामी रहस्यवाद">सूफी / इस्लामी रहस्यवाद</option>
          <option value="सामान्य आध्यात्मिक मार्ग">सामान्य आध्यात्मिक मार्ग</option>
          <option value="अन्य">अन्य</option>
        </select>
      </label>

      <fieldset className={styles.languageField}>
        <legend>मुख्य भाषा *</legend>
        <div>{(['हिंदी', 'हिंग्लिश', 'अंग्रेज़ी', 'अन्य']).map((opt) => (
          <label key={opt}><input required type="radio" name="primary_language" value={opt} checked={form.primary_language === opt} onChange={() => setForm({ ...form, primary_language: opt })} /><span>{opt}</span></label>
        ))}</div>
      </fieldset>

      <fieldset className={styles.languageField}>
        <legend>बीटा परीक्षण में अनुमानित साधक संख्या *</legend>
        <div>{(['केवल स्वयं', '5 साधक', '10 साधक', '20 साधक', 'अन्य']).map((opt) => (
          <label key={opt}><input required type="radio" name="tester_count" value={opt} checked={form.tester_count === opt} onChange={() => setForm({ ...form, tester_count: opt })} /><span>{opt}</span></label>
        ))}</div>
      </fieldset>

      <fieldset className={styles.languageField}>
        <legend>साधकों की मुख्य भाषा *</legend>
        <div>{(['हिंदी', 'हिंग्लिश', 'अंग्रेज़ी', 'मिश्रित', 'अन्य']).map((opt) => (
          <label key={opt}><input required type="radio" name="disciple_language" value={opt} checked={form.disciple_language === opt} onChange={() => setForm({ ...form, disciple_language: opt })} /><span>{opt}</span></label>
        ))}</div>
      </fieldset>

      <fieldset className={styles.languageField}>
        <legend>क्या आप चाहते हैं कि आपके साधक निजी रूप से इस ऐप का परीक्षण करें? *</legend>
        <div>{(['हाँ', 'नहीं', 'पहले मैं स्वयं परीक्षण करना चाहता/चाहती हूँ']).map((opt) => (
          <label key={opt}><input required type="radio" name="disciple_private_testing" value={opt} checked={form.disciple_private_testing === opt} onChange={() => setForm({ ...form, disciple_private_testing: opt })} /><span>{opt}</span></label>
        ))}</div>
      </fieldset>

      <fieldset className={styles.languageField}>
        <legend>क्या आपका नाम / समुदाय आंतरिक बीटा सूची में लिखा जा सकता है? *</legend>
        <div>{(['हाँ', 'नहीं']).map((opt) => (
          <label key={opt}><input required type="radio" name="internal_beta_listing_permission" value={opt} checked={form.internal_beta_listing_permission === opt} onChange={() => setForm({ ...form, internal_beta_listing_permission: opt })} /><span>{opt}</span></label>
        ))}</div>
      </fieldset>

      <fieldset className={styles.languageField}>
        <legend>दान / सहयोग विकल्प *</legend>
        <div style={{flexDirection: 'column', alignItems: 'flex-start'}}>{(['नहीं, अभी बंद रहे', 'केवल सामान्य निरवण धाम प्लेटफॉर्म सहयोग के रूप में दिखाई दे', 'बाद में चर्चा करेंगे']).map((opt) => (
          <label key={opt}><input required type="radio" name="donation_support_preference" value={opt} checked={form.donation_support_preference === opt} onChange={() => setForm({ ...form, donation_support_preference: opt })} /><span>{opt}</span></label>
        ))}</div>
      </fieldset>

      <fieldset className={styles.languageField} style={{ border: 'none' }}>
        <legend>भविष्य में रुचि (वैकल्पिक)</legend>
        <div style={{flexDirection: 'column', alignItems: 'flex-start'}}>{(['केवल साधकों के लिए सामान्य उपयोग', 'अपने समुदाय के लिए अलग स्वागत संदेश', 'अपनी वेबसाइट में एआई विजेट', 'अपने नाम / संस्था के अनुसार अलग संस्करण', 'भविष्य में आवाज़ / वीडियो अवतार', 'अभी निश्चित नहीं']).map((opt) => (
          <label key={opt}><input type="checkbox" checked={form.future_interest.includes(opt)} onChange={(e) => handleCheckboxChange(opt, e.target.checked)} /><span>{opt}</span></label>
        ))}</div>
      </fieldset>

      <div className={styles.questionsList}>
        <label className={styles.question}>
          <span className={styles.questionBody}><strong>क्या आपकी परंपरा या समुदाय से जुड़ा कोई विशेष विषय है जिसमें सावधानी रखनी चाहिए?</strong>
            <textarea rows={3} value={form.tradition_safety_notes} onChange={(e) => setForm({ ...form, tradition_safety_notes: e.target.value })} />
          </span>
        </label>
        <label className={styles.question}>
          <span className={styles.questionBody}><strong>आप किन प्रकार के प्रश्नों से इस एआई साथी को परीक्षण करना चाहेंगे?</strong>
            <textarea rows={3} value={form.test_question_notes} onChange={(e) => setForm({ ...form, test_question_notes: e.target.value })} />
          </span>
        </label>
        <label className={styles.question}>
          <span className={styles.questionBody}><strong>कोई अतिरिक्त सुझाव या चिंता</strong>
            <textarea rows={3} value={form.additional_notes} onChange={(e) => setForm({ ...form, additional_notes: e.target.value })} />
          </span>
        </label>
      </div>

      <label className={styles.consent} style={{ marginTop: '2rem' }}>
        <input type="checkbox" required checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} />
        <span>मैं समझता/समझती हूँ कि यह सीमित बीटा परीक्षण है; यह एआई केवल एक डिजिटल मार्गदर्शक है; यह जीवित गुरु, चिकित्सक, वकील या धार्मिक अधिकारी का स्थान नहीं लेता; मैं इस ऐप या लिंक को सार्वजनिक रूप से साझा नहीं करूँगा/करूँगी; और गलत/असुरक्षित उत्तर मिलने पर प्रतिक्रिया दूँगा/दूँगी।</span>
      </label>

      <label className={styles.honeypot} aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></label>

      <div className={styles.formSubmit}>
        <button type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'भेजा जा रहा है…' : 'आवेदन भेजें'} <span aria-hidden="true">→</span></button>
      </div>
      {message && <p role="status" className={`${styles.formMessage} ${status === 'success' ? styles.successMessage : styles.errorMessage}`}>{message}</p>}
    </form>
  );
}
