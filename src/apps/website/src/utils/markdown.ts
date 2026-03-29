/**
 * Simple markdown-to-HTML conversion for the changelog.
 * Only handles the subset of markdown used in docs/CHANGELOG.md:
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
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Extract version entries as `{ tag, id, date }` for sidebar navigation. */
export function extractVersions(
  md: string,
): { tag: string; id: string; date: string }[] {
  const cleaned = cleanChangelog(md);
  const versions: { tag: string; id: string; date: string }[] = [];
  const re = /^## \[?([\d.]+)\]?.*?(?:[-–—]\s*)?(\d{4}-\d{2}-\d{2})?/gm;
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

/** Join continuation lines back into their parent list item. */
function joinMultiLineListItems(md: string): string {
  return md.replace(
    /^([*-] .+)\n(?![\s]*[*-] |#{1,6} |```|---|\s*$)(.+)/gm,
    '$1 $2',
  );
}

/** Convert the cleaned markdown to HTML, adding `id` anchors on version headings. */
export function changelogToHtml(md: string): string {
  const cleaned = cleanChangelog(md);
  const joined = joinMultiLineListItems(cleaned);
  return (
    joined
      // Version headings → h2 with id anchor
      .replace(
        /^## \[?([\d.]+)\]?.*?([-–—]\s*)?(\d{4}-\d{2}-\d{2})?\s*$/gm,
        (_match, ver, _sep, date) => {
          const id = `v${ver.replace(/\./g, '')}`;
          const dateHtml = date
            ? `<span class="release-date">${date}</span>`
            : '';
          return `<h2 id="${id}"><span class="version-tag">v${ver}</span>${dateHtml}</h2>`;
        },
      )
      // Fenced code blocks (```...```) → <pre><code>
      .replace(
        /^```(\w*)\n([\s\S]*?)^```$/gm,
        (_m, _lang, code) =>
          `<pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`,
      )
      .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      // Generic ## headings (non-version, e.g. "## Features")
      .replace(/^## (.+)$/gm, '<h3>$1</h3>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
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
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
      )
      // Both * and - list items (including indented sub-items)
      .replace(/^\s*[*-] (.+)$/gm, '<li>$1</li>')
      .replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')
      .replace(/^(?!<[/huplo]|<li|<strong|<hr|<pre|<code)(.+)$/gm, '<p>$1</p>')
      .replace(/\n{2,}/g, '\n')
  );
}

/**
 * @deprecated Use `changelogToHtml` + `extractVersions` instead.
 */
export function simpleMarkdownToHtml(md: string): string {
  return changelogToHtml(md);
}
