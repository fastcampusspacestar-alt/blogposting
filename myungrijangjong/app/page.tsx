import Link from "next/link";
import { getAllPosts, CATEGORY_LABELS, getCategoryCounts, type Category } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import Timeline from "@/components/Timeline";
import SearchBar from "@/components/SearchBar";

const CATEGORY_ICONS: Record<Category, string> = {
  theory: "☯",
  analysis: "甲",
  cases: "📜",
  seasonal: "🌿",
  essays: "✦",
};

const CATEGORY_ORDER: Category[] = ["theory", "analysis", "cases", "seasonal", "essays"];

export default function HomePage() {
  const recentPosts = getAllPosts().slice(0, 6);
  const featuredPosts = getAllPosts().slice(0, 3);
  const counts = getCategoryCounts();
  const totalPosts = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <>
      {/* ===================== HERO ===================== */}
      <section
        className="relative text-center py-16 md:py-24 px-4 overflow-hidden border-b"
        style={{
          background:
            "linear-gradient(135deg, #EDE8D0 0%, var(--hanji) 50%, #EAE0C8 100%)",
          borderColor: "var(--border-color)",
        }}
      >
        {/* 장식용 한자 워터마크 */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
          aria-hidden
        >
          <span
            className="text-[280px] font-black opacity-[0.03] leading-none"
            style={{ color: "var(--ink)", fontFamily: "var(--font-serif)" }}
          >
            命
          </span>
        </div>

        {/* 낙관 스탬프 스타일 */}
        <div
          className="inline-flex items-center gap-1 mb-4 px-3 py-1 border text-xs tracking-[0.3em]"
          style={{
            borderColor: "var(--nakwan)",
            color: "var(--nakwan)",
            fontFamily: "var(--font-serif)",
          }}
        >
          ◈ 命理正宗 ◈
        </div>

        <h2
          className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight tracking-wide relative z-10"
          style={{ color: "var(--ink)", fontFamily: "var(--font-serif)" }}
        >
          삼십 년 적공(積功)의
          <br />
          <span style={{ color: "var(--nakwan)" }}>명리 아카이브</span>
        </h2>

        <p
          className="max-w-xl mx-auto text-base md:text-lg mb-2 relative z-10 leading-relaxed"
          style={{ color: "var(--ink-light)", fontFamily: "var(--font-serif)" }}
        >
          자평진전(子平眞詮)과 적천수(滴天髓)의 법도에 따라,
          <br className="hidden md:block" />
          {totalPosts.toLocaleString()}편의 강론과 상담 사례를 담았습니다.
        </p>

        <p
          className="text-sm mb-8 italic relative z-10"
          style={{ color: "var(--nakwan)", fontFamily: "var(--font-serif)" }}
        >
          &ldquo;命由天定이나 運由己造라.&rdquo;
        </p>

        {/* 검색창 */}
        <div className="max-w-xl mx-auto relative z-10">
          <SearchBar placeholder="용신, 일주, 상담 사례 검색..." />
        </div>

        {/* 통계 */}
        <div className="flex justify-center gap-6 mt-8 relative z-10 flex-wrap">
          <div className="text-center">
            <div
              className="text-2xl font-extrabold"
              style={{ color: "var(--nakwan)", fontFamily: "var(--font-serif)" }}
            >
              {totalPosts.toLocaleString()}+
            </div>
            <div className="text-xs" style={{ color: "var(--ink-light)" }}>
              전체 포스팅
            </div>
          </div>
          <div
            className="w-px"
            style={{ backgroundColor: "var(--border-color)" }}
          />
          <div className="text-center">
            <div
              className="text-2xl font-extrabold"
              style={{ color: "var(--nakwan)", fontFamily: "var(--font-serif)" }}
            >
              {counts.cases.toLocaleString()}+
            </div>
            <div className="text-xs" style={{ color: "var(--ink-light)" }}>
              실전 상담록
            </div>
          </div>
          <div
            className="w-px"
            style={{ backgroundColor: "var(--border-color)" }}
          />
          <div className="text-center">
            <div
              className="text-2xl font-extrabold"
              style={{ color: "var(--nakwan)", fontFamily: "var(--font-serif)" }}
            >
              30년+
            </div>
            <div className="text-xs" style={{ color: "var(--ink-light)" }}>
              명리 경력
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* ===================== 카테고리 카드 ===================== */}
        <section className="mb-14">
          <SectionTitle title="강론 분야" subtitle="정통 명리학의 다섯 기둥" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {CATEGORY_ORDER.map((cat) => (
              <Link
                key={cat}
                href={`/category/${cat}`}
                className="group block hanji-card text-center p-4 hover:scale-[1.03] transition-transform"
              >
                <div
                  className="text-2xl mb-2"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {CATEGORY_ICONS[cat]}
                </div>
                <div
                  className="text-sm font-bold"
                  style={{ color: "var(--ink)", fontFamily: "var(--font-serif)" }}
                >
                  {CATEGORY_LABELS[cat]}
                </div>
                <div
                  className="text-xs mt-1"
                  style={{ color: "var(--nakwan)", fontFamily: "var(--font-serif)" }}
                >
                  {counts[cat]}편
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽 메인 컬럼 */}
          <div className="lg:col-span-2 space-y-10">
            {/* ===================== 최근 포스팅 ===================== */}
            <section>
              <SectionTitle title="최근 포스팅" subtitle="새롭게 기록된 이야기" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredPosts.length > 0 ? (
                  featuredPosts.map((post) => (
                    <PostCard key={post.slug} post={post} variant="featured" />
                  ))
                ) : (
                  <EmptyMessage />
                )}
              </div>
              {recentPosts.length > 3 && (
                <div className="grid grid-cols-1 mt-4 gap-2">
                  {recentPosts.slice(3, 7).map((post) => (
                    <PostCard key={post.slug} post={post} variant="compact" />
                  ))}
                </div>
              )}
              <div className="text-center mt-5">
                <Link
                  href="/blog"
                  className="btn-outline text-sm inline-block"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  전체 글 보기 →
                </Link>
              </div>
            </section>

            {/* ===================== 실전 상담록 미리보기 ===================== */}
            <section>
              <SectionTitle title="실전 상담록" subtitle="명식으로 풀어낸 삶의 고민들" />
              <CasesPreview />
            </section>
          </div>

          {/* 오른쪽 사이드바 */}
          <aside className="space-y-6">
            {/* 상담 연표 */}
            <Timeline />

            {/* 인기 태그 */}
            <PopularTags />

            {/* 명리강론 최근 글 */}
            <CategorySidebar category="theory" title="명리강론 최근 글" />
          </aside>
        </div>
      </div>
    </>
  );
}

