export default function LandingPage() {
  return (
    <main className="flex-1 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <p className="text-xs font-mono text-teal uppercase tracking-widest mb-4">
          Portfolio for PMs who build
        </p>
        <h1 className="text-5xl font-display font-bold text-white mb-4 leading-tight">
          GitPM
        </h1>
        <p className="text-lg text-white/50 mb-8 leading-relaxed">
          One shareable URL that aggregates all your shipped projects — with
          OAuth-verified deployment badges to prove you built it.
        </p>
        <p className="text-sm text-white/30">
          Sign in with GitHub to get started — it&apos;s free.
        </p>
      </div>
    </main>
  );
}
