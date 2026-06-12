import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://phazr.co"),
  title: "Phazr — Finally Understand Your Home Purchase",
  description:
    "Phazr organizes your escrow, explains your documents, tracks your deadlines, and catches costly mistakes — so you close with confidence.",
  openGraph: {
    title: "Phazr — Finally Understand Your Home Purchase",
    description:
      "From serious shopping to keys in hand. AI-powered document intelligence, deadline tracking, loan comparison, and wire fraud protection for homebuyers.",
    siteName: "Phazr",
    type: "website",
    locale: "en_US",
    // TODO(post-beta): replace with a purpose-made 1200x630 social card.
    images: ["/PHAZR-Logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Phazr — Finally Understand Your Home Purchase",
    description:
      "AI reads your real estate documents and tells you what they mean. Track deadlines, compare loans, prevent wire fraud. Free to start.",
    images: ["/PHAZR-Logo.png"],
  },
  keywords: [
    "homebuyer",
    "escrow",
    "closing disclosure",
    "loan estimate",
    "home buying checklist",
    "real estate documents",
    "closing costs",
    "wire fraud protection",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerif.variable}`}>
      <body className="font-sans antialiased">
        <QueryProvider>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
