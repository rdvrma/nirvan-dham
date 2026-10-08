import { findEntry, findSection, type MagazineIssue } from "./types";

export type MagazineLocation =
  | { view: "cover" | "map" }
  | { view: "hub"; sectionId: string }
  | { view: "content"; entryId: string };

/** Keep old story links working after moving the two collections into hubs. */
export function readMagazineLocation(search: string, issue: MagazineIssue): MagazineLocation {
  const params = new URLSearchParams(search);
  const story = params.get("story");
  if (story) {
    const entry = findEntry(issue, story) ?? findSection(issue, story)?.entries[0];
    return entry ? { view: "content", entryId: entry.id } : { view: "map" };
  }
  const sectionId = params.get("section");
  if (sectionId) {
    const section = findSection(issue, sectionId);
    if (!section) return { view: "map" };
    return section.mode === "hub"
      ? { view: "hub", sectionId }
      : section.entries[0] ? { view: "content", entryId: section.entries[0].id } : { view: "map" };
  }
  return { view: params.get("view") === "map" ? "map" : "cover" };
}

export function magazineUrl(href: string, location: MagazineLocation): URL {
  const url = new URL(href);
  ["story", "section", "view", "listen"].forEach((key) => url.searchParams.delete(key));
  url.hash = "";
  if (location.view === "content") url.searchParams.set("story", location.entryId);
  if (location.view === "hub") url.searchParams.set("section", location.sectionId);
  if (location.view === "map") url.searchParams.set("view", "map");
  return url;
}
