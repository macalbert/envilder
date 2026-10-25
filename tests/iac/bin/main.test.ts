import path from "node:path";
import { deploy, validateConfig } from "../../../src/iac/bin/main";
import { AppEnvironment } from "../../../src/iac/lib/core/types";
import { PublicFilesStack } from "../../../src/iac/lib/stacks/publicFilesStack";
import { StaticWebsiteStack } from "../../../src/iac/lib/stacks/staticWebsiteStack";

vi.mock("../../../src/iac/lib/stacks/staticWebsiteStack");
vi.mock("../../../src/iac/lib/stacks/publicFilesStack");

describe("main", () => {
	beforeEach(() => {
		vi.stubEnv("CDK_DEFAULT_ACCOUNT", "123456789012");
		vi.stubEnv("CDK_DEFAULT_REGION", "us-east-1");
		vi.spyOn(process.stderr, "write").mockImplementation(() => true);
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.restoreAllMocks();
	});

	function createValidConfig() {
		return {
			repoName: "test-repo",
			branch: "main",
			environment: AppEnvironment.Production,
			domain: {
				name: "example.com",
				certificateId: "cert-123",
				hostedZoneId: "Z123",
			},
			stacks: {
				frontend: {
					staticWebsites: [] as {
						name: string;
						projectPath: string;
						subdomain?: string;
					}[],
				},
			},
		};
	}

	describe("validateConfig", () => {
		it("Should_Pass_When_ConfigHasValidValues", () => {
			// Arrange
			const config = createValidConfig();

			// Act
			const action = () => validateConfig(config);

			// Assert
			expect(action).not.toThrow();
		});

		it("Should_Throw_When_RequiredFieldsAreMissing", () => {
			// Arrange
			const config = { ...createValidConfig(), repoName: "", branch: "" };

			// Act
			const action = () => validateConfig(config);

			// Assert
			expect(action).toThrow("Configuration validation failed");
		});
	});

	describe("deploy", () => {
		it("Should_ReturnEmptyArray_When_StaticWebsitesIsEmpty", () => {
			// Arrange
			const config = createValidConfig();

			// Act
			const result = deploy(config);

			// Assert
			expect(result).toEqual([]);
		});

		it("Should_CreatePublicFilesStack_When_PublicFilesIsConfigured", () => {
			// Arrange
			const config = {
				...createValidConfig(),
				stacks: {
					...createValidConfig().stacks,
					publicFiles: {
						name: "Files",
						subdomain: "files",
						certificateId: "files-cert",
					},
				},
			};

			// Act
			const result = deploy(config);

			// Assert
			expect(result).toHaveLength(1);
			expect(PublicFilesStack).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({
					subdomain: "files",
					certificateId: "files-cert",
					domainName: "example.com",
					hostedZoneId: "Z123",
				}),
			);
		});

		it("Should_Throw_When_ValidationFails", () => {
			// Arrange
			const config = { ...createValidConfig(), repoName: "" };

			// Act
			const action = () => deploy(config);

			// Assert
			expect(action).toThrow("Configuration validation failed");
		});

		it("Should_ResolveDistFolderFromRepositoryRoot_When_RootPathIsNotProvided", () => {
			// Arrange
			const config = createValidConfig();
			config.stacks.frontend.staticWebsites.push({
				name: "Website",
				projectPath: "src/website/dist",
			});
			const repositoryRoot = path.resolve(__dirname, "../../..");

			// Act
			deploy(config);

			// Assert
			expect(vi.mocked(StaticWebsiteStack)).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({
					distFolderPath: path.join(repositoryRoot, "src/website/dist"),
				}),
			);
		});

		it("Should_ResolveDistFolderFromRootPath_When_RootPathIsProvided", () => {
			// Arrange
			const rootPath = path.resolve("/custom/root");
			const config = { ...createValidConfig(), rootPath };
			config.stacks.frontend.staticWebsites.push({
				name: "Website",
				projectPath: "src/website/dist",
			});

			// Act
			deploy(config);

			// Assert
			expect(vi.mocked(StaticWebsiteStack)).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({
					distFolderPath: path.join(rootPath, "src/website/dist"),
				}),
			);
		});
	});
});
