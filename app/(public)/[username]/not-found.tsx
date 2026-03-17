import Link from "next/link";
import { Github } from "lucide-react";

export default function UsernameNotFound() {
  return (
    <main className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-xs font-mono text-white/25 uppercase tracking-widest mb-4">
          404 · Profile not found
        </p>
        <h1 className="text-3xl font-display font-bold text-white mb-3">
          This profile doesn&apos;t exist
        </h1>
        <p className="text-white/40 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
          PMs who build with AI use GitPM to share their verified work.
          Create your own profile in under two minutes.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-purple text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple/90 transition-colors"
          >
            <Github className="h-4 w-4" />
            Create your profile
          </Link>
          <Link
            href="/"
            className="inline-flex items-center text-sm text-white/40 hover:text-white transition-colors px-4 py-2"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
