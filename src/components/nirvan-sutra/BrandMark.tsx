// The Nirvan Sutra mark: a point of awareness, the field around it, a horizon. No icons of religion — only space and light.
export default function BrandMark({ size = 34, className = 'ns-brand-mark' }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="none" stroke="rgba(212,168,67,0.55)" strokeWidth="1" />
      <circle cx="24" cy="24" r="14" fill="none" stroke="rgba(212,168,67,0.3)" strokeWidth="1" />
      <path d="M6 30 H42" stroke="rgba(243,234,212,0.25)" strokeWidth="1" />
      <circle cx="24" cy="24" r="3.2" fill="#e9c875" />
    </svg>
  );
}
