"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "you" | "bot"; text: string };

const INGREDIENTS = [
  "onion",
  "tomato",
  "paneer",
  "potato",
  "spinach",
  "chickpeas",
  "rice",
  "yogurt",
  "ginger",
  "garlic",
  "okra",
  "lentils",
];

type Recipe = {
  name: string;
  time: string;
  needs: string[];
  steps: string[];
};

const RECIPES: { match: string[]; recipe: Recipe }[] = [
  {
    match: ["paneer", "tomato"],
    recipe: {
      name: "Paneer Butter Masala",
      time: "22 min",
      needs: ["cream (or soaked cashews)", "garam masala", "kasuri methi"],
      steps: [
        "blitz tomatoes + ginger + garlic into a smooth purée",
        "bloom whole spices in ghee · 30s",
        "add purée + chilli powder · simmer until ghee separates",
        "fold in cubed paneer + cream · 4 min low",
        "finish with kasuri methi",
      ],
    },
  },
  {
    match: ["potato", "onion"],
    recipe: {
      name: "Aloo Pyaaz Sabzi",
      time: "18 min",
      needs: ["mustard seeds", "turmeric", "green chilli"],
      steps: [
        "temper mustard + cumin in oil",
        "soft-fry onions until edges turn gold",
        "add diced potatoes + turmeric + salt",
        "cover and steam 12 min on low — no water needed",
        "finish with coriander",
      ],
    },
  },
  {
    match: ["chickpeas", "onion"],
    recipe: {
      name: "Chana Masala",
      time: "28 min",
      needs: ["amchur (or lemon)", "garam masala", "bay leaf"],
      steps: [
        "deep-brown onions with ginger-garlic paste",
        "add tomato + chilli + spices · cook out 6 min",
        "fold in boiled chickpeas + a splash of cooking liquor",
        "simmer 10 min until gravy clings",
        "finish with amchur and coriander",
      ],
    },
  },
  {
    match: ["spinach", "paneer"],
    recipe: {
      name: "Palak Paneer",
      time: "24 min",
      needs: ["cream (small)", "garam masala", "kasuri methi"],
      steps: [
        "blanch spinach 60s · shock in ice water · blitz cool",
        "temper cumin · cook onion + ginger-garlic",
        "fold in spinach purée + spices",
        "add seared paneer cubes · simmer 5 min",
        "finish with cream and kasuri methi",
      ],
    },
  },
  {
    match: ["okra"],
    recipe: {
      name: "Bhindi Do Pyaza",
      time: "20 min",
      needs: ["amchur", "coriander powder"],
      steps: [
        "dry-pat okra · slice into 1cm rings",
        "high-heat fry okra in shallow oil · 5 min · don't stir much",
        "add sliced onions + spices · 6 min",
        "finish with amchur and coriander",
      ],
    },
  },
  {
    match: ["lentils"],
    recipe: {
      name: "Tadka Dal",
      time: "30 min",
      needs: ["ghee", "asafoetida", "kashmiri chilli"],
      steps: [
        "pressure-cook toor dal with turmeric · 4 whistles",
        "in a separate pan: heat ghee, crackle cumin, add asafoetida",
        "throw in chilli + garlic · until just golden",
        "pour the tadka over the hot dal",
        "rest 2 min · serve",
      ],
    },
  },
];

function findRecipe(picked: string[]): Recipe | null {
  let best: { score: number; r: Recipe } | null = null;
  for (const { match, recipe } of RECIPES) {
    const score = match.filter((m) => picked.includes(m)).length / match.length;
    if (score > 0 && (!best || score > best.score)) best = { score, r: recipe };
  }
  return best?.r ?? null;
}

