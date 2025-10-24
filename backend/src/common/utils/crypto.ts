import { createHash } from "crypto";
import fs from "fs";

export async function getFileSha256(input: string | Buffer): Promise<string> {
  const hash = createHash("sha256");

  if (typeof input === "string") {
    // Input is a file path
    const fileStream = fs.createReadStream(input);
    return new Promise((resolve, reject) => {
      fileStream.on("data", (data) => hash.update(data));
      fileStream.on("end", () => resolve(hash.digest("hex")));
      fileStream.on("error", reject);
    });
  } else {
    // Input is a Buffer (in-memory)
    hash.update(input);
    return hash.digest("hex");
  }
}
