import type { Metadata, Viewport } from "next";
import { Fraunces, Geist_Mono, Pixelify_Sans, Young_Serif } from "next/font/google";
import localFont from "next/font/local";
import { ArrivalMarker } from "@/components/arrival-marker";
import { ScrollBlur } from "@/components/scroll-blur";
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
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      <body className="flex min-h-full flex-col pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]">
        <SiteHeader />
        <ScrollBlur />
        {/* The header floats over the page, so content starts below it. */}
        <div className="flex-1 pt-[76px] sm:pt-[84px]">{children}</div>
        <Toaster />
        <ArrivalMarker />
      </body>
    </html>
  );
}
