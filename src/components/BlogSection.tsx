'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Language } from '@/lib/i18n';
import { getAllBlogPosts, getBlogImage, getLocalizedPost, getReadingMinutes } from '@/lib/blog';
import SacredBackground from '@/components/SacredBackground';

interface BlogSectionProps {
  lang: Language;
}

const text = {
  hi: {
    eyebrow: 'ज्ञान लेख',
    title: 'ब्लॉग और मनन',
    subtitle: 'आदिसत्व की शिक्षाओं से निकले लेख, सूत्र और आत्म-विचार।',
    cta: 'सभी लेख पढ़ें',
    read: 'पढ़ें',
    min: 'मिनट',
  },
  en: {
    eyebrow: 'Wisdom Journal',
    title: 'Blogs & Contemplations',
    subtitle: 'Articles, sutras, and self-inquiry notes from Aadisatv’s teachings.',
    cta: 'Read All Posts',
    read: 'Read',
    min: 'min',
  },
} as const;

export default function BlogSection({ lang }: BlogSectionProps) {
  const t = text[lang];
  const posts = getAllBlogPosts().slice(0, 3);
  const isHindi = lang === 'hi';

  return (
    <section id="blog" className="section-pad relative overflow-hidden" style={{ background: 'var(--c-bg)' }}>
      <SacredBackground variant="sri-yantra" intensity="soft" />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 70% 45% at 50% 20%, rgba(212,168,67,0.08), transparent 68%)',
      }} />

      <div className="nd-container relative z-10">
        <div className="blog-section-head">
          <div>
            <p className="pill">{t.eyebrow}</p>
            <h2 className={isHindi ? 'font-hindi' : 'font-serif-brand'}>{t.title}</h2>
            <p>{t.subtitle}</p>
          </div>
          <Link href="/blog" className="blog-section-link">
            {t.cta} <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="blog-section-grid">
          {posts.map((post) => {
            const localized = getLocalizedPost(post, lang);
            const image = getBlogImage(post, lang);

            return (
              <Link href={`/blog/${post.slug}`} key={post.slug} className="blog-card">
                {image ? (
                  <div className="blog-card-image">
                    <Image
                      src={image.src}
                      alt={lang === 'hi' ? image.altHi : image.altEn}
                      width={image.width}
                      height={image.height}
                      sizes="(max-width: 900px) 100vw, 33vw"
                    />
                  </div>
                ) : null}
                <div className="blog-card-body">
                  <span className="blog-card-index">{String(post.id).padStart(2, '0')}</span>
                  <h3 className={isHindi ? 'font-hindi' : 'font-serif-brand'}>{localized.title}</h3>
                  <p>{localized.excerpt}</p>
                </div>
                <div className="blog-card-meta">
                  <span>{getReadingMinutes(post, lang)} {t.min}</span>
                  <span>{t.read} →</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .blog-section-head {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 1.5rem;
          margin-bottom: clamp(2rem, 5vw, 3.5rem);
        }

        h2 {
          color: var(--c-ivory);
          font-size: clamp(2.2rem, 5vw, 4rem);
          font-weight: ${isHindi ? 600 : 300};
          line-height: 1.02;
          margin: 1rem 0 .7rem;
        }

        .blog-section-head p:not(.pill) {
          color: var(--c-ivdim);
          max-width: 620px;
          font-size: 1.05rem;
          line-height: 1.8;
        }

        .blog-section-link {
          flex: 0 0 auto;
          color: var(--c-gold);
          border: 1px solid rgba(212, 168, 67, .28);
          background: rgba(212, 168, 67, .06);
          padding: .85rem 1.1rem;
          border-radius: 4px;
          text-decoration: none;
          font-weight: 700;
        }

        .blog-section-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1.2rem;
        }

        .blog-card {
          min-height: 320px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border: 1px solid rgba(212, 168, 67, .13);
          background:
            linear-gradient(145deg, rgba(13, 31, 16, .88), rgba(8, 15, 10, .78)),
            radial-gradient(circle at 90% 0%, rgba(212, 168, 67, .12), transparent 30%);
          border-radius: 8px;
          padding: 0;
          color: inherit;
          text-decoration: none;
          transition: transform .35s ease, border-color .35s ease, background .35s ease;
        }

        .blog-card-image {
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

        .blog-card-body {
          padding: clamp(1.2rem, 3vw, 1.6rem) clamp(1.2rem, 3vw, 1.6rem) 0;
        }

        .blog-card:hover {
          transform: translateY(-6px);
          border-color: rgba(212, 168, 67, .36);
          background:
            linear-gradient(145deg, rgba(18, 48, 26, .9), rgba(8, 15, 10, .82)),
            radial-gradient(circle at 90% 0%, rgba(212, 168, 67, .18), transparent 34%);
        }

        .blog-card-index {
          color: var(--c-gold);
          letter-spacing: .16em;
          font-size: .74rem;
          font-weight: 700;
        }

        .blog-card h3 {
          color: var(--c-ivory);
          font-size: ${isHindi ? 'clamp(1.45rem, 3vw, 2rem)' : 'clamp(1.7rem, 3vw, 2.25rem)'};
          font-weight: ${isHindi ? 600 : 400};
          line-height: 1.18;
          margin: 1.3rem 0 1rem;
        }

        .blog-card p {
          color: var(--c-ivdim);
          line-height: 1.8;
          margin-bottom: 1.4rem;
        }

        .blog-card-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          border-top: 1px solid rgba(212, 168, 67, .13);
          padding-top: 1rem;
          margin-left: clamp(1.2rem, 3vw, 1.6rem);
          margin-right: clamp(1.2rem, 3vw, 1.6rem);
          margin-bottom: clamp(1.2rem, 3vw, 1.6rem);
          color: var(--c-gold);
          font-size: .86rem;
          font-weight: 700;
        }

        @media (max-width: 900px) {
          .blog-section-head {
            display: block;
          }

          .blog-section-link {
            display: inline-flex;
            margin-top: 1.4rem;
          }

          .blog-section-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
