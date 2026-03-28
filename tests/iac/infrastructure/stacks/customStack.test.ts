import { App } from 'aws-cdk-lib';
import { AppEnvironment } from '../../../../src/iac/domain/model/appEnvironment';
import {
  CustomStack,
  type CustomStackProps,
} from '../../../../src/iac/infrastructure/stacks/customStack';

describe('CustomStack', () => {
  function createCustomStackProps(): CustomStackProps {
    return {
      githubRepo: 'test-repo',
      envName: AppEnvironment.Development,
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

  test('Should_GenerateLowercaseStackId_When_StackCreated', () => {
    // Arrange
    const app = new App();
    const props = createCustomStackProps();
    props.githubRepo = 'TEST-REPO';
    props.name = 'MyStack';
    props.envName = AppEnvironment.Production;

    // Act
    const stack = new CustomStack(app, props);
    const stackId = stack.getStackId();

    // Assert
    expect(stackId).toBe(stackId.toLowerCase());
  });
});
