import { App } from 'aws-cdk-lib';
import {
  VpcLookupStack,
  type VpcLookupStackProps,
} from '../../../src/aws/network/vpcLookupStack';

// Mock the Vpc.fromLookup to avoid actual AWS lookups in tests
jest.mock('aws-cdk-lib/aws-ec2', () => {
  const actual = jest.requireActual('aws-cdk-lib/aws-ec2');
  return {
    ...actual,
    Vpc: {
      ...actual.Vpc,
      fromLookup: jest.fn((scope, _id, options) => ({
        vpcId: options.vpcId,
        node: scope.node,
      })),
    },
  };
});

// Note: VPC lookup requires actual AWS VPC to exist, so we mock the lookup
describe('VpcLookupStack', () => {
  const env = {
    account: '123456789012',
    region: 'us-east-1',
  };

  function createVpcLookupStackProps(): VpcLookupStackProps {
    return {
      vpcId: 'vpc-12345678',
      env,
    };
  }

  test('Should_CreateStack_When_ValidPropsProvided', () => {
    // Arrange
    const app = new App();
    const props = createVpcLookupStackProps();

    // Act
    const stack = new VpcLookupStack(app, props);

    // Assert
    expect(stack).toBeDefined();
    expect(stack.vpc).toBeDefined();
  });

  test('Should_UseVpcId_When_StackCreated', () => {
    // Arrange
    const app = new App();
    const props = createVpcLookupStackProps();

    // Act
    const stack = new VpcLookupStack(app, props);

    // Assert
    expect(stack.stackName).toBe(props.vpcId);
  });

  test('Should_PassEnvironment_When_PropsIncludeEnv', () => {
    // Arrange
    const app = new App();
    const props = createVpcLookupStackProps();

    // Act
    const stack = new VpcLookupStack(app, props);

    // Assert
    expect(stack.account).toBe(env.account);
    expect(stack.region).toBe(env.region);
  });

  test('Should_LookupVpc_When_StackConstructed', () => {
    // Arrange
    const app = new App();
    const props = createVpcLookupStackProps();
    const { Vpc } = jest.requireMock('aws-cdk-lib/aws-ec2');

    // Act
    new VpcLookupStack(app, props);

    // Assert
    expect(Vpc.fromLookup).toHaveBeenCalledWith(
      expect.anything(),
      'VpcNetwork',
      {
        vpcId: props.vpcId,
      },
    );
  });

  test('Should_HandleMissingEnv_When_EnvNotProvided', () => {
    // Arrange
    const app = new App();
    const propsWithoutEnv: VpcLookupStackProps = {
      vpcId: 'vpc-87654321',
    };

    // Act
    const stack = new VpcLookupStack(app, propsWithoutEnv);

    // Assert
    expect(stack).toBeDefined();
    expect(stack.vpc).toBeDefined();
  });
});
