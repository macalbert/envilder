import { AppEnvironment } from '../../../../src/config/domain/model/appEnvironment';

describe('AppEnvironment', () => {
  test('Should_HaveProductionValue_When_EnumAccessed', () => {
    // Arrange & Act
    const value = AppEnvironment.Production;

    // Assert
    expect(value).toBe('Production');
  });

  test('Should_HaveDevelopmentValue_When_EnumAccessed', () => {
    // Arrange & Act
    const value = AppEnvironment.Development;

    // Assert
    expect(value).toBe('Development');
  });

  test('Should_HaveBetaValue_When_EnumAccessed', () => {
    // Arrange & Act
    const value = AppEnvironment.Beta;

    // Assert
    expect(value).toBe('Beta');
  });

  test('Should_HaveStagingValue_When_EnumAccessed', () => {
    // Arrange & Act
    const value = AppEnvironment.Staging;

    // Assert
    expect(value).toBe('Staging');
  });

  test('Should_HaveGithubActionValue_When_EnumAccessed', () => {
    // Arrange & Act
    const value = AppEnvironment.GithubAction;

    // Assert
    expect(value).toBe('GithubAction');
  });

  test('Should_HaveTestValue_When_EnumAccessed', () => {
    // Arrange & Act
    const value = AppEnvironment.Test;

    // Assert
    expect(value).toBe('Test');
  });

  test('Should_HaveAllSixValues_When_EnumIsChecked', () => {
    // Arrange
    const expectedValues = [
      'Production',
      'Development',
      'Beta',
      'Staging',
      'GithubAction',
      'Test',
    ];

    // Act
    const actualValues = Object.values(AppEnvironment);

    // Assert
    expect(actualValues).toHaveLength(6);
    expect(actualValues).toEqual(expect.arrayContaining(expectedValues));
  });

  test('Should_BeStringEnum_When_ValuesAreChecked', () => {
    // Arrange & Act
    const values = Object.values(AppEnvironment);

    // Assert
    for (const value of values) {
      expect(typeof value).toBe('string');
    }
  });

  test('Should_HaveMatchingKeysAndValues_When_EnumIsExamined', () => {
    // Arrange & Act & Assert
    expect(AppEnvironment.Production).toBe('Production');
    expect(AppEnvironment.Development).toBe('Development');
    expect(AppEnvironment.Beta).toBe('Beta');
    expect(AppEnvironment.Staging).toBe('Staging');
    expect(AppEnvironment.GithubAction).toBe('GithubAction');
    expect(AppEnvironment.Test).toBe('Test');
  });
});
