export type Point = { x: number; y: number };

/**
 * Builds a smooth, organic SVG path through the given points
 * (Catmull-Rom spline converted to cubic Béziers).
 */
export function smoothPath(points: Point[], tension = 0.5): string {
  return smoothSegments(points, tension).map((segment, i) => i ? segment.slice(segment.indexOf(" C") + 1) : segment).join(" ");
}

/** Each segment retains its neighbours' tangents, so highlights match the road exactly. */
export function smoothSegments(points: Point[], tension = 0.5): string[] {
  if (points.length < 2) return [];
  const f = (n: number) => Math.round(n * 10) / 10;
  const segments: string[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const k = tension / 3;
    const c1 = { x: p1.x + (p2.x - p0.x) * k, y: p1.y + (p2.y - p0.y) * k };
    const c2 = { x: p2.x - (p3.x - p1.x) * k, y: p2.y - (p3.y - p1.y) * k };
    segments.push(`M ${f(p1.x)} ${f(p1.y)} C ${f(c1.x)} ${f(c1.y)}, ${f(c2.x)} ${f(c2.y)}, ${f(p2.x)} ${f(p2.y)}`);
  }
  return segments;
}

const devanagariDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

/** 1 → "०१" */
export function devanagariOrder(n: number): string {
  return String(n)
    .padStart(2, "0")
    .split("")
    .map((c) => devanagariDigits[Number(c)])
    .join("");
}
