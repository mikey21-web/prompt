import type { Metadata } from "next";
import { Providers } from "./providers";
import { AnalyticsLoader } from "@/components/AnalyticsLoader";
import "./globals.css";

export const metadata: Metadata = {
  title: "PromptForge — Better Prompts. Less Tokens.",
  description:
    "Compress, enhance, and optimize AI prompts in one keystroke. Browser extension + desktop app for ChatGPT, Claude, Gemini, and Midjourney.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
        <AnalyticsLoader />
      </body>
    </html>
  );
}
