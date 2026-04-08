namespace YourNamespace.Infrastructure.FeatureName;

public static class FeatureServiceExtensions
{
    public static IServiceCollection AddFeatureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddOptions<FeatureConfig>()
            .Bind(configuration.GetSection(FeatureConfig.SectionName))
            .ValidateFluently();

        services.AddSingleton<IValidator<FeatureConfig>, FeatureConfigValidator>();

        services.AddScoped<IFeatureRepository, FeatureRepository>();
        services.AddTransient<IFeatureMapper, FeatureMapper>();
        services.AddSingleton<IFeatureCache, FeatureCache>();

        services.AddHttpClient<IExternalFeatureClient, ExternalFeatureClient>((sp, client) =>
        {
            var config = sp.GetRequiredService<IOptions<FeatureConfig>>().Value;
            client.BaseAddress = new Uri(config.ApiUrl);
            client.Timeout = TimeSpan.FromSeconds(30);
        });

        return services;
    }
}

public class FeatureConfig
{
    public const string SectionName = "Feature";

    public string ApiUrl { get; init; } = string.Empty;
    public string ApiKey { get; init; } = string.Empty;
    public int TimeoutSeconds { get; init; } = 30;
}

public class FeatureConfigValidator : AbstractValidator<FeatureConfig>
{
    public FeatureConfigValidator()
    {
        RuleFor(x => x.ApiUrl)
            .NotEmpty().WithMessage("ApiUrl is required")
            .Must(url => Uri.TryCreate(url, UriKind.Absolute, out _))
            .WithMessage("ApiUrl must be a valid URL");

        RuleFor(x => x.ApiKey)
            .NotEmpty().WithMessage("ApiKey is required");

        RuleFor(x => x.TimeoutSeconds)
            .GreaterThan(0).WithMessage("TimeoutSeconds must be positive");
    }
}
