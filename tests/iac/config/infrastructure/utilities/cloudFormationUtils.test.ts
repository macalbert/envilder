import { formatRepoNameForCloudFormation } from '../../../../../src/iac/config/infrastructure/utilities/cloudFormationUtils';

describe('cloudFormationUtils', () => {
  describe('formatRepoNameForCloudFormation', () => {
    test('Should_ReturnFormattedName_When_ValidRepoNameProvided', () => {
      // Arrange
      const repoName = 'my-test-repo';

      // Act
      const result = formatRepoNameForCloudFormation(repoName);

      // Assert
      expect(result).toBe('my-test-repo');
    });

    test('Should_ConvertToLowercase_When_UppercaseLettersProvided', () => {
      // Arrange
      const repoName = 'MyTestRepo';

      // Act
      const result = formatRepoNameForCloudFormation(repoName);

      // Assert
      expect(result).toBe('mytestrepo');
    });

    test('Should_ReplaceSpecialCharsWithHyphen_When_InvalidCharsPresent', () => {
      // Arrange
      const repoName = 'my_test@repo#2024';

      // Act
      const result = formatRepoNameForCloudFormation(repoName);

      // Assert
      expect(result).toBe('my-test-repo-2024');
    });

    test('Should_ReplaceMultipleHyphensWithSingle_When_ConsecutiveHyphensExist', () => {
      // Arrange
      const repoName = 'my---test---repo';

      // Act
      const result = formatRepoNameForCloudFormation(repoName);

      // Assert
      expect(result).toBe('my-test-repo');
    });

    test('Should_RemoveLeadingHyphen_When_NameStartsWithHyphen', () => {
      // Arrange
      const repoName = '-my-repo';

      // Act
      const result = formatRepoNameForCloudFormation(repoName);

      // Assert
      expect(result).toBe('my-repo');
    });

    test('Should_RemoveTrailingHyphen_When_NameEndsWithHyphen', () => {
      // Arrange
      const repoName = 'my-repo-';

      // Act
      const result = formatRepoNameForCloudFormation(repoName);

      // Assert
      expect(result).toBe('my-repo');
    });

    test('Should_PrefixWithR_When_RepoNameStartsWithNumber', () => {
      // Arrange
      const repoName = '123-repo';

      // Act
      const result = formatRepoNameForCloudFormation(repoName);

      // Assert
      expect(result).toBe('r-123-repo');
      expect(result).toMatch(/^[A-Za-z]/);
    });

    test('Should_HandleComplexName_When_MultipleRulesApply', () => {
      // Arrange
      const repoName = '123_My@Test___Repo---2024!';

      // Act
      const result = formatRepoNameForCloudFormation(repoName);

      // Assert
      expect(result).toBe('r-123-my-test-repo-2024');
      expect(result).toMatch(/^[A-Za-z][A-Za-z0-9-]*$/);
    });

    test('Should_HandleUnderscores_When_RepoNameContainsUnderscores', () => {
      // Arrange
      const repoName = 'my_awesome_repo';

      // Act
      const result = formatRepoNameForCloudFormation(repoName);

      // Assert
      expect(result).toBe('my-awesome-repo');
    });

    test('Should_HandleDots_When_RepoNameContainsDots', () => {
      // Arrange
      const repoName = 'my.test.repo';

      // Act
      const result = formatRepoNameForCloudFormation(repoName);

      // Assert
      expect(result).toBe('my-test-repo');
    });

    test('Should_ReturnValidCloudFormationName_When_AllRulesApplied', () => {
      // Arrange
      const repoName = '!!!Test___Repo@2024###';

      // Act
      const result = formatRepoNameForCloudFormation(repoName);

      // Assert
      expect(result).toMatch(/^[A-Za-z][A-Za-z0-9-]*$/);
      expect(result).toBe('test-repo-2024');
    });

    test('Should_HandleSingleCharacter_When_NameIsOneLetter', () => {
      // Arrange
      const repoName = 'A';

      // Act
      const result = formatRepoNameForCloudFormation(repoName);

      // Assert
      expect(result).toBe('a');
    });

    test('Should_HandleNumericOnly_When_NameIsAllNumbers', () => {
      // Arrange
      const repoName = '123456';

      // Act
      const result = formatRepoNameForCloudFormation(repoName);

      // Assert
      expect(result).toBe('r-123456');
      expect(result).toMatch(/^[A-Za-z]/);
    });

    test('Should_HandleSpecialCharsOnly_When_NameHasNoAlphanumeric', () => {
      // Arrange
      const repoName = '@#$%^&*';

      // Act
      const result = formatRepoNameForCloudFormation(repoName);

      // Assert
      // After removing all special chars and hyphens, we get an empty string
      // which then gets prefixed with 'r-' since it doesn't start with a letter
      expect(result).toBe('r-');
    });

    test('Should_HandleMixedCase_When_NameHasMixedCasing', () => {
      // Arrange
      const repoName = 'MyRepoName';

      // Act
      const result = formatRepoNameForCloudFormation(repoName);

      // Assert
      expect(result).toBe('myreponame');
    });
  });
});
