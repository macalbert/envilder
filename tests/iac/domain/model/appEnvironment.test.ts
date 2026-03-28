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

  test('Should_HaveAllExpectedValues_When_EnumIsChecked', () => {
    // Arrange
    const expectedValues = ['Production', 'Development'];

    // Act
    const actualValues = Object.values(AppEnvironment);

    // Assert
    expect(actualValues).toEqual(expect.arrayContaining(expectedValues));
    expect(actualValues).toHaveLength(expectedValues.length);
  });
});
