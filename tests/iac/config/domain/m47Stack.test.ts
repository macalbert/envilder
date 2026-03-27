import { App } from 'aws-cdk-lib';
import {
  CustomStack,
  type CustomStackProps,
} from '../../../../src/iac/config/domain/customStack';
import { AppEnvironment } from '../../../../src/iac/config/domain/model/appEnvironment';

describe('CustomStack', () => {
  function createCustomStackProps(): CustomStackProps {
    return {
      githubRepo: 'test-repo',
      envName: AppEnvironment.Test,
      name: 'test-stack',
      stackName: 'test-stack-name',
    };
  }

  test('Should_CreateStack_When_ValidPropsProvided', () => {
    // Arrange
    const app = new App();
    const props = createCustomStackProps();

    // Act
    const stack = new CustomStack(app, props);

    // Assert
    expect(stack).toBeDefined();
    expect(stack.props).toEqual(props);
  });

  test('Should_GenerateStackId_When_GetStackIdCalled', () => {
    // Arrange
    const app = new App();
    const props = createCustomStackProps();
    const stack = new CustomStack(app, props);

    // Act
    const stackId = stack.getStackId();

    // Assert
    expect(stackId).toContain('macalbert');
    expect(stackId).toContain('test-repo');
    expect(stackId).toContain('test-stack');
    expect(stackId).toContain('test');
    expect(stackId).toContain('stack');
  });

  test('Should_AddProjectTags_When_StackCreated', () => {
    // Arrange
    const app = new App();
    const props = createCustomStackProps();

    // Act
    const stack = new CustomStack(app, props);

    // Assert
    const tags = stack.tags;
    expect(tags).toBeDefined();
  });

  test('Should_FormatRepoNameForCloudFormation_When_ToCloudFormationCalled', () => {
    // Arrange
    const app = new App();
    const props = createCustomStackProps();
    props.githubRepo = 'My_Test_Repo';
    const stack = new CustomStack(app, props);

    // Act
    const result = stack.toCloudFormation();

    // Assert
    expect(result).toBe('my-test-repo');
  });

  test('Should_HandleUppercaseRepo_When_StackCreated', () => {
    // Arrange
    const app = new App();
    const props = createCustomStackProps();
    props.githubRepo = 'TEST-REPO';

    // Act
    const stack = new CustomStack(app, props);

    // Assert
    expect(stack.getStackId()).toContain('test-repo');
  });

  test('Should_HandleSpecialChars_When_RepoNameHasSpecialChars', () => {
    // Arrange
    const app = new App();
    const props = createCustomStackProps();
    props.githubRepo = 'test_repo@123';

    // Act
    const stack = new CustomStack(app, props);
    const cloudFormationName = stack.toCloudFormation();

    // Assert
    expect(cloudFormationName).toMatch(/^[a-z0-9-]+$/);
  });

  test('Should_UseDifferentEnvironments_When_EnvNameChanged', () => {
    // Arrange
    const app = new App();
    const props = createCustomStackProps();

    // Act & Assert
    props.envName = AppEnvironment.Production;
    const prodStack = new CustomStack(app, props);
    expect(prodStack.getStackId()).toContain('production');

    props.envName = AppEnvironment.Development;
    props.name = 'different-stack'; // Need different name to avoid conflict
    const devStack = new CustomStack(app, props);
    expect(devStack.getStackId()).toContain('development');
  });

  test('Should_GenerateLowercaseStackId_When_StackCreated', () => {
    // Arrange
    const app = new App();
    const props = createCustomStackProps();
    props.name = 'MyTestStack';
    props.githubRepo = 'MyRepo';

    // Act
    const stack = new CustomStack(app, props);
    const stackId = stack.getStackId();

    // Assert
    expect(stackId).toBe(stackId.toLowerCase());
  });
});
