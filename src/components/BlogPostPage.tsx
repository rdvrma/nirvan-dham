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

    </>
  );
}
