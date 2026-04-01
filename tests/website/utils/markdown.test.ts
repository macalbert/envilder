import { describe, expect, it } from "vitest";
import {
	changelogToHtml,
	extractVersions,
} from "../../../src/website/src/utils/markdown";

describe("extractVersions", () => {
	it("Should_ExtractVersionEntries_When_ChangelogHasVersionHeadings", () => {
		// Arrange
		const md = `# Changelog

## [0.9.0] - 2026-03-22

### Added
- New feature

## [0.8.0] - 2026-02-15

### Fixed
- Bug fix`;

		// Act
		const result = extractVersions(md);

		// Assert
		expect(result).toEqual([
			{ tag: "v0.9.0", id: "v090", date: "2026-03-22" },
			{ tag: "v0.8.0", id: "v080", date: "2026-02-15" },
		]);
	});

	it("Should_ReturnEmptyArray_When_ChangelogHasNoVersions", () => {
		// Arrange
		const md = "# Changelog\n\nNo releases yet.";

		// Act
		const result = extractVersions(md);

		// Assert
		expect(result).toEqual([]);
	});
});

describe("changelogToHtml", () => {
	it("Should_StripHtmlComments_When_ChangelogContainsMarkdownlintDirectives", () => {
		// Arrange
		const md =
			"<!-- markdownlint-disable -->\n## [1.0.0] - 2026-01-01\n- Feature";

		// Act
		const result = changelogToHtml(md);

		// Assert
		expect(result).not.toContain("<!--");
		expect(result).not.toContain("-->");
	});

	it("Should_ConvertHeadingsAndLists_When_ChangelogHasStandardMarkdown", () => {
		// Arrange
		const md = `## [1.0.0] - 2026-01-01

### Added
- First feature
- Second feature`;

		// Act
		const result = changelogToHtml(md);

		// Assert
		expect(result).toContain('<h2 id="v100">');
		expect(result).toContain('<span class="version-tag">v1.0.0</span>');
		expect(result).toContain('<span class="release-date">2026-01-01</span>');
		expect(result).toContain("<h3>Added</h3>");
		expect(result).toContain("<li>First feature</li>");
		expect(result).toContain("<li>Second feature</li>");
		expect(result).toContain("<ul>");
	});
});
