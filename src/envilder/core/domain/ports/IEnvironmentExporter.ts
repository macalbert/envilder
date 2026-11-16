export interface IEnvironmentExporter {
  /**
   * Makes the variables available as environment variables to the processes
   * the host starts after Envilder, for example the later steps of a GitHub
   * Actions job. Writes every variable or none.
   */
  export(variables: Readonly<Record<string, string>>): Promise<void>;
}
