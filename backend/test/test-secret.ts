import { env, vaultClient, vaultWalletPath } from "@/common";

async function testVaultWrite() {
  const server = { privateKey: env.serverWalletPrivateKey };

  try {
    console.log(`Writing test secret to Vault at path: ${vaultWalletPath}`);
    await vaultClient.write(vaultWalletPath, { data: server });
    console.log("✅ Vault write succeeded!");
  } catch (err: any) {
    console.error("❌ Vault write failed:", err.message);
    if (err.response?.body) {
      console.error("Vault response body:", err.response.body);
    }
  }
}

// Run the test
testVaultWrite()
  .then(() => console.log("Test completed"))
  .catch((e) => console.error("Test script failed:", e));
