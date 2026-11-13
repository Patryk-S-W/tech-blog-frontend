import { marked } from 'marked';

export const PUBLIC_SITE_ORIGIN = 'https://patryksadowski.pl';
export const DEFAULT_SITE_TITLE = 'TechBlog';
export const DEFAULT_SITE_DESCRIPTION = 'Technical blog and projects';

export function publicArticleUrl(id: number): string {
  return `${PUBLIC_SITE_ORIGIN}/blog/${id}`;
}

export function markdownSummary(markdown: string): string {
  const parts: string[] = [];
  marked.walkTokens(marked.lexer(markdown), (token) => {
    if ((token.type === 'text' && (!('tokens' in token) || !Array.isArray(token.tokens) || token.tokens.length === 0)) || token.type === 'codespan' || token.type === 'code') {
      if (typeof token.text === 'string') parts.push(token.text);
    }
  });
  const text = parts.join(' ').replace(/<[^>]*>/g, ' ').replace(/[<>]/g, ' ').replace(/\s+/g, ' ').trim();
  return [...text].slice(0, 160).join('');
}

export function publicImageUrl(value: string): string | null {
  if (!value.trim()) return null;
  try {
    const url = new URL(value, PUBLIC_SITE_ORIGIN);
    return /^https?:$/.test(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

export function publishedDate(value: string | null | undefined): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}T/.test(value)) return null;
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  const date = new Date(value);
  if (year < 1 || month < 1 || month > 12 || day < 1 ||
    day > new Date(Date.UTC(year, month, 0)).getUTCDate() || !Number.isFinite(date.getTime())) return null;
  return date.toISOString();
}
