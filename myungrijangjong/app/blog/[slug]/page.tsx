import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getAllPosts,
  getPostBySlug,
  getRelatedPosts,
  CATEGORY_LABELS,
} from "@/lib/posts";
import PostCard from "@/components/PostCard";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "포스팅을 찾을 수 없습니다" };

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const related = getRelatedPosts(post, 4);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    author: {
      "@type": "Person",
      name: post.author,
    },
    datePublished: post.date,
    keywords: post.tags.join(", "),
    articleSection: CATEGORY_LABELS[post.category],
    inLanguage: "ko-KR",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 메인 콘텐츠 */}
          <article className="lg:col-span-3">
            {/* 브레드크럼 */}
            <nav
              className="text-xs mb-4 flex items-center gap-1"
              style={{ color: "var(--ink-light)", fontFamily: "var(--font-serif)" }}
            >
              <Link href="/" style={{ color: "var(--nakwan)" }}>
                홈
              </Link>
              <span>›</span>
              <Link
                href={`/category/${post.category}`}
                style={{ color: "var(--nakwan)" }}
              >
                {CATEGORY_LABELS[post.category]}
              </Link>
              <span>›</span>
              <span className="truncate max-w-xs">{post.title}</span>
            </nav>

            {/* 포스트 헤더 */}
            <header
              className="pb-6 mb-6 border-b"
              style={{ borderColor: "var(--border-color)" }}
            >
              {/* 낙관 스타일 카테고리 */}
              <div className="mb-3">
                <Link href={`/category/${post.category}`}>
                  <span
                    className="inline-block px-3 py-1 text-sm font-bold tracking-wide"
                    style={{
                      backgroundColor: "var(--nakwan)",
                      color: "white",
                      fontFamily: "var(--font-serif)",
                    }}
                  >
                    {CATEGORY_LABELS[post.category]}
                  </span>
                </Link>
              </div>

              {/* 제목 */}
              <h1
                className="text-2xl md:text-3xl font-extrabold leading-snug mb-4"
                style={{ color: "var(--ink)", fontFamily: "var(--font-serif)" }}
              >
                {post.title}
              </h1>

              {/* 메타 정보 */}
              <div
                className="flex flex-wrap items-center gap-4 text-sm"
                style={{ color: "var(--ink-light)", fontFamily: "var(--font-serif)" }}
              >
                <span>
                  ✦ {post.author}
                </span>
                <span>
                  {new Date(post.date).getFullYear()}년{" "}
                  {new Date(post.date).getMonth() + 1}월{" "}
                  {new Date(post.date).getDate()}일
                </span>
                {post.caseYear && (
                  <span style={{ color: "var(--nakwan)" }}>
                    📋 {post.caseYear}년 상담
                  </span>
                )}
              </div>

              {/* 발췌 */}
              {post.excerpt && (
                <p
                  className="mt-4 text-sm italic leading-relaxed pl-4 border-l-2"
                  style={{
                    color: "var(--ink-light)",
                    borderColor: "var(--nakwan)",
                    fontFamily: "var(--font-serif)",
                  }}
                >
                  {post.excerpt}
                </p>
              )}
            </header>

            {/* 사주 단자 장식 (cases 카테고리만) */}
            {post.category === "cases" && (
              <div
                className="mb-6 p-4 text-center text-xs border"
                style={{
                  borderColor: "var(--border-color)",
                  backgroundColor: "var(--paper)",
                  fontFamily: "var(--font-serif)",
                  color: "var(--ink-light)",
                }}
              >
                🔒 본 상담 기록은 의뢰인의 동의 하에 익명 처리되어 공개됩니다.
                <br />
                이름·나이·거주지 등 개인 식별 정보는 가공되었습니다.
              </div>
            )}

            {/* 본문 */}
            <div
              className="prose-hanji"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />

            {/* 태그 */}
            {post.tags.length > 0 && (
              <div
                className="mt-8 pt-6 border-t flex flex-wrap gap-2"
                style={{ borderColor: "var(--border-color)" }}
              >
                {post.tags.map((tag) => (
                  <Link key={tag} href={`/tag/${encodeURIComponent(tag)}`}>
                    <span className="tag-badge"># {tag}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* 이전/다음 포스트 네비게이션 */}
            <div
              className="mt-8 pt-6 border-t"
              style={{ borderColor: "var(--border-color)" }}
            >
              <Link
                href="/blog"
                className="inline-flex items-center gap-1 text-sm"
                style={{ color: "var(--nakwan)", fontFamily: "var(--font-serif)" }}
              >
                ← 목록으로 돌아가기
              </Link>
            </div>
          </article>

          {/* 사이드바 */}
          <aside className="lg:col-span-1 space-y-5">
            {/* 같은 카테고리 최근 글 */}
            <div
              className="p-4 border"
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
                ◈ {CATEGORY_LABELS[post.category]}
              </h3>
              <ul className="space-y-2">
                {getAllPosts()
                  .filter(
                    (p) =>
                      p.category === post.category && p.slug !== post.slug
                  )
                  .slice(0, 5)
                  .map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={`/blog/${p.slug}`}
                        className="text-xs leading-snug block hover:underline"
                        style={{ color: "var(--ink)", fontFamily: "var(--font-serif)" }}
                      >
                        ▸ {p.title}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>

            {/* 태그 목록 */}
            {post.tags.length > 0 && (
              <div
                className="p-4 border"
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
                  ◈ 이 글의 태그
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <Link key={tag} href={`/tag/${encodeURIComponent(tag)}`}>
                      <span className="tag-badge text-xs">#{tag}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* 관련 포스팅 */}
        {related.length > 0 && (
          <section
            className="mt-12 pt-8 border-t"
            style={{ borderColor: "var(--border-color)" }}
          >
            <h2
              className="text-lg font-bold mb-5"
              style={{ color: "var(--ink)", fontFamily: "var(--font-serif)" }}
            >
              ◈ 함께 읽으면 좋은 글
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

