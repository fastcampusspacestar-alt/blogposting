"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Fuse from "fuse.js";
import Link from "next/link";
import type { PostMeta } from "@/lib/types";
import PostCard from "@/components/PostCard";
import SearchBar from "@/components/SearchBar";

export default function SearchClient() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [allPosts, setAllPosts] = useState<PostMeta[]>([]);
  const [results, setResults] = useState<PostMeta[]>([]);
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(true);
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then((data: PostMeta[]) => {
        setAllPosts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const runSearch = useCallback(
    (q: string) => {
      if (!q.trim() || allPosts.length === 0) {
        setResults([]);
        return;
      }
      const t0 = performance.now();
      const fuse = new Fuse(allPosts, {
        keys: [
          { name: "title", weight: 3 },
          { name: "tags", weight: 2 },
          { name: "excerpt", weight: 1.5 },
          { name: "consultType", weight: 1 },
        ],
        threshold: 0.35,
        includeScore: true,
        minMatchCharLength: 1,
      });
      const res = fuse.search(q).map((r) => r.item);
      const t1 = performance.now();
      setResults(res);
      setElapsed(Math.round(t1 - t0));
    },
    [allPosts]
  );

  useEffect(() => {
    runSearch(query);
  }, [query, runSearch]);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <header className="mb-8">
        <div
          className="text-xs tracking-[0.3em] mb-1"
          style={{ color: "var(--nakwan)", fontFamily: "var(--font-serif)" }}
        >
          명리정종 검색
        </div>
        <h1
          className="text-2xl font-extrabold mb-5"
          style={{ color: "var(--ink)", fontFamily: "var(--font-serif)" }}
        >
          포스팅 검색
        </h1>
        <SearchBar placeholder="용신, 진술축미, 부부궁합, 일주..." />
      </header>

      {loading ? (
        <div
          className="text-center py-12"
          style={{ color: "var(--ink-light)", fontFamily: "var(--font-serif)" }}
        >
          <div className="text-2xl mb-2">⌛</div>
          <p>포스팅 색인을 불러오는 중...</p>
        </div>
      ) : query.trim() === "" ? (
        <div
          className="text-center py-12"
          style={{ color: "var(--ink-light)", fontFamily: "var(--font-serif)" }}
        >
          <div className="text-3xl mb-3">🔍</div>
          <p>
            검색어를 입력하세요.
            <br />
            <span className="text-xs mt-1 block" style={{ color: "var(--nakwan)" }}>
              총 {allPosts.length.toLocaleString()}편의 포스팅에서 검색합니다.
            </span>
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {["용신", "재물운", "갑진년", "부부궁합", "진술축미", "일주", "상담"].map(
              (suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setQuery(suggestion)}
                  className="tag-badge cursor-pointer"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  #{suggestion}
                </button>
              )
            )}
          </div>
        </div>
      ) : results.length === 0 ? (
        <div
          className="text-center py-12"
          style={{ color: "var(--ink-light)", fontFamily: "var(--font-serif)" }}
        >
          <div className="text-3xl mb-3">📭</div>
          <p className="text-base">
            &ldquo;
            <strong style={{ color: "var(--nakwan)" }}>{query}</strong>
            &rdquo; 에 해당하는 포스팅이 없습니다.
          </p>
          <p className="text-sm mt-2">다른 키워드로 검색해 보세요.</p>
          <Link
            href="/blog"
            className="inline-block mt-4 btn-outline text-sm"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            전체 글 보기 →
          </Link>
        </div>
      ) : (
        <>
          <div
            className="flex items-center justify-between mb-5 pb-3 border-b"
            style={{ borderColor: "var(--border-color)" }}
          >
            <p
              className="text-sm"
              style={{ color: "var(--ink-light)", fontFamily: "var(--font-serif)" }}
            >
              <strong style={{ color: "var(--nakwan)" }}>
                &ldquo;{query}&rdquo;
              </strong>{" "}
              검색 결과{" "}
              <strong style={{ color: "var(--ink)" }}>{results.length}</strong>건
            </p>
            <p
              className="text-xs"
              style={{ color: "var(--ink-light)", fontFamily: "var(--font-serif)" }}
            >
              {elapsed}ms
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

