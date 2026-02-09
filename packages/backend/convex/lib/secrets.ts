import {
  SSMClient,
  GetParameterCommand,
  PutParameterCommand,
  GetParameterCommandOutput,
  ResourceDataSyncAlreadyExistsException,
} from "@aws-sdk/client-ssm";

export function createSecretesManagerClient(): SSMClient {
  return new SSMClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY!,
      secretAccessKey: process.env.AWS_SECRET_KEY!,
    },
  });
}

export async function getSecretValue(secretName: string) {
  const client = createSecretesManagerClient();
  return await client.send(
    new GetParameterCommand({ Name: secretName, WithDecryption: true }),
  );
}

export async function setSecretValue(
  secretName: string,
  secretValue: Record<string, unknown>,
): Promise<void> {
  const client = createSecretesManagerClient();
  try {
    await client.send(
      new PutParameterCommand({
        Name: secretName,
        Value: JSON.stringify(secretValue),
        Type: "SecureString",
        Overwrite: true,
      }),
    );
  } catch (error) {
    console.error(`Failed to upsert parameter ${secretName}:`, error);
    throw error;
  }
}

export function parseSecretValue<T = Record<string, unknown>>(
  secretValue: GetParameterCommandOutput,
): T | null {
  if (!secretValue.Parameter?.Value) return null;
  try {
    return JSON.parse(secretValue.Parameter.Value) as T;
  } catch (error) {
    return null;
  }
}
