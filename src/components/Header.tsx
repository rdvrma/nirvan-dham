'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Language } from '@/lib/i18n';
import { content, saveLanguage } from '@/lib/i18n';

interface HeaderProps {
  lang: Language;
  onLangChange: (lang: Language) => void;
}

export default function Header({ lang, onLangChange }: HeaderProps) {
  const t = content[lang].nav;
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const currentPath = pathname || '/';

  function selectLanguage(nextLang: Language) {
    saveLanguage(nextLang);
    onLangChange(nextLang);
  }

  function handleHomeClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (typeof window === 'undefined') return;

    if (window.location.pathname === '/') {
      event.preventDefault();
      window.history.replaceState(null, '', '/');
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      });
    }
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const navLinks = [
    { href: '/', label: lang === 'hi' ? 'मुख्य पृष्ठ' : 'Home' },
    { href: '/about-aadisatv', label: lang === 'hi' ? 'आदिसत्व' : 'About Aadisatv' },
    { href: '/nirvan-sutra', label: lang === 'hi' ? 'निर्वाण सूत्र' : 'Nirvan Sutra' },
    { href: '/guided-meditation', label: lang === 'hi' ? 'ध्यान मार्गदर्शन' : 'Guided Meditation' },
    { href: '/bodhgaya-samvad', label: lang === 'hi' ? 'बोधगया संवाद' : 'Bodhgaya Samvad' },
    { href: '/online-samvad', label: lang === 'hi' ? 'ऑनलाइन संवाद' : 'Online Samvad' },
    { href: '/blog', label: lang === 'hi' ? 'ब्लॉग' : 'Blog' },
    { href: '/donation', label: lang === 'hi' ? 'सहयोग' : 'Donation' },
    { href: '#contact', label: lang === 'hi' ? 'संपर्क' : 'Contact' },
  ];

  const navLinkStyle = {
    fontSize: lang === 'hi' ? '0.95rem' : '0.875rem',
    color: 'var(--c-ivdim)',
    textDecoration: 'none',
    letterSpacing: lang === 'en' ? '0.04em' : '0',
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[500] transition-all duration-500"
      style={{
        background: scrolled ? 'rgba(8,15,10,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(212,168,67,0.08)' : 'none',
      }}
    >
      <div style={{
        maxWidth: '1280px',
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: 'clamp(1.25rem, 4vw, 3rem)',
        paddingRight: 'clamp(1.25rem, 4vw, 3rem)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px',
      }}>
        <Link
          href="/"
          onClick={handleHomeClick}
          className="group"
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.65rem' }}
        >
          <span
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              border: '1px solid rgba(212,168,67,0.24)',
              background: 'radial-gradient(circle at 50% 20%, rgba(212,168,67,0.16), rgba(8,15,10,0.68) 65%)',
              boxShadow: '0 0 24px rgba(212,168,67,0.13)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <Image
              src="/brand/lotus-mark.png"
              alt=""
              width={36}
              height={36}
              priority
              style={{ width: 36, height: 36, objectFit: 'cover', transform: 'scale(1.35)' }}
            />
          </span>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span
              className="font-hindi"
              style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                fontWeight: 600,
                color: 'var(--c-gold)',
                lineHeight: 1,
                transition: 'color 0.3s',
              }}
            >
              निर्वाण धाम
            </span>
            <span
              style={{
                fontSize: '0.625rem',
                letterSpacing: '0.25em',
                color: 'var(--c-ivdim)',
                textTransform: 'uppercase',
                lineHeight: 1.4,
              }}
            >
              nirvandham.in
            </span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => {
            const className = `transition-premium ${lang === 'hi' ? 'font-hindi' : ''}`;
            const hoverProps = {
              onMouseEnter: (e: React.MouseEvent<HTMLElement>) =>
                ((e.target as HTMLElement).style.color = 'var(--c-ivory)'),
              onMouseLeave: (e: React.MouseEvent<HTMLElement>) =>
                ((e.target as HTMLElement).style.color = 'var(--c-ivdim)'),
            };

            return link.href.startsWith('/') ? (
              <Link key={link.href} href={link.href} className={className} style={navLinkStyle} {...hoverProps}>
                {link.label}
              </Link>
            ) : (
              <a key={link.href} href={link.href} className={className} style={navLinkStyle} {...hoverProps}>
                {link.label}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div
            className="flex items-center rounded-full overflow-hidden"
            style={{
              border: '1px solid rgba(212,168,67,0.2)',
              background: 'rgba(8,15,10,0.6)',
            }}
          >
            {(['hi', 'en'] as Language[]).map((l) => (
              <a
                key={l}
                href={`/api/language?lang=${l}&next=${encodeURIComponent(currentPath)}`}
                role="button"
                onClick={(event) => {
                  event.preventDefault();
                  selectLanguage(l);
                }}
                className="transition-premium"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.35rem 0.85rem',
                  fontSize: l === 'hi' ? '0.85rem' : '0.75rem',
                  fontFamily: l === 'hi' ? 'var(--font-hind)' : 'var(--font-inter)',
                  fontWeight: lang === l ? 600 : 400,
                  color: lang === l ? 'var(--c-bg)' : 'var(--c-ivdim)',
                  background: lang === l ? 'var(--c-gold)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  letterSpacing: l === 'en' ? '0.05em' : '0',
                  textDecoration: 'none',
                }}
              >
                {l === 'hi' ? 'हिंदी' : 'EN'}
              </a>
            ))}
          </div>

          <button
            className="md:hidden flex flex-col justify-center items-center gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="block transition-all duration-300"
                style={{
                  width: '22px',
                  height: '1.5px',
                  background: 'var(--c-gold)',
                  opacity: menuOpen && i === 1 ? 0 : 1,
                  transform:
                    menuOpen && i === 0
                      ? 'rotate(45deg) translate(4px, 4px)'
                      : menuOpen && i === 2
                        ? 'rotate(-45deg) translate(4px, -4px)'
                        : 'none',
                }}
              />
            ))}
          </button>
        </div>
      </div>

      <div
        className="md:hidden overflow-hidden transition-all duration-400"
        style={{
          maxHeight: menuOpen ? '440px' : '0',
          background: 'rgba(8,15,10,0.97)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(212,168,67,0.08)',
        }}
      >
        <nav className="px-6 py-6 flex flex-col gap-5">
          {navLinks.map((link) => {
            const className = `transition-premium ${lang === 'hi' ? 'font-hindi' : ''}`;
            const style = {
              fontSize: lang === 'hi' ? '1.05rem' : '0.95rem',
              color: 'var(--c-ivdim)',
              textDecoration: 'none',
            };

            return link.href.startsWith('/') ? (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className={className} style={style}>
                {link.label}
              </Link>
            ) : (
              <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className={className} style={style}>
                {link.label}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
