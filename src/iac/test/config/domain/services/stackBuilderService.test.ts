import type { Environment } from 'aws-cdk-lib';
import type { IVpc } from 'aws-cdk-lib/aws-ec2';
import type { Node } from 'constructs';
import { ConsoleDeploymentLogger } from '../../../../src/config/infrastructure/logging/consoleDeploymentLogger';
import {
  IStackBuilder,
  type IStackBuildProps,
} from '../../../../src/config/domain/iStackBuilder';
import { StackBuildError } from '../../../../src/config/infrastructure/utilities/errors';
import { AppEnvironment } from '../../../../src/config/domain/model/appEnvironment';
import { StackBuilderService } from '../../../../src/config/domain/services/stackBuilderService';

// Mock dependencies
jest.mock(
  '../../../../src/config/infrastructure/logging/consoleDeploymentLogger',
);

describe('StackBuilderService', () => {
  let stackBuilderService: StackBuilderService;
  let mockLogger: jest.Mocked<ConsoleDeploymentLogger>;
  let mockNode: jest.Mocked<Node>;
  let mockVpc: jest.Mocked<IVpc>;
  let env: Environment;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock instances
    mockLogger =
      new ConsoleDeploymentLogger() as jest.Mocked<ConsoleDeploymentLogger>;
    mockLogger.logRepositoryInfo = jest.fn();
    mockLogger.logRequestedStacks = jest.fn();

    // Create mock node with tryGetContext method
    mockNode = {
      tryGetContext: jest.fn(),
    } as unknown as jest.Mocked<Node>;

    // Create mock VPC
    mockVpc = {} as jest.Mocked<IVpc>;

    // Create environment
    env = {
      region: 'us-east-1',
      account: '123456789012',
    };

    // Create service instance
    stackBuilderService = new StackBuilderService(
      mockLogger,
      'test-repo',
      env,
      mockVpc,
      mockNode,
      AppEnvironment.Production,
    );
  });

  describe('Happy Path Tests', () => {
    test('Should_GetBranchNameFromContext_When_BranchExistsInContext', () => {
      // Arrange
      mockNode.tryGetContext = jest.fn().mockReturnValue('feature/test');

      // Act
      const actual = stackBuilderService.getBranchName();

      // Assert
      expect(actual).toBe('feature/test');
      expect(mockNode.tryGetContext).toHaveBeenCalledWith('branch');
      expect(mockLogger.logRepositoryInfo).toHaveBeenCalledWith(
        'test-repo',
        'feature/test',
      );
    });

    test('Should_DefaultToMain_When_BranchNotInContext', () => {
      // Arrange
      mockNode.tryGetContext = jest.fn().mockReturnValue(undefined);

      // Act
      const actual = stackBuilderService.getBranchName();

      // Assert
      expect(actual).toBe('main');
      expect(mockNode.tryGetContext).toHaveBeenCalledWith('branch');
      expect(mockLogger.logRepositoryInfo).toHaveBeenCalledWith(
        'test-repo',
        'main',
      );
    });

    test('Should_BuildAllStackParts_When_AllStacksValid', () => {
      // Arrange
      const stackParts: IStackBuilder[] = [];

      // Act
      const action = () => stackBuilderService.buildStackParts(stackParts);

      // Assert
      expect(action).not.toThrow();
      expect(mockLogger.logRequestedStacks).toHaveBeenCalledTimes(1);
    });
  });

  describe('Corner Case Tests', () => {
    test('Should_IgnoreError_When_CannotFindAssetErrorOccurs', () => {
      // Arrange
      const mockStackPart = createMockStackPart('TestStack');
      const assetError = new Error('Error: Cannot find asset at /some/path');

      mockStackPart.build = jest.fn().mockImplementation(() => {
        throw assetError;
      });

      const stackParts = [mockStackPart];

      // Act
      const action = () => stackBuilderService.buildStackParts(stackParts);

      // Assert - should not throw
      expect(action).not.toThrow();
      expect(mockStackPart.build).toHaveBeenCalledTimes(1);
    });

    test('Should_ThrowStackBuildError_When_NonAssetErrorOccurs', () => {
      // Arrange
      const mockStackPart = createMockStackPart('FailingStack');
      const buildError = new Error('Stack build failed: invalid config');

      mockStackPart.build = jest.fn().mockImplementation(() => {
        throw buildError;
      });

      const stackParts = [mockStackPart];

      // Act
      const action = () => stackBuilderService.buildStackParts(stackParts);

      // Assert
      expect(action).toThrow(StackBuildError);
      expect(action).toThrow('Failed to build stack part: FailingStack');
    });
  });

  /**
   * Helper function to create a mock stack part
   */
  function createMockStackPart(name: string): IStackBuilder {
    class MockStackBuilder extends IStackBuilder {
      build = jest.fn().mockReturnValue([]);
      getIacConfig = jest.fn();
      formatRepoNameForCloudFormation = jest.fn().mockReturnValue(name);
    }

    Object.defineProperty(MockStackBuilder, 'name', { value: name });

    return new MockStackBuilder({} as IStackBuildProps);
  }
});
