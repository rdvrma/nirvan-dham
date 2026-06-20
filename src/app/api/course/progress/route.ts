import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { chapterNum?: number; score?: number; total?: number } | null;
  const chapterNum = body?.chapterNum;
  const score = body?.score;
  const total = body?.total;

  if (
    typeof chapterNum !== 'number' ||
    !Number.isInteger(chapterNum) ||
    typeof score !== 'number' ||
    !Number.isFinite(score) ||
    typeof total !== 'number' ||
    !Number.isFinite(total) ||
    total <= 0 ||
    chapterNum < 1 ||
    chapterNum > 8
  ) {
    return NextResponse.json({ error: 'Invalid practice progress payload.' }, { status: 400 });
  }

  const percentage = (score / total) * 100;
  if (percentage < 40) {
    return NextResponse.json({ passed: false, percentage }, { status: 200 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const { data: current, error: readError } = await supabase
    .from('user_progress')
    .select('highest_chapter_unlocked')
    .eq('user_id', user.id)
    .single();
  if (readError || !current) {
    return NextResponse.json({ error: 'Progress profile is unavailable. Run the Supabase SQL setup first.' }, { status: 500 });
  }

  const highestChapterUnlocked = Math.max(current.highest_chapter_unlocked, Math.min(chapterNum + 1, 9));
  const { error: updateError } = await supabase
    .from('user_progress')
    .update({ highest_chapter_unlocked: highestChapterUnlocked })
    .eq('user_id', user.id);
  if (updateError) return NextResponse.json({ error: 'Could not save course progress.' }, { status: 500 });

  return NextResponse.json({ passed: true, percentage, highestChapterUnlocked });
}
