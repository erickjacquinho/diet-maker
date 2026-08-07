"use client";

import { useState } from "react";
import { Sun, Moon, Maximize2 } from "lucide-react";

interface ComponentSandboxProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  codeSnippet?: string;
  showCode?: boolean;
}

export function ComponentSandbox({
  children,
  title,
  description,
  codeSnippet,
  showCode = false,
}: ComponentSandboxProps) {
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");

  return (
    <article className="rounded-xl border border-stone-200 bg-white shadow-sm transition-all dark:border-stone-800 dark:bg-stone-900">
      {/* Sandbox Header */}
      <div className="flex items-center justify-between border-b border-stone-100 px-5 py-3.5 dark:border-stone-800">
        <div>
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">{title}</h3>
          {description && <p className="text-xs text-stone-500">{description}</p>}
        </div>

        <div className="flex items-center gap-2">
          {/* Theme preview switcher */}
          <div className="inline-flex rounded-lg border border-stone-200 bg-stone-100 p-0.5 dark:border-stone-700 dark:bg-stone-800">
            <button
              type="button"
              onClick={() => setThemeMode("light")}
              className={`rounded p-1 text-xs transition-all ${
                themeMode === "light"
                  ? "bg-white text-stone-900 shadow dark:bg-stone-700 dark:text-stone-100"
                  : "text-stone-400 hover:text-stone-700"
              }`}
              title="Preview Light Background"
            >
              <Sun className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setThemeMode("dark")}
              className={`rounded p-1 text-xs transition-all ${
                themeMode === "dark"
                  ? "bg-stone-900 text-stone-100 shadow"
                  : "text-stone-400 hover:text-stone-700"
              }`}
              title="Preview Dark Background"
            >
              <Moon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Live Preview Container Frame */}
      <div
        className={`flex min-h-[140px] items-center justify-center p-6 transition-colors ${
          themeMode === "dark" ? "bg-stone-950 text-stone-100" : "bg-stone-50 text-stone-900"
        }`}
      >
        <div className="w-full max-w-xl">{children}</div>
      </div>

      {/* Code Snippet Drawer */}
      {showCode && codeSnippet && (
        <div className="border-t border-stone-100 bg-stone-900 p-4 font-mono text-xs text-stone-300 dark:border-stone-800">
          <pre className="overflow-x-auto">{codeSnippet}</pre>
        </div>
      )}
    </article>
  );
}
