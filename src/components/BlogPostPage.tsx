'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Language } from '@/lib/i18n';
import { getSavedLanguage, saveLanguage } from '@/lib/i18n';
import type { BlogPost } from '@/lib/blog';
import { getBlogImage, getLocalizedPost, getReadingMinutes, getRelatedBlogPosts } from '@/lib/blog';
import Header from '@/components/Header';
import SacredBackground from '@/components/SacredBackground';
import ContactSection from '@/components/ContactSection';

interface BlogPostPageProps {
  post: BlogPost;
}

const text = {
  hi: {
    back: 'लेख संग्रह',
    series: 'निर्वाण धाम ब्लॉग',
    min: 'मिनट',
    related: 'आगे पढ़ें',
    read: 'पढ़ें',
  },
  en: {
    back: 'Blog Index',
    series: 'Nirvan Dham Blog',
    min: 'min read',
    related: 'Continue Reading',
    read: 'Read',
  },
} as const;

export default function BlogPostPage({ post }: BlogPostPageProps) {
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
  const localized = getLocalizedPost(post, activeLang);
  const image = getBlogImage(post, activeLang);
  const related = getRelatedBlogPosts(post, 3);

  return (
    <>
      <Header lang={activeLang} onLangChange={handleLangChange} />
      <main className="post-page" lang={activeLang}>
        <SacredBackground variant="mandala" intensity="soft" />

        <article className="post-article">
          <section className={`post-hero ${image ? 'has-image' : 'no-image'}`}>
            {image ? (
              <Image
                className="post-hero-bg"
                src={image.src}
                alt=""
                fill
                priority
                loading="eager"
                sizes="100vw"
              />
            ) : null}
            <div className="post-hero-veil" />
            <div className="post-hero-geometry" />
            {!image && (
              <div className="post-hero-symbol" aria-hidden="true">ॐ</div>
            )}
            <div className="post-hero-inner">
          <Link href="/blog" className="back-link">← {t.back}</Link>
          <div className="post-kicker">
            <span>{t.series}</span>
            <span>{String(post.id).padStart(2, '0')}</span>
            <span>{getReadingMinutes(post, activeLang)} {t.min}</span>
          </div>
          <h1 className={isHindi ? 'font-hindi' : 'font-serif-brand'}>{localized.title}</h1>
          <p className="post-excerpt">{localized.excerpt}</p>
            </div>
          </section>

          <div className="post-shell">
          <div className="post-content">
            {localized.body.map((block, index) => {
              if (block.type === 'heading') {
                return (
                  <h2 key={`${block.text}-${index}`} className={isHindi ? 'font-hindi' : 'font-serif-brand'}>
                    {block.text}
                  </h2>
                );
              }

              return <p key={`${block.text}-${index}`}>{block.text}</p>;
            })}
          </div>
          </div>
        </article>

        <section className="related nd-container">
          <h2 className={isHindi ? 'font-hindi' : 'font-serif-brand'}>{t.related}</h2>
          <div className="related-grid">
            {related.map((item) => {
              const next = getLocalizedPost(item, activeLang);
              const relImg = getBlogImage(item, activeLang);

              return (
                <Link href={`/blog/${item.slug}`} key={item.slug} className="related-card">
                  {relImg && (
                    <div className="related-card-image">
                      <Image
                        src={relImg.src}
                        alt={activeLang === 'hi' ? relImg.altHi : relImg.altEn}
                        width={relImg.width}
                        height={relImg.height}
                        sizes="(max-width: 860px) 100vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="related-card-body">
                    <span>{String(item.id).padStart(2, '0')}</span>
                    <strong className={isHindi ? 'font-hindi' : 'font-serif-brand'}>{next.title}</strong>
                    <small>{t.read} →</small>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
      <ContactSection lang={activeLang} />

      <style jsx>{`
        .post-page {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background:
            radial-gradient(ellipse 80% 46% at 50% 0%, rgba(26, 92, 53, .28), transparent 62%),
            linear-gradient(180deg, #080f0a 0%, #0b180d 48%, #080f0a 100%);
          padding-top: 72px;
        }

        .post-article {
          position: relative;
          z-index: 1;
        }

        .post-hero {
          position: relative;
          min-height: clamp(560px, 84vh, 820px);
          overflow: hidden;
          display: flex;
          align-items: flex-end;
          isolation: isolate;
          border-bottom: 1px solid rgba(212, 168, 67, .16);
          background:
            radial-gradient(ellipse 70% 46% at 50% 8%, rgba(212, 168, 67, .16), transparent 58%),
            linear-gradient(135deg, rgba(7, 18, 10, .95), rgba(10, 25, 14, .85));
        }

        .post-hero :global(img) {
          object-fit: cover;
          object-position: center;
          filter: saturate(.92) contrast(1.06) brightness(.72);
          transform: scale(1.01);
          z-index: -3;
        }

        .post-hero-symbol {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: clamp(6rem, 18vw, 14rem);
          color: var(--c-gold);
          opacity: 0.07;
          pointer-events: none;
          z-index: -1;
          filter: blur(1px);
        }

        .post-hero-veil {
          position: absolute;
          inset: 0;
          z-index: -2;
          background:
            linear-gradient(180deg, rgba(4, 8, 6, .26) 0%, rgba(4, 8, 6, .42) 45%, rgba(8, 15, 10, .94) 100%),
            linear-gradient(90deg, rgba(8, 15, 10, .92) 0%, rgba(8, 15, 10, .62) 38%, rgba(8, 15, 10, .2) 68%, rgba(8, 15, 10, .58) 100%),
            radial-gradient(circle at 72% 28%, rgba(212, 168, 67, .16), transparent 35%),
            radial-gradient(circle at 18% 84%, rgba(26, 92, 53, .28), transparent 46%);
        }

        .post-hero-geometry {
          position: absolute;
          width: min(72vw, 820px);
          aspect-ratio: 1;
          right: clamp(-16rem, -18vw, -5rem);
          bottom: clamp(-18rem, -22vw, -8rem);
          z-index: -1;
          opacity: .22;
          border: 1px solid rgba(212, 168, 67, .3);
          border-radius: 50%;
          background:
            repeating-conic-gradient(from 0deg, rgba(212, 168, 67, .18) 0deg 1deg, transparent 1deg 18deg),
            radial-gradient(circle, transparent 0 36%, rgba(212, 168, 67, .2) 36% 36.3%, transparent 36.3% 58%, rgba(212, 168, 67, .18) 58% 58.3%, transparent 58.3%);
        }

        .post-hero-inner {
          width: min(1160px, calc(100% - 2rem));
          margin: 0 auto;
          padding: clamp(4.5rem, 12vw, 8.5rem) 0 clamp(3.8rem, 9vw, 6.5rem);
        }

        .post-shell {
          position: relative;
          z-index: 2;
          width: min(920px, calc(100% - 2rem));
          margin: 0 auto;
          padding: clamp(2.2rem, 7vw, 4.5rem) 0 clamp(3rem, 7vw, 5rem);
        }

        .back-link {
          display: inline-flex;
          color: var(--c-gold);
          text-decoration: none;
          border: 1px solid rgba(212, 168, 67, .22);
          background: rgba(8, 15, 10, .62);
          backdrop-filter: blur(12px);
          border-radius: 999px;
          padding: .45rem .9rem;
          margin-bottom: 1.8rem;
          font-size: .85rem;
          font-weight: 700;
        }

        .post-kicker {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: .7rem;
          color: var(--c-gold);
          font-size: .76rem;
          font-weight: 800;
          letter-spacing: .13em;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }

        .post-kicker span {
          border: 1px solid rgba(212, 168, 67, .2);
          border-radius: 999px;
          padding: .28rem .7rem;
          background: rgba(212, 168, 67, .05);
        }

        .post-hero h1 {
          color: var(--c-ivory);
          font-size: ${isHindi ? 'clamp(2.6rem, 7vw, 5.9rem)' : 'clamp(3rem, 7vw, 6.2rem)'};
          font-weight: ${isHindi ? 600 : 300};
          line-height: 1;
          max-width: 980px;
          text-wrap: balance;
          text-shadow: 0 20px 70px rgba(0, 0, 0, .58);
        }

        .post-excerpt {
          color: rgba(245, 238, 218, .82);
          font-size: clamp(1.05rem, 2vw, 1.25rem);
          line-height: 1.9;
          margin-top: 1.35rem;
          max-width: 760px;
          text-shadow: 0 12px 40px rgba(0, 0, 0, .72);
        }

        .post-content {
          border: 1px solid rgba(212, 168, 67, .14);
          border-radius: 8px;
          background:
            linear-gradient(180deg, rgba(8, 15, 10, .74), rgba(8, 15, 10, .58)),
            radial-gradient(circle at 100% 0%, rgba(212, 168, 67, .08), transparent 34%);
          backdrop-filter: blur(14px);
          padding: clamp(1.25rem, 4vw, 3rem);
          box-shadow: 0 28px 90px rgba(0, 0, 0, .28);
        }

        .post-content :global(h2) {
          color: var(--c-gold);
          font-size: ${isHindi ? 'clamp(1.35rem, 3vw, 2rem)' : 'clamp(1.6rem, 3vw, 2.25rem)'};
          font-weight: ${isHindi ? 600 : 400};
          line-height: 1.25;
          margin: 2.2rem 0 .8rem;
        }

        .post-content :global(h2:first-child) {
          margin-top: 0;
        }

        .post-content :global(p) {
          color: var(--c-text);
          font-size: ${isHindi ? '1.08rem' : '1.04rem'};
          line-height: ${isHindi ? 2 : 1.9};
          margin: 0 0 1.15rem;
        }

        .related {
          position: relative;
          z-index: 1;
          padding-bottom: clamp(5rem, 9vw, 8rem);
        }

        .related > h2 {
          color: var(--c-ivory);
          font-size: clamp(2rem, 4vw, 3.4rem);
          font-weight: ${isHindi ? 600 : 300};
          margin-bottom: 1.4rem;
        }

        .related-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
        }

        .related-card {
          display: flex;
          flex-direction: column;
          min-height: 260px;
          color: inherit;
          text-decoration: none;
          border: 1px solid rgba(212, 168, 67, .13);
          border-radius: 8px;
          overflow: hidden;
          background:
            linear-gradient(145deg, rgba(13, 31, 16, .84), rgba(8, 15, 10, .78)),
            radial-gradient(circle at 100% 0%, rgba(212, 168, 67, .1), transparent 34%);
          transition: transform .35s ease, border-color .35s ease, background .35s ease;
        }

        .related-card-image {
          width: 100%;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          border-bottom: 1px solid rgba(212, 168, 67, .14);
          background: rgba(8, 15, 10, .75);
          flex-shrink: 0;
        }

        .related-card-image :global(img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: saturate(.96) contrast(1.05);
          transition: transform .45s ease, filter .45s ease;
        }

        .related-card:hover .related-card-image :global(img) {
          transform: scale(1.05);
          filter: saturate(1.05) contrast(1.08);
        }

        .related-card-body {
          display: grid;
          gap: .75rem;
          padding: 1.2rem;
          flex: 1;
          align-content: space-between;
        }

        .related-card:hover {
          transform: translateY(-4px);
          border-color: rgba(212, 168, 67, .34);
          background:
            linear-gradient(145deg, rgba(18, 48, 26, .9), rgba(8, 15, 10, .82)),
            radial-gradient(circle at 100% 0%, rgba(212, 168, 67, .18), transparent 36%);
        }

        .related-card span,
        .related-card small {
          color: var(--c-gold);
          font-weight: 800;
          letter-spacing: .1em;
          text-transform: uppercase;
        }

        .related-card strong {
          color: var(--c-ivory);
          font-size: ${isHindi ? '1.25rem' : '1.45rem'};
          line-height: 1.2;
          font-weight: ${isHindi ? 600 : 400};
        }

        @media (max-width: 860px) {
          .post-hero {
            min-height: 680px;
          }

          .post-hero-veil {
            background:
              linear-gradient(180deg, rgba(4, 8, 6, .22) 0%, rgba(8, 15, 10, .72) 48%, rgba(8, 15, 10, .96) 100%),
              radial-gradient(circle at 50% 18%, rgba(212, 168, 67, .14), transparent 42%);
          }

          .post-hero-inner {
            padding-bottom: 3rem;
          }

          .related-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
