"use client";

import { useState } from "react";
import { ColorTokenSpec, ViewMode } from "./types";
import { Check, Copy, ShieldCheck } from "lucide-react";

interface TokenColorSwatchProps {
  token: ColorTokenSpec;
  viewMode: ViewMode;
}

export function TokenColorSwatch({ token, viewMode }: TokenColorSwatchProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition-all hover:border-stone-300 hover:shadow-md dark:border-stone-800 dark:bg-stone-900">
      {/* Color Swatch Preview Block */}
      <div
        className="h-24 w-full rounded-lg border border-black/10 shadow-inner transition-transform group-hover:scale-[1.02]"
        style={{ backgroundColor: token.hexValue }}
      >
        <div className="flex h-full items-start justify-between p-3">
          <span className="rounded bg-black/40 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
            {token.layer.toUpperCase()}
          </span>

          <button
            type="button"
            onClick={() => copyToClipboard(token.cssVariable)}
            className="flex items-center gap-1 rounded bg-black/60 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur transition-all hover:bg-black/80"
            title="Copiar variável CSS"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? "Copiado!" : "Copiar Variable"}</span>
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">{token.name}</h4>
          <span className="font-mono text-xs font-semibold text-stone-600 dark:text-stone-400">
            {token.hexValue}
          </span>
        </div>

        <p className="text-xs text-stone-500 dark:text-stone-400">{token.usageContext}</p>

        {viewMode === "dev-spec" && (
          <div className="rounded bg-stone-100 p-2 font-mono text-[11px] text-stone-700 dark:bg-stone-800 dark:text-stone-300">
            <div>Var: <span className="text-blue-600 dark:text-blue-400">{token.cssVariable}</span></div>
            <div>HSL: {token.hslValue}</div>
          </div>
        )}

        {/* Contrast Accessibility Badges */}
        <div className="flex items-center gap-2 pt-1">
          <span className="flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <ShieldCheck className="h-3 w-3" />
            <span>Contraste {token.contrastRatioOnLight}</span>
          </span>
          {token.wcagAaa && (
            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              WCAG AAA
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
