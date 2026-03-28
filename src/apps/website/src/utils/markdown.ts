/**
 * Simple markdown-to-HTML conversion for the changelog.
 * Only handles the subset of markdown used in docs/CHANGELOG.md:
 * headings, bold, inline code, links, unordered lists, and horizontal rules.
 *
 * Strips non-user-facing sections ("How to Update…", "Maintenance",
 * markdown link references, and HTML comments).
 */

/** Remove maintenance / meta sections that don't belong on the website. */
function stripNonUserSections(md: string): string {
  return (
    md
      // Drop everything from "## How to Update This Changelog" to EOF
      .replace(/^## How to Update This Changelog[\s\S]*$/m, '')
      // Drop everything from "## Maintenance" to EOF
      .replace(/^## Maintenance[\s\S]*$/m, '')
      // Drop "## Changelog" meta paragraph (the mid-file one)
      .replace(
        /^## Changelog\n\nAll notable changes[\s\S]*?(?=\n## \[)/m,
        '',
      )
      // Drop bottom link-reference definitions  [x.y.z]: https://...
      .replace(/^\[[\d.]+\]:.*$/gm, '')
      // Drop markdownlint HTML comments
      .replace(/<!--[\s\S]*?-->/g, '')
      // Drop the top-level "# Changelog" title (the page already has one)
      .replace(/^# Changelog\s*/m, '')
      // Collapse leftover blank lines
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}

/** Extract version entries as `{ tag, id, date }` for sidebar navigation. */
export function extractVersions(
  md: string,
): { tag: string; id: string; date: string }[] {
  const cleaned = stripNonUserSections(md);
  const versions: { tag: string; id: string; date: string }[] = [];
  const re = /^## \[?([\d.]+)\]?.*?(?:[-–—]\s*)?(\d{4}-\d{2}-\d{2})?/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(cleaned)) !== null) {
    const tag = m[1];
    versions.push({
      tag: `v${tag}`,
      id: `v${tag.replace(/\./g, '')}`,
      date: m[2] ?? '',
    });
  }
  return versions;
}

/** Convert the cleaned markdown to HTML, adding `id` anchors on version headings. */
export function changelogToHtml(md: string): string {
  const cleaned = stripNonUserSections(md);
  return (
    cleaned
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
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // Horizontal rules
      .replace(/^---$/gm, '<hr />')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
      )
      // Both * and - list items
      .replace(/^[*-] (.+)$/gm, '<li>$1</li>')
      .replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')
      .replace(/^(?!<[huplo]|<li|<strong|<hr|<pre|<code)(.+)$/gm, '<p>$1</p>')
      .replace(/\n{2,}/g, '\n')
  );
}

/**
 * @deprecated Use `changelogToHtml` + `extractVersions` instead.
 */
export function simpleMarkdownToHtml(md: string): string {
  return changelogToHtml(md);
}
