export interface ModulePathConfig {
  name: string;
  projectPath: string;
}

export interface StaticWebsiteConfig extends ModulePathConfig {
  subdomain: string;
}

export interface FrontendStackConfig {
  staticWebsites: readonly StaticWebsiteConfig[];
}
