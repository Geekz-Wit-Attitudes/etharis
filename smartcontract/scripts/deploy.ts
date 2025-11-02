import path from "path";
import { fileURLToPath } from "url";

import { network } from "hardhat";
import EtharisEscrowModule from "../ignition/modules/EtharisEscrowModule.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const { ignition, viem } = await network.connect({ network: "baseSepolia" });

  const parametersPath = path.resolve(__dirname, "../ignition/parameters.json");

  // Let Ignition use the default account
  const { mockIDRX, escrow } = await ignition.deploy(EtharisEscrowModule, {
    parameters: parametersPath,
  });

  const mockAddr = mockIDRX.address;
  const escrowAddr = escrow.address;

  console.log("MockIDRX deployed at:", mockAddr);
  console.log("EtharisEscrow deployed at:", escrowAddr);

  const mock = await viem.getContractAt("MockIDRX", mockAddr);
  const escrowContract = await viem.getContractAt("EtharisEscrow", escrowAddr);
}

main().catch((err) => {
  console.error(`Deployment failed: ${err}`);
  process.exit(1);
});
