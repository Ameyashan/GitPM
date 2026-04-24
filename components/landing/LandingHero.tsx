"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SignInButton } from "./SignInButton";
import type { PublicProfileForLanding } from "@/lib/featured-profiles";
import { CommitGraphCard } from "./CommitGraphCard";
import {
  useVerbCycle,
  useCountUp,
  useLiveTicker,
  usePrefersReducedMotion,
} from "./motion-hooks";

const VERBS = ["ship", "prove", "demo", "launch"];
const NAMES = ["yourname", "priya", "ameyag", "malcolm", "sarah_pm", "nate"];

function TypingHandle() {
  const reduced = usePrefersReducedMotion();
  const [text, setText] = useState(NAMES[0]);

  useEffect(() => {
    if (reduced) {
      setText(NAMES[0]);
      return;
    }
    let stopped = false;
    let ni = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const intervals: ReturnType<typeof setInterval>[] = [];

    const cycle = () => {
      if (stopped) return;
      const full = NAMES[ni % NAMES.length];
      let i = 0;
      setText("");
      const typer = setInterval(() => {
        if (stopped) return;
        i++;
        setText(full.slice(0, i));
        if (i >= full.length) {
          clearInterval(typer);
          timers.push(
            setTimeout(() => {
              const eraser = setInterval(() => {
                if (stopped) return;
                setText((t) => {
                  if (t.length <= 1) {
                    clearInterval(eraser);
                    ni++;
                    timers.push(setTimeout(cycle, 300));
                    return "";
                  }
                  return t.slice(0, -1);
                });
              }, 40);
              intervals.push(eraser);
            }, 1500)
          );
        }
      }, 75);
      intervals.push(typer);
    };
    timers.push(setTimeout(cycle, 2200));

    return () => {
      stopped = true;
      timers.forEach(clearTimeout);
      intervals.forEach(clearInterval);
    };
  }, [reduced]);

  return <span className="gitpm-url-you">{text}</span>;
}

function MagneticWrap({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    el.style.transform = `translate(${x * 0.12}px, ${y * 0.18}px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="gitpm-magnetic"
      style={{ display: "inline-block", transition: "transform .25s cubic-bezier(.2,.7,.3,1)" }}
    >
      {children}
    </div>
  );
}

export function LandingHero({
  totalUsers = 0,
  avatars = [],
}: {
  totalUsers?: number;
  avatars?: PublicProfileForLanding[];
}) {
  const { word: verb, phase } = useVerbCycle(VERBS);
  const reduced = usePrefersReducedMotion();
  const animatedCount = useCountUp(totalUsers, 1400, 1800);
  const [ticked, setTicked] = useState(0);
  const [flash, setFlash] = useState(false);
  const currentCount = animatedCount + ticked;

  useLiveTicker(!reduced && animatedCount >= totalUsers, () => {
    setTicked((n) => n + 1);
    setFlash(true);
    setTimeout(() => setFlash(false), 700);
  });

  return (
    <section className="gitpm-hero">
      <div className="gitpm-hero-mesh" aria-hidden />
      <div className="gitpm-hero-grid-bg" aria-hidden />

      <div className="gitpm-hero-inner">
        <div>
          <div className="gitpm-beta">
            <span className="gitpm-beta-dot" /> Now in beta · Free for PMs
          </div>

          <h1 className="gitpm-headline">
            One link to prove<br />
            you can{" "}
            <em className="gitpm-verb" aria-hidden>
              <span key={verb + phase} className={`gitpm-verb-word${phase === "out" ? " out" : ""}`}>
                {verb}
              </span>
            </em>
            <span className="sr-only">ship</span>
          </h1>

          <p className="gitpm-sub">
            GitPM gives product managers a verified portfolio of the apps they vibecode.
            Connect Vercel, Lovable, or GitHub — every commit, deploy, and decision becomes proof.
          </p>

          <div className="gitpm-cta-row">
            <MagneticWrap>
              <SignInButton variant="white" label="Start building your profile" />
            </MagneticWrap>
            <Link href="/ameyashan" className="gitpm-cta-ghost">
              See an example profile
            </Link>
          </div>

          <div className="gitpm-social-proof">
            <div className="gitpm-avatar-stack">
              {avatars.map((p) =>
                p.avatarUrl ? (
                  <Image
                    key={p.username}
                    src={p.avatarUrl}
                    alt={p.name}
                    width={32}
                    height={32}
                    className="gitpm-av"
                    style={{ objectFit: "cover" }}
                    title={p.name}
                  />
                ) : (
                  <span
                    key={p.username}
                    className="gitpm-av"
                    style={{ background: `linear-gradient(135deg,${p.gradientFrom},${p.gradientTo})` }}
                    title={p.name}
                  >
                    {p.initials}
                  </span>
                )
              )}
              {currentCount > avatars.length && (
                <span className="gitpm-av gitpm-av-more">+{currentCount - avatars.length}</span>
              )}
            </div>
            <span className="gitpm-live-dot" />
            <span className="gitpm-proof-caption">
              <b className={flash ? "gitpm-flash" : undefined}>
                {currentCount.toLocaleString()}
              </b>{" "}
              PMs shipping this week
            </span>
          </div>

          <div className="gitpm-url-preview">
            <span className="gitpm-url-lock">◆</span>
            <span>gitpm.dev/</span>
            <TypingHandle />
            <span className="gitpm-caret" aria-hidden />
          </div>
        </div>

        <CommitGraphCard />
      </div>
    </section>
  );
}
