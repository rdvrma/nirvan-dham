import type { MagazineContentType } from "@/data/nirvana-sutra/types";

/** Small hand-drawn line symbols for each destination (24×24, stroke only). */
export function MapSymbol({ type }: { type: MagazineContentType }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
    className: "ns-symbol",
  };

  switch (type) {
    case "welcome": // gate
      return (
        <svg {...common}>
          <path d="M4 21V10a8 8 0 0 1 16 0v11" />
          <path d="M9 21v-6a3 3 0 0 1 6 0v6" />
        </svg>
      );
    case "song": // note
      return (
        <svg {...common}>
          <path d="M9 18V6l10-2v12" />
          <circle cx="6.5" cy="18" r="2.5" />
          <circle cx="16.5" cy="16" r="2.5" />
        </svg>
      );
    case "humour": // smile
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M8.3 14c1 1.7 2.2 2.4 3.7 2.4s2.7-.7 3.7-2.4" />
          <path d="M9 9.6h.01M15 9.6h.01" strokeWidth={2.2} />
        </svg>
      );
    case "story": // tree
      return (
        <svg {...common}>
          <path d="M12 21v-6.5" />
          <path d="M12 15c-3.5 0-6-2.3-6-5.3C6 6.6 8.6 3 12 3s6 3.6 6 6.7c0 3-2.5 5.3-6 5.3z" />
          <path d="M12 12.2l2.4-2.4" />
        </svg>
      );
    case "article": // lamp
      return (
        <svg {...common}>
          <path d="M3.5 14h17a8.5 5.5 0 0 1-17 0z" />
          <path d="M12 3c2.2 2.6 3 4.2 3 5.8a3 3 0 0 1-6 0C9 7.2 9.8 5.6 12 3z" />
        </svg>
      );
    case "deep": // drop
      return (
        <svg {...common}>
          <path d="M12 3c3.6 4.2 6 7.2 6 10.2a6 6 0 0 1-12 0C6 10.2 8.4 7.2 12 3z" />
          <path d="M9.5 14.5a2.6 2.6 0 0 0 2 2" />
        </svg>
      );
    case "silence": // open circle
      return (
        <svg {...common}>
          <path d="M19 7.6A8.5 8.5 0 1 0 20.4 12" />
        </svg>
      );
  }
}
