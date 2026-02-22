import { Suspense } from "react";
import SearchClient from "./SearchClient";

export const metadata = {
  title: "검색",
  description: "명리정종의 1,000건 이상의 포스팅을 키워드 하나로 즉시 검색합니다.",
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div
          className="max-w-4xl mx-auto px-4 py-20 text-center"
          style={{ fontFamily: "var(--font-serif)", color: "var(--ink-light)" }}
        >
          <div className="text-3xl mb-3">🔍</div>
          <p>검색 페이지를 불러오는 중...</p>
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
