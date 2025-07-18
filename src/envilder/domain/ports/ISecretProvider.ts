export interface ISecretProvider {
  getSecret(name: string): Promise<string | undefined>;
  setSecret(name: string, value: string): Promise<void>;
}
