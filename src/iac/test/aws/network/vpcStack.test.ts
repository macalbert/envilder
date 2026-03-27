import { Template } from 'aws-cdk-lib/assertions';
import { SubnetType } from 'aws-cdk-lib/aws-ec2';
import 'source-map-support/register';
import { App, Stack } from 'aws-cdk-lib';
import {
  type VPCStackProps,
  VpcStack,
} from '../../../src/aws/network/vpcStack';
import { AppEnvironment } from '../../../src/config/domain/model/appEnvironment';

describe('VpcStackTest', () => {
  const expected: VPCStackProps = {
    name: 'VpcStack',
    stackName: 'shared',
    maxAzs: 2,
    natGateways: 2,
    enableDnsHostnames: true,
    enableDnsSupport: true,
    envName: AppEnvironment.Test,
    vpcName: 'private-CustomVpc',
    vpcCdir: '22.0.0.0/16',
    subnetConfiguration: [
      {
        cidrMask: 20,
        name: 'Public1',
        subnetType: SubnetType.PUBLIC,
      },
      {
        cidrMask: 20,
        name: 'Private1',
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
      },
    ],
    githubRepo: 'shared-test',
  };
  const env = {
    account: 'account',
    region: 'eu-west-1',
  };

  test('Should_MatchSnapshotAndResources_When_VpcStackIsCreated', () => {
    // Arrange
    const stack = new Stack(new App(), 'VpcStackTest', { env });

    // Act
    const vpcStack = new VpcStack(stack, expected);

    // Assert
    const template = Template.fromStack(vpcStack);
    expect(template.toJSON()).toMatchSnapshot('VpcStackTest');
    template.resourceCountIs('AWS::EC2::VPC', 1);
    template.hasResourceProperties('AWS::EC2::VPC', {
      EnableDnsSupport: expected.enableDnsSupport,
      EnableDnsHostnames: expected.enableDnsHostnames,
      CidrBlock: expected.vpcCdir,
    });
    template.resourceCountIs('AWS::EC2::InternetGateway', 1);
    template.resourceCountIs('AWS::EC2::VPCGatewayAttachment', 1);
    template.resourceCountIs('AWS::EC2::Subnet', 4);
  });
});
