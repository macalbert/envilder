namespace Envilder.Tests.Fixtures;

using Amazon.SimpleSystemsManagement;
using DotNet.Testcontainers.Builders;
using Envilder.Infrastructure.Aws;
using Testcontainers.LocalStack;

public sealed class LocalStackFixture : IAsyncLifetime
{
	private const int InternalPort = 4566;

	private LocalStackContainer _container = null!;

	public string ServiceUrl { get; private set; } = null!;

	public IAmazonSimpleSystemsManagement SsmClient { get; private set; } = null!;

	public AwsSsmSecretProvider CreateProvider() =>
		new(SsmClient);

	public async ValueTask InitializeAsync()
	{
		var environment = await LocalStackEnvironment.LoadAsync();

		var waitStrategy = Wait.ForUnixContainer()
			.UntilInternalTcpPortIsAvailable(InternalPort)
			.AddCustomWaitStrategy(new LocalStackHealthCheck(InternalPort));

		_container = new LocalStackBuilder("localstack/localstack:stable")
			.WithEnvironment(environment)
			.WithName($"localstack-{Guid.CreateVersion7()}")
			.WithPortBinding(InternalPort, assignRandomHostPort: true)
			.WithWaitStrategy(waitStrategy)
			.Build();

		await _container.StartAsync();

		ServiceUrl = _container.GetConnectionString();

		SsmClient = new AmazonSimpleSystemsManagementClient(
			new AmazonSimpleSystemsManagementConfig
			{
				ServiceURL = ServiceUrl,
			});
	}

	public async ValueTask DisposeAsync()
	{
		SsmClient?.Dispose();

		if (_container is not null)
		{
			await _container.DisposeAsync();
		}
	}
}