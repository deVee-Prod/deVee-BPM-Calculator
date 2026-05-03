import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BPM Calculator",
  description: "Professional BPM detection tool by deVee Boutique Label",
  icons: {
    icon: "/bpm-icon.png",
    apple: "/apple-touch-icon.png",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-black">{children}</body>
    </html>
  );
}