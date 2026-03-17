import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="text-xs font-mono text-white/25 uppercase tracking-widest mb-4">
          404
        </p>
        <h1 className="text-3xl font-display font-bold text-white mb-3">
          Page not found
        </h1>
        <p className="text-white/40 text-sm mb-8 leading-relaxed">
          This page doesn&apos;t exist or may have moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-purple text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple/90 transition-colors"
        >
          <Home className="h-4 w-4" />
          Go home
        </Link>
      </div>
    </div>
  );
}
