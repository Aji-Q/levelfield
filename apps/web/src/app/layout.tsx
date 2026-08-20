import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "LevelField",
  description: "Know who you're really betting against.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container">
            <Link href="/" className="wordmark">
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
            Structural information-asymmetry risk assessment for event contracts. Not a
            prediction of any outcome, and not trading advice.
          </div>
        </footer>
      </body>
    </html>
  );
}
