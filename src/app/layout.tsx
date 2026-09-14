import type { Metadata } from "next";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import { Toaster } from "sonner";
import "./globals.css";
import { SessionAwareAppShell } from "@/app/SessionAwareAppShell";
import { PatientApplicationBootstrap } from "@/app/PatientApplicationBootstrap";

export const metadata: Metadata = {
  title: "NutriDiet Local Pro - Sistema Nutricional Swiss Warm Minimalist",
  description: "Aplicativo local de elaboração, adequação, cópia/cola e escala de dietas clínicas e esportivas para nutricionistas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-canvas text-text-primary font-sans antialiased min-h-screen">
        <SessionAwareAppShell>{children}</SessionAwareAppShell>
        <PatientApplicationBootstrap />
        <Toaster position="bottom-right" richColors duration={3000} />
      </body>
    </html>
  );
}

