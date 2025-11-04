import { UserRole } from "../generated/prisma";
import {
  hashPassword,
  prismaClient,
  vaultClient,
  vaultWalletPath,
} from "@/common";

async function main() {
  const hashedPassword = await hashPassword("password123");

  // === USERS ===
  const adminUser = await prismaClient.user.upsert({
    where: { email: "etharis.prod@gmail.com" },
    update: {},
    create: {
      email: "etharis.prod@gmail.com",
      name: "Etharis Admin",
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  });

  const brandUser = await prismaClient.user.upsert({
    where: { email: "mdutchand@gmail.com" },
    update: {},
    create: {
      email: "mdutchand@gmail.com",
      name: "Chandra Brand",
      password: hashedPassword,
      role: UserRole.BRAND,
    },
  });

  const creatorUser = await prismaClient.user.upsert({
    where: { email: "pamungkasdimas122@gmail.com" },
    update: {},
    create: {
      email: "pamungkasdimas122@gmail.com",
      name: "Dimas Creator",
      password: hashedPassword,
      role: UserRole.CREATOR,
    },
  });

  // === WALLETS ===
  const wallets = [
    {
      user: adminUser,
      address: "0x5416777979De79fB790432D3B612F1CC945e8722",
      privateKey: Bun.env.SERVER_WALLET_PRIVATE_KEY,
    },
    {
      user: brandUser,
      address: "0xcd567C8A783117A5E6685A4b61037505e6261084",
      privateKey: Bun.env.BRAND_PRIVATE_KEY,
    },
    {
      user: creatorUser,
      address: "0x0Fef90E1BA763c449998A01C7C720D33a646966D",
      privateKey: Bun.env.CREATOR_PRIVATE_KEY,
    },
  ];

  for (const { user, address, privateKey } of wallets) {
    const secretPath = `${vaultWalletPath}/${user.id}`;

    // Store private key securely in Vault
    try {
      const formattedPrivateKey = privateKey?.startsWith("0x")
        ? privateKey
        : `0x${privateKey}`;

      await vaultClient.write(secretPath, {
        data: { privateKey: formattedPrivateKey },
      });
      console.log(`Stored private key for ${user.name} in Vault`);
    } catch (err: any) {
      console.error(`Failed to write to Vault for ${user.name}:`, err.message);
    }

    // Create or update wallet in DB
    await prismaClient.wallet.upsert({
      where: { user_id: user.id },
      update: {},
      create: {
        user_id: user.id,
        address,
        secret_path: secretPath,
      },
    });
  }

  console.log("✅ Database & Vault seeded successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
