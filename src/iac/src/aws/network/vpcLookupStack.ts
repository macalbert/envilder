import { type Environment, Stack, type StackProps } from 'aws-cdk-lib';
import { type IVpc, Vpc } from 'aws-cdk-lib/aws-ec2';
import type { Construct } from 'constructs';

export interface VpcLookupStackProps extends StackProps {
  vpcId: string;
  env?: Environment;
}

/**
 * Stack for looking up an existing VPC by ID
 * This is used to retrieve VPC information for stack deployments
 */
export class VpcLookupStack extends Stack {
  public readonly vpc: IVpc;

  constructor(scope: Construct, props: VpcLookupStackProps) {
    super(scope, props.vpcId, props);

    this.vpc = Vpc.fromLookup(this, 'VpcNetwork', {
      vpcId: props.vpcId,
    });
  }
}
