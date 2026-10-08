"use client";
import { useMagazineLanguage } from "./MagazineLanguage";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { listeningLibrary, type ListeningTrack } from "@/data/nirvana-sutra/audio";

type LibraryKind = ListeningTrack["kind"];
type ListeningContext = { open: (kind: LibraryKind, entryId?: string) => void; selectedId?: string };
const Listening = createContext<ListeningContext>({ open: () => {} });
export const useListening = () => useContext(Listening);

export function ListeningRoom({ children, onRead, initialKind }: { children: ReactNode; onRead: (id: string) => void; initialKind?: LibraryKind }) {
  const { t, language } = useMagazineLanguage();
  const { chapters, songs } = listeningLibrary(language);
  const audioRef = useRef<HTMLAudioElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const launchRef = useRef<HTMLElement | null>(null);
  const selectedRef = useRef<ListeningTrack | null>(null);
  const savedAt = useRef(0);
  const [track, setTrack] = useState<ListeningTrack | null>(null);
  const [expanded, setExpanded] = useState(!!initialKind);
  const [kind, setKind] = useState<LibraryKind>(initialKind ?? "songs");
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");
  const [speed, setSpeed] = useState(1);
  const [autoNext, setAutoNext] = useState(true);

  const savePosition = useCallback(() => {
    const audio = audioRef.current, current = selectedRef.current;
    if (!audio || !current || audio.readyState < 1 || audio.ended || !Number.isFinite(audio.currentTime)) return;
    try { localStorage.setItem(`ns-listen:${current.id}`, String(audio.currentTime)); } catch { /* Listening also works without storage. */ }
  }, []);

  const choose = useCallback((next: ListeningTrack) => {
    const audio = audioRef.current;
    if (!audio) return;
    savePosition();
    selectedRef.current = next; setTrack(next); setKind(next.kind); setError("");
    audio.src = next.src;
    audio.playbackRate = speed;
    void audio.play().catch(() => { if (selectedRef.current?.id === next.id) setError(t("चलाने के लिए नीचे Play दबाएँ।")); });
  }, [savePosition, speed, t]);

  const open = useCallback((nextKind: LibraryKind, entryId?: string) => {
    launchRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setKind(nextKind); setExpanded(true);
    const chapter = entryId && chapters.find(item => item.entryId === entryId);
    if (chapter && selectedRef.current?.id !== chapter.id) choose(chapter);
  }, [choose, chapters]);

  const close = useCallback(() => {
    setExpanded(false); launchRef.current?.focus({ preventScroll: true });
  }, []);
  useEffect(() => {
    if (expanded) headingRef.current?.focus({ preventScroll: true });
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape" && expanded) close(); };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [expanded, close]);
  useEffect(() => {
    window.addEventListener("pagehide", savePosition);
    return () => window.removeEventListener("pagehide", savePosition);
  }, [savePosition]);

  const queue = track?.kind === "chapters" ? chapters : songs;
  const index = queue.findIndex(item => item.id === track?.id);
  const nextTrack = index >= 0 ? queue[index + 1] : undefined;
  const prevTrack = index > 0 ? queue[index - 1] : undefined;

  return <Listening.Provider value={{ open, selectedId: track?.id }}>
    {children}
    {/* A single persistent audio element prevents overlapping music and narration. */}
    <aside className="ns-sound-dock" data-expanded={expanded} hidden={!expanded && !track} aria-label={t("पत्रिका श्रवण कक्ष")}>
      {expanded ? <>
        <header className="ns-sound-head"><div><small>{t("निर्वाण सूत्र पत्रिका")}</small><h2 ref={headingRef} tabIndex={-1}>{t("श्रवण वाटिका")}</h2></div><button type="button" onClick={close} aria-label={t("श्रवण कक्ष छोटा करें")}>×</button></header>
        <div className="ns-sound-tabs" role="group" aria-label={t("श्रवण संग्रह")}>
          <button type="button" aria-pressed={kind === "songs"} onClick={() => setKind("songs")}>{language === 'en' ? 'Five songs · original Hindi' : 'पाँच गीत'}</button>
          <button type="button" aria-pressed={kind === "chapters"} onClick={() => setKind("chapters")}>{t("पत्रिका सुनें · ")}{chapters.length}</button>
        </div>
      </> : <button type="button" className="ns-sound-mini" onClick={() => { setKind(track?.kind ?? "songs"); setExpanded(true); }}><span aria-hidden="true">♫</span><span>{track?.title}<small>{t("श्रवण कक्ष खोलें")}</small></span></button>}
      {track && <p className="ns-now-playing">{playing ? t("सुन रहे हैं") : t("चुना हुआ")} · {track.title}</p>}
      {track && <div className="ns-transport">
        <button type="button" onClick={() => {
          const audio = audioRef.current;
          if (!audio) return;
          if (audio.paused) void audio.play().catch(() => setError(t("ऑडियो चल नहीं सका; फिर चुनें।"))); else audio.pause();
        }}>{playing ? t("विराम") : t("चलाएँ")}</button>
        {expanded && <button type="button" onClick={() => {
          const audio = audioRef.current;
          if (audio) { audio.currentTime = 0; savePosition(); }
        }}>{t("शुरू से")}</button>}
        <button type="button" onClick={() => {
          const audio = audioRef.current;
          if (audio) { audio.pause(); savePosition(); audio.removeAttribute("src"); audio.load(); }
          selectedRef.current = null; setTrack(null); setPlaying(false); setError(""); close();
        }}>{t("श्रवण बंद करें")}</button>
      </div>}
      <audio ref={audioRef} controls preload="none" aria-label={track ? ("" + String(track.title) + t(" — श्रवण")) : t("गीत या लेख चुनें")}
        hidden={!track} onPlay={() => { setPlaying(true); setError(""); }} onPause={() => { setPlaying(false); savePosition(); }}
        onLoadedMetadata={() => {
          const audio = audioRef.current, current = selectedRef.current;
          if (!audio || !current) return;
          audio.playbackRate = speed;
          try { const saved = Number(localStorage.getItem(`ns-listen:${current.id}`)); if (saved > 0 && saved < audio.duration - 3) audio.currentTime = saved; } catch { /* Optional resume. */ }
        }}
        onTimeUpdate={() => { if (Date.now() - savedAt.current > 5000) { savePosition(); savedAt.current = Date.now(); } }}
        onEnded={() => {
          try { if (track) localStorage.removeItem(`ns-listen:${track.id}`); } catch { /* Optional storage. */ }
          // savePosition ignores ended media, keeping a finished chapter reset.
          if (autoNext && nextTrack) choose(nextTrack); else setPlaying(false);
        }} onError={() => setError(t("ऑडियो नहीं खुल सका। नेटवर्क जाँचकर गीत या लेख फिर चुनें।"))} />
      {error && <p className="ns-sound-error" role="status">{error}</p>}
      {expanded && <>
        {track && <div className="ns-sound-options">
          <button type="button" disabled={!prevTrack} onClick={() => prevTrack && choose(prevTrack)} aria-label={t("पिछला ऑडियो")}>←</button>
          <label>{t("गति ")}<select value={speed} onChange={event => { const value = Number(event.target.value); setSpeed(value); if (audioRef.current) audioRef.current.playbackRate = value; }}>{[.75, 1, 1.25, 1.5, 2].map(value => <option key={value} value={value}>{value}×</option>)}</select></label>
          <button type="button" disabled={!nextTrack} onClick={() => nextTrack && choose(nextTrack)} aria-label={t("अगला ऑडियो")}>→</button>
          <label className="ns-auto-next"><input type="checkbox" checked={autoNext} onChange={event => setAutoNext(event.target.checked)} />{t("अगला स्वतः")}</label>
        </div>}
        {kind === "chapters" && <p className="ns-sound-note">{language === 'en' ? 'English narration by Sarvam · Your listening position is saved in this browser.' : 'Sarvam की हिंदी आवाज़ · सुनने की जगह इसी ब्राउज़र में याद रहती है।'}</p>}
        {kind === "chapters" && !chapters.length && <p className="ns-sound-note">{t("लेखों का श्रवण संस्करण तैयार किया जा रहा है। अभी पाँचों गीत सुन सकते हैं।")}</p>}
        <ol className="ns-playlist" aria-label={kind === "songs" ? t("पाँच गीतों की सूची") : t("पत्रिका के श्रवण अध्याय")}>
          {(kind === "songs" ? songs : chapters).map((item, i) => <li key={item.id} data-current={track?.id === item.id}>
            <button type="button" onClick={() => choose(item)} aria-current={track?.id === item.id ? "true" : undefined}><span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span><span>{item.title}{item.seconds && <small>{Math.ceil(item.seconds / 60)} {t(" मिनट")}</small>}</span><span aria-hidden="true">▷</span></button>
            {item.entryId && <button type="button" className="ns-playlist-read" aria-label={("" + String(item.title) + t(" पढ़ें"))} onClick={() => { close(); onRead(item.entryId!); }}>{t("पढ़ें ↗")}</button>}
          </li>)}
        </ol>
        <p className="ns-sound-note">{t("गीत और लेख साथ नहीं बजेंगे। पन्ना बदलकर भी सुन सकते हैं।")}</p>
      </>}
    </aside>
  </Listening.Provider>;
}

export function MapListeningButton() {
  const { t } = useMagazineLanguage();
  const listening = useListening();
  return <button className="ns-map-listen" type="button" onClick={() => listening.open("songs")}><span aria-hidden="true">♫</span><span>{t("श्रवण वाटिका")}<small>{t("पाँच गीत · पत्रिका का श्रवण")}</small></span><span aria-hidden="true">↗</span></button>;
}

export function ArticleListeningButton({ entryId }: { entryId: string }) {
  const { t, language } = useMagazineLanguage();
  const { chapters } = listeningLibrary(language);
  const listening = useListening();
  const chapter = chapters.find(item => item.entryId === entryId);
  if (!chapter) return null;
  return <button className="ns-article-listen" type="button" onClick={() => listening.open("chapters", entryId)}><span aria-hidden="true">♫</span>{listening.selectedId === chapter.id ? t("श्रवण कक्ष खोलें") : t("यह रचना सुनें")}<small>{language === 'en' ? 'Sarvam · English · ' : 'Sarvam · हिंदी · '}{Math.ceil((chapter.seconds ?? 0) / 60)} {t(" मिनट")}</small></button>;
}
