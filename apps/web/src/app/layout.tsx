import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IBM_Plex_Mono, IBM_Plex_Sans, Instrument_Serif } from "next/font/google";
import { SiteNav } from "@/components/SiteNav";
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
  keywords: ["event contracts", "prediction markets", "DreamDEX", "Somnia", "risk assessment"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${displaySerif.variable} ${bodySans.variable} ${dataMono.variable}`}>
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <header className="site-header">
          <div className="container">
            <Link href="/" className="wordmark">
              <Image className="level-glyph" src="/brand/level-glyph.svg" width={34} height={14} alt="" priority />
              <span>LevelField</span>
              <small>Event contract intelligence</small>
            </Link>
            <SiteNav />
          </div>
        </header>
        <main id="main-content">
          <div className="container">{children}</div>
        </main>
        <footer className="site-footer">
          <div className="container">
            <span className="footer-rule" aria-hidden="true" />
            <div className="footer-grid">
              <div>
                <Link href="/" className="footer-mark">LevelField</Link>
                <p>Structural information-asymmetry risk assessment for event contracts.</p>
              </div>
              <div>
                <span className="footer-label">Built for</span>
                <p>Somnia × DreamDEX<br />Event Contracts Hackathon</p>
              </div>
              <div>
                <span className="footer-label">Navigate</span>
                <nav className="footer-nav" aria-label="Footer navigation">
                  <Link href="/">Markets</Link>
                  <Link href="/methodology">Methodology</Link>
                  <Link href="/assess">Assess a contract</Link>
                </nav>
              </div>
              <div>
                <span className="footer-label">Scope</span>
                <p>Not an outcome prediction, live-insider detector, or trading advice.</p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
