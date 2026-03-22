import { Container } from 'inversify';
export declare class Startup {
    private readonly container;
    constructor();
    static build(): Startup;
    configureServices(): this;
    /**
     * Configures infrastructure services for the application.
     * @param awsProfile - The AWS profile to use for configuring infrastructure services.
     * @param provider - The cloud provider to use (aws or azure), defaults to aws.
     * @returns The current instance for method chaining.
     */
    configureInfrastructure(awsProfile?: string, provider?: string): this;
    create(): Container;
    getServiceProvider(): Container;
    private configureInfrastructureServices;
    private configureApplicationServices;
}
//# sourceMappingURL=Startup.d.ts.map