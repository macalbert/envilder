import type { APIRoute } from 'astro';
import { docsArticleRoutes, docsNavGroups } from '../i18n/docs-routes';
import { en } from '../i18n/en';
import intro from '../llms/intro.md?raw';
import rest from '../llms/rest.md?raw';

const siteUrl = 'https://envilder.com';

function buildDocsSections(): string {
  return docsNavGroups
    .map((group) => {
      const links = docsArticleRoutes
        .filter((route) => route.navGroup === group.key)
        .map((route) => {
          const page = en.docs.pages[route.key];
          return `- [${page.title}](${siteUrl}${route.path}): ${page.description}`;
        });

      return links.length === 0
        ? ''
        : `## Docs: ${en.docs[group.labelKey]}\n\n${links.join('\n')}`;
    })
    .filter((section) => section !== '')
    .join('\n\n');
}

export const GET: APIRoute = () =>
  new Response(
    `${[intro.trimEnd(), buildDocsSections(), rest.trimEnd()].join('\n\n')}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
