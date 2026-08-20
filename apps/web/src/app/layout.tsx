import type { Metadata } from "next";
import Link from "next/link";
import { IBM_Plex_Mono, IBM_Plex_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";

// Self-hosted at build time by next/font — no external font host at runtime.
// Instrument Serif for display (the name is on theme), IBM Plex for body/data.
const displaySerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});
const bodySans = IBM_Plex_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-body",
});
const dataMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-data",
});

export const metadata: Metadata = {
  title: { default: "LevelField", template: "%s · LevelField" },
  description:
    "Structural information-asymmetry risk assessment for prediction-market event contracts. Know who you're really betting against.",
};

// The wordmark glyph: a spirit level's vial with a centered bubble — a level field,
// read literally. Inline SVG so it ships with zero asset requests.
function LevelGlyph() {
  return (
    <svg className="level-glyph" viewBox="0 0 34 14" aria-hidden="true">
      <rect x="1" y="1" width="32" height="12" rx="6" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <line x1="13" y1="1.2" x2="13" y2="12.8" stroke="currentColor" strokeWidth="0.9" opacity="0.55" />
      <line x1="21" y1="1.2" x2="21" y2="12.8" stroke="currentColor" strokeWidth="0.9" opacity="0.55" />
      <circle cx="17" cy="7" r="3.1" fill="currentColor" />
    </svg>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${displaySerif.variable} ${bodySans.variable} ${dataMono.variable}`}>
      <body>
        <header className="site-header">
          <div className="container">
            <Link href="/" className="wordmark">
              <LevelGlyph />
              LevelField
            </Link>
            <nav className="site-nav">
              <Link href="/">Markets</Link>
              <Link href="/methodology">Methodology</Link>
              <Link href="/assess">Assess</Link>
            </nav>
          </div>
        </header>
        <main>
          <div className="container">{children}</div>
        </main>
        <footer className="site-footer">
          <div className="container">
            <span className="footer-rule" aria-hidden="true" />
            Structural information-asymmetry risk assessment for event contracts. Not a
            prediction of any outcome, and not trading advice.
          </div>
        </footer>
      </body>
    </html>
  );
}
