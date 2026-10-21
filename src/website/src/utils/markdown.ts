/**
 * Simple markdown-to-HTML conversion for the changelog.
 * Only handles the subset of markdown used in docs/changelogs/:
 * headings, bold, inline code, links, unordered lists, and horizontal rules.
 *
 * Strips HTML comments left over from markdownlint directives.
 */

/**
 * Strip HTML comments completely, including malformed or nested fragments.
 * Uses a loop to guarantee no `<!--` or `-->` sequences survive
 * (avoids incomplete multi-character sanitization).
 */
function stripHtmlComments(text: string): string {
  let result = text;
  // First pass: remove well-formed comments
  while (
    result.includes('<!--') &&
    (result.includes('-->') || result.includes('--!>'))
  ) {
    result = result.replace(/<!--[\s\S]*?--(?:>|!>)/g, '');
  }
  // Second pass: remove any residual opener/closer fragments
  while (
    result.includes('<!--') ||
    result.includes('-->') ||
    result.includes('--!>')
  ) {
    result = result.replace(/<!--|--(?:>|!>)/g, '');
  }
  return result;
}

/** Clean the raw changelog markdown for website rendering. */
function cleanChangelog(md: string): string {
  return stripHtmlComments(md)
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Extract version entries as `{ tag, id, date }` for sidebar navigation. */
export function extractVersions(
  md: string,
): { tag: string; id: string; date: string }[] {
  const cleaned = cleanChangelog(md);
  const versions: { tag: string; id: string; date: string }[] = [];
  const re = /^## \[?([\d.]+)\]?(?:\s*[-–—]+\s*(\d{4}-\d{2}-\d{2}))?/gm;
  let m = re.exec(cleaned);
  while (m !== null) {
    const tag = m[1];
    versions.push({
      tag: `v${tag}`,
      id: `v${tag.replace(/\./g, '')}`,
      date: m[2] ?? '',
    });
    m = re.exec(cleaned);
  }
  return versions;
}

/** Join every wrapped continuation line back into its parent list item. */
function joinMultiLineListItems(md: string): string {
  const listItem = /^\s*[*-] /;
  const blockStart = /^\s*(?:[*-] |#{1,6} |```|---)/;
  const fence = /^\s*```/;
  const out: string[] = [];
  let inFence = false;
  for (const line of md.split('\n')) {
    if (fence.test(line)) {
      inFence = !inFence;
    }
    const prev = out.at(-1);
    if (
      !inFence &&
      prev !== undefined &&
      listItem.test(prev) &&
      line.trim() !== '' &&
      !blockStart.test(line)
    ) {
      out[out.length - 1] = `${prev} ${line.trim()}`;
    } else {
      out.push(line);
    }
  }
  return out.join('\n');
}

/** Changelogs live in docs/changelogs/, so relative links resolve there on GitHub. */
const CHANGELOG_BASE_URL =
  'https://github.com/macalbert/envilder/blob/main/docs/changelogs/';

function resolveLinkHref(href: string): string {
  if (/^(?:[a-z]+:|#)/i.test(href)) {
    return href;
  }
  return new URL(href, CHANGELOG_BASE_URL).href;
}

/** Convert the cleaned markdown to HTML, adding `id` anchors on version headings. */
export function changelogToHtml(md: string, idPrefix = ''): string {
  const cleaned = cleanChangelog(md);
  const joined = joinMultiLineListItems(cleaned);
  // Rendered code blocks are parked behind placeholders so that the line-based
  // passes below never rewrite their contents.
  const codeBlocks: string[] = [];
  return (
    joined
      // Version headings → h2 with id anchor
      .replace(/^## \[?([\d.]+)\]?(.*)$/gm, (_match, ver, rest) => {
        const id = `${idPrefix}v${ver.replace(/\./g, '')}`;
        const dateMatch = rest.match(/(\d{4}-\d{2}-\d{2})/);
        const date = dateMatch?.[1];
        const deprecated = rest.includes('[DEPRECATED]');
        const dateHtml = date
          ? `<span class="release-date">${date}</span>`
          : '';
        const deprecatedHtml = deprecated
          ? `<span class="badge badge-deprecated">DEPRECATED</span>`
          : '';
        return `<h2 id="${id}"><span class="version-tag">v${ver}</span>${dateHtml}${deprecatedHtml}</h2>`;
      })
      // Fenced code blocks (```...```) → <pre><code>
      // Supports optional leading whitespace so indented fences (e.g. inside
      // list-item continuations) are matched. A backreference (\1) ensures the
      // closing fence has the same indent, and that indent is stripped from
      // every content line.
      .replace(
        /^([ \t]*)```(\w*)\n([\s\S]*?)^\1```$/gm,
        (_m, indent, _lang, code) => {
          const dedented = indent
            ? code.replace(new RegExp(`^${indent}`, 'gm'), '')
            : code;
          codeBlocks.push(
            `<pre><code>${dedented.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`,
          );
          return `<pre data-code-block="${codeBlocks.length - 1}"></pre>`;
        },
      )
      .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      // Generic ## headings (non-version, e.g. "## Features")
      .replace(/^## (.+)$/gm, '<h3>$1</h3>')
      .replace(/^# (.+)$/gm, '<h2 class="changelog-doc-title">$1</h2>')
      // Horizontal rules
      .replace(/^---$/gm, '<hr />')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(
        /`([^`]+)`/g,
        (_m, code) =>
          `<code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`,
      )
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        (_m, text, href) =>
          `<a href="${resolveLinkHref(href)}" target="_blank" rel="noopener noreferrer">${text}</a>`,
      )
      // Both * and - list items (including indented sub-items)
      .replace(/^\s*[*-] (.+)$/gm, '<li>$1</li>')
      .replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')
      .replace(/^(?!<[/huplo]|<li|<strong|<hr|<pre|<code)(.+)$/gm, '<p>$1</p>')
      .replace(/\n{2,}/g, '\n')
      .replace(
        /<pre data-code-block="(\d+)"><\/pre>/g,
        (_m, index) => codeBlocks[Number(index)],
      )
  );
}

/**
 * @deprecated Use `changelogToHtml` + `extractVersions` instead.
 */
export function simpleMarkdownToHtml(md: string): string {
  return changelogToHtml(md);
}
