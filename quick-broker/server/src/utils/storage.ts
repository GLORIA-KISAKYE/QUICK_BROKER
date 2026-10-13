import { config } from '../config';

/**
 * Upload photo — uses Cloudflare R2 if configured, otherwise stores locally
 */
export async function uploadPhoto(key: string, body: Buffer, contentType: string): Promise<string> {
  // Try R2 first if configured
  if (config.r2AccessKeyId && config.r2SecretAccessKey && config.r2Endpoint) {
    try {
      const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
      const s3Client = new S3Client({
        region: 'auto',
        endpoint: config.r2Endpoint,
        credentials: {
          accessKeyId: config.r2AccessKeyId,
          secretAccessKey: config.r2SecretAccessKey,
        },
      });

      await s3Client.send(new PutObjectCommand({
        Bucket: config.r2Bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }));

      return `${config.r2PublicUrl}/${key}`;
    } catch (error) {
      console.error('R2 upload failed, falling back to local:', error);
    }
  }

  // Fallback: store in local uploads directory
  const fs = await import('fs');
  const path = await import('path');
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filePath = path.join(uploadsDir, key);
  fs.writeFileSync(filePath, body);

  return `/uploads/${key}`;
}

/**
 * Delete photo — tries R2 first, then local
 */
export async function deletePhoto(key: string): Promise<void> {
  // Try R2 first
  if (config.r2AccessKeyId && config.r2SecretAccessKey && config.r2Endpoint) {
    try {
      const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3');
      const s3Client = new S3Client({
        region: 'auto',
        endpoint: config.r2Endpoint,
        credentials: {
          accessKeyId: config.r2AccessKeyId,
          secretAccessKey: config.r2SecretAccessKey,
        },
      });

      await s3Client.send(new DeleteObjectCommand({
        Bucket: config.r2Bucket,
        Key: key,
      }));
      return;
    } catch (error) {
      console.error('R2 delete failed:', error);
    }
  }

  // Fallback: delete local file
  const fs = await import('fs');
  const path = await import('path');
  const filePath = path.join(process.cwd(), 'uploads', key);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
