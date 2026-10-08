/**
 * Nirvana Sutra Magazine — content model (Milestone 2 — upgraded).
 *
 * Issue → Sections → Entries
 * Two section types: "single" (one entry, opens directly) and "hub" (multiple
 * entries, opens a curated hub page first).
 */

export type MagazineContentType =
  | "welcome"
  | "song"
  | "humour"
  | "story"
  | "article"
  | "deep"
  | "silence";

/** Position on the wide (desktop) map, in percent of the map width/height. */
export type MapPosition = { x: number; y: number };

/** A visual thought inserted after one exact, semantic prose block. */
export type EditorialScene = {
  id: string;
  after: string;
  type: "thought-flow" | "wave" | "transform" | "dual-state" | "quote-pause" | "identity-layers" | "sequence" | "cycle" | "mirror" | "journey" | "lyric" | "release" | "stillness";
  variant?: "thoughts" | "experience" | "belief" | "expectation" | "event" | "time" | "change" | "passing" | "daily";
  title: string;
  items: string[];
  secondary?: string[];
  caption: string;
  description: string;
};

/** One piece of content inside a section. */
export type MagazineEntry = {
  id: string;
  title: string;
  type: MagazineContentType;
  sectionId: string;
  eyebrow: string;
  /** Paragraphs separated by a blank line. Single line breaks are preserved. */
  body: string;
  editorialScenes?: EditorialScene[];
  /** Optional artwork URL. `null` is fully supported. */
  image: string | null;
  /** Optional audio URL. `null` hides the player. */
  audio: string | null;
  /** Human-readable reading / listening time, e.g. "8 मिनट". */
  duration: string;
  /** Order within the section. */
  order: number;
};

/** One zone / stop on the journey map. */
export type MagazineSection = {
  id: string;
  /** The map node number (1–7). */
  mapOrder: number;
  title: string;
  /** "single" → click opens the one entry directly. "hub" → click opens hub page. */
  mode: "single" | "hub";
  /** Short description shown in section hubs and map previews. */
  description: string;
  /** Short teaser for map hover preview. */
  previewLine: string;
  /** e.g. "3 लेख" or "8 मिनट" — shown in map preview. */
  durationPreview: string;
  map_position: MapPosition;
  /** Symbol key used by MapSymbols to pick an SVG icon. */
  iconType: MagazineContentType;
  entries: MagazineEntry[];
};

/** The top-level issue. */
export type MagazineIssue = {
  id: string;
  title: string;
  subtitle: string;
  issueLabel: string;
  tagline: string;
  publisher: string;
  sections: MagazineSection[];
};

// ── Convenience re-exports ──────────────────────────────────────────────────

/** Flat list of all entries across all sections, globally ordered by mapOrder
 *  then entry order — used for prev/next navigation in the reader. */
export function flatEntries(issue: MagazineIssue): MagazineEntry[] {
  return issue.sections
    .slice()
    .sort((a, b) => a.mapOrder - b.mapOrder)
    .flatMap((s) => s.entries.slice().sort((a, b) => a.order - b.order));
}

/** Look up a section by its id. */
export function findSection(
  issue: MagazineIssue,
  sectionId: string
): MagazineSection | undefined {
  return issue.sections.find((s) => s.id === sectionId);
}

/** Look up an entry across all sections by its id. */
export function findEntry(
  issue: MagazineIssue,
  entryId: string
): MagazineEntry | undefined {
  for (const s of issue.sections) {
    const e = s.entries.find((e) => e.id === entryId);
    if (e) return e;
  }
  return undefined;
}
