// Verified ownership badge — implemented in Ticket 6
import type { VerificationMethod } from "@/types/project";

interface VerifiedBadgeProps {
  method: VerificationMethod;
}

const METHOD_LABELS: Record<VerificationMethod, string> = {
  vercel_oauth: "Verified on Vercel",
  lovable_repo: "Verified on Lovable",
  github_pages: "Verified on GitHub Pages",
};

export function VerifiedBadge({ method }: VerifiedBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-teal/10 text-teal border border-teal/20 px-3 py-1 text-xs font-semibold">
      <svg
        className="h-3 w-3"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
      {METHOD_LABELS[method]}
    </span>
  );
}
