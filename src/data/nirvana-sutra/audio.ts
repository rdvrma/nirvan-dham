import manifest from "./audio-manifest.json";
import englishManifest from './audio-manifest.en.json';
import { issue01English, type MagazineLanguage } from './localization';
import { issue01 } from "./issue-01";
import { flatEntries } from "./types";

export type ListeningTrack = { id: string; title: string; src: string; kind: "songs" | "chapters"; entryId?: string; seconds?: number };
export type Narration = { src: string; title: string; seconds: number; sourceHash: string; voice: string; model: string };
export const narrationManifest: Record<string, Narration> = manifest;
export const songs: ListeningTrack[] = [
  { id: "jag-re-musafir", title: "जाग रे मुसाफिर", src: "/magazine-audio/songs/jag-re-musafir.mp3", kind: "songs" },
  { id: "safar-hi-sukoon", title: "सफ़र ही सुकून है", src: "/magazine-audio/songs/safar-hi-sukoon.mp3", kind: "songs" },
  { id: "sone-ki-zanjeerein", title: "सोने की ज़ंजीरें", src: "/magazine-audio/songs/sone-ki-zanjeerein.mp3", kind: "songs" },
  { id: "mrityu-na-anta", title: "मृत्यु न अंत", src: "/magazine-audio/songs/mrityu-na-anta.mp3", kind: "songs" },
  { id: "maun-ki-parakashtha", title: "मौन की पराकाष्ठा", src: "/magazine-audio/songs/maun-ki-parakashtha.mp3", kind: "songs" },
];
export const chapters: ListeningTrack[] = flatEntries(issue01).flatMap(entry => {
  const audio = narrationManifest[entry.id];
  return audio ? [{ id: `chapter-${entry.id}`, entryId: entry.id, title: entry.title, src: audio.src, seconds: audio.seconds, kind: "chapters" as const }] : [];
});
export const listeningTracks = [...songs, ...chapters];

const englishNarration: Record<string, Narration> = englishManifest;
const englishChapters: ListeningTrack[] = flatEntries(issue01English).flatMap(entry => {
  const audio = englishNarration[entry.id];
  return audio ? [{ id: `chapter-en-${entry.id}`, entryId: entry.id, title: entry.title, src: audio.src, seconds: audio.seconds, kind: 'chapters' as const }] : [];
});
const songTitles = ['Awake, Traveller', 'The Journey Is the Peace', 'Chains of Gold', 'Death Is Not the End', 'The Fullness of Silence'];
const englishSongs = songs.map((song, index) => ({ ...song, title: songTitles[index] }));
export function listeningLibrary(language: MagazineLanguage) {
  return language === 'en' ? { chapters: englishChapters, songs: englishSongs } : { chapters, songs };
}
