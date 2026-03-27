import { App, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import {
  PipelineStack,
  type PipelineStackProps,
} from '../../../src/aws/developerTools/codepipeline/pipelineStack';
import { AppEnvironment } from '../../../src/config/domain/model/appEnvironment';

describe('PipelineStack', () => {
  const env = {
    account: 'account',
    region: 'eu-west-1',
  };

  test('Should_CreatePipelineStack_When_StackIsCalled', () => {
    // Arrange
    const stack = new Stack(new App(), 'pipelineStackTest', { env });
    const props = createPipelineStackProps(stack);

    // Act
    const actual = new PipelineStack(stack, props);

    // Assert
    const template = Template.fromStack(actual);
    expect(template.toJSON()).toMatchSnapshot('pipelineStackTest');
  });

  test('Should_CreatePipelineWithFilteredPathsStack_When_StackIsCalled', () => {
    // Arrange
    const stack = new Stack(new App(), 'pipelineWithFilterStackTest', {
      env,
    });
    const props = createPipelineStackProps(stack);
    props.filterPaths = ['some/path'];
    props.envName = AppEnvironment.Production;

    // Act
    const actual = new PipelineStack(stack, props);

    // Assert
    const template = Template.fromStack(actual);
    expect(template.toJSON()).toMatchSnapshot('pipelineWithFilterStackTest');
  });

  test('Should_CreatePipelineWithManualApproval_When_StackIsCalled', () => {
    // Arrange
    const stack = new Stack(new App(), 'pipelineWithFilterStackTest', {
      env,
    });
    const props = createPipelineStackProps(stack);
    props.manualApproval = true;

    // Act
    const actual = new PipelineStack(stack, props);

    // Assert
    const template = Template.fromStack(actual);
    expect(template.toJSON()).toMatchSnapshot('pipelineWithManualApproval');
  });

  test('Should_CreatePipelineWithNoCache_When_CacheConfigIsUndefined', () => {
    // Arrange
    const stack = new Stack(new App(), 'pipelineWithUndefinedCacheTest', {
      env,
    });
    const props = createPipelineStackProps(stack);
    // cacheConfig is undefined by default

    // Act
    const actual = new PipelineStack(stack, props);

    // Assert
    const template = Template.fromStack(actual);
    expect(template.toJSON()).toMatchSnapshot('pipelineWithUndefinedCache');

    // Verify deploy project has no cache configured (default behavior)
    template.hasResourceProperties('AWS::CodeBuild::Project', {
      Name: 'build-pipeline-deploy-envilder-test',
      Cache: {
        Type: 'NO_CACHE',
      },
    });
  });

  test('Should_CreatePipelineWithLocalCache_When_CacheConfigIsLocal', () => {
    // Arrange
    const stack = new Stack(new App(), 'pipelineWithLocalCacheTest', { env });
    const props = createPipelineStackProps(stack);
    props.cacheConfig = { type: 'local' };

    // Act
    const actual = new PipelineStack(stack, props);

    // Assert
    const template = Template.fromStack(actual);
    expect(template.toJSON()).toMatchSnapshot('pipelineWithLocalCache');

    // Verify deploy project has local cache configured with Docker layer and custom modes
    template.hasResourceProperties('AWS::CodeBuild::Project', {
      Name: 'build-pipeline-deploy-envilder-test',
      Cache: {
        Type: 'LOCAL',
        Modes: ['LOCAL_DOCKER_LAYER_CACHE', 'LOCAL_CUSTOM_CACHE'],
      },
    });
  });

  test('Should_CreatePipelineWithS3Cache_When_CacheConfigIsS3WithDefaultBucket', () => {
    // Arrange
    const stack = new Stack(new App(), 'pipelineWithS3CacheDefaultTest', {
      env,
    });
    const props = createPipelineStackProps(stack);
    props.cacheConfig = { type: 's3' };

    // Act
    const actual = new PipelineStack(stack, props);

    // Assert
    const template = Template.fromStack(actual);
    expect(template.toJSON()).toMatchSnapshot('pipelineWithS3CacheDefault');

    // Verify deploy project has S3 cache configured with default bucket
    template.hasResourceProperties('AWS::CodeBuild::Project', {
      Name: 'build-pipeline-deploy-envilder-test',
      Cache: {
        Type: 'S3',
        Location: 'codebuild-eu-west-1-account/envilder',
      },
    });
  });

  test('Should_CreatePipelineWithS3Cache_When_CacheConfigIsS3WithCustomBucket', () => {
    // Arrange
    const stack = new Stack(new App(), 'pipelineWithS3CacheCustomTest', {
      env,
    });
    const props = createPipelineStackProps(stack);
    props.cacheConfig = { type: 's3', bucketName: 'my-custom-cache-bucket' };

    // Act
    const actual = new PipelineStack(stack, props);

    // Assert
    const template = Template.fromStack(actual);
    expect(template.toJSON()).toMatchSnapshot('pipelineWithS3CacheCustom');

    // Verify deploy project has S3 cache configured with custom bucket
    template.hasResourceProperties('AWS::CodeBuild::Project', {
      Name: 'build-pipeline-deploy-envilder-test',
      Cache: {
        Type: 'S3',
        Location: 'my-custom-cache-bucket/envilder',
      },
    });
  });

  function createPipelineStackProps(app: Stack): PipelineStackProps {
    return {
      name: 'FrontendPipelineStack',
      branch: 'main',
      githubRepo: 'envilder',
      envName: AppEnvironment.Test,
      secretTokenArn: `arn:aws:secretsmanager:${env.region}:${env.account}:secret:github-token`,
      deployBuildSpec: [`path/build-pipeline.yml`],
      testBuildSpec: [`path/test-pipeline.yml`],
      testProjectName: 'project-test',
      vpc: new Vpc(app, 'vpc'),
      env,
      environment: {
        SOME_KEY: {
          value: 'https://some-url-for-test',
        },
      },
      bucketRemovalPolicy: RemovalPolicy.DESTROY,
      domain: 'envilder-test',
      stackName: 'pipeline-stack',
    };
  }
});
