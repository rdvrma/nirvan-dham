"use client";
import { MagazineLanguageProvider, useMagazineLanguage } from "./MagazineLanguage";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { MagazineLanguage } from "@/data/nirvana-sutra/localization";
import { findEntry, findSection } from "@/data/nirvana-sutra/types";
import { magazineUrl, readMagazineLocation, type MagazineLocation } from "@/data/nirvana-sutra/navigation";
import { ContentReader } from "./ContentReader";
import { JourneyMap } from "./JourneyMap";
import { MagazineCover } from "./MagazineCover";
import { SectionHub } from "./SectionHub";
import { MagazineIdentity } from "./MagazineIdentity";
import { ListeningRoom } from "./ListeningRoom";
import Link from "next/link";

const subscribeToStorage = (notify: () => void) => {
  window.addEventListener("storage", notify);
  return () => window.removeEventListener("storage", notify);
};
const readLastSection = () => {
  try { return sessionStorage.getItem("ns-map-last"); } catch { return null; }
};
const serverLastSection = () => null;

type MagazineProps = { initialLocation?: MagazineLocation; initialListening?: "songs" | "chapters"; initialLanguage?: MagazineLanguage };
export function MagazineLab(props: MagazineProps) {
  return <MagazineLanguageProvider initialLanguage={props.initialLanguage}><MagazineExperience {...props} /></MagazineLanguageProvider>;
}
function MagazineExperience({ initialLocation = { view: "cover" }, initialListening }: MagazineProps) {
  const { t, language, issue: issue01 } = useMagazineLanguage();
  const [location, setLocation] = useState<MagazineLocation>(initialLocation);
  const [lastId, setLastId] = useState<string | null>(null);
  const savedLastId = useSyncExternalStore(subscribeToStorage, readLastSection, serverLastSection);
  const [mapPlayed, setMapPlayed] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [enteringId, setEnteringId] = useState<string | null>(null);
  const mapScroll = useRef(0);
  const scrollRestored = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const timerRef = useRef<number | null>(null);

  const arrive = useCallback((destination: MagazineLocation) => {
    setLocation(destination);
    setLeaving(false);
    setEnteringId(null);
    if (destination.view === "content") {
      setLastId(findEntry(issue01, destination.entryId)?.sectionId ?? null);
      setMapPlayed(true);
    } else if (destination.view === "hub") {
      setLastId(destination.sectionId);
      setMapPlayed(true);
    }
  }, [issue01]);

  useEffect(() => {
    const restore = () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      arrive(readMagazineLocation(window.location.search, issue01));
    };
    window.addEventListener("popstate", restore);
    return () => {
      window.removeEventListener("popstate", restore);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [arrive, issue01]);

  const navigate = useCallback((destination: MagazineLocation) => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    const url = magazineUrl(window.location.href, destination);
    if (url.href !== window.location.href) {
      // Next patches native history, copies its own fields and synchronizes the router.
      // Passing its existing __NA state would skip that synchronization.
      window.history.pushState(null, "", url);
    }
    arrive(destination);
  }, [arrive]);

  useLayoutEffect(() => {
    if (!scrollRestored.current) {
      try { mapScroll.current = Number(sessionStorage.getItem("ns-map-scroll")) || 0; } catch { /* Optional persistence. */ }
      scrollRestored.current = true;
    }
    if (location.view !== "map" && location.view !== "cover") return;
    window.scrollTo({ top: location.view === "map" ? mapScroll.current : 0, behavior: "instant" });
    headingRef.current?.focus({ preventScroll: true });
  }, [location]);

  const begin = () => {
    if (leaving) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      navigate({ view: "map" });
    } else {
      setLeaving(true);
      timerRef.current = window.setTimeout(() => navigate({ view: "map" }), 850);
    }
  };

  const openEntry = (entryId: string) => navigate({ view: "content", entryId });
  const backToMap = () => navigate({ view: "map" });
  const openSection = (sectionId: string) => {
    const section = findSection(issue01, sectionId);
    if (!section) return;
    const destination: MagazineLocation = section.mode === "hub" ? { view: "hub", sectionId } : { view: "content", entryId: section.entries[0].id };
    if (location.view === "map") {
      if (enteringId) return;
      mapScroll.current = window.scrollY;
      try { sessionStorage.setItem("ns-map-scroll", String(mapScroll.current)); sessionStorage.setItem("ns-map-last", sectionId); } catch { /* Optional persistence. */ }
      setMapPlayed(true);
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setEnteringId(sectionId);
        timerRef.current = window.setTimeout(() => navigate(destination), 420);
        return;
      }
    }
    navigate(destination);
  };
  const entry = location.view === "content" ? findEntry(issue01, location.entryId) : undefined;
  const section = location.view === "hub" ? findSection(issue01, location.sectionId) : undefined;

  return (
    <ListeningRoom key={language} onRead={openEntry} initialKind={initialListening}><main className="ns-app" data-view={location.view} lang={language}>
      {location.view === "cover" && <MagazineCover issue={issue01} leaving={leaving} onBegin={begin} />}
      {(location.view === "map" || (location.view === "cover" && leaving)) && (
        <section className="ns-map-screen" aria-labelledby="ns-map-title" inert={leaving}>
          <div className="ns-map-stage">
            <div className="ns-map-head">
              <div className="ns-library-brand"><MagazineIdentity issue={issue01} /><Link href="/library">{t("← पुस्तकालय")}</Link></div>
              <h1 id="ns-map-title" ref={headingRef} tabIndex={-1} className="ns-map-title">{t("यात्रा मानचित्र")}</h1>
              <p className="ns-map-hint">{t("जहाँ मन ठहरे, वहीं से आरम्भ करें। सात पड़ाव · चौदह रचनाएँ।")}</p>
            </div>
            <JourneyMap sections={issue01.sections} animateIn={!mapPlayed} lastId={lastId ?? savedLastId} enteringId={enteringId} onOpen={openSection} onOpenEntry={id => {
              mapScroll.current = window.scrollY;
              const sectionId = findEntry(issue01, id)?.sectionId ?? "";
              try { sessionStorage.setItem("ns-map-scroll", String(mapScroll.current)); sessionStorage.setItem("ns-map-last", sectionId); } catch { /* Optional persistence. */ }
              setMapPlayed(true);
              openEntry(id);
            }} />
            <div className="ns-map-footer">
              <p>{t("कथा, ज्ञान और गहराई के पड़ावों में और रचनाएँ खोलें।")}</p>
              <button type="button" className="ns-back" onClick={() => navigate({ view: "cover" })}>{t("← मुखपृष्ठ")}</button>
            </div>
          </div>
        </section>
      )}
      {location.view === "hub" && section && (
        <SectionHub key={section.id} section={section} issue={issue01} onBack={backToMap} onOpenEntry={openEntry} />
      )}
      {location.view === "content" && entry && (
        <ContentReader key={entry.id} entry={entry} issue={issue01} onBack={backToMap}
          onBackToHub={() => openSection(entry.sectionId)} onNavigate={openEntry} />
      )}
    </main></ListeningRoom>
  );
}
