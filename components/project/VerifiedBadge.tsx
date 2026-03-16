import { CheckCircle2 } from "lucide-react";
import type { VerificationMethod } from "@/types/project";

interface VerifiedBadgeProps {
  method: VerificationMethod;
  size?: "inline" | "full";
}

const METHOD_LABELS: Record<VerificationMethod, string> = {
  vercel_oauth: "Verified on Vercel",
  lovable_repo: "Verified on Lovable",
  github_pages: "Verified on GitHub Pages",
};

const METHOD_SHORT: Record<VerificationMethod, string> = {
  vercel_oauth: "Verified",
  lovable_repo: "Verified",
  github_pages: "Verified",
};

export function VerifiedBadge({ method, size = "inline" }: VerifiedBadgeProps) {
  if (size === "inline") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-teal/10 text-teal border border-teal/20 px-2 py-0.5 text-[10px] font-semibold font-mono shrink-0">
        <CheckCircle2 className="h-2.5 w-2.5" aria-hidden="true" />
        {METHOD_SHORT[method]}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-teal/10 text-teal border border-teal/20 px-3 py-1 text-xs font-semibold">
      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
      {METHOD_LABELS[method]}
    </span>
  );
}
