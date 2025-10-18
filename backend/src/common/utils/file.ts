import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../config";
import { MINUTE } from "../constants";
import { getExtension } from "hono/utils/mime";

export class MinioService {
  public client: S3Client;
  public bucket: string;

  constructor() {
    this.client = new S3Client({
      endpoint: env.minioEndpoint,
      region: "ap-southeast-1",
      credentials: {
        accessKeyId: env.minioAccessKey,
        secretAccessKey: env.minioSecretKey,
      },
      forcePathStyle: true,
    });

    this.bucket = env.minioBucket;
  }

  // Generate presigned upload URL
  async generateUploadUrl(userId: string, contentType?: string) {
    // Get extension from MIME type if valid
    const ext = contentType ? getExtension(contentType) : undefined;

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2);
    const filename = ext
      ? `${timestamp}-${random}.${ext}`
      : `${timestamp}-${random}`;

    // Full object key in bucket
    const key = `briefs/${userId}/${filename}`;

    // Create the PUT command
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    // Generate presigned URL for upload
    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: 15 * MINUTE, // 15 minutes
    });

    // Permanent file URL (for public bucket)
    const fileUrl = `${env.minioEndpoint}/${this.bucket}/${key}`;

    return { upload_url: uploadUrl, file_url: fileUrl };
  }

  async generateDownloadUrl(fileKey?: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
    });

    // Shorter expiry for downloads
    const downloadUrl = await getSignedUrl(this.client, command, {
      expiresIn: 5 * MINUTE,
    });

    return downloadUrl;
  }
}
