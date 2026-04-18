"use client";

import { useRef } from "react";
import { usePrefersReducedMotion } from "./motion-hooks";

function TiltCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(600px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateY(-3px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div
      ref={ref}
      className="gitpm-f-card"
      style={style}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  );
}

export function FeaturesGrid() {
  return (
    <section className="gitpm-features">
      <div className="gitpm-features-head">
        <h2 className="gitpm-features-title">
          Your commits tell the <em>whole</em> story.<br />
          Your portfolio should too.
        </h2>
        <div className="gitpm-eyebrow">What you get</div>
      </div>

      <div className="gitpm-f-grid">
        <TiltCard style={{ ["--f-c" as string]: "var(--teal)" }}>
          <span className="gitpm-f-label">Verification</span>
          <div className="gitpm-f-art gitpm-art-verify">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <circle cx="30" cy="30" r="24" stroke="var(--teal)" strokeWidth="1.2" opacity=".25" />
              <circle
                cx="30"
                cy="30"
                r="24"
                stroke="var(--teal)"
                strokeWidth="2"
                strokeDasharray="110 40"
                strokeLinecap="round"
                transform="rotate(-90 30 30)"
              />
              <path
                d="M20 30.5 L27 37.5 L41 22.5"
                stroke="var(--teal)"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="40"
                style={{ animation: "verify-draw 1.4s .2s both cubic-bezier(.6,0,.2,1)" }}
              />
            </svg>
          </div>
          <h3 className="gitpm-f-title">Prove you built it</h3>
          <p className="gitpm-f-body">
            OAuth-verified deploy ownership, commit history, and a confidence score hiring managers can trust.
          </p>
        </TiltCard>

        <TiltCard style={{ ["--f-c" as string]: "var(--purple)" }}>
          <span className="gitpm-f-label">Consolidation</span>
          <div className="gitpm-f-art gitpm-art-globe">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <circle cx="30" cy="30" r="14" stroke="var(--purple)" strokeWidth="1.5" />
              <ellipse
                className="gitpm-ring"
                cx="30"
                cy="30"
                rx="26"
                ry="10"
                stroke="var(--purple)"
                strokeWidth="1"
                opacity=".5"
              />
              <circle cx="30" cy="30" r="4" fill="var(--purple)" />
            </svg>
          </div>
          <h3 className="gitpm-f-title">One URL for everything</h3>
          <p className="gitpm-f-body">
            Stop sending five links. Vercel, Lovable, GitHub Pages — one profile, auto-detected metadata.
          </p>
        </TiltCard>

        <TiltCard style={{ ["--f-c" as string]: "var(--forest)" }}>
          <span className="gitpm-f-label">Product thinking</span>
          <div className="gitpm-f-art gitpm-art-stack">
            <svg width="70" height="60" viewBox="0 0 70 60" fill="none">
              <rect className="gitpm-layer gitpm-layer-3" x="10" y="28" width="46" height="8" rx="2" fill="var(--forest)" opacity=".3" />
              <rect className="gitpm-layer gitpm-layer-2" x="10" y="18" width="46" height="8" rx="2" fill="var(--forest)" opacity=".6" />
              <rect className="gitpm-layer gitpm-layer-1" x="10" y="8" width="46" height="8" rx="2" fill="var(--forest)" />
            </svg>
          </div>
          <h3 className="gitpm-f-title">
            Show the <em style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}>why</em>
          </h3>
          <p className="gitpm-f-body">
            Problem, decisions, target user. The thinking that separates a PM from just another dev.
          </p>
        </TiltCard>

        <TiltCard style={{ ["--f-c" as string]: "var(--navy)" }}>
          <span className="gitpm-f-label">Demo-first</span>
          <div className="gitpm-f-art gitpm-art-demo">
            <svg width="68" height="58" viewBox="0 0 68 58" fill="none">
              <rect x="4" y="6" width="60" height="38" rx="4" fill="var(--navy)" opacity=".08" />
              <rect x="4" y="6" width="60" height="38" rx="4" stroke="var(--navy)" strokeWidth="1" />
              <g className="gitpm-play">
                <circle cx="34" cy="25" r="11" fill="var(--navy)" />
                <path d="M31 20 L40 25 L31 30 Z" fill="#fff" />
              </g>
              <rect x="15" y="49" width="38" height="3" rx="1.5" fill="var(--navy)" opacity=".15" />
            </svg>
          </div>
          <h3 className="gitpm-f-title">2-min video &gt; resume</h3>
          <p className="gitpm-f-body">
            Embed a Loom. Hiring managers press play before they&rsquo;d read line one of your résumé.
          </p>
        </TiltCard>
      </div>
    </section>
  );
}
