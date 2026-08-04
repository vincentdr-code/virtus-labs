import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Convenientia Ops",
  description: "Internal operations dashboard",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-bg-primary text-text-primary flex">
        <Sidebar />
        <main className="flex-1 flex flex-col min-h-screen overflow-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
