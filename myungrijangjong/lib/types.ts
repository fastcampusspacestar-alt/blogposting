export type Category = 'theory' | 'analysis' | 'cases' | 'seasonal' | 'essays';

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  category: Category;
  tags: string[];
  excerpt: string;
  author: string;
  caseYear?: string;
  consultType?: string;
}

export interface Post extends PostMeta {
  content: string;
  contentHtml: string;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  theory: '명리강론',
  analysis: '60갑자 정해',
  cases: '실전 상담록',
  seasonal: '절기 서신',
  essays: '인생 철학',
};

export const CATEGORY_DESC: Record<Category, string> = {
  theory: '오행·십신·12운성·신살 등 정통 명리 이론 해설',
  analysis: '60 甲子 일주별 성격·직업·재물·건강 상세 분석',
  cases: '실전 익명 상담 사례 — 고민을 명식으로 풀다',
  seasonal: '24절기별 기운과 삶의 지침 — 지난 10년·향후 10년',
  essays: '명리학적 시선으로 바라본 삶의 지혜와 수양록',
};

