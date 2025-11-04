import deployedAddresses from "@smartcontract/ignition/deployments/chain-84532/deployed_addresses.json";
import type { Address } from "viem";

export const vaultWalletPath = "secret/data/apps/etharis/wallet";

function getDeployedAddress(key: keyof typeof deployedAddresses) {
  const addr = deployedAddresses[key];
  if (!addr) throw new Error(`Missing deployed address for ${key}`);

  return addr as Address;
}

export const serverInstanceAddress = getDeployedAddress(
  "Modules#EtharisEscrow"
);
export const idrxInstanceAddress = getDeployedAddress("Modules#MockIDRX");
