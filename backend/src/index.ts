import { initVault } from "./common/utils/wallet";
import app from "./app";

async function main() {
  console.log("🚀 Initializing application...");

  // Initialize Vault connection
  await initVault();

  console.log("✅ App is ready");
}

// Call main() to run setup
main().catch((err) => {
  console.error("❌ App failed to start:", err);
  process.exit(1);
});

export default app;
