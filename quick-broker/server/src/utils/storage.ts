import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { config } from '../config';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: config.r2Endpoint,
  credentials: {
    accessKeyId: config.r2AccessKeyId,
    secretAccessKey: config.r2SecretAccessKey
  }
});

export async function uploadPhoto(key: string, body: Buffer, contentType: string): Promise<string> {
  if (!config.r2AccessKeyId) {
    console.log(`[DEV] Would upload ${key} (${body.length} bytes)`);
    return `https://photos.quickbroker.duckdns.org/${key}`;
  }

  await s3Client.send(new PutObjectCommand({
    Bucket: config.r2Bucket,
    Key: key,
    Body: body,
    ContentType: contentType
  }));

  return `${config.r2PublicUrl}/${key}`;
}

export async function deletePhoto(key: string): Promise<void> {
  if (!config.r2AccessKeyId) {
    console.log(`[DEV] Would delete ${key}`);
    return;
  }

  await s3Client.send(new DeleteObjectCommand({
    Bucket: config.r2Bucket,
    Key: key
  }));
}
