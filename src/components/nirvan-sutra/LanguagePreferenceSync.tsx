'use client';

import { useEffect } from 'react';
import { act } from './api';
import type { LocaleCode } from '@/course/nirvan-sutra/types';

/** Save a returning learner's /course language choice without delaying entry. */
export default function LanguagePreferenceSync({ chosen, saved }: { chosen: LocaleCode; saved: LocaleCode | null }) {
  useEffect(() => {
    if (saved && saved !== chosen) void act('locale', { locale: chosen }).catch(() => {});
  }, [chosen, saved]);
  return null;
}
