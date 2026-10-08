"use client";
import { useMagazineLanguage } from "./MagazineLanguage";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MagazineSection } from "@/data/nirvana-sutra/types";
import { MapSymbol } from "./MapSymbols";
import { TallScene, WideScene } from "./MapScenes";
import { smoothSegments, type Point } from "./mapGeometry";
import { useReadingMotion } from "./useReadingMotion";
import { IssueArticles } from "./IssueArticles";
import { MapListeningButton } from "./ListeningRoom";

type Layout = "wide" | "tall";

/** Vertical (mobile) positions, percent of 400 × 1180 canvas. Keyed by mapOrder. */
const TALL_POSITIONS: Record<number, Point> = {
  1: { x: 22, y: 9  },
  2: { x: 70, y: 19 },
  3: { x: 28, y: 30 },
  4: { x: 70, y: 41 },
  5: { x: 28, y: 52 },
  6: { x: 70, y: 63 },
  7: { x: 28, y: 74 },
};

const WIDE_BOX = { w: 1000, h: 600 };
const TALL_BOX = { w: 400,  h: 1180 };

type Props = {
  sections: MagazineSection[];
  animateIn: boolean;
  lastId: string | null;
  enteringId: string | null;
  onOpen: (sectionId: string) => void;
  onOpenEntry: (id: string) => void;
};

export function JourneyMap({ sections, animateIn, lastId, enteringId, onOpen, onOpenEntry }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  useReadingMotion(rootRef);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (!(e.target instanceof Element) || !e.target.closest(".ns-node")) setActiveId(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveId(null);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={rootRef} className="ns-journey" data-enter={animateIn ? "true" : "false"} data-entering={enteringId ? "true" : "false"}>
      <MapListeningButton />
      <MapLayer layout="wide" sections={sections} activeId={activeId} setActiveId={setActiveId} lastId={lastId} enteringId={enteringId} onOpen={onOpen} onOpenEntry={onOpenEntry} />
      <MapLayer layout="tall" sections={sections} activeId={activeId} setActiveId={setActiveId} lastId={lastId} enteringId={enteringId} onOpen={onOpen} onOpenEntry={onOpenEntry} />
    </div>
  );
}

type LayerProps = {
  layout: Layout;
  sections: MagazineSection[];
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  lastId: string | null;
  enteringId: string | null;
  onOpen: (sectionId: string) => void;
  onOpenEntry: (id: string) => void;
};

function MapLayer({ layout, sections, activeId, setActiveId, lastId, enteringId, onOpen, onOpenEntry }: LayerProps) {
  const { t, number } = useMagazineLanguage();
  const lastPointer = useRef<{ type: string; wasActive: boolean } | null>(null);

  const sorted = useMemo(
    () => [...sections].sort((a, b) => a.mapOrder - b.mapOrder),
    [sections],
  );

  const positions = useMemo(
    () =>
      sorted.map((s) =>
        layout === "wide"
          ? s.map_position
          : (TALL_POSITIONS[s.mapOrder] ?? s.map_position),
      ),
    [sorted, layout],
  );

  const segments = useMemo(() => {
    const box = layout === "wide" ? WIDE_BOX : TALL_BOX;
    const pts: Point[] = positions.map((p) => ({ x: (p.x / 100) * box.w, y: (p.y / 100) * box.h }));
    const first = pts[0];
    const last  = pts[pts.length - 1];
    const lead: Point =
      layout === "wide" ? { x: 16, y: first.y + 46 } : { x: 38, y: Math.max(8, first.y - 56) };
    const tail: Point =
      layout === "wide" ? { x: box.w - 12, y: last.y + 54 } : { x: 72, y: last.y + 82 };
    return smoothSegments([lead, ...pts, tail]);
  }, [positions, layout]);
  const activeIndex = sorted.findIndex(section => section.id === (enteringId ?? activeId));
  const highlightPath = activeIndex < 0 ? "" : segments.slice(activeIndex, activeIndex + 2).join(" ");
  const pathD = segments.map((segment, i) => i ? segment.slice(segment.indexOf(" C") + 1) : segment).join(" ");

  const handleClick = useCallback(
    (id: string) => {
      const p = lastPointer.current;
      lastPointer.current = null;
      if (p && p.type === "touch" && !p.wasActive) {
        setActiveId(id);
        return;
      }
      onOpen(id);
    },
    [onOpen, setActiveId],
  );

  return (
    <div className={`ns-map ns-map--${layout}`}>
      <div className="ns-map__frame">
        {layout === "wide" ? <WideScene pathD={pathD} highlightPath={highlightPath} /> : <TallScene pathD={pathD} highlightPath={highlightPath} />}

        <ol className="ns-nodes" aria-label={t("यात्रा के पड़ाव")}>
          {sorted.map((section, i) => {
            const pos      = positions[i];
            const previewId = `ns-preview-${layout}-${section.id}`;
            const open      = activeId === section.id;
            const isHub     = section.mode === "hub";
            const side =
              layout === "wide"
                ? section.mapOrder % 2 === 0 ? "above" : "below"
                : pos.x < 50 ? "right" : "left";
            const align =
              layout === "wide"
                ? pos.x < 18 ? "start" : pos.x > 82 ? "end" : "center"
                : "center";

            return (
              <li
                key={section.id}
                className="ns-node"
                data-side={side}
                data-align={align}
                data-open={open ? "true" : "false"}
                data-last={lastId === section.id ? "true" : "false"}
                data-selected={enteringId === section.id ? "true" : "false"}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  ["--i" as string]: i,
                }}
              >
                <button
                  type="button"
                  className="ns-node__btn"
                  aria-label={`${number(section.mapOrder)} · ${section.title}${isHub ? (" — " + String(section.entries.length) + t(" लेख")) : `, ${section.entries[0]?.duration ?? ""}`}`}
                  aria-describedby={previewId}
                  onPointerDown={(e) => {
                    lastPointer.current = { type: e.pointerType, wasActive: activeId === section.id };
                  }}
                  onPointerEnter={(e) => {
                    if (e.pointerType === "mouse") setActiveId(section.id);
                  }}
                  onPointerLeave={(e) => {
                    if (e.pointerType === "mouse") setActiveId(null);
                  }}
                  onFocus={() => setActiveId(section.id)}
                  onBlur={() => setActiveId(activeId === section.id ? null : activeId)}
                  onClick={() => handleClick(section.id)}
                >
                  <span className="ns-node__arrival" data-reveal>
                  <span className="ns-node__disc">
                    <MapSymbol type={section.iconType} />
                  </span>
                  <span className="ns-node__num" aria-hidden="true">
                    {number(section.mapOrder)}
                  </span>
                  {isHub && (
                    <span className="ns-node__hub-badge" aria-hidden="true" title={t("कई लेख")}>
                      ⋯
                    </span>
                  )}
                  <span className="ns-node__label">{section.title}</span>
                  </span>
                </button>

                <div id={previewId} role="tooltip" className="ns-preview">
                  <span className="ns-preview__cat">{section.title}</span>
                  <span className="ns-preview__title">{section.previewLine}</span>
                  <span className="ns-preview__time">{section.durationPreview}</span>
                  <span className="ns-preview__cta">{isHub ? t("संग्रह देखें →") : t("पढ़ें →")}</span>
                </div>
              </li>
            );
          })}
        </ol>
        <IssueArticles sections={sections} onOpen={onOpenEntry} layout={layout} />
      </div>
      <p className="ns-touch-hint">{t("पहले स्पर्श पर झलक देखें; दोबारा स्पर्श करके खोलें।")}</p>
    </div>
  );
}
