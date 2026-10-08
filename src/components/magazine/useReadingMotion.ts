"use client";

import { useEffect, type RefObject } from "react";
import { editorialFrame, editorialItemFrame, editorialProgress } from "@/data/nirvana-sutra/motion";

/** One observer per reader; scroll updates a CSS transform, not React every frame. */
export function useReadingMotion(rootRef: RefObject<HTMLElement | null>, progressRef?: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let reveals: IntersectionObserver | undefined;
    let activeHeading: HTMLElement | undefined;
    const headings = Array.from(root.querySelectorAll<HTMLElement>(".ns-body h2"));
    const scenes = Array.from(root.querySelectorAll<HTMLElement>("[data-editorial-scene]")).map(el => ({
      el, items: Array.from(el.querySelectorAll<HTMLElement>("[data-scene-item]")),
      lastP: -1, reduced: false,
    }));
    const fields = Array.from(root.querySelectorAll<HTMLElement>("[data-scroll-field]"));
    const updateProgress = () => {
      frame = 0;
      if (!progressRef?.current && !scenes.length && !fields.length) return;
      // Batch geometry reads before style writes; no layout read after a scene mutation.
      const rects = scenes.map(({ el }) => el.getBoundingClientRect());
      const fieldRects = fields.map(el => el.getBoundingClientRect());
      const scrollRemaining = Math.max(0, document.documentElement.scrollHeight - innerHeight - window.scrollY);
      const distance = root.offsetHeight - window.innerHeight;
      const progress = distance > 0 ? Math.min(1, Math.max(0, -root.getBoundingClientRect().top / distance)) : 1;
      const heading = headings.filter(el => el.getBoundingClientRect().top < innerHeight * .54).at(-1);
      if (progressRef?.current) progressRef.current.style.transform = `scaleX(${progress})`;
      fields.forEach((el, i) => {
        const rect = fieldRects[i];
        const p = motion.matches ? 1 : editorialProgress(rect.top, rect.height, innerHeight, rect.top - scrollRemaining);
        el.style.setProperty("--field-p", p.toFixed(4));
        el.dataset.fieldProgress = p.toFixed(3);
      });
      scenes.forEach((scene, i) => {
        const { el, items } = scene;
        const p = motion.matches ? 1 : editorialProgress(rects[i].top, rects[i].height, innerHeight, rects[i].top - scrollRemaining);
        if (scene.lastP === p && scene.reduced === motion.matches) return;
        scene.lastP = p;
        scene.reduced = motion.matches;
        const values = editorialFrame(p);
        for (const [key, value] of Object.entries(values)) el.style.setProperty(`--scene-${key}`, value.toFixed(4));
        el.dataset.sceneProgress = p.toFixed(3);
        el.toggleAttribute("data-static", motion.matches);
        items.forEach((item, index) => {
          const itemFrame = editorialItemFrame(p, index, items.length);
          item.style.setProperty("--travel", `${itemFrame.travel.toFixed(2)}%`);
          item.style.setProperty("--show", String(itemFrame.show));
          item.style.setProperty("--scale", String(itemFrame.scale));
        });
      });
      if (root.matches(".ns-reader--silence")) {
        // Keep the way out available; let only decorative chrome recede.
        root.style.setProperty("--ns-silence-chrome", String(1 - progress * .85));
      }
      if (root.matches(".ns-reader")) {
        root.style.setProperty("--ns-light-y", motion.matches ? "42vh" : `${40 + progress * 12}vh`);
        if (heading !== activeHeading) {
          activeHeading?.removeAttribute("data-reading");
          heading?.setAttribute("data-reading", "true");
          activeHeading = heading;
        }
      }
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateProgress);
    };
    const setup = () => {
      reveals?.disconnect();
      root.classList.remove("ns-motion-ready");
      root.classList.add("ns-editorial-ready");
      updateProgress();
      // Text remains visible when observers are unavailable or motion is reduced.
      if (!("IntersectionObserver" in window)) return;
      if (motion.matches) return;
      reveals = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.target.hasAttribute("data-editorial-scene")) {
            entry.target.toggleAttribute("data-active", entry.intersectionRatio >= .5);
            continue;
          }
          if (entry.isIntersecting) {
            entry.target.classList.add("ns-in");
            reveals?.unobserve(entry.target);
          }
        }
      }, { threshold: [.08, .5], rootMargin: root.matches(".ns-reader") ? "-10% 0px -25% 0px" : "0px" });
      const targets = root.querySelectorAll("[data-reveal]");
      targets.forEach((target) => {
        target.classList.add("ns-scroll-reveal");
        reveals?.observe(target);
      });
      scenes.forEach(({ el }) => reveals?.observe(el));
      root.classList.add("ns-motion-ready");
    };
    setup();
    updateProgress();
    motion.addEventListener("change", setup);
    if (progressRef || scenes.length || fields.length) {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
    }
    return () => {
      reveals?.disconnect();
      root.classList.remove("ns-motion-ready");
      root.classList.remove("ns-editorial-ready");
      motion.removeEventListener("change", setup);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [rootRef, progressRef]);
}
