import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ProjectNotFound() {
  return (
    <main className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="text-xs font-mono text-white/25 uppercase tracking-widest mb-4">
          404 · Project not found
        </p>
        <h1 className="text-3xl font-display font-bold text-white mb-3">
          This project doesn&apos;t exist
        </h1>
        <p className="text-white/40 text-sm mb-8 leading-relaxed">
          The project you&apos;re looking for may have been removed or the
          URL may be incorrect.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>
    </main>
  );
}
