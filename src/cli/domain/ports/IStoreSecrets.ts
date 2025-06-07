export interface IStoreSecrets {
  getSecret(name: string): Promise<string | undefined>;
}
