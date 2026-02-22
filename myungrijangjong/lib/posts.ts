import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import type { Category, PostMeta, Post } from './types';

// re-export so consumers can import from @/lib/posts as before
export type { Category, PostMeta, Post };
export { CATEGORY_LABELS, CATEGORY_DESC } from './types';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const CATEGORIES: Category[] = ['theory', 'analysis', 'cases', 'seasonal', 'essays'];

function getPostFiles(category: Category): string[] {
  const dir = path.join(CONTENT_DIR, category);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
}

export function getAllPosts(): PostMeta[] {
  const posts: PostMeta[] = [];

  for (const category of CATEGORIES) {
    const files = getPostFiles(category);
    for (const file of files) {
      const slug = file.replace(/\.md$/, '');
      const fullPath = path.join(CONTENT_DIR, category, file);
      try {
        const raw = fs.readFileSync(fullPath, 'utf8');
        const { data } = matter(raw);
        posts.push({
          slug,
          title: data.title ?? '제목 없음',
          date: data.date ?? '2024-01-01',
          category: (data.category as Category) ?? category,
          tags: Array.isArray(data.tags) ? data.tags : [],
          excerpt: data.excerpt ?? '',
          author: data.author ?? '명리정종',
          caseYear: data.caseYear,
          consultType: data.consultType,
        });
      } catch {
        // skip malformed files
      }
    }
  }

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  for (const category of CATEGORIES) {
    const fullPath = path.join(CONTENT_DIR, category, `${slug}.md`);
    if (fs.existsSync(fullPath)) {
      const raw = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(raw);

      const processed = await remark().use(remarkHtml, { sanitize: false }).process(content);
      const contentHtml = processed.toString();

      return {
        slug,
        title: data.title ?? '제목 없음',
        date: data.date ?? '2024-01-01',
        category: (data.category as Category) ?? category,
        tags: Array.isArray(data.tags) ? data.tags : [],
        excerpt: data.excerpt ?? '',
        author: data.author ?? '명리정종',
        caseYear: data.caseYear,
        consultType: data.consultType,
        content,
        contentHtml,
      };
    }
  }
  return null;
}

export function getPostsByCategory(category: Category): PostMeta[] {
  return getAllPosts().filter((p) => p.category === category);
}

export function getPostsByTag(tag: string): PostMeta[] {
  return getAllPosts().filter((p) => p.tags.includes(tag));
}

export function getAllTags(): { tag: string; count: number }[] {
  const counts: Record<string, number> = {};
  getAllPosts().forEach((p) => {
    p.tags.forEach((t) => {
      counts[t] = (counts[t] ?? 0) + 1;
    });
  });
  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export function getRelatedPosts(post: PostMeta, limit = 4): PostMeta[] {
  const all = getAllPosts().filter((p) => p.slug !== post.slug);
  const scored = all.map((p) => {
    let score = 0;
    if (p.category === post.category) score += 3;
    p.tags.forEach((t) => {
      if (post.tags.includes(t)) score += 2;
    });
    return { post: p, score };
  });
  return scored
    .sort((a, b) => b.score - a.score || new Date(b.post.date).getTime() - new Date(a.post.date).getTime())
    .slice(0, limit)
    .map((s) => s.post);
}

export function getCaseTimeline(): { year: string; count: number }[] {
  const cases = getPostsByCategory('cases');
  const yearMap: Record<string, number> = {};
  cases.forEach((p) => {
    const year = new Date(p.date).getFullYear().toString();
    yearMap[year] = (yearMap[year] ?? 0) + 1;
  });
  return Object.entries(yearMap)
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year.localeCompare(b.year));
}

export function getCategoryCounts(): Record<Category, number> {
  const all = getAllPosts();
  const result = {} as Record<Category, number>;
  CATEGORIES.forEach((c) => {
    result[c] = all.filter((p) => p.category === c).length;
  });
  return result;
}
