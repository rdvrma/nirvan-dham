import type { MagazineIssue } from "@/data/nirvana-sutra/types";

export function MagazineIdentity({ issue, className = "" }: { issue: MagazineIssue; className?: string }) {
  return <span className={`ns-brand ns-identity ${className}`}>
    <strong>{issue.title} {issue.subtitle}</strong><small>{issue.issueLabel}</small>
  </span>;
}
