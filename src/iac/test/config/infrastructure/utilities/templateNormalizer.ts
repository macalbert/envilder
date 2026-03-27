import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';

interface CloudFormationFunction {
  'Fn::Sub'?: string;
  [key: string]: unknown;
}

interface LambdaFunctionCode {
  ImageUri: string | CloudFormationFunction;
  [key: string]: unknown;
}

interface LambdaFunctionProperties {
  Code?: LambdaFunctionCode;
  [key: string]: unknown;
}

interface CloudFormationResource {
  Properties?: LambdaFunctionProperties;
  Image?: string;
  'Fn::Join'?: [string, Array<unknown>];
  [key: string]: unknown;
}

export interface CloudFormationTemplate {
  Resources?: Record<string, CloudFormationResource>;
  [key: string]: unknown;
}

type CloudFormationValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | CloudFormationObject
  | CloudFormationArray;
type CloudFormationObject = { [key: string]: CloudFormationValue };
type CloudFormationArray = Array<CloudFormationValue>;

export function normalizeDockerImageReferences(
  input: Stack | Template | CloudFormationTemplate,
): CloudFormationTemplate {
  let templateJson: CloudFormationTemplate;

  if (input instanceof Stack) {
    templateJson = Template.fromStack(input).toJSON();
  } else if (input instanceof Template) {
    templateJson = input.toJSON();
  } else {
    templateJson = input;
  }

  const normalizedTemplate: CloudFormationTemplate = JSON.parse(
    JSON.stringify(templateJson),
  );

  if (normalizedTemplate.Resources) {
    for (const resourceKey in normalizedTemplate.Resources) {
      const resource = normalizedTemplate.Resources[resourceKey];
      normalizeImageUriIfPresent(resource);
      normalizeAllDockerHashesRecursively(resource as CloudFormationObject);
    }
  }

  return normalizedTemplate;
}

function normalizeImageUriIfPresent(
  lambdaResource: CloudFormationResource,
): void {
  const properties = lambdaResource.Properties;
  if (!properties?.Code?.ImageUri) {
    return;
  }

  const imageUriContainer = properties.Code;

  if (typeof imageUriContainer.ImageUri === 'string') {
    imageUriContainer.ImageUri = 'IMAGE_URI_PLACEHOLDER';
  } else if (imageUriContainer.ImageUri['Fn::Sub']) {
    const normalizedEcrPath =
      // biome-ignore lint/suspicious/noTemplateCurlyInString: CloudFormation intrinsic function syntax
      '${AWS::AccountId}.dkr.ecr.${AWS::Region}.${AWS::URLSuffix}/cdk-container-assets-NORMALIZED_HASH';
    imageUriContainer.ImageUri['Fn::Sub'] = normalizedEcrPath;
  }
}

function normalizeAllDockerHashesRecursively(
  value: CloudFormationObject | CloudFormationArray,
): void {
  if (!value || typeof value !== 'object') {
    return;
  }

  if (Array.isArray(value)) {
    normalizeArrayValues(value);
  } else {
    normalizeObjectValues(value);
  }
}

function normalizeArrayValues(array: CloudFormationArray): void {
  for (let i = 0; i < array.length; i++) {
    const item = array[i];

    if (typeof item === 'string' && isDockerImageHash(item)) {
      array[i] = ':NORMALIZED_DOCKER_HASH';
    } else if (item && typeof item === 'object') {
      normalizeAllDockerHashesRecursively(
        item as CloudFormationObject | CloudFormationArray,
      );
    }
  }
}

function normalizeObjectValues(obj: CloudFormationObject): void {
  normalizeImageProperty(obj);
  normalizeFnJoinExpression(obj);

  for (const key in obj) {
    if (Object.hasOwn(obj, key) && obj[key] && typeof obj[key] === 'object') {
      normalizeAllDockerHashesRecursively(
        obj[key] as CloudFormationObject | CloudFormationArray,
      );
    }
  }
}

function normalizeImageProperty(obj: CloudFormationObject): void {
  if (typeof obj.Image === 'string' && isContainerImage(obj.Image)) {
    obj.Image = obj.Image.replace(/:[a-f0-9]{64}/i, ':NORMALIZED_HASH');
  }
}

function normalizeFnJoinExpression(obj: CloudFormationObject): void {
  const fnJoin = obj['Fn::Join'];
  if (!fnJoin || !Array.isArray(fnJoin) || !Array.isArray(fnJoin[1])) {
    return;
  }

  const joinParts = fnJoin[1];
  for (let i = 0; i < joinParts.length; i++) {
    const part = joinParts[i];

    if (typeof part === 'string' && isDockerImageHash(part)) {
      joinParts[i] = ':NORMALIZED_DOCKER_HASH';
    }
  }
}

function isDockerImageHash(value: string): boolean {
  const dockerHashPattern = /^:[a-f0-9]{64}$/i;
  return dockerHashPattern.test(value);
}

function isContainerImage(value: string): boolean {
  return value.includes('dkr.ecr') && /:[a-f0-9]{64}/i.test(value);
}
