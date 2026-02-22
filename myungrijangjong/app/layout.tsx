import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "명리정종(命理正宗) — 삼십 년 적공의 명리 아카이브",
    template: "%s | 명리정종",
  },
  description:
    "30년 경력 명리학자가 쌓은 1,000건 이상의 상담 사례와 정통 이론 강론. 자평진전(子平眞詮)과 적천수(滴天髓)에 근거한 정통 명리학 전문 아카이브입니다.",
  keywords: [
    "명리학",
    "사주",
    "사주팔자",
    "운세",
    "60갑자",
    "오행",
    "십신",
    "용신",
    "일주",
    "명리정종",
    "자평진전",
    "적천수",
  ],
  authors: [{ name: "명리정종" }],
  creator: "명리정종",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "명리정종(命理正宗)",
    title: "명리정종(命理正宗) — 삼십 년 적공의 명리 아카이브",
    description:
      "30년 경력 명리학자의 1,000건 상담 사례와 정통 명리 이론 강론",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen flex flex-col relative z-10">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
