import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import DisclaimerModal from "@/components/DisclaimerModal";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SmartPCChecker | AI-Powered PC Diagnostics (No Login, 100% Secure)",
  description: "Free, professional AI-powered PC health scanner. No login required. Perform deep system audits, check SSD health, analyze driver errors, and get BSOD reports instantly. 100% secure, private, and simple diagnostics for Windows systems.",
  keywords: [
    "AI PC check", "no login diagnostics", "free hardware check", "PC health scan", 
    "SSD SMART health", "RAM speed test", "driver error analyzer", "BSOD crash report", 
    "system audit tool", "computer repair assistant", "Windows optimization", 
    "PC technician suite", "hardware monitor", "CPU temperature check", "GPU info tool",
    "monitor test", "keyboard diagnostic", "mic check online", "LCD dead pixel test"
  ],
  authors: [{ name: "SmartPCChecker Team" }],
  openGraph: {
    title: "SmartPCChecker | Professional AI PC Diagnostics",
    description: "Expert PC health analysis without the hassle. Deep hardware scan, driver audit, and AI recommendations. No account needed, 100% safe.",
    type: "website",
    locale: "en_US",
    siteName: "SmartPCChecker",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DisclaimerModal />
        <div className="app-container">
          <Sidebar />
          <div className="main-content">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
