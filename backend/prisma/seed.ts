import { UserRole } from "../generated/prisma";
import { hashPassword, prismaClient } from "../src/common";

async function main() {
  const hashedPassword = await hashPassword("password123");

  // Users
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
    where: { email: "pamungkasdimas@gmail.com" },
    update: {},
    create: {
      email: "pamungkasdimas@gmail.com",
      name: "Dimas Creator",
      password: hashedPassword,
      role: UserRole.CREATOR,
    },
  });

  // Wallets
  await prismaClient.wallet.upsert({
    where: { user_id: brandUser.id },
    update: {},
    create: {
      user_id: brandUser.id,
      address: "0xBrandWallet",
      encrypted_priv_key: "encryptedKey1",
    },
  });

  await prismaClient.wallet.upsert({
    where: { user_id: creatorUser.id },
    update: {},
    create: {
      user_id: creatorUser.id,
      address: "0xCreatorWallet",
      encrypted_priv_key: "encryptedKey2",
    },
  });

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
