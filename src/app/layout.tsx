import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppLayoutShell } from "@/components/templates";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
});

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
    <html lang="pt-BR" className={plusJakartaSans.variable} suppressHydrationWarning>
      <body className="bg-warm-bg text-warm-charcoal font-sans antialiased min-h-screen">
        <AppLayoutShell>{children}</AppLayoutShell>
      </body>
    </html>
  );
}

