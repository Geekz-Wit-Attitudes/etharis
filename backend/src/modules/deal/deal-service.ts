import { type UploadBriefResponse } from "./deal-types";
import { prismaClient, MinioService } from "../../common";

import type { PrismaClient } from "../../../generated/prisma";

import { HTTPException } from "hono/http-exception";

const minioService = new MinioService();

export class DealService {
  private prisma: PrismaClient;
  private minio: MinioService;

  constructor(prisma: PrismaClient, minio: MinioService) {
    this.prisma = prisma;
    this.minio = minio;
  }

  async uploadBrief(
    userId: string,
    contentType?: string
  ): Promise<UploadBriefResponse> {
    const response: UploadBriefResponse = await this.minio.generateUploadUrl(
      userId,
      contentType
    );

    console.log(contentType);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    console.log("user", user);

    if (!user) throw new HTTPException(404, { message: "User not found" });

    await this.prisma.brief.create({
      data: {
        user_id: userId,
        file_url: response.file_url,
      },
    });

    return response;
  }

  async getSecureDownloadUrl(briefId: string, userId: string) {
    const brief = await this.prisma.brief.findUnique({
      where: { id: briefId },
    });

    if (!brief) throw new HTTPException(404, { message: "Brief not found" });

    if (brief.user_id !== userId) {
      throw new HTTPException(403, { message: "User not authorized" });
    }

    // Derive object key from file_url
    const fileKey = brief.file_url.split(`${this.minio.bucket}/`)[1];
    const signedUrl = await this.minio.generateDownloadUrl(fileKey);

    return signedUrl;
  }
}

export const dealService = new DealService(prismaClient, minioService);
