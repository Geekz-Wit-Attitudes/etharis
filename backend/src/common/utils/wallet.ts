import { spawn } from "child_process";
import vault from "node-vault";
import { createWalletClient, http } from "viem";
import {
  generatePrivateKey,
  privateKeyToAccount,
  type PrivateKeyAccount,
} from "viem/accounts";
import { baseSepolia } from "viem/chains";

/**
 * -------------------------
 * Types
 * -------------------------
 */
export interface WalletData {
  address: string;
  secretPath: string;
}

export interface RetrievedWallet {
  address: string;
  account: PrivateKeyAccount;
}

/**
 * -------------------------
 * Wallet Client
 * -------------------------
 */

const endpoint = Bun.env.VAULT_ADDR;
const token = Bun.env.VAULT_TOKEN;

const vaultClient = vault({
  apiVersion: "v1",
  endpoint: endpoint,
  token: token,
});

export async function createWallet(userId: string): Promise<WalletData> {
  // Generate private key + account
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);

  // Store private key securely in Vault
  const secretPath = getSecretPath(userId);
  await vaultClient.write(secretPath, {
    data: { privateKey },
  });

  // Create wallet
  const wallet = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http("https://sepolia.base.org"),
  });

  console.log("Private key:", privateKey);
  console.log("Address:", account.address);
  console.log(`Wallet created for user ${wallet}`);

  const result: WalletData = {
    address: account.address,
    secretPath: secretPath,
  };

  // Return address + Vault reference path
  return result;
}

export async function getWallet(userId: string) {
  const secretPath = getSecretPath(userId);
  const secret = await vaultClient.read(secretPath);

  const privateKey = secret?.data?.data?.privateKey;
  if (!privateKey) {
    throw new Error(`No wallet found for user ${userId}`);
  }

  const account = privateKeyToAccount(privateKey);
  return { address: account.address, account };
}

function getSecretPath(userId: string) {
  return `secret/data/apps/etharis/wallets/${userId}`;
}

export async function initVault() {
  const isDev = Bun.env.NODE_ENV === "development";

  if (!endpoint || !token) {
    console.warn(
      "⚠️  VAULT_ADDR or VAULT_TOKEN not set — running without Vault"
    );
    return null;
  }

  try {
    // Check if Vault is reachable
    let running = false;
    try {
      await vaultClient.health();
      running = true;
    } catch {
      running = false;
    }

    if (running) {
      console.log("🔐 Vault connected successfully");
      return vaultClient;
    }

    // Start Vault only in dev mode
    if (isDev) {
      console.log("🚀 Starting Vault dev server...");

      const vaultProcess = spawn("vault", ["server", "-dev"], {
        stdio: "inherit",
      });

      process.on("SIGINT", () => {
        console.log("🛑 Shutting down Vault...");
        vaultProcess.kill("SIGTERM");
        process.exit();
      });

      // Wait a moment for the server to boot
      await new Promise((resolve) => setTimeout(resolve, 3000));

      console.log("🔐 Vault initialized successfully");
      console.log(`✅ Vault started at ${endpoint}`);

      return vaultClient;
    }
  } catch (err) {
    console.log(err);
    console.warn("⚠️  Failed to connect to Vault, continuing without it");
    return null;
  }
}
