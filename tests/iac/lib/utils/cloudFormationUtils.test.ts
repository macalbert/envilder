import { formatRepoNameForCloudFormation } from "../../../../src/iac/lib/stacks/utils";

describe("cloudFormationUtils", () => {
	describe("formatRepoNameForCloudFormation", () => {
		test("Should_ConvertToLowercase_When_UppercaseLettersProvided", () => {
			// Arrange
			const repoName = "MyTestRepo";

			// Act
			const result = formatRepoNameForCloudFormation(repoName);

			// Assert
			expect(result).toBe("mytestrepo");
		});

		test("Should_ReplaceSpecialCharsWithHyphen_When_InvalidCharsPresent", () => {
			// Arrange
			const repoName = "my_test@repo#2024";

			// Act
			const result = formatRepoNameForCloudFormation(repoName);

			// Assert
			expect(result).toBe("my-test-repo-2024");
		});

		test("Should_ReplaceMultipleHyphensWithSingle_When_ConsecutiveHyphensExist", () => {
			// Arrange
			const repoName = "my---test---repo";

			// Act
			const result = formatRepoNameForCloudFormation(repoName);

			// Assert
			expect(result).toBe("my-test-repo");
		});

		test("Should_RemoveTrailingHyphen_When_NameEndsWithHyphen", () => {
			// Arrange
			const repoName = "my-repo-";

			// Act
			const result = formatRepoNameForCloudFormation(repoName);

			// Assert
			expect(result).toBe("my-repo");
		});

		test("Should_PrefixWithR_When_RepoNameStartsWithNumber", () => {
			// Arrange
			const repoName = "123-repo";

			// Act
			const result = formatRepoNameForCloudFormation(repoName);

			// Assert
			expect(result).toBe("r-123-repo");
			expect(result).toMatch(/^[A-Za-z]/);
		});
	});
});
