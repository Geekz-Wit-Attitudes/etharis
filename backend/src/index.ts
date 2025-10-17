import { initVault } from "./common/utils/wallet";
import app from "./app";

async function main() {
  console.log("🚀 Initializing application...");

  // Initialize Vault connection
  await initVault();

  // Start the Bun server
  const port = Bun.env.PORT || 3000;
  const server = Bun.serve({
    port,
    fetch: app.fetch,
  });

  console.log(`✅ Server running at http://localhost:${port}`);
  console.log("🔐 Vault initialized successfully (if configured)");

  return server;
}

main().catch((err) => {
  console.error("❌ App failed to start:", err);
  process.exit(1);
});

export default app;
