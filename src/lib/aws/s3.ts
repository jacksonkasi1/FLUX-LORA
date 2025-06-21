import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
});

const BUCKET_NAME = process.env.S3_BUCKET || 'flux-lora-api-dev-storage';

export class S3Service {
  static async getPresignedUploadUrl(key: string, contentType: string, expiresIn: number = 3600) {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    return await getSignedUrl(client, command, { expiresIn });
  }

  static async getPresignedDownloadUrl(key: string, expiresIn: number = 3600) {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(client, command, { expiresIn });
  }

  static async deleteObject(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await client.send(command);
  }

  static getPublicUrl(key: string) {
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
  }

  static generateKey(userId: string, type: 'training' | 'generated', filename: string) {
    const timestamp = Date.now();
    const extension = filename.split('.').pop();
    return `${type}/${userId}/${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;
  }
}
