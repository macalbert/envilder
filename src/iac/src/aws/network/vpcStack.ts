import { CfnOutput } from 'aws-cdk-lib';
import {
  type IVpc,
  IpAddresses,
  type SubnetConfiguration,
  Vpc,
} from 'aws-cdk-lib/aws-ec2';
import type { Construct } from 'constructs';
import {
  CustomStack,
  type CustomStackProps,
} from '../../config/domain/customStack';

/**
 * Properties for configuring the VPC stack.
 *
 * This interface extends CustomStackProps with additional properties required to create a VPC.
 *
 * Properties include:
 * - vpcName: The base name for the VPC.
 * - vpcCdir: The CIDR block for the VPC.
 * - maxAzs: (Optional) The maximum number of availability zones to use.
 * - natGateways: (Optional) The number of NAT gateways to create.
 * - enableDnsHostnames: (Optional) Whether to enable DNS hostnames for instances.
 * - enableDnsSupport: (Optional) Whether to enable DNS support.
 * - subnetConfiguration: An array of subnet configurations for the VPC.
 *
 * @example
 * const vpcStackProps: VPCStackProps = {
 *   vpcName: "my-vpc",
 *   vpcCdir: "10.0.0.0/16",
 *   maxAzs: 3,
 *   natGateways: 1,
 *   enableDnsHostnames: true,
 *   enableDnsSupport: true,
 *   subnetConfiguration: [
 *     {
 *       name: "Public",
 *       subnetType: SubnetType.PUBLIC,
 *       cidrMask: 24,
 *     },
 *     {
 *       name: "Private",
 *       subnetType: SubnetType.PRIVATE_WITH_NAT,
 *       cidrMask: 24,
 *     },
 *   ],
 *   // plus additional CustomStackProps properties...
 * };
 */
export interface VPCStackProps extends CustomStackProps {
  vpcName: string;
  vpcCdir: string;
  maxAzs?: number;
  natGateways?: number;
  enableDnsHostnames?: boolean;
  enableDnsSupport?: boolean;
  subnetConfiguration: SubnetConfiguration[];
}

/**
 * VpcStack provisions an Amazon Virtual Private Cloud (VPC) with the specified configuration.
 *
 * This stack creates a VPC with the given name (appended with the environment name), CIDR block, and subnet
 * configurations. It supports optional settings such as maximum availability zones, NAT gateways, and DNS settings.
 * The VPC ID is output as a CloudFormation output for external reference.
 *
 * @example
 * new VpcStack(app, {
 *   vpcName: "my-vpc",
 *   vpcCdir: "10.0.0.0/16",
 *   maxAzs: 3,
 *   natGateways: 1,
 *   enableDnsHostnames: true,
 *   enableDnsSupport: true,
 *   subnetConfiguration: [ ... ],
 *   // plus additional CustomStackProps properties...
 * });
 */
export class VpcStack extends CustomStack {
  public readonly vpc: IVpc;

  /**
   * Constructs a new instance of the VpcStack.
   *
   * This constructor creates a new VPC with the provided configuration. The VPC's name is built by appending the
   * environment name to the provided base vpcName. The CIDR block, availability zones, NAT gateways, and DNS settings
   * are configured based on the input properties. Finally, the VPC ID is output as a CloudFormation output.
   *
   * @param scope - The construct scope in which this stack is defined.
   * @param props - The properties for configuring the VPC.
   */
  constructor(scope: Construct, props: VPCStackProps) {
    super(scope, props);

    this.vpc = new Vpc(this, 'vpcId', {
      vpcName: `${props.vpcName}-${props.envName}`,
      ipAddresses: IpAddresses.cidr(props.vpcCdir),
      maxAzs: props.maxAzs,
      natGateways: props.natGateways,
      enableDnsHostnames: props.enableDnsHostnames,
      enableDnsSupport: props.enableDnsSupport,
      subnetConfiguration: props.subnetConfiguration,
    });

    new CfnOutput(this, 'cfnOutputVpcId', {
      value: this.vpc.vpcId,
      description: 'Created VPC ID',
      exportName: 'VpcStack:vpcId',
    });
  }
}
