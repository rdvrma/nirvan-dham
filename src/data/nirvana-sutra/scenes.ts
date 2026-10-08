import { issue01 } from './issue-01';
import { findEntry } from './types';

/** Partition either edition at the same editorial paragraph boundaries. */
export function flagshipScenes(body: string): string[][] {
  const blocks = body.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
  const sourceBlocks = (findEntry(issue01, 'sadhak-se-satya-tak')?.body ?? body).split(/\n\s*\n/).map(block => block.trim()).filter(Boolean);
  if (sourceBlocks.length !== blocks.length) return [blocks];
  const boundaries = [
    0,
    sourceBlocks.findIndex((block) => block.startsWith("लेकिन खोज की संरचना")),
    sourceBlocks.indexOf("साधक कौन है?"),
    sourceBlocks.findIndex((block) => block.startsWith("यहीं खोज बाहर")),
    sourceBlocks.indexOf("लहर को समुद्र बनने की आवश्यकता नहीं होती।"),
    blocks.length,
  ];
  // Future edited content must remain readable even when an editorial marker changes.
  if (boundaries.some((index, i) => i > 0 && index <= boundaries[i - 1])) return [blocks];
  return boundaries.slice(0, -1).map((start, i) => blocks.slice(start, boundaries[i + 1]));
}
