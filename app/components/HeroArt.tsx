"use client";

export default function HeroArt() {
  return (
    <div
      aria-hidden
      className="relative w-full aspect-square max-w-[420px] mx-auto pointer-events-none select-none"
    >
      <svg
        viewBox="0 0 400 400"
        className="absolute inset-0 w-full h-full"
        style={{ filter: "drop-shadow(0 24px 60px rgba(96,165,250,0.18))" }}
      >
        <defs>
          <radialGradient id="ha-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(125, 184, 255, 0.55)" />
            <stop offset="40%" stopColor="rgba(96, 165, 250, 0.18)" />
            <stop offset="100%" stopColor="rgba(96, 165, 250, 0)" />
          </radialGradient>
          <linearGradient id="ha-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(125, 184, 255, 0.85)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.3)" />
          </linearGradient>
          <linearGradient id="ha-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(125, 184, 255, 0.7)" />
            <stop offset="100%" stopColor="rgba(125, 184, 255, 0.15)" />
          </linearGradient>
          <filter id="ha-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* core glow */}
        <circle cx="200" cy="200" r="180" fill="url(#ha-core)" />

        {/* concentric rings */}
        <circle cx="200" cy="200" r="170" fill="none" stroke="rgba(96,165,250,0.10)" strokeWidth="1" />
        <circle cx="200" cy="200" r="120" fill="none" stroke="rgba(96,165,250,0.13)" strokeWidth="1" strokeDasharray="2 4" />
        <circle cx="200" cy="200" r="70" fill="none" stroke="rgba(96,165,250,0.18)" strokeWidth="1" />

        {/* connection arcs */}
        <path d="M 60 140 Q 200 80 340 140" fill="none" stroke="url(#ha-line)" strokeWidth="1.2" opacity="0.8" />
        <path d="M 60 260 Q 200 320 340 260" fill="none" stroke="url(#ha-line)" strokeWidth="1.2" opacity="0.8" />
        <path d="M 140 60 Q 80 200 140 340" fill="none" stroke="url(#ha-line)" strokeWidth="1.2" opacity="0.5" />
        <path d="M 260 60 Q 320 200 260 340" fill="none" stroke="url(#ha-line)" strokeWidth="1.2" opacity="0.5" />

        {/* satellite nodes */}
        {[
          { x: 60, y: 140 },
          { x: 340, y: 140 },
          { x: 60, y: 260 },
          { x: 340, y: 260 },
          { x: 140, y: 60 },
          { x: 260, y: 60 },
          { x: 140, y: 340 },
          { x: 260, y: 340 },
        ].map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="6" fill="rgba(125,184,255,0.10)" />
            <circle cx={p.x} cy={p.y} r="2.5" fill="rgba(125,184,255,0.95)" filter="url(#ha-glow)" />
          </g>
        ))}

        {/* center cluster */}
        <g transform="translate(200,200)">
          <circle r="22" fill="rgba(9,9,11,0.85)" stroke="url(#ha-stroke)" strokeWidth="1" />
          <circle r="40" fill="none" stroke="rgba(125,184,255,0.25)" strokeWidth="1" />
          <circle r="3" fill="rgba(125,184,255,1)">
            <animate attributeName="r" values="3;5;3" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.6;1" dur="2.4s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* traveling particles on the long arcs */}
        <circle r="2.5" fill="rgba(125,184,255,1)">
          <animateMotion dur="3.6s" repeatCount="indefinite">
            <mpath href="#arc-top" />
          </animateMotion>
        </circle>
        <circle r="2.5" fill="rgba(125,184,255,1)">
          <animateMotion dur="4.2s" repeatCount="indefinite" begin="1s">
            <mpath href="#arc-bot" />
          </animateMotion>
        </circle>
        {/* duplicate hidden paths so motion can reference them */}
        <path id="arc-top" d="M 60 140 Q 200 80 340 140" fill="none" stroke="none" />
        <path id="arc-bot" d="M 340 260 Q 200 320 60 260" fill="none" stroke="none" />

        {/* tiny labels on a few nodes */}
        <g fontFamily="var(--font-mono)" fontSize="7" fill="rgba(212,212,216,0.45)" letterSpacing="0.5">
          <text x="60" y="128" textAnchor="middle">edge</text>
          <text x="340" y="128" textAnchor="middle">gateway</text>
          <text x="60" y="278" textAnchor="middle">wal</text>
          <text x="340" y="278" textAnchor="middle">matcher</text>
          <text x="200" y="206" textAnchor="middle" fill="rgba(125,184,255,0.9)" fontSize="6.5" letterSpacing="1.5">CORE</text>
        </g>
      </svg>
    </div>
  );
}
