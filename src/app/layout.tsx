import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mortgage AI Planner | 주택담보대출 AI 분석 서비스",
  description:
    "유튜브 영상 분석부터 맞춤형 대출 로드맵까지. AI가 당신의 주택담보대출 성공을 도와드립니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1 bg-gray-50 pb-20 md:pb-0">{children}</main>
      </body>
    </html>
  );
}
