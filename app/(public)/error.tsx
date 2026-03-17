"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PublicError({ error, reset }: ErrorProps) {
  return (
    <main className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="h-6 w-6 text-red-400" />
        </div>
        <p className="text-xs font-mono text-white/25 uppercase tracking-widest mb-3">
          Error
        </p>
        <h1 className="text-2xl font-display font-bold text-white mb-3">
          Something went wrong
        </h1>
        <p className="text-white/40 text-sm mb-8 leading-relaxed">
          {error.digest
            ? `Error ID: ${error.digest}`
            : "We hit an unexpected error. Please try again."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={reset}
            className="bg-purple hover:bg-purple/90 text-white gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </Button>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "text-white/40 hover:text-white gap-2"
            )}
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
