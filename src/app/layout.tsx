import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter, Rubik } from "next/font/google";
import { SITE } from "@/lib/site";
import { themeScript } from "@/lib/theme";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
// Rubik: softly rounded corners for headings, figures and buttons; Inter for reading.
const rubik = Rubik({ variable: "--font-rubik", subsets: ["latin"], weight: ["400", "500", "600"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.title, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: ["stablecoin yield", "USDC yield", "USDT yield", "DeFi savings", "best APY", "stablecoin interest"],
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    url: "/",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: SITE.title, description: SITE.description },
  alternates: { canonical: "/" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f4f1" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c0c" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The theme script sets data-theme before hydration, hence the warning suppression.
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${rubik.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        {/* Privacy-friendly page views (no cookies) plus a few product events. */}
        <Analytics />
        {/* Maze: in-product research (surveys, tests). Loads after the page is interactive. */}
        <Script id="maze-universal-snippet" strategy="afterInteractive">{`(function (m, a, z, e) {
  var s, t, u, v;
  try {
    t = m.sessionStorage.getItem('maze-us');
  } catch (err) {}

  if (!t) {
    t = new Date().getTime();
    try {
      m.sessionStorage.setItem('maze-us', t);
    } catch (err) {}
  }

  u = document.currentScript || (function () {
    var w = document.getElementsByTagName('script');
    return w[w.length - 1];
  })();
  v = u && u.nonce;

  s = a.createElement('script');
  s.src = z + '?apiKey=' + e;
  s.async = true;
  if (v) s.setAttribute('nonce', v);
  a.getElementsByTagName('head')[0].appendChild(s);
  m.mazeUniversalSnippetApiKey = e;
})(window, document, 'https://snippet.maze.co/maze-universal-loader.js', '6e5be1c0-9785-4e5c-9969-09a1bd8dbbfe');`}</Script>
      </body>
    </html>
  );
}
