"use client";

import { Fragment } from "react";
import type { EditorialScene as Scene, MagazineEntry } from "@/data/nirvana-sutra/types";
import { scenesAfterBlock } from "@/data/nirvana-sutra/editorial-scenes";
import { EditorialScene } from "./EditorialScene";
import { englishText } from "@/data/nirvana-sutra/localization";

/**
 * Dependency-free body renderer.
 * Body text is paragraphs separated by a blank line; single line breaks preserved.
 * Each content type has its own typographic treatment.
 */

const toBlocks = (body: string) =>
  body
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);

/** Straight quotes → curly quotes */
const typo = (s: string) => s.replace(/'([^']*)'/g, "\u2018$1\u2019");

const isQuoted = (s: string) => s.startsWith("\u2018") || s.startsWith("'");
const isShort  = (s: string, n = 56) => s.length <= n;

function ScenesAfter({ block, scenes = [] }: { block: string; scenes?: Scene[] }) {
  return scenesAfterBlock(scenes, block).map(scene => <EditorialScene key={scene.id} scene={scene} order={scenes.indexOf(scene) + 1} />);
}

const BREATH_LINES = new Set([
  "आपको पता है कि विचार चल रहा है।",
  "आपको पता है कि मन अशांत है।",
]);

const PULL_QUOTES = new Set([
  "साधक कौन है?",
  "लहर को समुद्र बनने की आवश्यकता नहीं होती।",
]);

// Editorial subheads are explicit: short sentences should not accidentally become headings.
const SUBHEADS = new Set([
  "शरीर बदलता है", "मन भी बदलता है", "क्या पहचान स्मृतियों का संग्रह है?",
  "देखने की एक छोटी-सी दिशा", "विचार शत्रु नहीं हैं", "विचार और विश्वास के बीच",
  "क्या विचार को रोका जा सकता है?", "मन को देखना", "ध्यान की दूसरी संभावना", "एक सरल प्रयोग",
  "आध्यात्मिक अहंकार", "साधारण क्षण का रहस्य", "अनुभव को आने दें, जाने दें",
  "बारिश फिर भी होगी", "कार्य समाप्त नहीं होता", "संबंध बदल सकते हैं",
  "भावनाएँ समाप्त नहीं होतीं", "साधारण जीवन",
  "पहला मिनट: जैसा है, वैसा सुनना", "दूसरा मिनट: विचार को आने देना", "तीसरा मिनट: अपने दिन में लौटना",
  "लिखने के लिए तीन छोटी पंक्तियाँ", "क्रोध उठे तो?", "दिन का एक निरीक्षण",
]);

// Paragraph-preserving transcreation keeps headings and pull quotes at the same positions.
for (const labels of [SUBHEADS, BREATH_LINES, PULL_QUOTES]) {
  for (const label of [...labels]) labels.add(englishText(label));
}

export function articleHeadings(body: string) {
  return toBlocks(body).flatMap((text, index) => SUBHEADS.has(text) ? [{ text, id: `ns-part-${index}` }] : []);
}

export function ArticleBody({ entry }: { entry: MagazineEntry }) {
  const blocks = toBlocks(entry.body);

  switch (entry.type) {
    case "welcome":
      return <WelcomeBody blocks={blocks} scenes={entry.editorialScenes} />;
    case "song":
      return <LyricsBody blocks={blocks} scenes={entry.editorialScenes} />;
    case "humour":
      return <DialogueBody blocks={blocks} scenes={entry.editorialScenes} />;
    case "silence":
      return <SilenceBody blocks={blocks} scenes={entry.editorialScenes} />;
    case "deep":
      return <ProseBody blocks={blocks} variant="deep" scenes={entry.editorialScenes} />;
    case "article":
      return <ProseBody blocks={blocks} variant="article" scenes={entry.editorialScenes} />;
    case "story":
    default:
      return <ProseBody blocks={blocks} variant="story" scenes={entry.editorialScenes} />;
  }
}

function WelcomeBody({ blocks, scenes }: { blocks: string[]; scenes?: Scene[] }) {
  const body    = blocks.slice(0, -2);
  const closing = blocks.slice(-2);
  return (
    <div className="ns-body ns-body--welcome">
      {body.map((b, i) => (
        <p key={i} data-reveal className={i === 0 ? "ns-lead" : undefined}>
          {typo(b)}
        </p>
      ))}
      <div className="ns-closing">
        {closing.map((b, i) => (
          <Fragment key={i}><p data-reveal className={i === 0 ? "ns-closing__a" : "ns-closing__b"}>
            {typo(b)}
          </p><ScenesAfter block={b} scenes={scenes} /></Fragment>
        ))}
      </div>
    </div>
  );
}

function LyricsBody({ blocks, scenes }: { blocks: string[]; scenes?: Scene[] }) {
  return (
    <div className="ns-body ns-lyrics">
      {blocks.map((stanza, i) => (
        <Fragment key={i}><p className="ns-stanza" data-reveal>
          {stanza.split("\n").map((line, j) => (
            <span key={j} className="ns-stanza__line">
              {line}
            </span>
          ))}
        </p><ScenesAfter block={stanza} scenes={scenes} /></Fragment>
      ))}
    </div>
  );
}

function DialogueBody({ blocks, scenes }: { blocks: string[]; scenes?: Scene[] }) {
  const lastIndex = blocks.length - 1;
  return (
    <div className="ns-body ns-dialogue">
      {blocks.map((b, i) => {
        if (i === lastIndex)  return <p key={i} className="ns-observation" data-reveal>{typo(b)}</p>;
        if (isQuoted(b))      return <Fragment key={i}><p className="ns-speech" data-reveal data-punchline={i === lastIndex - 1 || undefined} style={{ ["--dialogue-side" as string]: blocks.slice(0, i).filter(isQuoted).length % 2 }}>{typo(b)}</p><ScenesAfter block={b} scenes={scenes} /></Fragment>;
        return                       <p key={i} className="ns-narration" data-reveal>{typo(b)}</p>;
      })}
    </div>
  );
}

function ProseBody({ blocks, variant, scenes = [] }: { blocks: string[]; variant: "story" | "article" | "deep"; scenes?: Scene[] }) {
  const deep = variant === "deep";
  return <div className={`ns-body ns-body--${variant}`}>
    {blocks.map((b, i) => {
      const cls = i === 0 ? "ns-lead" : i === blocks.length - 1 ? "ns-closing-thought"
        : BREATH_LINES.has(b) ? "ns-breath" : deep && isQuoted(b) ? "ns-statement"
        : b.includes("\n") ? "ns-lines" : isShort(b, deep ? 44 : 56) ? "ns-beat" : undefined;
      return <Fragment key={i}>
        {SUBHEADS.has(b) ? <h2 id={`ns-part-${i}`} data-prose-block data-reveal>{b}</h2>
          : deep && PULL_QUOTES.has(b) ? <blockquote className="ns-pull"><p data-prose-block>{b}</p></blockquote>
          : <p className={cls} data-prose-block data-reveal={cls === "ns-beat" || cls === "ns-closing-thought" || cls === "ns-breath" || undefined}>{typo(b)}</p>}
        <ScenesAfter block={b} scenes={scenes} />
      </Fragment>;
    })}
  </div>;
}
function SilenceBody({ blocks, scenes }: { blocks: string[]; scenes?: Scene[] }) {
  return (
    <div className="ns-body ns-body--silence">
      {blocks.map((b, i) => (
        <Fragment key={i}><p data-reveal>{typo(b)}</p><ScenesAfter block={b} scenes={scenes} /></Fragment>
      ))}
    </div>
  );
}
