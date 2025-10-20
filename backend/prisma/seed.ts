import { UserRole } from "../generated/prisma";
import { hashPassword, prismaClient, vaultWalletPath } from "../src/common";

try {
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
  await prismaClient.wallet.upsert({
    where: { user_id: adminUser.id },
    update: {},
    create: {
      user_id: adminUser.id,
      address: "0x5416777979De79fB790432D3B612F1CC945e8722",
      secret_path: `${vaultWalletPath}/${adminUser.id}`,
    },
  });

  await prismaClient.wallet.upsert({
    where: { user_id: brandUser.id },
    update: {},
    create: {
      user_id: brandUser.id,
      address: "0x2a1789841dCA3e698a4cf98AFCfC5e07DaCc97A5",
      secret_path: `${vaultWalletPath}/${brandUser.id}`,
    },
  });

  await prismaClient.wallet.upsert({
    where: { user_id: creatorUser.id },
    update: {},
    create: {
      user_id: creatorUser.id,
      address: "0x311C65d2a284Ecf555F2D6F9421bd34E21953919",
      secret_path: `${vaultWalletPath}/${creatorUser.id}`,
    },
  });

  console.log("✅ Database seeded successfully!");
} catch (error) {
  const e = error as Error;
  console.error("❌ Seeding failed:", e);

  await prismaClient.$disconnect();
  process.exit(1);
}
