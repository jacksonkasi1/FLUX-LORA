/**
 * S3 service with improved organization
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { serverEnv } from '@server/config';

// ** Initialize S3 client
const client = new S3Client({ region: serverEnv.aws.region });

/**
 * S3 service class with organized methods
 */
export class S3Service {
  /**
   * Generate presigned URL for file upload
   */
  static async generatePresignedUrl({
    bucket,
    key,
    contentType,
    expiresIn = serverEnv.aws.s3.presignedUrlExpiry
  }: {
    bucket: string;
    key: string;
    contentType: string;
    expiresIn?: number;
  }): Promise<{ url: string; fields?: Record<string, string> }> {
    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
      });

      const url = await getSignedUrl(client, command, { expiresIn });
      return { url };
    } catch (error) {
      console.error('Error generating presigned upload URL:', error);
      throw error;
    }
  }

  /**
   * Delete an object from S3
   */
  static async deleteObject(bucket: string, key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      await client.send(command);
    } catch (error) {
      console.error('Error deleting S3 object:', error);
      throw error;
    }
  }

  /**
   * Get public URL for an object
   */
  static getPublicUrl(bucket: string, key: string): string {
    return `https://${bucket}.s3.${serverEnv.aws.region}.amazonaws.com/${key}`;
  }
}
