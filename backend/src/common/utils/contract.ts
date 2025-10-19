import { createPublicClient, getContract, http, type Hash } from "viem";
import { abi, erc20Abi } from "../artifacts/abi";
import { baseSepolia } from "viem/chains";
import { getServerWallet, walletClient } from "./wallet";
import { serverInstanceAddress, idrxInstanceAddress } from "../constants";
import { AppError } from "../error";

import type { CreateDealRequest } from "@/modules/deal";

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

  createDeal: (deal: CreateDealRequest) => {
    return callContractMethod(contract.write.createDeal, [
      deal.deal_id,
      deal.brand,
      deal.creator,
      deal.amount,
      deal.deadline,
      deal.brief_hash,
    ]);
  },

  approveDeal: (dealId: string) =>
    callContractMethod(contract.write.approveDeal, [dealId]),

  fundDeal: (dealId: string) =>
    callContractMethod(contract.write.fundDeal, [dealId]),

  submitContent: (dealId: string, contentUrl: string) =>
    callContractMethod(contract.write.submitContent, [dealId, contentUrl]),

  getDeal: (dealId: string) =>
    callContractMethod(contract.read.getDeal, [dealId]),
  initiateDispute: (dealId: string, reason: string) =>
    callContractMethod(contract.write.initiateDispute, [dealId, reason]),

  resolveDispute: (dealId: string, accept8020: boolean) =>
    callContractMethod(contract.write.resolveDispute, [dealId, accept8020]),

  autoReleasePayment: (dealId: string) =>
    callContractMethod(contract.write.autoReleasePayment, [dealId]),

  autoRefundAfterDeadline: (dealId: string) =>
    callContractMethod(contract.write.autoRefundAfterDeadline, [dealId]),

  cancelDeal: (dealId: string) =>
    callContractMethod(contract.write.cancelDeal, [dealId]),

  emergencyCancelDeal: (dealId: string) =>
    callContractMethod(contract.write.emergencyCancelDeal, [dealId]),

  getDeals: (userAddress: string, isBrand: boolean) =>
    callContractMethod(contract.read.getDeals, [userAddress, isBrand]),

  canAutoRelease: (dealId: string) =>
    callContractMethod(contract.read.canAutoRelease, [dealId]),
};
