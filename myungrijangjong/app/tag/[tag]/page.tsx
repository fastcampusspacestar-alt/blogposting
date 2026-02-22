import type { Metadata } from "next";
import Link from "next/link";
import { getPostsByTag, getAllTags } from "@/lib/posts";
import PostCard from "@/components/PostCard";

interface Props {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  const tags = getAllTags();
  return tags.map(({ tag }) => ({ tag: encodeURIComponent(tag) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `#${decoded} 태그`,
    description: `'${decoded}' 태그가 붙은 모든 포스팅 목록`,
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const posts = getPostsByTag(decoded);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <header
        className="mb-8 pb-5 border-b"
        style={{ borderColor: "var(--border-color)" }}
      >
        <nav
          className="text-xs mb-3"
          style={{ color: "var(--ink-light)", fontFamily: "var(--font-serif)" }}
        >
          <Link href="/" style={{ color: "var(--nakwan)" }}>홈</Link>
          {" "}›{" "}
          <Link href="/blog" style={{ color: "var(--nakwan)" }}>전체 글</Link>
          {" "}› 태그
        </nav>
        <h1
          className="text-2xl font-extrabold"
          style={{ color: "var(--ink)", fontFamily: "var(--font-serif)" }}
        >
          <span style={{ color: "var(--nakwan)" }}>#</span>
          {decoded}
        </h1>
        <p
          className="text-sm mt-2"
          style={{ color: "var(--ink-light)", fontFamily: "var(--font-serif)" }}
        >
          {decoded} 태그가 붙은 포스팅 {posts.length}편
        </p>
      </header>

      {posts.length === 0 ? (
        <div
          className="text-center py-16 border"
          style={{ borderColor: "var(--border-color)" }}
        >
          <p className="text-base" style={{ color: "var(--ink-light)", fontFamily: "var(--font-serif)" }}>
            해당 태그의 포스팅이 없습니다.
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

