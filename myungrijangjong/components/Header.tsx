"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "홈" },
  { href: "/blog", label: "전체 글" },
  { href: "/category/theory", label: "명리강론" },
  { href: "/category/cases", label: "상담록" },
  { href: "/category/analysis", label: "60갑자" },
  { href: "/category/seasonal", label: "절기 서신" },
  { href: "/search", label: "검색" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        backgroundColor: "var(--hanji-dark)",
        borderColor: "var(--border-color)",
        boxShadow: "0 1px 8px rgba(45,45,45,0.08)",
      }}
    >
      {/* 상단 타이틀 영역 */}
      <div
        className="text-center py-3 border-b"
        style={{
          borderColor: "var(--border-color)",
          background: "linear-gradient(to bottom, #E8E0C8, var(--hanji-dark))",
        }}
      >
        <Link href="/" className="group inline-block">
          <div
            className="text-xs tracking-[0.35em] mb-0.5"
            style={{ color: "var(--nakwan)", fontFamily: "var(--font-serif)" }}
          >
            命理正宗
          </div>
          <h1
            className="text-2xl md:text-3xl font-extrabold tracking-wider"
            style={{ color: "var(--ink)", fontFamily: "var(--font-serif)" }}
          >
            명리정종
          </h1>
          <div
            className="text-xs tracking-[0.2em] mt-0.5"
            style={{ color: "var(--ink-light)" }}
          >
            三十年 積功의 命理 아카이브
          </div>
        </Link>
      </div>

      {/* 네비게이션 */}
      <nav className="max-w-5xl mx-auto px-4">
        {/* 데스크톱 메뉴 */}
        <ul className="hidden md:flex items-center justify-center gap-0 py-0">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block px-4 py-3 text-sm tracking-wide transition-all duration-150 border-b-2 border-transparent hover:border-nakwan"
                style={{
                  color: "var(--ink)",
                  fontFamily: "var(--font-serif)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--nakwan)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--ink)";
                }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* 모바일 햄버거 */}
        <div className="md:hidden flex items-center justify-between py-2">
          <span
            className="text-sm"
            style={{ color: "var(--ink-light)", fontFamily: "var(--font-serif)" }}
          >
            메뉴
          </span>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2"
            aria-label="메뉴 열기"
          >
            <div
              className="w-5 h-0.5 mb-1.5 transition-all"
              style={{ backgroundColor: "var(--ink)" }}
            />
            <div
              className="w-5 h-0.5 mb-1.5 transition-all"
              style={{ backgroundColor: "var(--ink)" }}
            />
            <div
              className="w-5 h-0.5 transition-all"
              style={{ backgroundColor: "var(--ink)" }}
            />
          </button>
        </div>

        {/* 모바일 드롭다운 */}
        {menuOpen && (
          <ul
            className="md:hidden border-t"
            style={{ borderColor: "var(--border-color)" }}
          >
            {NAV_ITEMS.map((item) => (
              <li
                key={item.href}
                className="border-b"
                style={{ borderColor: "var(--border-color)" }}
              >
                <Link
                  href={item.href}
                  className="block px-4 py-3 text-sm"
                  style={{
                    color: "var(--ink)",
                    fontFamily: "var(--font-serif)",
                  }}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </header>
  );
}

