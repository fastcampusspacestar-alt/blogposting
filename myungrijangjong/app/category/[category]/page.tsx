import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getPostsByCategory,
  CATEGORY_LABELS,
  CATEGORY_DESC,
  type Category,
} from "@/lib/posts";
import PostCard from "@/components/PostCard";

const VALID_CATEGORIES: Category[] = [
  "theory",
  "analysis",
  "cases",
  "seasonal",
  "essays",
];

interface Props {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return VALID_CATEGORIES.map((c) => ({ category: c }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  if (!VALID_CATEGORIES.includes(category as Category)) {
    return { title: "카테고리를 찾을 수 없습니다" };
  }
  const cat = category as Category;
  return {
    title: CATEGORY_LABELS[cat],
    description: CATEGORY_DESC[cat],
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  if (!VALID_CATEGORIES.includes(category as Category)) notFound();

  const cat = category as Category;
  const posts = getPostsByCategory(cat);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* 헤더 */}
      <header
        className="mb-8 pb-6 border-b"
        style={{ borderColor: "var(--border-color)" }}
      >
        <nav
          className="text-xs mb-3"
          style={{ color: "var(--ink-light)", fontFamily: "var(--font-serif)" }}
        >
          <Link href="/" style={{ color: "var(--nakwan)" }}>홈</Link>
          {" "}›{" "}
          <Link href="/blog" style={{ color: "var(--nakwan)" }}>전체 글</Link>
          {" "}›{" "}
          {CATEGORY_LABELS[cat]}
        </nav>
        <div
          className="text-xs tracking-[0.3em] mb-1"
          style={{ color: "var(--nakwan)", fontFamily: "var(--font-serif)" }}
        >
          命理正宗
        </div>
        <h1
          className="text-3xl font-extrabold mb-2"
          style={{ color: "var(--ink)", fontFamily: "var(--font-serif)" }}
        >
          {CATEGORY_LABELS[cat]}
        </h1>
        <p
          className="text-sm"
          style={{ color: "var(--ink-light)", fontFamily: "var(--font-serif)" }}
        >
          {CATEGORY_DESC[cat]}
        </p>
        <p
          className="text-xs mt-2"
          style={{ color: "var(--nakwan)", fontFamily: "var(--font-serif)" }}
        >
          총 {posts.length}편
        </p>
      </header>

      {/* 포스트 그리드 */}
      {posts.length === 0 ? (
        <div
          className="text-center py-16 border"
          style={{ borderColor: "var(--border-color)" }}
        >
          <p
            className="text-base"
            style={{ color: "var(--ink-light)", fontFamily: "var(--font-serif)" }}
          >
            아직 등록된 포스팅이 없습니다.
          </p>
          <p
            className="text-sm mt-2"
            style={{ color: "var(--nakwan)", fontFamily: "var(--font-serif)" }}
          >
            python generate_posts.py 를 실행해 주세요.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

