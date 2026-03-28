import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import {
  StaticWebsiteStack,
  type StaticWebsiteStackProps,
} from '../../../../src/iac/infrastructure/stacks/staticWebsiteStack';
import type { DomainConfig } from '../../../../src/iac/infrastructure/stacks/customStack';
import { AppEnvironment } from '../../../../src/iac/domain/model/appEnvironment';

describe('Static website Stack', () => {
  const env = {
    account: 'account',
    region: 'eu-west-1',
  };

  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'static-website-test-'));
    fs.writeFileSync(path.join(tmpDir, 'index.html'), '<html></html>');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('Should_CreateWebsite_When_StackIsCalled', () => {
    // Arrange
    const stack = new Stack(new App(), 'staticWebsiteStackTest', {
      env: env,
    });
    const props = createStaticWebsiteStackProps();

    // Act
    const actual = new StaticWebsiteStack(stack, props);

    // Assert
    const template = Template.fromStack(actual).toJSON();
    normalizeStaticWebsiteTemplate(template);

    expect(template).toMatchSnapshot('staticWebsiteStackTest');
  });

  // biome-ignore lint/suspicious/noExplicitAny: CDK template is untyped
  function normalizeStaticWebsiteTemplate(template: Record<string, any>): void {
    for (const key in template.Resources) {
      const resource = template.Resources[key];
      if (resource.Properties.SourceObjectKeys) {
        const { SourceObjectKeys: _SourceObjectKeys, ...otherProps } =
          resource.Properties;
        resource.Properties = otherProps;
      }
      if (resource.Properties.Content?.S3Key) {
        const { S3Key: _S3Key, ...otherContentProps } =
          resource.Properties.Content;
        resource.Properties.Content = otherContentProps;
      }
      if (resource.Properties.Code?.S3Key) {
        const { S3Key: _S3KeyCode, ...otherCodeProps } =
          resource.Properties.Code;
        resource.Properties.Code = otherCodeProps;
      }
    }
  }

  function createStaticWebsiteStackProps(): StaticWebsiteStackProps {
    const domains: DomainConfig[] = [
      {
        subdomain: 'test',
        domainName: 'domain.com',
        hostedZoneId: '123456789',
        certificateId: 'some-guid',
      },
    ];

    return {
      env: env,
      name: 'websitetest',
      domains: domains,
      distFolderPath: tmpDir,
      envName: AppEnvironment.Development,
      githubRepo: 'test-website',
      stackName: 'test-web-app',
    };
  }
});
