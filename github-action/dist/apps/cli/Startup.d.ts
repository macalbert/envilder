import { Container } from 'inversify';
export declare class Startup {
    private readonly container;
    constructor();
    static build(): Startup;
    configureServices(): this;
    configureInfrastructure(awsProfile?: string, provider?: string): this;
    create(): Container;
    getServiceProvider(): Container;
}
//# sourceMappingURL=Startup.d.ts.map