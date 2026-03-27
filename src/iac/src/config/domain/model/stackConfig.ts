// ============================================================================
// FRONTEND TYPES
// ============================================================================

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

// ============================================================================
// SHARED TYPES
// ============================================================================

export interface PipelineConfig {
  manualApproval: boolean;
  slackChannelConfigurationName?: string;
  testBuildSpecs: readonly string[];
  deployBuildSpecs: readonly string[];
}

export interface SharedStackConfig {
  pipeline?: readonly PipelineConfig[];
}
