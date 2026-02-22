"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

export default function SearchBar({ placeholder = "제목, 태그, 내용 검색..." }: { placeholder?: string }) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-stretch">
      {/* 검색 아이콘 */}
      <div
        className="flex items-center px-3 border border-r-0"
        style={{
          borderColor: "var(--border-color)",
          backgroundColor: "var(--paper)",
        }}
      >
        <svg
          className="w-4 h-4"
          style={{ color: "var(--ink-light)" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1116.65 2a7.5 7.5 0 010 14.65z"
          />
        </svg>
      </div>

      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-4 py-3 text-sm outline-none border"
        style={{
          borderColor: "var(--border-color)",
          backgroundColor: "var(--paper)",
          color: "var(--ink)",
          fontFamily: "var(--font-serif)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--nakwan)";
          e.currentTarget.previousElementSibling &&
            ((e.currentTarget.previousElementSibling as HTMLElement).style.borderColor = "var(--nakwan)");
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--border-color)";
          e.currentTarget.previousElementSibling &&
            ((e.currentTarget.previousElementSibling as HTMLElement).style.borderColor = "var(--border-color)");
        }}
      />

      <button
        type="submit"
        className="btn-nakwan text-sm px-5"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        검색
      </button>
    </form>
  );
}

