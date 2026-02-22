"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="border-t mt-16"
      style={{
        borderColor: "var(--border-color)",
        backgroundColor: "var(--hanji-dark)",
      }}
    >
      {/* 장식선 */}
      <div
        className="h-px mx-8"
        style={{
          background:
            "linear-gradient(to right, transparent, var(--nakwan) 30%, var(--nakwan) 70%, transparent)",
          marginBottom: "0",
        }}
      />

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* 소개 */}
          <div>
            <h3
              className="text-base font-bold mb-3 pb-2 border-b"
              style={{
                color: "var(--nakwan)",
                borderColor: "var(--border-color)",
                fontFamily: "var(--font-serif)",
              }}
            >
              명리정종 命理正宗
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--ink-light)", fontFamily: "var(--font-serif)" }}
            >
              자평진전(子平眞詮)과 적천수(滴天髓)의 정통 이론을 계승하여
              삼십 년 동안 쌓은 상담 경험을 기록한 명리학 아카이브입니다.
            </p>
          </div>

          {/* 카테고리 */}
          <div>
            <h3
              className="text-base font-bold mb-3 pb-2 border-b"
              style={{
                color: "var(--nakwan)",
                borderColor: "var(--border-color)",
                fontFamily: "var(--font-serif)",
              }}
            >
              카테고리
            </h3>
            <ul className="space-y-1.5">
              {[
                { href: "/category/theory", label: "명리강론" },
                { href: "/category/analysis", label: "60갑자 정해" },
                { href: "/category/cases", label: "실전 상담록" },
                { href: "/category/seasonal", label: "절기 서신" },
                { href: "/category/essays", label: "인생 철학" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm transition-colors"
                    style={{ color: "var(--ink-light)", fontFamily: "var(--font-serif)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--nakwan)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--ink-light)";
                    }}
                  >
                    ▸ {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 명언 */}
          <div>
            <h3
              className="text-base font-bold mb-3 pb-2 border-b"
              style={{
                color: "var(--nakwan)",
                borderColor: "var(--border-color)",
                fontFamily: "var(--font-serif)",
              }}
            >
              오늘의 명구
            </h3>
            <blockquote
              className="text-sm italic leading-relaxed pl-3 border-l-2"
              style={{
                color: "var(--ink-light)",
                borderColor: "var(--nakwan)",
                fontFamily: "var(--font-serif)",
              }}
            >
              &ldquo;命由天定이나 運由己造라.
              <br />
              명은 하늘이 정하나 운은 스스로 만든다.&rdquo;
            </blockquote>
          </div>
        </div>

        {/* 하단 카피라이트 */}
        <div
          className="pt-6 border-t text-center text-xs"
          style={{
            borderColor: "var(--border-color)",
            color: "var(--ink-light)",
            fontFamily: "var(--font-serif)",
          }}
        >
          <div className="mb-1" style={{ color: "var(--nakwan)" }}>
            ◈ 命理正宗 ◈
          </div>
          <p>
            본 사이트의 모든 콘텐츠는 명리정종에 귀속됩니다. 무단 전재 및
            재배포를 금합니다.
          </p>
          <p className="mt-1">
            상담 내용은 익명화 처리되었으며, 개인 식별 정보는 포함되어 있지
            않습니다.
          </p>
        </div>
      </div>
    </footer>
  );
}

