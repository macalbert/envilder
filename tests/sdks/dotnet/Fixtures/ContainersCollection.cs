namespace Envilder.Tests.Fixtures;

[CollectionDefinition(nameof(ContainersCollection), DisableParallelization = false)]
public class ContainersCollection : ICollectionFixture<LocalStackFixture>, ICollectionFixture<LowkeyVaultFixture>;