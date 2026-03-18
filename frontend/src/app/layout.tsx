import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "CA Mega Suite — AI-Powered Platform for Chartered Accountants",
  description: "All-in-one AI platform for CAs: Bank Statement Processing, Tally Export, GST Automation, Financial Calculators, and Client Management.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
