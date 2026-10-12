import type { Metadata, Viewport } from "next";
import { Fraunces, Geist_Mono, Pixelify_Sans, Young_Serif } from "next/font/google";
import localFont from "next/font/local";
import { ArrivalMarker } from "@/components/arrival-marker";
import { ScrollBlur } from "@/components/scroll-blur";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Body and UI: Satoshi, as on HackerRank Campus Crew.
const satoshi = localFont({
  variable: "--font-sans",
  display: "swap",
  src: [
    { path: "../fonts/Satoshi-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Satoshi-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/Satoshi-Bold.woff2", weight: "700", style: "normal" },
  ],
});

// Hero headline. Stand-ins until the licensed files arrive (see src/fonts/README.md):
// Young Serif for RL Madena (headline), Fraunces for Buche (the word "CSE").
const headline = Young_Serif({
  variable: "--font-headline",
  subsets: ["latin"],
  weight: "400",
});
const cse = Fraunces({
  variable: "--font-cse",
  subsets: ["latin"],
  axes: ["SOFT", "WONK"],
});

// Headings: free pixel stand-in for PP Mondwest (see src/fonts/README.md).
const pixel = Pixelify_Sans({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: "400",
  // Only used further down the page, so it does not compete with the first screen.
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  // Only used on faculty pages (roll numbers).
  preload: false,
});

export const metadata: Metadata = {
  title: "CSE Spotlight",
  description: "Student achievements from the Dept. Of Computer Science & Engineering, SRMIST VDP, checked by faculty.",
};

// Phones: draw edge to edge on iPhones with a notch or Dynamic Island (the header and page
// pad themselves with the safe-area insets), and tint the browser bar to match the site.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${satoshi.variable} ${pixel.variable} ${headline.variable} ${cse.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]">
        <SiteHeader />
        <ScrollBlur />
        {/* The header floats over the page, so content starts below it (and below the
            phone's status bar). The top and bottom safe areas are not padded on the body,
            so the hero and footer art run under the notch and home bar with no white strip. */}
        <div className="flex-1 pt-[calc(76px+env(safe-area-inset-top))] sm:pt-[calc(84px+env(safe-area-inset-top))]">{children}</div>
        <SiteFooter />
        <Toaster />
        <ArrivalMarker />
      </body>
    </html>
  );
}
