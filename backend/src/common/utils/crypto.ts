import crypto from "crypto";

export async function getFileSha256(downloadUrl: string): Promise<string> {
  const res = await fetch(downloadUrl);
  if (!res.ok) throw new Error(`Failed to fetch file: ${res.statusText}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  return crypto.createHash("sha256").update(buffer).digest("hex");
}
