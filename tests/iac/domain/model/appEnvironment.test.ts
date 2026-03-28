import { AppEnvironment } from '../../../../src/iac/domain/model/appEnvironment';

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
    expect(actualValues).toEqual(expect.arrayContaining(expectedValues));
    expect(actualValues).toHaveLength(expectedValues.length);
  });
});
