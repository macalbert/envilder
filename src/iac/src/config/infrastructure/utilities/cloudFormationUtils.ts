/**
 * Utilities for AWS CloudFormation related operations
 */

/**
 * Returns a formatted repository name that complies with AWS CloudFormation stack naming requirements.
 * Stack names must match the regular expression: /^[A-Za-z][A-Za-z0-9-]*$/
 * - Must start with a letter (A-Z, a-z)
 * - Can only contain letters, numbers, and hyphens
 *
 * @param repoName The GitHub repository name to format
 * @returns A formatted name that complies with CloudFormation naming requirements
 */
export function formatRepoNameForCloudFormation(repoName: string): string {
  let formattedName = repoName.toLowerCase();

  formattedName = formattedName.replace(/[^A-Za-z0-9]/g, '-');
  formattedName = formattedName.replace(/-+/g, '-');
  formattedName = formattedName.replace(/^-|-$/g, '');

  if (!/^[A-Za-z]/.test(formattedName)) {
    formattedName = `r-${formattedName}`;
  }

  return formattedName;
}
