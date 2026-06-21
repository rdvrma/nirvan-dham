'use client';

import { FormEvent, useState } from 'react';
import styles from './NirvanShaktiSnanPage.module.css';

interface EntryQuestion {
  id: string;
  category: string;
  prompt: string;
  response_type: string;
  required: boolean;
}

interface FormState {
  name: string;
  email: string;
  whatsapp: string;
  location: string;
  language: 'Hindi' | 'English' | 'Hinglish';
  answers: Record<string, string>;
  consent: boolean;
  website: string;
}

const initialState: FormState = {
  name: '', email: '', whatsapp: '', location: '', language: 'Hindi', answers: {}, consent: false, website: '',
};

export default function EntryQuestionsForm({ questions }: { questions: EntryQuestion[] }) {
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  function updateAnswer(id: string, value: string) {
    setForm((current) => ({ ...current, answers: { ...current.answers, [id]: value } }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    setMessage('');

    try {
      const response = await fetch('/api/shakti-snan/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'उत्तर भेजे नहीं जा सके।');
      setStatus('success');
      setMessage('आपके प्रवेश प्रश्न प्राप्त हो गए हैं। Nirvan Dham की ओर से आपके उत्तरों को देखकर आगे की सूचना दी जाएगी।');
      setForm(initialState);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'कृपया कुछ समय बाद पुनः प्रयास करें।');
    }
  }

  return (
    <form className={styles.entryForm} onSubmit={submit}>
      <div className={styles.profileFields}>
        <label><span>नाम *</span><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" /></label>
        <label><span>ईमेल *</span><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" /></label>
        <label><span>WhatsApp नंबर *</span><input required type="tel" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} autoComplete="tel" /></label>
        <label><span>शहर / देश *</span><input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} autoComplete="country-name" /></label>
      </div>

      <fieldset className={styles.languageField}>
        <legend>पसंदीदा भाषा *</legend>
        <div>{(['Hindi', 'English', 'Hinglish'] as const).map((language) => (
          <label key={language}><input type="radio" name="language" value={language} checked={form.language === language} onChange={() => setForm({ ...form, language })} /><span>{language}</span></label>
        ))}</div>
      </fieldset>

      <div className={styles.questionsList}>
        {questions.map((question, index) => (
          <label className={styles.question} key={question.id}>
            <span className={styles.questionNumber}>{String(index + 1).padStart(2, '0')}</span>
            <span className={styles.questionBody}><small>{question.category}</small><strong>{question.prompt}</strong>
              <textarea
                required={question.required}
                rows={4}
                value={form.answers[question.id] || ''}
                onChange={(event) => updateAnswer(question.id, event.target.value)}
                placeholder={question.response_type === 'yes_no_with_details' ? 'हाँ या नहीं लिखकर, आवश्यक विवरण दें…' : 'अपना उत्तर सहजता और स्पष्टता से लिखें…'}
              />
            </span>
          </label>
        ))}
      </div>

      <label className={styles.consent}>
        <input type="checkbox" required checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} />
        <span>मैं समझता/समझती हूँ कि यह आध्यात्मिक साधना है, चिकित्सा या मानसिक स्वास्थ्य उपचार नहीं। अनुभव आएँ या न आएँ, मैं नियमित साधना और सजगता के साथ इस यात्रा में भाग लूँगा/लूँगी।</span>
      </label>
      <label className={styles.honeypot} aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></label>

      <div className={styles.formSubmit}>
        <button type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'भेजा जा रहा है…' : 'प्रवेश के लिए भेजें'} <span aria-hidden="true">→</span></button>
        <p>आपके उत्तर निजी रखे जाएंगे और केवल कार्यक्रम में प्रवेश के अवलोकन हेतु उपयोग होंगे।</p>
      </div>
      {message && <p role="status" className={`${styles.formMessage} ${status === 'success' ? styles.successMessage : styles.errorMessage}`}>{message}</p>}
    </form>
  );
}