// ── 서브 컴포넌트 ──────────────────────────────────────

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-3">
        <h2
          className="text-xl font-extrabold"
          style={{ color: "var(--ink)", fontFamily: "var(--font-serif)" }}
        >
          {title}
        </h2>
        <div
          className="flex-1 h-px"
          style={{ backgroundColor: "var(--border-color)" }}
        />
        <span
          className="text-xs"
          style={{ color: "var(--nakwan)" }}
        >
          ◈
        </span>
      </div>
      <p className="text-xs mt-1" style={{ color: "var(--ink-light)", fontFamily: "var(--font-serif)" }}>
        {subtitle}
      </p>
    </div>
  );
}

function EmptyMessage() {
  return (
    <div
      className="col-span-2 py-10 text-center border"
      style={{ borderColor: "var(--border-color)", fontFamily: "var(--font-serif)" }}
    >
      <p className="text-sm" style={{ color: "var(--ink-light)" }}>
        Python 생성 스크립트를 실행하면 포스팅이 표시됩니다.
      </p>
      <p className="text-xs mt-2" style={{ color: "var(--nakwan)" }}>
        python generate_posts.py
      </p>
    </div>
  );
}

function CasesPreview() {
  const cases = getAllPosts()
    .filter((p) => p.category === "cases")
    .slice(0, 5);

  if (cases.length === 0) {
    return (
      <EmptyMessage />
    );
  }

  return (
    <div
      className="border"
      style={{ borderColor: "var(--border-color)" }}
    >
      {cases.map((post, i) => (
        <PostCard key={post.slug} post={post} variant="compact" />
      ))}
      <div className="p-3 text-center border-t" style={{ borderColor: "var(--border-color)" }}>
        <Link
          href="/category/cases"
          className="text-xs transition-colors"
          style={{ color: "var(--nakwan)", fontFamily: "var(--font-serif)" }}
        >
          상담록 전체 보기 ({getAllPosts().filter(p => p.category === "cases").length}건) →
        </Link>
      </div>
    </div>
  );
}

function PopularTags() {
  const allPosts = getAllPosts();
  const tagCounts: Record<string, number> = {};
  allPosts.forEach((p) =>
    p.tags.forEach((t) => {
      tagCounts[t] = (tagCounts[t] ?? 0) + 1;
    })
  );
  const tags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  if (tags.length === 0) return null;

  return (
    <section
      className="p-5 border"
      style={{ borderColor: "var(--border-color)", backgroundColor: "var(--paper)" }}
    >
      <h3
        className="text-sm font-bold mb-3 pb-2 border-b"
        style={{
          color: "var(--nakwan)",
          borderColor: "var(--border-color)",
          fontFamily: "var(--font-serif)",
        }}
      >
        ◈ 인기 태그
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {tags.map(([tag, count]) => (
          <Link key={tag} href={`/tag/${encodeURIComponent(tag)}`}>
            <span className="tag-badge text-xs">
              #{tag}
              <span
                className="ml-1 text-[10px]"
                style={{ color: "var(--ink-light)" }}
              >
                {count}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function CategorySidebar({ category, title }: { category: Category; title: string }) {
  const posts = getAllPosts()
    .filter((p) => p.category === category)
    .slice(0, 5);

  if (posts.length === 0) return null;

  return (
    <section
      className="p-5 border"
      style={{ borderColor: "var(--border-color)", backgroundColor: "var(--paper)" }}
    >
      <h3
        className="text-sm font-bold mb-3 pb-2 border-b"
        style={{
          color: "var(--nakwan)",
          borderColor: "var(--border-color)",
          fontFamily: "var(--font-serif)",
        }}
      >
        ◈ {title}
      </h3>
      <ul className="space-y-2">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="text-xs leading-snug block hover:text-nakwan transition-colors"
              style={{ color: "var(--ink)", fontFamily: "var(--font-serif)" }}
            >
              ▸ {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
