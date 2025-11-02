import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("EtharisEscrowModule", (m) => {
  // You can set these parameters here or via CLI when deploying
  const feeRecipient = m.getParameter("feeRecipient");
  const initialOwner = m.getParameter("initialOwner");

  // Deploy Mock IDRX (stablecoin)
  const mockIDRX = m.contract("MockIDRX", [initialOwner]);

  // Deploy EtharisEscrow with MockIDRX address, feeRecipient, and initialOwner
  const escrow = m.contract("EtharisEscrow", [
    mockIDRX, // IDRX token address
    feeRecipient, // Fee recipient address
    initialOwner, // Server wallet address
  ]);

  return { mockIDRX, escrow };
});
