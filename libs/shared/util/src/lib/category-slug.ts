export function categorySlug(category: string): string {
  return category.toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

const translatableCategories = new Set([
  'ai', 'bezpieczenstwo', 'development', 'gaming', 'hardware', 'nauka',
  'open-source', 'self-hosting', 'sieci', 'smart-home', 'vps', 'windows',
]);

export function categoryTranslationKey(category: string): string | null {
  const slug = categorySlug(category);
  return translatableCategories.has(slug) ? `categories.${slug}` : null;
}
