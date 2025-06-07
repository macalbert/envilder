export interface ISecretProvider {
  getSecret(name: string): Promise<string | undefined>;
}
