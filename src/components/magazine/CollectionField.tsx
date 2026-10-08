"use client";
import { useMagazineLanguage } from "./MagazineLanguage";
/** Scroll position draws the path; all labels remain ordinary HTML outside it. */
export function CollectionField({ depth = false }: { depth?: boolean }) {
  const { t } = useMagazineLanguage();
  return <div className={`ns-collection-field ${depth ? "ns-collection-field--depth" : ""}`} data-scroll-field aria-hidden="true">
    <svg viewBox="0 0 900 230" fill="none" focusable="false">
      <path className="ns-collection-field__axis" d="M40 160Q170 160 260 100T480 130T700 100T860 65" />
      <path className="ns-collection-field__draw" d="M40 160Q170 160 260 100T480 130T700 100T860 65" pathLength="100" />
      {[0, 1, 2].map(i => <g key={i} className="ns-collection-field__stop" style={{ ["--i" as string]: i }}>
        <circle cx={210 + i * 240} cy={i === 1 ? 130 : 112} r={depth ? 32 + i * 18 : 30} />
        <circle cx={210 + i * 240} cy={i === 1 ? 130 : 112} r="4" />
        {depth && <ellipse cx={210 + i * 240} cy={i === 1 ? 130 : 112} rx={55 + i * 15} ry="18" />}
      </g>)}
    </svg>
    <span>{t("०१")}</span><span>{t("०२")}</span><span>{t("०३")}</span>
  </div>;
}
