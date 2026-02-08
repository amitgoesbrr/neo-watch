import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// {{{ Font Configuration
const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});
// }}}

// {{{ Metadata
export const metadata: Metadata = {
  title: "Neo-Watch | Near-Earth Object Monitoring",
  description:
    "Real-time tracking and risk analysis of Near-Earth Objects. Monitor asteroids, receive alerts, and stay informed about cosmic threats.",
  keywords: [
    "asteroid",
    "NEO",
    "near-earth object",
    "space",
    "NASA",
    "astronomy",
    "tracking",
  ],
  authors: [{ name: "Neo-Watch Team" }],
  openGraph: {
    title: "Neo-Watch | Near-Earth Object Monitoring",
    description: "Track the cosmos. Protect Earth.",
    type: "website",
  },
};
// }}}

import { AuthProvider } from "@/context/AuthContext";

// ... existing code ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <AuthProvider>
          {/* Background Effects */}
          <div className="nebula-bg" aria-hidden="true" />
          <div className="starfield" aria-hidden="true" />

          {/* Main Content */}
          <main className="relative z-10">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
// }}}
