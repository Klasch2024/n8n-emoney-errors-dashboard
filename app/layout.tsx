import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "N8N Errors Dashboard",
  description: "Professional debugging dashboard for n8n workflows",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

