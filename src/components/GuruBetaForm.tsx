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

const INITIAL: FormState = {
  name: '', organization_name: '', tradition: '', primary_language: '',
  tester_count: '', disciple_language: '', whatsapp: '', email: '',
  disciple_private_testing: '', internal_beta_listing_permission: '',
  donation_support_preference: '', future_interest: [],
  tradition_safety_notes: '', test_question_notes: '', additional_notes: '',
  consent: false, website: '',
};

// Radio/Checkbox group component
function RadioGroup({
  name, legend, options, value, onChange, required = false, column = false,
}: {
  name: string; legend: string; options: string[]; value: string;
  onChange: (v: string) => void; required?: boolean; column?: boolean;
}) {
  return (
    <fieldset className={styles.languageField}>
      <legend>{legend}{required ? ' *' : ''}</legend>
      <div style={column ? { flexDirection: 'column', alignItems: 'flex-start' } : {}}>
        {options.map((opt) => (
          <label key={opt}>
            <input
              type="radio"
              name={name}
              value={opt}
              required={required && !value}
              checked={value === opt}
              onChange={() => onChange(opt)}
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function CheckboxGroup({
  legend, options, values, onChange,
}: {
  legend: string; options: string[]; values: string[];
  onChange: (opt: string, checked: boolean) => void;
}) {
  return (
    <fieldset className={styles.languageField}>
      <legend>{legend}</legend>
      <div style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
        {options.map((opt) => (
          <label key={opt}>
            <input
              type="checkbox"
              checked={values.includes(opt)}
              onChange={(e) => onChange(opt, e.target.checked)}
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function GuruBetaForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleCheckbox = (opt: string, checked: boolean) => {
    setForm((f) => {
      const s = new Set(f.future_interest);
      if (checked) s.add(opt); else s.delete(opt);
      return { ...f, future_interest: Array.from(s) };
    });
  };

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setMessage('');
    try {
      const res = await fetch('/api/guru-beta/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'अभी आवेदन भेजने में समस्या आ रही है।');
      setStatus('success');
      setMessage('आपका आवेदन सुरक्षित रूप से प्राप्त हो गया है। निरवण धाम की ओर से आपसे शीघ्र संपर्क किया जाएगा। प्रणाम।');
      setForm(INITIAL);
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'अभी आवेदन भेजने में समस्या आ रही है। कृपया थोड़ी देर बाद पुनः प्रयास करें या निरवण धाम से सीधे संपर्क करें।');
    }
  }

  return (
    <form className={styles.entryForm} onSubmit={submit} noValidate>

      {/* ── Section 1: Basic Info ── */}
      <div className={styles.profileFields}>
        <label>
          <span>आपका नाम *</span>
          <input required value={form.name} onChange={set('name')} autoComplete="name" placeholder="अपना पूरा नाम लिखें" />
        </label>
        <label>
          <span>आश्रम / संस्था / समुदाय / चैनल का नाम</span>
          <input value={form.organization_name} onChange={set('organization_name')} placeholder="यदि लागू हो" />
        </label>
        <label>
          <span>WhatsApp नंबर *</span>
          <input required type="tel" value={form.whatsapp} onChange={set('whatsapp')} autoComplete="tel" placeholder="+91 XXXXXXXXXX" />
        </label>
        <label>
          <span>ईमेल</span>
          <input type="email" value={form.email} onChange={set('email')} autoComplete="email" placeholder="वैकल्पिक" />
        </label>
      </div>

      {/* ── Field 3: Tradition (Select) ── */}
      <fieldset className={styles.languageField} style={{ marginTop: '1.5rem' }}>
        <legend>आपका मार्ग या परंपरा *</legend>
        <div style={{ width: '100%' }}>
          <select
            required
            value={form.tradition}
            onChange={set('tradition')}
            style={{
              width: '100%', minHeight: '48px', padding: '0.7rem 0.85rem',
              background: 'rgba(4,14,7,0.72)', color: 'var(--shakti-ivory)',
              border: '1px solid rgba(212,168,67,0.2)', borderRadius: '6px',
              font: '400 0.95rem/1.6 var(--font-hind)', outline: 'none',
            }}
          >
            <option value="" disabled>चुनें…</option>
            {[
              'अद्वैत / आत्म-जिज्ञासा', 'योग / ध्यान', 'भक्ति / सत्संग', 'तंत्र / शक्ति साधना',
              'बौद्ध मार्ग', 'सिख परंपरा', 'जैन परंपरा', 'ईसाई आध्यात्मिकता',
              'सूफी / इस्लामी रहस्यवाद', 'सामान्य आध्यात्मिक मार्ग', 'अन्य',
            ].map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </fieldset>

      {/* ── Field 4: Primary Language ── */}
      <RadioGroup name="primary_language" legend="मुख्य भाषा" required
        options={['हिंदी', 'हिंग्लिश', 'अंग्रेज़ी', 'अन्य']}
        value={form.primary_language} onChange={(v) => setForm((f) => ({ ...f, primary_language: v }))} />

      {/* ── Field 5: Tester Count ── */}
      <RadioGroup name="tester_count" legend="बीटा परीक्षण में अनुमानित साधक संख्या" required
        options={['केवल स्वयं', '5 साधक', '10 साधक', '20 साधक', 'अन्य']}
        value={form.tester_count} onChange={(v) => setForm((f) => ({ ...f, tester_count: v }))} />

      {/* ── Field 6: Disciple Language ── */}
      <RadioGroup name="disciple_language" legend="साधकों की मुख्य भाषा" required
        options={['हिंदी', 'हिंग्लिश', 'अंग्रेज़ी', 'मिश्रित', 'अन्य']}
        value={form.disciple_language} onChange={(v) => setForm((f) => ({ ...f, disciple_language: v }))} />

      {/* ── Field 9: Disciple Private Testing ── */}
      <RadioGroup name="disciple_private_testing" legend="क्या आप चाहते हैं कि आपके साधक निजी रूप से इस ऐप का परीक्षण करें?" required column
        options={['हाँ', 'नहीं', 'पहले मैं स्वयं परीक्षण करना चाहता/चाहती हूँ']}
        value={form.disciple_private_testing} onChange={(v) => setForm((f) => ({ ...f, disciple_private_testing: v }))} />

      {/* ── Field 10: Internal Beta Listing ── */}
      <RadioGroup name="internal_beta_listing_permission" legend="क्या आपका नाम / समुदाय आंतरिक बीटा सूची में लिखा जा सकता है?" required
        options={['हाँ', 'नहीं']}
        value={form.internal_beta_listing_permission} onChange={(v) => setForm((f) => ({ ...f, internal_beta_listing_permission: v }))} />

      {/* ── Field 11: Donation Preference ── */}
      <RadioGroup name="donation_support_preference" legend="दान / सहयोग विकल्प" required column
        options={['नहीं, अभी बंद रहे', 'केवल सामान्य निरवण धाम प्लेटफॉर्म सहयोग के रूप में दिखाई दे', 'बाद में चर्चा करेंगे']}
        value={form.donation_support_preference} onChange={(v) => setForm((f) => ({ ...f, donation_support_preference: v }))} />

      {/* ── Field 12: Future Interest (checkboxes) ── */}
      <CheckboxGroup
        legend="भविष्य में रुचि (वैकल्पिक)"
        options={[
          'केवल साधकों के लिए सामान्य उपयोग',
          'अपने समुदाय के लिए अलग स्वागत संदेश',
          'अपनी वेबसाइट में एआई विजेट',
          'अपने नाम / संस्था के अनुसार अलग संस्करण',
          'भविष्य में आवाज़ / वीडियो अवतार',
          'अभी निश्चित नहीं',
        ]}
        values={form.future_interest}
        onChange={handleCheckbox}
      />

      {/* ── Textareas ── */}
      <div className={styles.questionsList}>
        {[
          { key: 'tradition_safety_notes' as const, label: 'क्या आपकी परंपरा या समुदाय से जुड़ा कोई विशेष विषय है जिसमें सावधानी रखनी चाहिए?', num: '13' },
          { key: 'test_question_notes' as const, label: 'आप किन प्रकार के प्रश्नों से इस एआई साथी को परीक्षण करना चाहेंगे?', num: '14' },
          { key: 'additional_notes' as const, label: 'कोई अतिरिक्त सुझाव या चिंता', num: '15' },
        ].map(({ key, label, num }) => (
          <label className={styles.question} key={key}>
            <span className={styles.questionNumber}>{num}</span>
            <span className={styles.questionBody}>
              <strong>{label}</strong>
              <textarea
                rows={3}
                value={form[key] as string}
                onChange={set(key)}
                placeholder="वैकल्पिक — अपने विचार सहजता से लिखें…"
              />
            </span>
          </label>
        ))}
      </div>

      {/* ── Consent ── */}
      <label className={styles.consent}>
        <input
          type="checkbox"
          required
          checked={form.consent}
          onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
        />
        <span>
          मैं समझता/समझती हूँ कि यह सीमित बीटा परीक्षण है; यह एआई स्वयं आदिसत्व नहीं है; यह केवल
          एक डिजिटल मार्गदर्शक है; यह जीवित गुरु, चिकित्सक, वकील या धार्मिक अधिकारी का स्थान नहीं
          लेता; मैं इस ऐप या लिंक को सार्वजनिक रूप से साझा नहीं करूँगा/करूँगी; और गलत/असुरक्षित
          उत्तर मिलने पर प्रतिक्रिया दूँगा/दूँगी। *
        </span>
      </label>

      {/* ── Honeypot ── */}
      <label className={styles.honeypot} aria-hidden="true">
        Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
      </label>

      {/* ── Submit ── */}
      <div className={styles.formSubmit}>
        <button type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'भेजा जा रहा है…' : 'आवेदन भेजें'}{' '}
          <span aria-hidden="true">→</span>
        </button>
        <p>आपकी सभी जानकारी गोपनीय रखी जाएगी।</p>
      </div>

      {message && (
        <p role="status" className={`${styles.formMessage} ${status === 'success' ? styles.successMessage : styles.errorMessage}`}>
          {message}
        </p>
      )}
    </form>
  );
}
