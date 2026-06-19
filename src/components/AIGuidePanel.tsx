'use client';

import { useState, useRef, useEffect } from 'react';
import type { Language } from '@/lib/i18n';
import { content } from '@/lib/i18n';
import SacredBackground from '@/components/SacredBackground';

interface Message {
  role: 'bot' | 'user';
  text: string;
}

interface AIGuidePanelProps {
  lang: Language;
}

export default function AIGuidePanel({ lang }: AIGuidePanelProps) {
  const t = content[lang].aiGuide;
  const isHindi = lang === 'hi';
  const [messages, setMessages] = useState<Message[]>(() => [
    { role: 'bot', text: t.welcomeMsg },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [cooldown, setCooldown] = useState(0); // seconds remaining
  const chatEndRef = useRef<HTMLDivElement>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastWelcomeRef = useRef(t.welcomeMsg);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length !== 1 || prev[0]?.role !== 'bot' || prev[0]?.text !== lastWelcomeRef.current) {
        return prev;
      }

      lastWelcomeRef.current = t.welcomeMsg;
      return [{ role: 'bot', text: t.welcomeMsg }];
    });
  }, [t.welcomeMsg]);

  useEffect(() => {
    if (messages.length <= 1 && !isTyping) return;

    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, isTyping]);

  // Start cooldown countdown
  function startCooldown(seconds: number) {
    setCooldown(seconds);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function sendMessage(question: string) {
    if (!question.trim() || isTyping || cooldown > 0) return;

    const userMsg: Message = { role: 'user', text: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, history: messages, lang }),
      });

      if (res.status === 429) {
        startCooldown(45);
        setMessages((prev) => [
          ...prev,
          {
            role: 'bot',
            text: isHindi
              ? 'अभी बहुत सारे प्रश्न आ रहे हैं। कृपया 30-60 सेकंड प्रतीक्षा करें और फिर पूछें।'
              : 'The guide is receiving many questions right now. Please wait 30-60 seconds and ask again.',
          },
        ]);
        return;
      }

      if (!res.ok) {
        throw new Error('API request failed');
      }

      const data = await res.json();
      
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: data.response || (isHindi
            ? 'यह जानकारी अभी Nirvan Dham की उपलब्ध knowledge base में नहीं है।'
            : 'This information is not available in the current Nirvan Dham knowledge base.'),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: isHindi
            ? 'नेटवर्क में समस्या है। कृपया पुनः प्रयास करें।'
            : 'Network issue. Please check your connection and try again.',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <section
      id="ai-guide"
      className="section-pad relative overflow-hidden"
      style={{ background: 'var(--c-mist, #122418)' }}
    >
      {/* Om field sacred background */}
      <SacredBackground variant="om-field" intensity="soft" />
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(26,92,53,0.15) 0%, transparent 70%)',
        }}
      />

      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: '860px',
        marginLeft: 'auto', marginRight: 'auto',
        paddingLeft: 'clamp(1.25rem, 4vw, 3rem)',
        paddingRight: 'clamp(1.25rem, 4vw, 3rem)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p className="pill mx-auto mb-5" style={{ width: 'fit-content' }}>
            {isHindi ? 'पवित्र संवाद' : 'Sacred Dialogue'}
          </p>
          <h2
            className={`font-serif ${isHindi ? 'font-hindi' : ''}`}
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: isHindi ? 600 : 300,
              color: 'var(--c-ivory)',
              marginBottom: '0.5rem',
            }}
          >
            {t.heading}
          </h2>
          <p
            className={isHindi ? 'font-hindi' : 'font-serif'}
            style={{
              fontSize: '0.95rem',
              color: 'var(--c-ivdim)',
              opacity: 0.6,
              fontStyle: isHindi ? 'normal' : 'italic',
            }}
          >
            {t.subheading}
          </p>
        </div>

        {/* Disclaimer */}
        <div
          className="mb-8 mx-auto"
          style={{
            maxWidth: '560px',
            padding: '0.875rem 1.25rem',
            borderRadius: '6px',
            background: 'rgba(212,168,67,0.05)',
            border: '1px solid rgba(212,168,67,0.15)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <span style={{ color: 'var(--c-gold)', fontSize: '0.9rem', marginTop: '1px', flexShrink: 0 }}>ℹ</span>
          <p
            className={isHindi ? 'font-hindi' : ''}
            style={{
              fontSize: isHindi ? '0.85rem' : '0.8rem',
              color: 'var(--c-ivdim)',
              lineHeight: isHindi ? 1.8 : 1.65,
              opacity: 0.8,
            }}
          >
            {t.disclaimer}
          </p>
        </div>

        {/* Chat container */}
        <div
          className="relative"
          style={{
            borderRadius: '12px',
            border: '1px solid rgba(212,168,67,0.12)',
            background: 'rgba(8,15,10,0.8)',
            backdropFilter: 'blur(20px)',
            overflow: 'hidden',
            boxShadow: '0 0 0 1px rgba(212,168,67,0.04), 0 24px 64px rgba(0,0,0,0.5)',
          }}
        >
          {/* Chat header bar */}
          <div
            style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid rgba(212,168,67,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: 'rgba(13,31,16,0.4)',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(212,168,67,0.2), rgba(26,92,53,0.3))',
                border: '1px solid rgba(212,168,67,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                animation: 'glowPulse 4s ease-in-out infinite',
              }}
            >
              ॐ
            </div>
            <div>
              <p
                className={isHindi ? 'font-hindi' : ''}
                style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--c-ivory)' }}
              >
                {isHindi ? 'Aadisatv AI गाइड' : 'Aadisatv AI Guide'}
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--c-sage)', letterSpacing: '0.05em' }}>
                ● {isHindi ? 'Gemini द्वारा संचालित' : 'Powered by Gemini'}
              </p>
            </div>
          </div>

          {/* Messages area */}
          <div
            style={{
              height: '340px',
              overflowY: 'auto',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  animation: 'fadeInUp 0.4s ease forwards',
                }}
              >
                <div
                  className={msg.role === 'bot' ? 'chat-bubble-bot' : 'chat-bubble-user'}
                  style={{
                    maxWidth: '82%',
                    padding: '0.875rem 1.125rem',
                    borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                  }}
                >
                  <p
                    className={isHindi ? 'font-hindi' : ''}
                    style={{
                      fontSize: isHindi ? '0.9rem' : '0.875rem',
                      color: 'var(--c-ivory)',
                      lineHeight: isHindi ? 1.9 : 1.7,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {msg.text}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', animation: 'fadeIn 0.3s ease' }}>
                <div
                  className="chat-bubble-bot"
                  style={{ padding: '0.875rem 1.125rem', borderRadius: '12px 12px 12px 4px' }}
                >
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '16px' }}>
                    {[0, 1, 2].map((j) => (
                      <div
                        key={j}
                        style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          background: 'var(--c-gold)',
                          opacity: 0.6,
                          animation: `float 1.2s ease-in-out ${j * 0.2}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Suggested questions */}
          <div
            style={{
              padding: '0.75rem 1.5rem',
              borderTop: '1px solid rgba(212,168,67,0.06)',
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              background: 'rgba(13,31,16,0.2)',
            }}
          >
            {t.suggestions.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                disabled={isTyping}
                className={`transition-premium ${isHindi ? 'font-hindi' : ''}`}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: '9999px',
                  border: '1px solid rgba(212,168,67,0.18)',
                  background: 'rgba(212,168,67,0.05)',
                  color: 'var(--c-gold)',
                  fontSize: isHindi ? '0.8rem' : '0.72rem',
                  cursor: isTyping ? 'default' : 'pointer',
                  opacity: isTyping ? 0.5 : 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input area */}
          <div
            style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid rgba(212,168,67,0.08)',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              placeholder={cooldown > 0
                ? (isHindi ? `${cooldown}s इंतजार करें...` : `Please wait ${cooldown}s...`)
                : t.placeholder
              }
              disabled={isTyping || cooldown > 0}
              className={isHindi ? 'font-hindi' : ''}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                border: `1px solid ${cooldown > 0 ? 'rgba(212,168,67,0.08)' : 'rgba(212,168,67,0.15)'}`,
                background: 'rgba(13,31,16,0.6)',
                color: cooldown > 0 ? 'var(--c-ivdim)' : 'var(--c-ivory)',
                fontSize: isHindi ? '0.9rem' : '0.875rem',
                outline: 'none',
                opacity: cooldown > 0 ? 0.6 : 1,
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={isTyping || !input.trim() || cooldown > 0}
              className={`transition-premium ${isHindi ? 'font-hindi' : ''}`}
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '6px',
                background: (isTyping || !input.trim() || cooldown > 0)
                  ? 'rgba(212,168,67,0.2)'
                  : 'var(--c-gold)',
                color: (isTyping || !input.trim() || cooldown > 0)
                  ? 'var(--c-ivdim)'
                  : 'var(--c-bg)',
                fontWeight: 600,
                fontSize: '0.875rem',
                border: 'none',
                cursor: (isTyping || !input.trim() || cooldown > 0) ? 'default' : 'pointer',
                minWidth: '72px',
                whiteSpace: 'nowrap',
              }}
            >
              {cooldown > 0 ? `${cooldown}s` : t.send}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
