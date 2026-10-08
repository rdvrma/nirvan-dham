import { notFound } from 'next/navigation';
import { courseContext } from '@/course/nirvan-sutra/server/context';
import { allStages, videoAsset, provenance, source } from '@/course/nirvan-sutra/server/content';
import { LOCALES } from '@/course/nirvan-sutra/locales';
import fs from 'node:fs';
import path from 'node:path';

// LOCAL ONLY: a content overview for the team — which lesson has a real film, which texts are approved/draft, which languages are filled.
// Editing is done in the content files it names (no CMS); refused in production.
export default async function AdminPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  const { locale } = await courseContext();
  const stages = allStages(locale);
  const src = source();
  const prov = provenance();
  const root = path.join(process.cwd(), 'src', 'course', 'nirvan-sutra');
  const files = ['ui.json', 'stages.json', 'questions.json', 'assessments.json', 'program.json'];
  const coverage = LOCALES.map((l) => ({ l, have: files.map((f) => fs.existsSync(path.join(root, 'locales', l.code, f)) || (l.code === 'hi' && f === 'questions.json')) }));
  const lessons = Object.keys(src.lessons);
  const published = lessons.filter((id) => videoAsset(id).videoProvider !== 'placeholder');
  return (
    <section className="ns-stack-l" style={{ fontSize: '0.92rem' }}>
      <header>
        <h1 className="ns-h2">Content (local)</h1>
        <p className="ns-muted">Approved source: {prov.repo} · {prov.branch} @ {prov.commit} · imported {prov.importedAt}</p>
        <p className="ns-muted">Films: {published.length} of {lessons.length} lessons have a real video. Publish a film by editing <code>src/course/nirvan-sutra/content/videos.json</code> (see docs/nirvan-sutra-v2.md).</p>
      </header>
      <div className="ns-panel" style={{ overflowX: 'auto' }}>
        <h2 className="ns-h3">Languages</h2>
        <table style={{ width: '100%', marginTop: 12, borderCollapse: 'collapse' }}>
          <thead><tr><th style={{ textAlign: 'left' }}>Language</th>{files.map((f) => <th key={f} style={{ textAlign: 'left', padding: '4px 8px' }}>{f}</th>)}</tr></thead>
          <tbody>{coverage.map(({ l, have }) => <tr key={l.code}><td>{l.native} ({l.code})</td>{have.map((h, i) => <td key={i} style={{ padding: '4px 8px', color: h ? 'var(--ns-sage)' : 'var(--ns-rose)' }}>{h ? 'yes' : 'fallback'}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <div className="ns-panel" style={{ overflowX: 'auto' }}>
        <h2 className="ns-h3">Stages</h2>
        <table style={{ width: '100%', marginTop: 12, borderCollapse: 'collapse' }}>
          <thead><tr>{['Stage', 'Title', 'Text status', 'Approved fields', 'Main film', 'Duration (est.)'].map((h) => <th key={h} style={{ textAlign: 'left', padding: '4px 8px' }}>{h}</th>)}</tr></thead>
          <tbody>{stages.map((s) => { const v = videoAsset(s.mainLessonId); return (
            <tr key={s.id} style={{ borderTop: '1px solid var(--ns-line-2)' }}><td style={{ padding: '6px 8px' }}>{s.id}</td><td>{s.text.title}</td><td>{s.status}</td><td>{s.approvedFields.join(', ') || '—'}</td><td>{v.videoProvider}{v.videoId ? ` · ${v.videoId}` : ''} · {v.publishStatus}</td><td>{v.durationSec ? `${Math.round(v.durationSec / 60)} min` : '—'}</td></tr>
          ); })}</tbody>
        </table>
      </div>
    </section>
  );
}
