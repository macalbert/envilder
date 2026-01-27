import { Container } from 'inversify';
export declare class Startup {
    private readonly container;
    constructor();
    static build(): Startup;
    configureServices(): this;
    /**
     * Configures infrastructure services for the application.
     * Optionally accepts an AWS profile to use for service configuration.
     * @param awsProfile - The AWS profile to use for configuring infrastructure services.
     * @returns The current instance for method chaining.
     */
    configureInfrastructure(awsProfile?: string): this;
    create(): Container;
    getServiceProvider(): Container;
    private configureInfrastructureServices;
    private configureApplicationServices;
}
//# sourceMappingURL=Startup.d.ts.map