import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('blog rendering configuration', () => {
  it('renders live API and query-dependent pages at request time while retaining SSR output', () => {
    const project = JSON.parse(readFileSync(resolve(__dirname, 'project.json'), 'utf8'));
    expect(project.targets.build.options).toMatchObject({
      prerender: false,
      server: 'apps/blog/src/main.server.ts',
      ssr: { entry: 'apps/blog/server.ts' },
      outputPath: { base: 'dist/tech-blog' },
    });
  });
});
