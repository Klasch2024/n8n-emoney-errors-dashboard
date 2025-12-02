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
      <body 
        className="min-h-screen bg-fixed"
        style={{
          backgroundImage: 'linear-gradient(to bottom right, #0a0a0a 0%, #1a0f0a 50%, #ff8c2e 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="min-h-screen bg-[rgba(0,0,0,0.4)]">
          {children}
        </div>
      </body>
    </html>
  );
}

