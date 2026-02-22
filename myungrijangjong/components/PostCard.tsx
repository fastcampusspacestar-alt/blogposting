import Link from "next/link";
import type { PostMeta } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";

interface PostCardProps {
  post: PostMeta;
  variant?: "default" | "compact" | "featured";
}

const CATEGORY_COLORS: Record<string, string> = {
  theory: "#1a3a5c",
  analysis: "#2d4a1e",
  cases: "#8B0000",
  seasonal: "#5a3e00",
  essays: "#3d1a5c",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function PostCard({ post, variant = "default" }: PostCardProps) {
  const categoryColor = CATEGORY_COLORS[post.category] ?? "var(--nakwan)";
  const label = CATEGORY_LABELS[post.category];

  if (variant === "compact") {
    return (
      <Link href={`/blog/${post.slug}`} className="group block">
        <article
          className="flex gap-3 py-3 border-b transition-colors"
          style={{ borderColor: "var(--border-color)" }}
        >
          <span
            className="text-xs px-2 py-0.5 shrink-0 mt-0.5 h-fit"
            style={{
              backgroundColor: categoryColor,
              color: "white",
              fontFamily: "var(--font-serif)",
            }}
          >
            {label}
          </span>
          <div className="flex-1 min-w-0">
            <h3
              className="text-sm font-bold truncate group-hover:underline"
              style={{ color: "var(--ink)", fontFamily: "var(--font-serif)" }}
            >
              {post.title}
            </h3>
            <time
              className="text-xs"
              style={{ color: "var(--ink-light)" }}
            >
              {formatDate(post.date)}
            </time>
          </div>
        </article>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link href={`/blog/${post.slug}`} className="group block h-full">
        <article
          className="hanji-card h-full flex flex-col p-6"
          style={{ minHeight: "220px" }}
        >
          {/* 카테고리 배지 */}
          <div className="mb-3">
            <span
              className="text-xs px-2 py-1 font-bold tracking-wide"
              style={{
                backgroundColor: categoryColor,
                color: "white",
                fontFamily: "var(--font-serif)",
              }}
            >
              {label}
            </span>
          </div>

          {/* 제목 */}
          <h2
            className="text-xl font-bold leading-snug mb-3 group-hover:underline decoration-nakwan"
            style={{
              color: "var(--ink)",
              fontFamily: "var(--font-serif)",
              textDecorationColor: "var(--nakwan)",
            }}
          >
            {post.title}
          </h2>

          {/* 발췌 */}
          <p
            className="text-sm flex-1 leading-relaxed line-clamp-3 mb-4"
            style={{ color: "var(--ink-light)", fontFamily: "var(--font-serif)" }}
          >
            {post.excerpt}
          </p>

          {/* 태그 및 날짜 */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t"
            style={{ borderColor: "var(--border-color)" }}>
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="tag-badge text-xs">
                  #{tag}
                </span>
              ))}
            </div>
            <time
              className="text-xs shrink-0"
              style={{ color: "var(--ink-light)" }}
            >
              {formatDate(post.date)}
            </time>
          </div>
        </article>
      </Link>
    );
  }

  // default
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="hanji-card p-5">
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <span
            className="text-xs px-2 py-0.5 font-bold tracking-wide shrink-0"
            style={{
              backgroundColor: categoryColor,
              color: "white",
              fontFamily: "var(--font-serif)",
            }}
          >
            {label}
          </span>
          <time
            className="text-xs shrink-0"
            style={{ color: "var(--ink-light)", fontFamily: "var(--font-serif)" }}
          >
            {formatDate(post.date)}
          </time>
        </div>

        {/* 제목 */}
        <h2
          className="text-base font-bold leading-snug mb-2 group-hover:text-nakwan transition-colors"
          style={{
            color: "var(--ink)",
            fontFamily: "var(--font-serif)",
          }}
        >
          {post.title}
        </h2>

        {/* 발췌 */}
        {post.excerpt && (
          <p
            className="text-sm leading-relaxed line-clamp-2 mb-3"
            style={{ color: "var(--ink-light)", fontFamily: "var(--font-serif)" }}
          >
            {post.excerpt}
          </p>
        )}

        {/* 태그 */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="tag-badge">
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs" style={{ color: "var(--ink-light)" }}>
                +{post.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </article>
    </Link>
  );
}

