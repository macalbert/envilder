import { describe, it, expect, vi } from "vitest";
import * as fs from "fs/promises";
import { run } from "../src/index";

vi.mock("fs/promises");
vi.mock("aws-sdk", () => ({
  SSM: vi.fn(() => ({
    getParameter: vi.fn(({ Name }) => ({
      promise: vi.fn(() =>
        Promise.resolve({ Parameter: { Value: "mock_value" } })
      ),
    })),
  })),
}));

describe("Envilder CLI", () => {
  it("Should_generateEnvFileFromSsm_When_", async () => {
    // Arrange
    const mockMap = {
      NEXT_PUBLIC_CREDENTIAL_EMAIL: "/path/to/ssm/email",
    };

    vi.spyOn(fs, "readFile").mockResolvedValueOnce(JSON.stringify(mockMap));
    vi.spyOn(fs, "writeFile").mockResolvedValueOnce();

    // Act
    await run("param_map.json", ".env");

    // Assert
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.any(String),
      "NEXT_PUBLIC_CREDENTIAL_EMAIL=mock_value"
    );
  });
});
