import { getAllPosts, getAllTags, CATEGORY_LABELS, type Category } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "전체 글",
  description: "명리정종의 모든 강론과 상담 사례를 한눈에 보실 수 있습니다.",
};

const CATEGORIES: { value: Category | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "theory", label: "명리강론" },
  { value: "analysis", label: "60갑자 정해" },
  { value: "cases", label: "실전 상담록" },
  { value: "seasonal", label: "절기 서신" },
  { value: "essays", label: "인생 철학" },
];

const PAGE_SIZE = 24;

interface Props {
  searchParams: Promise<{ category?: string; tag?: string; page?: string }>;
}

export default async function BlogPage({ searchParams }: Props) {
  const { category: catParam, tag: tagParam, page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));

  let posts = getAllPosts();

  // 카테고리 필터
  if (catParam && catParam !== "all") {
    posts = posts.filter((p) => p.category === catParam as Category);
  }

  // 태그 필터
  if (tagParam) {
    posts = posts.filter((p) => p.tags.includes(tagParam));
  }

  const total = posts.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const paginatedPosts = posts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const popularTags = getAllTags().slice(0, 16);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* 헤더 */}
      <div className="mb-8 pb-5 border-b" style={{ borderColor: "var(--border-color)" }}>
        <div
          className="text-xs tracking-[0.3em] mb-1"
          style={{ color: "var(--nakwan)", fontFamily: "var(--font-serif)" }}
        >
          命理正宗 아카이브
        </div>
        <h1
          className="text-3xl font-extrabold"
          style={{ color: "var(--ink)", fontFamily: "var(--font-serif)" }}
        >
          전체 글
        </h1>
        <p className="text-sm mt-2" style={{ color: "var(--ink-light)", fontFamily: "var(--font-serif)" }}>
          총 {total}편의 포스팅
          {catParam && catParam !== "all" && (
            <> · <span style={{ color: "var(--nakwan)" }}>{CATEGORY_LABELS[catParam as Category]}</span> 필터 중</>
          )}
          {tagParam && (
            <> · <span style={{ color: "var(--nakwan)" }}>#{tagParam}</span> 태그 필터 중</>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 사이드바 */}
        <aside className="lg:col-span-1 space-y-5">
          {/* 카테고리 */}
          <nav
            className="p-4 border"
            style={{ borderColor: "var(--border-color)", backgroundColor: "var(--paper)" }}
          >
            <h2
              className="text-sm font-bold mb-3 pb-2 border-b"
              style={{
                color: "var(--nakwan)",
                borderColor: "var(--border-color)",
                fontFamily: "var(--font-serif)",
              }}
            >
              ◈ 카테고리
            </h2>
            <ul className="space-y-1">
              {CATEGORIES.map(({ value, label }) => {
                const isActive =
                  catParam === value || (!catParam && value === "all");
                return (
                  <li key={value}>
                    <Link
                      href={value === "all" ? "/blog" : `/blog?category=${value}`}
                      className="block text-sm px-2 py-1.5 transition-colors"
                      style={{
                        color: isActive ? "white" : "var(--ink)",
                        backgroundColor: isActive ? "var(--nakwan)" : "transparent",
                        fontFamily: "var(--font-serif)",
                      }}
                    >
                      {isActive ? "▶" : "▸"} {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* 태그 */}
          {popularTags.length > 0 && (
            <div
              className="p-4 border"
              style={{ borderColor: "var(--border-color)", backgroundColor: "var(--paper)" }}
            >
              <h2
                className="text-sm font-bold mb-3 pb-2 border-b"
                style={{
                  color: "var(--nakwan)",
                  borderColor: "var(--border-color)",
                  fontFamily: "var(--font-serif)",
                }}
              >
                ◈ 태그 필터
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {popularTags.map(({ tag, count }) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                  >
                    <span
                      className="tag-badge text-xs"
                      style={
                        tagParam === tag
                          ? {
                              backgroundColor: "var(--nakwan)",
                              color: "white",
                              border: "1px solid var(--nakwan)",
                            }
                          : {}
                      }
                    >
                      #{tag}
                      <span
                        className="ml-1 text-[10px]"
                        style={{ opacity: 0.7 }}
                      >
                        {count}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* 포스트 목록 */}
        <div className="lg:col-span-3">
          {paginatedPosts.length === 0 ? (
            <div
              className="text-center py-16 border"
              style={{ borderColor: "var(--border-color)", fontFamily: "var(--font-serif)" }}
            >
              <p className="text-lg" style={{ color: "var(--ink-light)" }}>
                해당하는 포스팅이 없습니다.
              </p>
              <Link
                href="/blog"
                className="text-sm mt-3 inline-block"
                style={{ color: "var(--nakwan)" }}
              >
                전체 글 보기 →
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedPosts.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <Pagination
                  current={page}
                  total={totalPages}
                  catParam={catParam}
                  tagParam={tagParam}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Pagination({
  current,
  total,
  catParam,
  tagParam,
}: {
  current: number;
  total: number;
  catParam?: string;
  tagParam?: string;
}) {
  function pageUrl(p: number) {
    const params = new URLSearchParams();
    if (catParam && catParam !== "all") params.set("category", catParam);
    if (tagParam) params.set("tag", tagParam);
    if (p > 1) params.set("page", p.toString());
    const qs = params.toString();
    return `/blog${qs ? `?${qs}` : ""}`;
  }

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - 2 && i <= current + 2)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex justify-center gap-1 mt-8">
      {current > 1 && (
        <Link
          href={pageUrl(current - 1)}
          className="px-3 py-2 text-sm border"
          style={{
            borderColor: "var(--border-color)",
            color: "var(--ink)",
            fontFamily: "var(--font-serif)",
          }}
        >
          ←
        </Link>
      )}
      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="px-3 py-2 text-sm"
            style={{ color: "var(--ink-light)" }}
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            href={pageUrl(p)}
            className="px-3 py-2 text-sm border transition-colors"
            style={{
              borderColor: p === current ? "var(--nakwan)" : "var(--border-color)",
              backgroundColor: p === current ? "var(--nakwan)" : "transparent",
              color: p === current ? "white" : "var(--ink)",
              fontFamily: "var(--font-serif)",
            }}
          >
            {p}
          </Link>
        )
      )}
      {current < total && (
        <Link
          href={pageUrl(current + 1)}
          className="px-3 py-2 text-sm border"
          style={{
            borderColor: "var(--border-color)",
            color: "var(--ink)",
            fontFamily: "var(--font-serif)",
          }}
        >
          →
        </Link>
      )}
    </div>
  );
}

