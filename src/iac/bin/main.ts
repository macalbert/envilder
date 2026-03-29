#!/usr/bin/env node
import path from "node:path";
import type { Environment, Stack } from "aws-cdk-lib";
/**
 * CDK Infrastructure Deployment Entry Point
 */
import { App } from "aws-cdk-lib";
import { AppEnvironment } from "../lib/core/types";
import { StaticWebsiteStack } from "../lib/stacks/staticWebsiteStack";

// ============================================================================
// Types
// ============================================================================

interface StaticWebsiteConfig {
	name: string;
	projectPath: string;
	subdomain?: string;
}

interface DeploymentConfig {
	repoName: string;
	branch: string;
	environment: AppEnvironment;
	domain: {
		name: string;
		certificateId: string;
		hostedZoneId: string;
	};
	stacks: {
		frontend: {
			staticWebsites: readonly StaticWebsiteConfig[];
		};
	};
	rootPath?: string;
}

// ============================================================================
// Configuration
// ============================================================================

const config: DeploymentConfig = {
	repoName: "envilder",
	branch: "main",
	environment: AppEnvironment.Production,
	domain: {
		name: "envilder.com",
		certificateId: "e04983fe-1561-4ebe-9166-83f77789964a",
		hostedZoneId: "Z0718467FEEOZ35UNCTO",
	},
	stacks: {
		frontend: {
			staticWebsites: [
				{
					name: "Website",
					projectPath: "envilder/src/apps/website/dist",
				},
			],
		},
	},
};

// ============================================================================
// Utils
// ============================================================================

function getRootPath(rootPath?: string): string {
	return rootPath ?? path.join(process.cwd(), "../../../");
}

function resolveFullPath(rootPath: string, relativePath: string): string {
	return path.join(rootPath, relativePath);
}

function logInfo(message: string): void {
	process.stderr.write(`${message}\x1b[E\n`);
}

function logError(error: Error): void {
	process.stderr.write(`\x1b[31m❌ Error: ${error.message}\x1b[0m\x1b[E\n`);
	if (error.stack) {
		process.stderr.write(`${error.stack}\x1b[E\n`);
	}
}

function logTable(
	entries: ReadonlyArray<{ label: string; value: string }>,
): void {
	const MAX_VALUE_WIDTH = 40;
	const truncate = (s: string) =>
		s.length > MAX_VALUE_WIDTH ? `…${s.slice(-(MAX_VALUE_WIDTH - 1))}` : s;

	const rows = entries.map(({ label, value }) => ({
		label,
		value: truncate(value),
	}));

	const maxLabel = Math.max(...rows.map((e) => e.label.length));
	const maxValue = Math.max(...rows.map((e) => e.value.length));
	const header = " 📁 Deployment Info ";
	const innerWidth = maxLabel + maxValue + 4;
	const padding = Math.max(0, innerWidth - header.length);

	const nl = "\x1b[E\n";

	process.stderr.write(nl);
	process.stderr.write(`╭─${header}${"─".repeat(padding)}╮${nl}`);
	for (const { label, value } of rows) {
		process.stderr.write(
			`│ ${label.padEnd(maxLabel)} │ ${value.padEnd(maxValue)} │${nl}`,
		);
	}
	process.stderr.write(
		`╰${"─".repeat(maxLabel + 2)}┴${"─".repeat(maxValue + 2)}╯${nl}`,
	);
	process.stderr.write(nl);
}

export function validateConfig(config: DeploymentConfig): void {
	const errors: string[] = [];

	if (!config.repoName || config.repoName.trim() === "") {
		errors.push("repoName is required and cannot be empty");
	}

	if (!config.branch || config.branch.trim() === "") {
		errors.push("branch is required and cannot be empty");
	}

	if (config.environment === undefined || config.environment === null) {
		errors.push("environment is required and cannot be empty");
	}

	if (!config.domain) {
		errors.push("domain configuration is required");
	} else {
		if (!config.domain.name || config.domain.name.trim() === "") {
			errors.push("domain.name is required and cannot be empty");
		}
		if (
			!config.domain.certificateId ||
			config.domain.certificateId.trim() === ""
		) {
			errors.push("domain.certificateId is required and cannot be empty");
		}
		if (
			!config.domain.hostedZoneId ||
			config.domain.hostedZoneId.trim() === ""
		) {
			errors.push("domain.hostedZoneId is required and cannot be empty");
		}
	}

	if (!config.stacks) {
		errors.push("stacks configuration is required");
	} else {
		if (!config.stacks.frontend) {
			errors.push("stacks.frontend is required");
		} else {
			const { staticWebsites } = config.stacks.frontend;
			if (staticWebsites) {
				for (const [index, website] of staticWebsites.entries()) {
					if (!website.name || website.name.trim() === "") {
						errors.push(`frontend.staticWebsites[${index}].name is required`);
					}
					if (!website.projectPath || website.projectPath.trim() === "") {
						errors.push(
							`frontend.staticWebsites[${index}].projectPath is required`,
						);
					}
				}
			}
		}
	}

	if (errors.length > 0) {
		throw new Error(
			`Configuration validation failed with ${errors.length} error(s):\n${errors.join("\n")}`,
		);
	}
}

// ============================================================================
// Deployment
// ============================================================================

export function deploy(configOverride?: DeploymentConfig): Stack[] {
	const effectiveConfig = configOverride ?? config;
	const rootPath = getRootPath(effectiveConfig.rootPath);

	try {
		validateConfig(effectiveConfig);

		// Log deployment info
		const entries: Array<{ label: string; value: string }> = [
			{ label: "Repository", value: effectiveConfig.repoName },
			{ label: "Branch", value: effectiveConfig.branch },
			{ label: "Environment", value: String(effectiveConfig.environment) },
		];

		if (process.env.CDK_DEFAULT_REGION) {
			entries.push({ label: "Region", value: process.env.CDK_DEFAULT_REGION });
		}
		if (process.env.CDK_DEFAULT_ACCOUNT) {
			entries.push({
				label: "Account",
				value: `***${process.env.CDK_DEFAULT_ACCOUNT.slice(-4)}`,
			});
		}

		entries.push({ label: "Root Path", value: rootPath });

		for (const ws of effectiveConfig.stacks.frontend.staticWebsites) {
			entries.push({
				label: ws.name,
				value: resolveFullPath(rootPath, ws.projectPath),
			});
		}

		logTable(entries);

		logInfo("🎯 Requested stacks:");

		const app = new App();
		const envFromCli: Environment = {
			account: process.env.CDK_DEFAULT_ACCOUNT,
			region: process.env.CDK_DEFAULT_REGION,
		};

		const stacks: Stack[] = [];

		for (const websiteConfig of effectiveConfig.stacks.frontend
			.staticWebsites) {
			const distFolderPath = resolveFullPath(
				rootPath,
				websiteConfig.projectPath,
			);

			const stack = new StaticWebsiteStack(app, {
				env: envFromCli,
				name: websiteConfig.name,
				domains: [
					{
						subdomain: websiteConfig.subdomain,
						domainName: effectiveConfig.domain.name,
						certificateId: effectiveConfig.domain.certificateId,
						hostedZoneId: effectiveConfig.domain.hostedZoneId,
					},
				],
				distFolderPath,
				envName: effectiveConfig.environment,
				githubRepo: effectiveConfig.repoName,
				stackName: `${effectiveConfig.repoName}-${websiteConfig.name}`,
			});

			stacks.push(stack);
		}

		return stacks;
	} catch (error) {
		if (error instanceof Error) {
			logError(error);
		}
		throw error;
	}
}

if (!process.env.VITEST) {
	deploy();
}
