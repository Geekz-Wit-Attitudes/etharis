import fs from "fs";
import path from "path";
import { getFileSha256 } from "@/common/utils/crypto";
import { dealService } from "@/modules/deal/deal-service";
import { fileTypeFromBuffer } from "file-type";

async function testUpload() {
  const userId = "cmgvffobw0002l1fmej48h1kl"; // existing user in DB

  const filePath = path.resolve("./src/common/templates/logo.png");
  const fileData = fs.readFileSync(filePath);

  const type = await fileTypeFromBuffer(fileData);
  const contentType = type?.mime || "application/octet-stream";

  // 1️⃣ Generate presigned upload URL and save brief in DB
  const { upload_url, file_url } = await dealService.uploadBrief(
    userId,
    contentType
  );

  console.log(contentType);

  console.log("Upload URL:", upload_url);
  console.log("File URL saved in DB:", file_url);

  const uploadRes = await fetch(upload_url, {
    method: "PUT",
    body: fileData,
    headers: { "Content-Type": contentType },
  });

  if (!uploadRes.ok) {
    throw new Error(`Upload failed: ${uploadRes.statusText}`);
  }
  console.log("Upload successful with status:", uploadRes.status);

  // 4️⃣ Compute SHA-256 hash of downloaded file
  const sha256Hash = await getFileSha256(file_url);
  console.log("SHA-256 from downloaded file:", sha256Hash);
}

testUpload().catch(console.error);
