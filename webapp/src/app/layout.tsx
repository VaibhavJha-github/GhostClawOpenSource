import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import GoFundMeGate from "@/components/GoFundMeGate";

const fallbackFontVars: CSSProperties = {
  ["--font-geist-sans" as string]: "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
  ["--font-geist-mono" as string]: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
};

export const metadata: Metadata = {
  title: "GhostClaw — AI Employees That Actually Work",
  description: "Deploy autonomous AI agents in 1 minute. Multiple skills, self-learning capabilities, and endless possibilities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={fallbackFontVars} className="antialiased font-sans selection:bg-orange-500/30">
        <AuthProvider>
          {children}
          <GoFundMeGate />
        </AuthProvider>
      </body>
    </html>
  );
}
