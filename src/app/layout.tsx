import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "cdcalcula — Apple-inspired CD Calculator",
  description:
    "A touch-friendly CD calculator for cdcalcula.com that helps families visualize savings in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
