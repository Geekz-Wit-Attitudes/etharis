import { createPublicClient, getContract, http, type Hash } from "viem";
import { abi, erc20Abi } from "../artifacts/abi";
import { baseSepolia } from "viem/chains";
import { getServerWallet, walletClient } from "./wallet";
import { serverInstanceAddress, idrxInstanceAddress } from "../constants";
import { AppError } from "../error";

import type { CreateDealContractArgs } from "@/modules/deal";
import { toWad } from "./toWad";

export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http("https://sepolia.base.org"),
});

const contract = getContract({
  address: serverInstanceAddress,
  abi,
  client: { public: publicClient, wallet: walletClient },
});

const idrxTokenContract = getContract({
  address: idrxInstanceAddress,
  abi: erc20Abi,
  client: { public: publicClient, wallet: walletClient },
});

async function callContractMethod<T extends (...args: any[]) => any>(
  fn: T | undefined,
  ...args: Parameters<T>
) {
  console.log(args);
  
  if (!fn) throw new AppError("Contract method not found");

  const serverWallet = await getServerWallet();

  return fn(...args, { account: serverWallet.account });
}

// Wait for transaction receipt
export const waitForTransactionReceipt = (hash: Hash) =>
  publicClient.waitForTransactionReceipt({ hash });

// Contract model with high-level methods
export const contractModel = {
  getPlatformFeeBps: () => callContractMethod(contract.read.platformFeeBps),

  getTokenInfo: async () => {
    const [name, symbol, totalSupply] = await Promise.all([
      callContractMethod(idrxTokenContract.read.name),
      callContractMethod(idrxTokenContract.read.symbol),
      callContractMethod(idrxTokenContract.read.totalSupply),
    ]);
    return { name, symbol, totalSupply };
  },

  mintIDRX: (recipientAddress: string, amountRupiah: number) => {
    // Konversi Rupiah menjadi WAD sebelum dikirim ke Smart Contract
    const amountWad = toWad(amountRupiah); 
    
    // mockPayment(address _to, uint256 _amount) - Dipanggil oleh Owner (Server Wallet)
    return callContractMethod(idrxTokenContract.write.mockPayment, [
      recipientAddress as `0x${string}`, 
      amountWad
    ]);
  },

  createDeal: (args: CreateDealContractArgs) =>
    callContractMethod(contract.write.createDeal, [
      args.dealId,
      args.brand,
      args.creator,
      args.amount,
      args.deadline,
      args.briefHash,
    ]),

  fundDeal: (dealId: string, brandAddress: string) =>
    callContractMethod(contract.write.fundDeal, [dealId, brandAddress]),

  submitContent: (dealId: string, creatorAddress: string, contentUrl: string) =>
    callContractMethod(contract.write.submitContent, [
      dealId,
      creatorAddress,
      contentUrl,
    ]),

  approveDeal: (dealId: string, brandAddress: string) =>
    callContractMethod(contract.write.approveDeal, [dealId, brandAddress]),

  initiateDispute: (dealId: string, brandAddress: string, reason: string) =>
    callContractMethod(contract.write.initiateDispute, [
      dealId,
      brandAddress,
      reason,
    ]),

  resolveDispute: (
    dealId: string,
    creatorAddress: string,
    accept8020: boolean
  ) =>
    callContractMethod(contract.write.resolveDispute, [
      dealId,
      creatorAddress,
      accept8020,
    ]),

  autoReleasePayment: (dealId: string) =>
    callContractMethod(contract.write.autoReleasePayment, [dealId]),

  autoRefundAfterDeadline: (dealId: string) =>
    callContractMethod(contract.write.autoRefundAfterDeadline, [dealId]),

  cancelDeal: (dealId: string, brandAddress: string) =>
    callContractMethod(contract.write.cancelDeal, [dealId, brandAddress]),

  emergencyCancelDeal: (dealId: string) =>
    callContractMethod(contract.write.emergencyCancelDeal, [dealId]),

  getDeal: (dealId: string) =>
    callContractMethod(contract.read.getDeal, [dealId]),

  getDeals: (userAddress: string, isBrand: boolean) =>
    callContractMethod(contract.read.getDeals, [userAddress, isBrand]),

  canAutoRelease: (dealId: string) =>
    callContractMethod(contract.read.canAutoRelease, [dealId]),
};
