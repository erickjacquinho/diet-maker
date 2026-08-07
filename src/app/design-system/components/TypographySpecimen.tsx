"use client";

import { useState } from "react";
import { TypographyTokenSpec, ViewMode } from "./types";
import { textStyle } from "@/design-system";
import { Type } from "lucide-react";

interface TypographySpecimenProps {
  token: TypographyTokenSpec;
  viewMode: ViewMode;
}

export function TypographySpecimen({ token, viewMode }: TypographySpecimenProps) {
  const [customText, setCustomText] = useState(token.sampleText);

  return (
    <article className="group rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition-all hover:border-stone-300 hover:shadow-md dark:border-stone-800 dark:bg-stone-900">
      <div className="flex flex-col gap-3 border-b border-stone-100 pb-3 dark:border-stone-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded border border-stone-200 p-1.5 dark:border-stone-700">
            <Type className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">{token.name}</h4>
            <span className="text-xs text-stone-500">
              Font-size: {token.fontSize} · Weight: {token.fontWeight}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {token.allowedElements.map((el) => (
            <span
              key={el}
              className="rounded bg-stone-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-400"
            >
              &lt;{el}&gt;
            </span>
          ))}
        </div>
      </div>

      {/* Editable Specimen Content */}
      <div className="my-4 min-h-[60px]">
        <p className={textStyle(token.styleId as any)}>
          {customText}
        </p>
      </div>

      {/* Interactive Input for Client Testing */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="Testar texto nesta fonte..."
          className="w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-800 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:focus:border-blue-500"
        />
      </div>

      {viewMode === "dev-spec" && (
        <div className="mt-3 rounded bg-stone-100 p-2 font-mono text-[11px] text-stone-700 dark:bg-stone-800 dark:text-stone-300">
          <code>textStyle("{token.styleId}")</code>
        </div>
      )}
    </article>
  );
}
