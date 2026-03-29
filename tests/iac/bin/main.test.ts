import { deploy, validateConfig } from "../../../src/iac/bin/main";
import { AppEnvironment } from "../../../src/iac/lib/core/types";

vi.mock("../../../src/iac/lib/stacks/staticWebsiteStack");

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

		it("Should_Throw_When_ValidationFails", () => {
			// Arrange
			const config = { ...createValidConfig(), repoName: "" };

			// Act
			const action = () => deploy(config);

			// Assert
			expect(action).toThrow("Configuration validation failed");
		});
	});
});
