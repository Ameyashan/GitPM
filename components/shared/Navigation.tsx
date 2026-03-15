// Site navigation — implemented in Ticket 3
// Auth state: sign in / sign out / avatar

export function Navigation() {
  return (
    <nav className="border-b border-gitpm-border/50 bg-navy">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <span className="font-display font-bold text-white tracking-tight">
          GitPM
        </span>
        <div className="flex items-center gap-4">
          <span className="text-white/40 text-sm">
            Nav — coming in Ticket 3
          </span>
        </div>
      </div>
    </nav>
  );
}
