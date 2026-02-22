import { getCaseTimeline } from "@/lib/posts";

export default function Timeline() {
  const timeline = getCaseTimeline();
  const maxCount = Math.max(...timeline.map((t) => t.count), 1);

  return (
    <section
      className="p-6 border"
      style={{
        backgroundColor: "var(--paper)",
        borderColor: "var(--border-color)",
      }}
    >
      <h2
        className="text-lg font-bold mb-5 pb-2 border-b flex items-center gap-2"
        style={{
          color: "var(--nakwan)",
          borderColor: "var(--border-color)",
          fontFamily: "var(--font-serif)",
        }}
      >
        <span>◈</span>
        <span>상담 이력 연표</span>
        <span className="text-sm font-normal ml-auto" style={{ color: "var(--ink-light)" }}>
          2015 — 2026
        </span>
      </h2>

      {timeline.length === 0 ? (
        <p className="text-sm text-center py-4" style={{ color: "var(--ink-light)", fontFamily: "var(--font-serif)" }}>
          상담 기록을 불러오는 중입니다.
        </p>
      ) : (
        <div className="space-y-3">
          {timeline.map(({ year, count }) => {
            const pct = Math.round((count / maxCount) * 100);
            return (
              <div key={year} className="flex items-center gap-3">
                <span
                  className="text-sm font-bold w-12 shrink-0 text-right"
                  style={{ color: "var(--ink)", fontFamily: "var(--font-serif)" }}
                >
                  {year}
                </span>
                <div className="flex-1 flex items-center gap-2">
                  {/* 막대 그래프 */}
                  <div
                    className="h-4 transition-all duration-500 relative"
                    style={{
                      width: `${pct}%`,
                      minWidth: "8px",
                      background: `linear-gradient(to right, var(--nakwan), rgba(139,0,0,0.6))`,
                    }}
                  />
                  <span
                    className="text-xs shrink-0"
                    style={{ color: "var(--ink-light)", fontFamily: "var(--font-serif)" }}
                  >
                    {count}건
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p
        className="text-xs mt-4 pt-3 border-t"
        style={{
          color: "var(--ink-light)",
          borderColor: "var(--border-color)",
          fontFamily: "var(--font-serif)",
        }}
      >
        * 모든 상담 내용은 의뢰인의 동의 하에 익명 처리되었습니다.
      </p>
    </section>
  );
}

