"use client";
import { useEffect, useState, type RefObject } from "react";
import { clamp01, inquiryFrame, sceneAt } from "@/data/nirvana-sutra/motion";
import { useMagazineLanguage } from './MagazineLanguage';
const CAPTIONS = ["मैं यहाँ हूँ। सत्य कहीं वहाँ।", "अनुभव बदलते हैं। जानने का केंद्र स्थिर है।", "", "देखना खोजने वाले की ओर लौटता है।", ""];

/** One event-driven rAF; React updates only at scene boundaries. */
export function useFlagshipMotion(rootRef: RefObject<HTMLElement | null>, progressRef: RefObject<HTMLDivElement | null>) {
  const { t } = useMagazineLanguage();
  const [activeScene, setActiveScene] = useState(1);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const stage = root.querySelector<HTMLElement>("[data-visual-stage]");
    const steps = Array.from(root.querySelectorAll<HTMLElement>("[data-story-step]"));
    if (!stage || !steps.length) return;
    const visuals = new Map(Array.from(stage.querySelectorAll<SVGElement | HTMLElement>("[data-visual]")).map(el => [el.dataset.visual, el]));
    const objects = Array.from(stage.querySelectorAll<SVGElement>("[data-experience]"));
    const sea = Array.from(stage.querySelectorAll<SVGPathElement>("[data-sea-line]"));
    const caption = stage.querySelector("[data-caption]");
    const oceanQuotes = stage.querySelector(".ns-ocean-quotes");
    const outwardPath = visuals.get("outward-path") as SVGPathElement | undefined;
    const outwardLength = outwardPath?.getTotalLength() ?? 0;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 700px)");
    let frame = 0, previous = 0;
    const attr = (name: string, key: string, value: string | number) => visuals.get(name)?.setAttribute(key, String(value));
    const update = () => {
      frame = 0;
      const { scene, progress } = sceneAt(steps.map(step => { const r = step.getBoundingClientRect(); return { top: r.top, height: r.height }; }), window.innerHeight * (mobile.matches ? .72 : .5));
      const p = motion.matches ? (scene === 5 ? 1 : .65) : progress;
      const v = inquiryFrame(scene, p);
      if (previous !== scene) {
        previous = scene; stage.dataset.visualScene = String(scene);
        oceanQuotes?.setAttribute("aria-hidden", String(scene !== 5));
        if (caption) caption.textContent = t(CAPTIONS[scene - 1]);
        setActiveScene(scene);
      }
      stage.dataset.quiet = scene === 5 && p > .7 ? "true" : "false";
      attr("outward-path", "stroke-dashoffset", 1 - v.path);
      const seekerPoint = outwardPath?.getPointAtLength(outwardLength * p * .45);
      if (seekerPoint) attr("outward-seeker", "transform", `translate(${seekerPoint.x} ${seekerPoint.y})`);
      attr("target-glow", "opacity", .35 + .65 * p);
      objects.forEach((el, i) => {
        const illumination = clamp01(1 - Math.abs(p * 6 - (i + .5)));
        el.style.opacity = String(.18 + .82 * illumination);
        el.style.transform = `translateY(${-3 * illumination}px)`;
      });
      attr("inward-path", "stroke-dashoffset", 1 - p); attr("inward-path", "opacity", .9 - .65 * p);
      attr("inward-seeker", "cx", v.seekerX); attr("inward-seeker", "cy", v.seekerY);
      attr("inward-target", "cx", v.targetX); attr("inward-target", "cy", v.targetY); attr("inward-target", "r", v.targetRadius);
      attr("ring-left", "transform", `translate(${-v.ringOffset} 0)`); attr("ring-right", "transform", `translate(${v.ringOffset} 0)`);
      attr("wave", "opacity", v.waveOpacity);
      attr("wave", "transform", `translate(${v.waveX} ${230 * (1 - v.waveScale)}) scale(${v.waveScale})`);
      sea.forEach((line, i) => {
        const y = 295 + i * 46, a = v.seaAmplitude * (1 - i * .22);
        line.setAttribute("d", `M0 ${y}C80 ${y - a} 120 ${y + a} 200 ${y}S320 ${y - a} 400 ${y}S520 ${y + a} 600 ${y}`);
      });
      for (const [name, opacity] of [["ocean-quote-a", 1 - clamp01((p - .4) / .15)], ["ocean-quote-b", clamp01((p - .48) / .15)]] as const) {
        const el = visuals.get(name);
        if (el) { el.style.opacity = String(opacity); el.setAttribute("aria-hidden", String(opacity < .1)); }
      }
      if (motion.matches) {
        visuals.get("ocean-quote-a")?.style.setProperty("opacity", "1");
        visuals.get("ocean-quote-a")?.setAttribute("aria-hidden", "false");
      }
      const distance = root.offsetHeight - window.innerHeight;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${clamp01(-root.getBoundingClientRect().top / Math.max(1, distance))})`;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true }); window.addEventListener("resize", schedule); motion.addEventListener("change", schedule);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); motion.removeEventListener("change", schedule); };
  }, [rootRef, progressRef, t]);
  return activeScene;
}
