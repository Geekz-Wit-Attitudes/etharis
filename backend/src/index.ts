import { env, initVault, isRunningInDocker } from "./common";
import app from "./app";
import { serve } from "bun";

async function main() {
  console.log("🚀 Initializing application...");

  // Initialize Vault connection
  await initVault();

  // Start server
  serve({
    fetch: app.fetch,
    port: env.port,
  });

  console.log("✅ App is ready");
}

// Call main() to run setup
main().catch((err) => {
  console.error("❌ App failed to start:", err);
  process.exit(1);
});
