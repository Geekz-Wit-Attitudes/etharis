import { env } from "../config";
import { AppError } from "../error";
import { vaultWalletPath } from "../constants/address";

import { spawn } from "child_process";
import vault from "node-vault";
import { createWalletClient, http } from "viem";
import {
  generatePrivateKey,
  privateKeyToAccount,
  type PrivateKeyAccount,
} from "viem/accounts";
import { baseSepolia } from "viem/chains";
import fs from "fs";

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

const { nodeEnv, vaultAddr, vaultToken } = env;

export const vaultClient = vault({
  apiVersion: "v1",
  endpoint: vaultAddr,
  token: vaultToken,
});

export const isRunningInDocker = fs.existsSync("/.dockerenv");

const serverAccount = privateKeyToAccount(`0x${env.serverWalletPrivateKey}`);

export const serverWalletClient = createWalletClient({
  chain: baseSepolia,
  transport: http("https://sepolia.base.org"),
  account: serverAccount,
});

export async function createWallet(userId: string): Promise<WalletData> {
  try {
    const health = await vaultClient.health();
    if (!health || health.sealed || health.standby) {
      throw new AppError("Vault is not ready (sealed or in standby mode)");
    }

    // Generate private key + account
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);

    console.log("address", account.address);

    // Store private key securely in Vault
    const secretPath = getSecretPath(userId);

    await vaultClient.write(secretPath, {
      data: { privateKey },
    });

    const result: WalletData = {
      address: account.address,
      secretPath: secretPath,
    };

    console.log("result", result);

    // Return address + Vault reference path
    return result;
  } catch (err: any) {
    throw new AppError(`Failed to store private key in Vault: ${err.message}`);
  }
}

export async function getWallet(userId: string) {
  try {
    const secretPath = getSecretPath(userId);
    const secret = await vaultClient.read(secretPath);

    const privateKey = secret?.data?.data?.privateKey;
    if (!privateKey) {
      throw new AppError(`No wallet found for user ${userId}`);
    }

    const account = privateKeyToAccount(privateKey);
    return { address: account.address, account };
  } catch (error) {
    console.log("Failed to get wallet for user", userId, error);
    throw new AppError(`Failed to get wallet for user ${userId} ${error}`);
  }
}

export async function getServerWallet(): Promise<RetrievedWallet> {
  // Use server wallet from ENV if available
  const serverWalletPrivateKey = env.serverWalletPrivateKey;
  if (serverWalletPrivateKey) {
    const account = privateKeyToAccount(`0x${serverWalletPrivateKey}`);
    return { address: account.address, account };
  }

  // Fallback to Vault
  const secretPath = getSecretPath("server");
  try {
    const secret = await vaultClient.read(secretPath);
    const privateKey = secret?.data?.data?.privateKey;
    if (privateKey) {
      const account = privateKeyToAccount(privateKey);
      return { address: account.address, account };
    }
  } catch {
    console.warn("Vault not available or server wallet not found in Vault");
  }

  // If neither ENV nor Vault provide a wallet, throw
  throw new AppError(
    "Server wallet not found. Set env.SERVER_WALLET_PRIVATE_KEY or store it in Vault."
  );
}

export function getSecretPath(userId: string) {
  return `${vaultWalletPath}/${userId}`;
}

export async function initVault() {
  const isDev = nodeEnv === "development";

  if (!vaultAddr || !vaultToken) {
    console.warn(
      "⚠️  VAULT_ADDR or VAULT_TOKEN not set, running without Vault"
    );
    return null;
  }

  try {
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

    if (isDev && !isRunningInDocker) {
      console.log("🚀 Starting Vault dev server...");
      const vaultProcess = spawn(
        "vault",
        ["server", "-dev", "-dev-root-token-id=root"],
        {
          stdio: "inherit",
        }
      );
      process.on("SIGINT", () => {
        console.log("🛑 Shutting down Vault...");
        vaultProcess.kill("SIGTERM");
        process.exit();
      });
      await new Promise((resolve) => setTimeout(resolve, 3000));
      console.log("🔐 Vault initialized successfully");
      return vaultClient;
    }
  } catch (err) {
    console.log(err);
    console.warn("⚠️  Failed to connect to Vault, continuing without it");
    return null;
  }
}
