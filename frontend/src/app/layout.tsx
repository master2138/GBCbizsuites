import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "CA Mega Suite — AI-Powered Platform for Chartered Accountants",
  description: "All-in-one AI platform for CAs: Bank Statement Processing, Tally Export, GST Automation, Financial Calculators, and Client Management.",
};

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const content = (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );

  // Only wrap with ClerkProvider if the key is available
  if (clerkKey) {
    return <ClerkProvider>{content}</ClerkProvider>;
  }

  return content;
}
