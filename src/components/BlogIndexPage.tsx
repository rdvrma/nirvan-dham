'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Language } from '@/lib/i18n';
import { getSavedLanguage, saveLanguage } from '@/lib/i18n';
import { getAllBlogPosts, getBlogImage, getLocalizedPost, getReadingMinutes } from '@/lib/blog';
import Header from '@/components/Header';
import SacredBackground from '@/components/SacredBackground';
import ContactSection from '@/components/ContactSection';

const text = {
  hi: {
    eyebrow: 'निर्वाण धाम लेख संग्रह',
    title: 'ब्लॉग और मनन',
    subtitle: 'हिंदी और English दोनों भाषाओं में वही क्रम, वही भाव, वही ज्ञान-धारा।',
    all: 'सभी लेख',
    read: 'लेख पढ़ें',
    min: 'मिनट',
    count: 'लेख उपलब्ध',
  },
  en: {
    eyebrow: 'Nirvan Dham Journal',
    title: 'Blogs & Contemplations',
    subtitle: 'The same series in Hindi and English, aligned by serial order and prepared for future WordPress publishing.',
    all: 'All Posts',
    read: 'Read Article',
    min: 'min',
    count: 'posts available',
  },
} as const;

export default function BlogIndexPage() {
  const [lang, setLang] = useState<Language>('hi');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setLang(getSavedLanguage());
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  function handleLangChange(selected: Language) {
    setLang(selected);
    saveLanguage(selected);
  }

  const activeLang: Language = mounted ? lang : 'hi';
  const t = text[activeLang];
  const isHindi = activeLang === 'hi';
  const posts = useMemo(() => getAllBlogPosts(), []);

  return (
    <>
      <Header lang={activeLang} onLangChange={handleLangChange} />
      <main className="blog-page" lang={activeLang}>
        <SacredBackground variant="mandala" intensity="soft" />
        <section className="blog-hero">
          {/* Spinning mandala behind hero */}
          <div className="blog-hero-mandala" aria-hidden="true" />

          {/* Floating Om */}
          <div className="blog-hero-symbol" aria-hidden="true">ॐ</div>

          <p className="pill">{t.eyebrow}</p>
          <h1 className={isHindi ? 'font-hindi' : 'font-serif-brand'}>{t.title}</h1>
          <p className="blog-hero-copy">{t.subtitle}</p>

          {/* Decorative divider */}
          <div className="blog-hero-divider" />

          <div className="blog-stat">
            <span>{posts.length}</span>
            <small>{t.count}</small>
          </div>
        </section>

        <section className="blog-list nd-container">
          <div className="blog-list-head">
            <span>{t.all}</span>
            <span>{posts.length}</span>
          </div>

          <div className="blog-grid">
            {posts.map((post) => {
              const localized = getLocalizedPost(post, activeLang);
              const image = getBlogImage(post, activeLang);

              return (
                <Link href={`/blog/${post.slug}`} className="blog-card" key={post.slug}>
                  {image ? (
                    <div className="blog-card-image">
                      <Image
                        src={image.src}
                        alt={activeLang === 'hi' ? image.altHi : image.altEn}
                        width={image.width}
                        height={image.height}
                        priority={post.id <= 3}
                        sizes="(max-width: 720px) 100vw, (max-width: 1080px) 50vw, 33vw"
                      />
                    </div>
                  ) : null}
                  <div>
                    <div className="blog-card-top">
                      <span>{String(post.id).padStart(2, '0')}</span>
                      <span>{getReadingMinutes(post, activeLang)} {t.min}</span>
                    </div>
                    <h2 className={isHindi ? 'font-hindi' : 'font-serif-brand'}>{localized.title}</h2>
                    <p>{localized.excerpt}</p>
                  </div>
                  <div className="blog-card-bottom">
                    <span>{post.tags[0]}</span>
                    <strong>{t.read} →</strong>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
      <ContactSection lang={activeLang} />

      <style jsx>{`
        .blog-page {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background:
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(26, 92, 53, .28), transparent 62%),
            linear-gradient(180deg, #080f0a 0%, #0b180d 48%, #080f0a 100%);
          padding-top: 72px;
        }

        .blog-hero {
          position: relative;
          z-index: 1;
          max-width: 960px;
          margin: 0 auto;
          padding: clamp(5rem, 11vw, 8rem) 1.5rem clamp(3rem, 7vw, 5rem);
          text-align: center;
          overflow: hidden;
        }

        .blog-hero-mandala {
          position: absolute;
          width: 600px;
          height: 600px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -52%);
          border: 1px solid rgba(212,168,67,0.07);
          border-radius: 50%;
          pointer-events: none;
          animation: blogMandalaSpin 120s linear infinite;
        }

        .blog-hero-mandala::before,
        .blog-hero-mandala::after {
          content: '';
          position: absolute;
          inset: 14%;
          border: 1px solid rgba(212,168,67,0.06);
          border-radius: 50%;
          animation: blogMandalaSpin 90s linear infinite reverse;
        }

        .blog-hero-mandala::after {
          inset: 28%;
          border-color: rgba(212,168,67,0.08);
          animation-duration: 60s;
        }

        @keyframes blogMandalaSpin {
          from { transform: translate(-50%, -52%) rotate(0deg); }
          to   { transform: translate(-50%, -52%) rotate(360deg); }
        }

        .blog-hero-symbol {
          font-size: clamp(2.2rem, 5vw, 3.5rem);
          color: var(--c-gold);
          margin-bottom: 1.5rem;
          filter: drop-shadow(0 0 28px rgba(212,168,67,0.45));
          animation: blogSymbolFloat 6s ease-in-out infinite;
          position: relative;
          z-index: 2;
        }

        @keyframes blogSymbolFloat {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-10px); }
        }

        .blog-hero-divider {
          width: 140px;
          height: 1px;
          margin: 0 auto 1.8rem;
          background: linear-gradient(90deg, transparent, rgba(212,168,67,0.55), transparent);
        }

        .blog-hero h1 {
          color: var(--c-ivory);
          font-size: clamp(3rem, 8vw, 6.8rem);
          font-weight: ${isHindi ? 600 : 300};
          line-height: .96;
          margin: 1rem 0;
        }

        .blog-hero-copy {
          color: var(--c-ivdim);
          font-size: clamp(1rem, 2vw, 1.18rem);
          line-height: 1.9;
          max-width: 720px;
          margin: 0 auto 1.8rem;
        }

        .blog-stat {
          display: inline-flex;
          align-items: center;
          gap: .8rem;
          border: 1px solid rgba(212, 168, 67, .22);
          background: rgba(8, 15, 10, .58);
          border-radius: 999px;
          padding: .5rem .9rem;
        }

        .blog-stat span {
          color: var(--c-gold);
          font-weight: 800;
        }

        .blog-stat small {
          color: var(--c-ivdim);
        }

        .blog-list {
          position: relative;
          z-index: 1;
          padding-bottom: clamp(5rem, 9vw, 8rem);
        }

        .blog-list-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: var(--c-gold);
          border-top: 1px solid rgba(212, 168, 67, .2);
          border-bottom: 1px solid rgba(212, 168, 67, .2);
          padding: 1rem 0;
          margin-bottom: 1.3rem;
          font-size: .82rem;
          font-weight: 800;
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        .blog-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
        }

        .blog-card {
          min-height: 360px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: inherit;
          text-decoration: none;
          border: 1px solid rgba(212, 168, 67, .13);
          border-radius: 8px;
          padding: ${posts.some((post) => getBlogImage(post, activeLang)) ? '0' : 'clamp(1.1rem, 2.6vw, 1.45rem)'};
          background:
            linear-gradient(145deg, rgba(13, 31, 16, .84), rgba(8, 15, 10, .78)),
            radial-gradient(circle at 100% 0%, rgba(212, 168, 67, .1), transparent 34%);
          transition: transform .35s ease, border-color .35s ease, background .35s ease;
        }

        .blog-card > div:not(.blog-card-image),
        .blog-card-bottom {
          margin-left: clamp(1.1rem, 2.6vw, 1.45rem);
          margin-right: clamp(1.1rem, 2.6vw, 1.45rem);
        }

        .blog-card > div:not(.blog-card-image):first-child {
          margin-top: clamp(1.1rem, 2.6vw, 1.45rem);
        }

        .blog-card-image {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          border-bottom: 1px solid rgba(212, 168, 67, .14);
          background: rgba(8, 15, 10, .75);
        }

        .blog-card-image :global(img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: saturate(.96) contrast(1.05);
          transition: transform .45s ease, filter .45s ease;
        }

        .blog-card:hover .blog-card-image :global(img) {
          transform: scale(1.04);
          filter: saturate(1.05) contrast(1.08);
        }

        .blog-card:hover {
          transform: translateY(-5px);
          border-color: rgba(212, 168, 67, .36);
          background:
            linear-gradient(145deg, rgba(18, 48, 26, .9), rgba(8, 15, 10, .82)),
            radial-gradient(circle at 100% 0%, rgba(212, 168, 67, .18), transparent 36%);
        }

        .blog-card-top,
        .blog-card-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          color: var(--c-gold);
          font-size: .76rem;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .blog-card h2 {
          color: var(--c-ivory);
          font-size: ${isHindi ? 'clamp(1.35rem, 2.4vw, 1.75rem)' : 'clamp(1.55rem, 2.6vw, 2rem)'};
          font-weight: ${isHindi ? 600 : 400};
          line-height: 1.18;
          margin: 1.1rem 0 .9rem;
        }

        .blog-card p {
          color: var(--c-ivdim);
          line-height: 1.78;
        }

        .blog-card-bottom {
          border-top: 1px solid rgba(212, 168, 67, .13);
          padding-top: 1rem;
          margin-top: 1.4rem;
        }

        .blog-card-bottom span {
          color: rgba(196, 184, 154, .76);
        }

        @media (max-width: 1080px) {
          .blog-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .blog-grid {
            grid-template-columns: 1fr;
          }

          .blog-card {
            min-height: 300px;
          }
        }
      `}</style>
    </>
  );
}
