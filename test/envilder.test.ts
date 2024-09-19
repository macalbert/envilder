import * as fs from "fs";
import * as path from "path";
import { fetchSSMParameter, generateEnvFile } from "../src/envilder";
import { SSM } from "aws-sdk";

jest.mock("aws-sdk", () => ({
  SSM: jest.fn(() => ({
    getParameter: jest.fn().mockImplementation((param) => {
      if (param.Name === "/ProjectName/Production/Service/Token") {
        return {
          promise: jest.fn().mockResolvedValue({
            Parameter: { Value: "mocked_value" },
          }),
        };
      } else {
        const error = new Error("SSM fetch failed");
        return {
          promise: jest.fn().mockRejectedValue(error),
        };
      }
    }),
  })),
}));

jest.mock("fs", () => ({
  writeFileSync: jest.fn(),
}));

describe("Envilder", () => {
  const paramMap = {
    NEXT_PUBLIC_CREDENTIAL_EMAIL: "/ProjectName/Production/Service/Token",
  };
  const mockEnvFilePath = path.resolve(__dirname, "./mock.env");

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Should_WriteToFile_When_EnvVariablesFetched", async () => {
    // Arrange
    const expectedContent = ["NEXT_PUBLIC_CREDENTIAL_EMAIL=mocked_value"];

    // Act
    await generateEnvFile(paramMap, mockEnvFilePath);

    // Assert
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      mockEnvFilePath,
      expectedContent.join("\n"),
      "utf-8"
    );
  });

  test("Should_ReturnSSMValue_When_FetchingSSMParameter", async () => {
    // Arrange
    const ssmKey = paramMap["NEXT_PUBLIC_CREDENTIAL_EMAIL"];

    // Act
    const value = await fetchSSMParameter(ssmKey);

    // Assert
    expect(value).toBe("mocked_value");
  });

  test("Should_LogError_When_SSMParameterFetchFails", async () => {
    // Arrange
    const ssmKey = "nonexistent_key";

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Act
    const value = await fetchSSMParameter(ssmKey);

    // Assert
    expect(value).toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  test("Should_LogError_When_FileWriteFails", async () => {
    // Arrange
    const error = new Error("File write failed");

    jest.spyOn(fs, "writeFileSync").mockImplementationOnce(() => {
      throw error;
    });

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Act
    await generateEnvFile(paramMap, mockEnvFilePath);

    // Assert
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error generating .env file:",
      error
    );
    consoleErrorSpy.mockRestore();
  });

  test("Should_DoNothing_When_ParamMapIsEmpty", async () => {
    // Arrange
    const emptyParamMap = {};

    // Act
    await generateEnvFile(emptyParamMap, mockEnvFilePath);

    // Assert
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });
});
