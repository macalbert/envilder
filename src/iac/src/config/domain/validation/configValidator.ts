import type { IDeploymentRequest } from '../../application/deployInfrastructure/models/deploymentRequest';
import { ConfigValidationError } from '../../infrastructure/utilities/errors';

/**
 * Service responsible for validating IAC configuration
 */
export class ConfigValidator {
  /**
   * Validate IAC configuration
   * @param config IAC configuration to validate
   * @throws ConfigValidationError if validation fails
   */
  validate(config: IDeploymentRequest): void {
    const errors: string[] = [];

    // Validate required string fields
    if (!config.repoName || config.repoName.trim() === '') {
      errors.push('repoName is required and cannot be empty');
    }

    if (!config.vpcId || config.vpcId.trim() === '') {
      errors.push('vpcId is required and cannot be empty');
    }

    if (!config.branch || config.branch.trim() === '') {
      errors.push('branch is required and cannot be empty');
    }

    // Validate domain configuration
    if (!config.domain) {
      errors.push('domain configuration is required');
    } else {
      if (!config.domain.name || config.domain.name.trim() === '') {
        errors.push('domain.name is required and cannot be empty');
      }

      if (
        !config.domain.certificateId ||
        config.domain.certificateId.trim() === ''
      ) {
        errors.push('domain.certificateId is required and cannot be empty');
      }

      if (
        !config.domain.hostedZoneId ||
        config.domain.hostedZoneId.trim() === ''
      ) {
        errors.push('domain.hostedZoneId is required and cannot be empty');
      }
    }

    // Validate stacks configuration
    if (!config.stacks) {
      errors.push('stacks configuration is required');
    } else {
      if (!config.stacks.frontend) {
        errors.push('stacks.frontend is required');
      } else {
        this.validateFrontendStacks(config.stacks.frontend, errors);
      }
    }

    // Throw error if validation failed
    if (errors.length > 0) {
      throw new ConfigValidationError(
        `Configuration validation failed with ${errors.length} error(s)`,
        errors,
      );
    }
  }

  private validateFrontendStacks(
    frontend: IDeploymentRequest['stacks']['frontend'],
    errors: string[],
  ): void {
    if (frontend.staticWebsites) {
      for (const [index, website] of frontend.staticWebsites.entries()) {
        if (!website.name || website.name.trim() === '') {
          errors.push(`frontend.staticWebsites[${index}].name is required`);
        }
        if (!website.projectPath || website.projectPath.trim() === '') {
          errors.push(
            `frontend.staticWebsites[${index}].projectPath is required`,
          );
        }
        if (!website.subdomain || website.subdomain.trim() === '') {
          errors.push(
            `frontend.staticWebsites[${index}].subdomain is required`,
          );
        }
      }
    }
  }
}
