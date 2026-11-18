import { Stack, type StackProps, Tags } from "aws-cdk-lib";
import { ManagedPolicy, PermissionsBoundary } from "aws-cdk-lib/aws-iam";
import type { Construct } from "constructs";
import type { AppEnvironment } from "../core/types";
import { formatRepoNameForCloudFormation } from "./utils";

export interface DomainConfig {
	subdomain?: string;
	domainName: string;
	hostedZoneId: string;
	certificateId: string;
}

export interface CustomStackProps extends StackProps {
	githubRepo: string;
	envName: AppEnvironment;
	name: string;
	stackName: string;
	/** Managed policy name applied as permissions boundary to every role. */
	permissionsBoundaryName?: string;
}

export class CustomStack extends Stack {
	props: CustomStackProps;

	constructor(scope: Construct, props: CustomStackProps) {
		super(scope, getStackName(props), props);

		this.props = props;

		this.addProjectTags();

		if (props.permissionsBoundaryName) {
			PermissionsBoundary.of(this).apply(
				ManagedPolicy.fromManagedPolicyName(
					this,
					"PermissionsBoundary",
					props.permissionsBoundaryName,
				),
			);
		}
	}

	getStackId(): string {
		return getStackName(this.props);
	}

	private addProjectTags(): void {
		Tags.of(this).add("StackId", getStackName(this.props), {
			priority: 300,
		});

		Tags.of(this).add("Environment", this.props.envName.valueOf(), {
			priority: 300,
		});

		Tags.of(this).add("Project", this.props.githubRepo, {
			priority: 300,
		});
	}

	public getCloudFormationRepoName(): string {
		return formatRepoNameForCloudFormation(this.props.githubRepo);
	}
}

function getStackName(props: CustomStackProps): string {
	return `macalbert-${formatRepoNameForCloudFormation(props.githubRepo)}-${props.name}-${props.envName}-stack`.toLowerCase();
}
