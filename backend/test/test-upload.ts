import fs from "fs";
import path from "path";
import { getFileSha256 } from "@/common/utils/crypto";
import { dealService } from "@/modules/deal/deal-service";
import { fileTypeFromBuffer } from "file-type";
import { AppError, prismaClient } from "@/common";

async function testUpload() {
  const email = "mdutchand@gmail.com";
  const user = await prismaClient.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(
      `Test user with email "${email}" not found. Please seed first.`,
      404
    );
  }

  const userId = user.id;
  console.log("Using test user:", user.name, `(${userId})`);

  // Read file and determine MIME type
  const filePath = path.resolve("./src/common/templates/lock.png");
  const fileData = fs.readFileSync(filePath);

  const type = await fileTypeFromBuffer(fileData);
  const contentType = type?.mime || "application/octet-stream";

  // Compute SHA-256 hash of the file contents (local file)
  const briefHash = await getFileSha256(fileData);
  console.log("Computed SHA-256 hash:", briefHash);

  // Generate presigned upload URL and register brief in DB
  const { upload_url, file_url } = await dealService.uploadBrief(
    userId,
    briefHash,
    contentType
  );

  console.log("Content type:", contentType);
  console.log("Upload URL:", upload_url);
  console.log("File URL (saved in DB):", file_url);

  // Upload the file to MinIO using the presigned URL
  const uploadRes = await fetch(upload_url, {
    method: "PUT",
    body: fileData,
    headers: { "Content-Type": contentType },
  });

  if (!uploadRes.ok) {
    throw new AppError(
      `Upload failed: ${uploadRes.statusText}`,
      uploadRes.status
    );
  }

  console.log("Upload successful! Status:", uploadRes.status);

  // (Optional) Verify uploaded file integrity by re-downloading and hashing
  // This step ensures that what was uploaded matches the original file
  try {
    const res = await fetch(file_url);
    const uploadedBuffer = Buffer.from(await res.arrayBuffer());
    const uploadedHash = await getFileSha256(uploadedBuffer);

    console.log("SHA-256 hash of uploaded file:", uploadedHash);

    if (uploadedHash !== briefHash) {
      throw new AppError("Uploaded file hash mismatch!", 400);
    }

    console.log("✅ File integrity verified successfully!");
  } catch (err) {
    console.error("⚠️ Could not verify uploaded file:", err);
  }
}

testUpload().catch(console.error);
