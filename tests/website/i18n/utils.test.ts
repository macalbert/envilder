import { describe, expect, it } from "vitest";
import { en } from "../../../src/website/src/i18n/en";
import {
	localizedPath,
	useTranslations,
} from "../../../src/website/src/i18n/utils";

describe("useTranslations", () => {
	it("Should_ReturnEnglishTranslations_When_LangIsEn", () => {
		// Arrange
		const lang = "en";

		// Act
		const result = useTranslations(lang);

		// Assert
		expect(result).toBe(en);
	});

	it("Should_FallbackToEnglish_When_LangIsUnknown", () => {
		// Arrange
		const lang = "xx";

		// Act
		const result = useTranslations(lang);

		// Assert
		expect(result).toBe(en);
	});
});

describe("localizedPath", () => {
	it("Should_ReturnBarePath_When_LangIsDefault", () => {
		// Arrange
		const lang = "en";
		const path = "/docs";

		// Act
		const result = localizedPath(lang, path);

		// Assert
		expect(result).toBe("/docs");
	});

	it("Should_PrefixWithLocale_When_LangIsNonDefault", () => {
		// Arrange
		const lang = "ca";
		const path = "/docs";

		// Act
		const result = localizedPath(lang, path);

		// Assert
		expect(result).toBe("/ca/docs");
	});
});
