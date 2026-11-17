import { categorySlug } from './category-slug';

describe('categorySlug', () => {
  it.each([
    ['Hardware', 'hardware'],
    ['Bezpieczeństwo', 'bezpieczenstwo'],
    ['Open Source', 'open-source'],
    ['Łączność / sieci!', 'lacznosc-sieci'],
  ])('canonicalizes %s', (label, slug) => {
    expect(categorySlug(label)).toBe(slug);
  });
});