export default function RasoiBotDemo() {
  const [picked, setPicked] = useState<string[]>(["paneer", "tomato"]);
  const [servings, setServings] = useState(3);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "bot",
      text: "tell me what's in your pantry — i'll find a recipe.",
    },
  ]);
  const [typing, setTyping] = useState<string>("");
  const typingRef = useRef<NodeJS.Timeout | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [messages, typing]);

  const toggle = (ing: string) => {
    setPicked((p) =>
      p.includes(ing) ? p.filter((x) => x !== ing) : [...p, ing]
    );
  };

  const ask = async () => {
    if (typingRef.current) return;
    const list = picked.join(", ");
    setMessages((m) => [
      ...m,
      {
        role: "you",
        text: list
          ? `i have ${list}. scaling for ${servings}.`
          : `nothing in particular. scaling for ${servings}.`,
      },
    ]);

    const recipe = findRecipe(picked);
    let reply: string;
    if (!recipe) {
      reply = "nothing locks in cleanly — try adding tomato, paneer, or chickpeas.";
    } else {
      reply =
        `${recipe.name.toLowerCase()} · ${recipe.time}\n` +
        `you'll also need: ${recipe.needs.join(", ")}.\n\n` +
        recipe.steps.map((s, i) => `${i + 1}. ${s}`).join("\n") +
        `\n\nserves ${servings} · grocery list ↓`;
    }

    await stream(reply);
  };

  const stream = async (text: string) => {
    setTyping("");
    const chars = Array.from(text);
    for (let i = 0; i < chars.length; i++) {
      await new Promise<void>((res) => {
        typingRef.current = setTimeout(res, chars[i] === "\n" ? 80 : 14);
      });
      setTyping((t) => t + chars[i]);
    }
    setMessages((m) => [...m, { role: "bot", text }]);
    setTyping("");
    typingRef.current = null;
  };

  return (
    <div className="artifact !p-0 overflow-hidden" style={{ fontSize: "0.7rem" }}>
      <header className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-line)]">
        <div className="flex items-center gap-3">
          <span className="c-accent">●</span>
          <span className="c-fg uppercase tracking-[0.18em] text-[0.66rem]">
            rasoibot
          </span>
          <span className="c-muted">·</span>
          <span className="c-muted text-[0.62rem]">pantry → recipe</span>
        </div>
        <div className="flex items-center gap-2 mono text-[0.62rem]">
          <span className="c-muted uppercase tracking-[0.14em]">serves</span>
          <button
            onClick={() => setServings((s) => Math.max(1, s - 1))}
            className="border border-[var(--color-line)] rounded-[3px] px-1.5 hover:border-[var(--color-fg-soft)] transition"
          >
            −
          </button>
          <span className="c-fg tabular-nums w-3 text-center">{servings}</span>
          <button
            onClick={() => setServings((s) => Math.min(12, s + 1))}
            className="border border-[var(--color-line)] rounded-[3px] px-1.5 hover:border-[var(--color-fg-soft)] transition"
          >
            +
          </button>
        </div>
      </header>

      <div
        ref={bodyRef}
        className="px-3 py-2.5 h-[170px] overflow-y-auto space-y-2 mono text-[0.7rem]"
      >
        {messages.map((m, i) => (
          <div key={i} className="grid grid-cols-[36px_1fr] gap-2">
            <span
              className={
                m.role === "bot"
                  ? "c-accent text-[0.62rem] uppercase tracking-[0.14em]"
                  : "c-muted text-[0.62rem] uppercase tracking-[0.14em]"
              }
            >
              {m.role}
            </span>
            <span className="text-[var(--color-fg-soft)] whitespace-pre-wrap">
              {m.text}
            </span>
          </div>
        ))}
        {typing && (
          <div className="grid grid-cols-[36px_1fr] gap-2">
            <span className="c-accent text-[0.62rem] uppercase tracking-[0.14em]">
              bot
            </span>
            <span className="text-[var(--color-fg-soft)] whitespace-pre-wrap">
              {typing}
              <span className="c-accent">▋</span>
            </span>
          </div>
        )}
      </div>

      <div className="px-3 py-2 border-t border-[var(--color-line)]">
        <div className="c-muted text-[0.6rem] uppercase tracking-[0.16em] mb-1.5">
          pantry · tap to toggle
        </div>
        <div className="flex flex-wrap gap-1">
          {INGREDIENTS.map((ing) => {
            const on = picked.includes(ing);
            return (
              <button
                key={ing}
                onClick={() => toggle(ing)}
                className={`mono text-[0.62rem] px-1.5 py-0.5 rounded-[3px] border transition ${
                  on
                    ? "border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10"
                    : "border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-fg)]"
                }`}
              >
                {ing}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-3 py-2 border-t border-[var(--color-line)] flex items-center gap-3">
        <span className="c-muted text-[0.6rem] uppercase tracking-[0.16em]">
          {picked.length} selected
        </span>
        <button
          onClick={ask}
          className="ml-auto mono text-[0.62rem] uppercase tracking-[0.14em] px-2 py-0.5 rounded-[3px] border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition"
        >
          ▶ ask
        </button>
      </div>
    </div>
  );
}
