import type { ReactNode } from "react";

type Cls = "kw" | "str" | "num" | "fn" | "type" | "cm" | "op" | "attr" | "var";

type Tok = { c?: Cls; t: string };
export type TokLine = Tok[];

const colorOf: Record<Cls, string> = {
  kw: "var(--color-accent)",
  str: "var(--color-emerald)",
  num: "var(--color-emerald)",
  fn: "var(--color-fg)",
  type: "var(--color-rose)",
  cm: "var(--color-muted)",
  op: "var(--color-muted)",
  attr: "var(--color-rose)",
  var: "var(--color-fg)",
};

export default function CodeBlock({
  lang,
  file,
  lines,
  caption,
}: {
  lang: string;
  file: string;
  lines: TokLine[];
  caption?: ReactNode;
}) {
  return (
    <figure className="my-7 bg-[var(--color-bg-soft)] border border-[var(--color-line)] rounded-lg overflow-hidden">
      <header className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-line)] text-[0.66rem] uppercase tracking-[0.18em] text-[var(--color-muted)]">
        <span className="flex items-center gap-2.5">
          <span className="flex gap-1">
            <span className="w-[6px] h-[6px] rounded-full bg-[var(--color-rose)]/55" />
            <span className="w-[6px] h-[6px] rounded-full bg-[var(--color-accent)]/65" />
            <span className="w-[6px] h-[6px] rounded-full bg-[var(--color-emerald)]/55" />
          </span>
          <span className="text-[var(--color-fg-soft)] normal-case tracking-normal text-[0.72rem] font-mono">
            {file}
          </span>
        </span>
        <span className="tabular-nums">{lang}</span>
      </header>
      <pre className="px-4 py-3 mono text-[0.78rem] leading-[1.7] overflow-x-auto text-[var(--color-fg-soft)]">
        {lines.map((line, i) => (
          <div key={i} className="flex">
            <span className="text-[var(--color-muted)]/50 tabular-nums select-none pr-4 text-right w-7 shrink-0">
              {i + 1}
            </span>
            <span className="whitespace-pre">
              {line.map((tok, j) => (
                <span key={j} style={tok.c ? { color: colorOf[tok.c], fontStyle: tok.c === "cm" ? "italic" : undefined } : undefined}>
                  {tok.t}
                </span>
              ))}
            </span>
          </div>
        ))}
      </pre>
      {caption && (
        <figcaption className="px-4 py-2.5 border-t border-[var(--color-line)] text-[0.78rem] text-[var(--color-muted)] italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export const BOURSE_SNIPPET: TokLine[] = [
  [{ c: "cm", t: "// matcher core — single-threaded by design" }],
  [{ c: "kw", t: "impl" }, { t: " " }, { c: "type", t: "Matcher" }, { t: " {" }],
  [{ t: "    " }, { c: "kw", t: "pub fn" }, { t: " " }, { c: "fn", t: "run" }, { t: "(&" }, { c: "kw", t: "mut" }, { t: " " }, { c: "var", t: "self" }, { t: ") -> ! {" }],
  [{ t: "        " }, { c: "kw", t: "loop" }, { t: " {" }],
  [{ t: "            " }, { c: "kw", t: "let" }, { t: " " }, { c: "var", t: "order" }, { t: " = " }, { c: "kw", t: "match" }, { t: " " }, { c: "var", t: "self" }, { t: "." }, { c: "fn", t: "gateway_rx" }, { t: "." }, { c: "fn", t: "try_pop" }, { t: "() {" }],
  [{ t: "                " }, { c: "type", t: "Some" }, { t: "(" }, { c: "var", t: "o" }, { t: ") => " }, { c: "var", t: "o" }, { t: "," }],
  [{ t: "                " }, { c: "type", t: "None" }, { t: "    => " }, { c: "kw", t: "continue" }, { t: "," }],
  [{ t: "            };" }],
  [{ t: "            " }, { c: "kw", t: "let" }, { t: " " }, { c: "var", t: "fills" }, { t: " = " }, { c: "var", t: "self" }, { t: "." }, { c: "var", t: "book" }, { t: "." }, { c: "fn", t: "submit" }, { t: "(" }, { c: "var", t: "order" }, { t: ");" }],
  [{ t: "            " }, { c: "var", t: "self" }, { t: "." }, { c: "var", t: "wal" }, { t: "." }, { c: "fn", t: "append" }, { t: "(&" }, { c: "var", t: "order" }, { t: ")?;" }],
  [{ t: "            " }, { c: "kw", t: "for" }, { t: " " }, { c: "var", t: "f" }, { t: " " }, { c: "kw", t: "in" }, { t: " " }, { c: "var", t: "fills" }, { t: " {" }],
  [{ t: "                " }, { c: "var", t: "self" }, { t: "." }, { c: "var", t: "market_data_tx" }, { t: "." }, { c: "fn", t: "push" }, { t: "(" }, { c: "var", t: "f" }, { t: ");" }],
  [{ t: "            }" }],
  [{ t: "        }" }],
  [{ t: "    }" }],
  [{ t: "}" }],
];

export const NETPULSE_SNIPPET: TokLine[] = [
  [{ c: "cm", t: "# longest-prefix-match index: 500× faster than linear" }],
  [{ c: "kw", t: "class" }, { t: " " }, { c: "type", t: "RPKIIndex" }, { t: ":" }],
  [{ t: "    " }, { c: "kw", t: "def" }, { t: " " }, { c: "fn", t: "__init__" }, { t: "(" }, { c: "var", t: "self" }, { t: ", " }, { c: "var", t: "vrps" }, { t: ": " }, { c: "type", t: "Iterable" }, { t: "[" }, { c: "type", t: "VRP" }, { t: "]):" }],
  [{ t: "        " }, { c: "var", t: "self" }, { t: "." }, { c: "var", t: "trie" }, { t: " = " }, { c: "type", t: "PatriciaTrie" }, { t: "()" }],
  [{ t: "        " }, { c: "kw", t: "for" }, { t: " " }, { c: "var", t: "vrp" }, { t: " " }, { c: "kw", t: "in" }, { t: " " }, { c: "var", t: "vrps" }, { t: ":" }],
  [{ t: "            " }, { c: "var", t: "self" }, { t: "." }, { c: "var", t: "trie" }, { t: "." }, { c: "fn", t: "insert" }, { t: "(" }, { c: "var", t: "vrp" }, { t: "." }, { c: "var", t: "prefix" }, { t: ", " }, { c: "var", t: "vrp" }, { t: ")" }],
  [{ t: "" }],
  [{ t: "    " }, { c: "kw", t: "def" }, { t: " " }, { c: "fn", t: "validate" }, { t: "(" }, { c: "var", t: "self" }, { t: ", " }, { c: "var", t: "a" }, { t: ": " }, { c: "type", t: "Announce" }, { t: ") -> " }, { c: "type", t: "Validation" }, { t: ":" }],
  [{ t: "        " }, { c: "var", t: "cov" }, { t: " = " }, { c: "var", t: "self" }, { t: "." }, { c: "var", t: "trie" }, { t: "." }, { c: "fn", t: "longest_prefix" }, { t: "(" }, { c: "var", t: "a" }, { t: "." }, { c: "var", t: "prefix" }, { t: ")" }],
  [{ t: "        " }, { c: "kw", t: "if not" }, { t: " " }, { c: "var", t: "cov" }, { t: ":" }, { t: " " }, { c: "kw", t: "return" }, { t: " " }, { c: "type", t: "Validation" }, { t: "." }, { c: "var", t: "UNKNOWN" }],
  [{ t: "        " }, { c: "kw", t: "if" }, { t: " " }, { c: "var", t: "a" }, { t: "." }, { c: "var", t: "origin" }, { t: " " }, { c: "kw", t: "in" }, { t: " " }, { c: "var", t: "cov" }, { t: "." }, { c: "var", t: "allowed_origins" }, { t: ":" }],
  [{ t: "            " }, { c: "kw", t: "return" }, { t: " " }, { c: "type", t: "Validation" }, { t: "." }, { c: "var", t: "VALID" }],
  [{ t: "        " }, { c: "kw", t: "return" }, { t: " " }, { c: "type", t: "Validation" }, { t: "." }, { c: "var", t: "INVALID" }],
];
