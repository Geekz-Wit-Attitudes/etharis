import { contractAbi, erc20Abi } from "../artifacts/abi";
import { convertRupiahToWad } from "./wad";
import { getServerWallet, getWallet, walletClient } from "./wallet";
import {
  serverInstanceAddress,
  idrxInstanceAddress,
} from "../constants/address";
import { AppError } from "../error";
import type { CreateDealContractArgs } from "@/modules/deal";

import { baseSepolia } from "viem/chains";
import {
  createPublicClient,
  createWalletClient,
  getContract,
  http,
  type Address,
  type Hash,
} from "viem";

export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http("https://sepolia.base.org"),
});

const contract = getContract({
  address: serverInstanceAddress,
  abi: contractAbi,
  client: walletClient,
});

const idrxTokenContract = getContract({
  address: idrxInstanceAddress,
  abi: erc20Abi,
  client: walletClient,
});

async function callContractMethod<T extends (...args: any[]) => any>(
  fn: T | undefined,
  ...args: Parameters<T>
) {
  console.log(args);

  if (!fn) throw new AppError("Contract method not found");

  const serverWallet = await getServerWallet();

  const nonce = await getNextNonce(serverWallet.address);

  return fn(...args, { account: serverWallet.account, nonce });
}

// Wait for transaction receipt
export const waitForTransactionReceipt = (hash: Hash, confirmations = 1) =>
  publicClient.waitForTransactionReceipt({ hash, confirmations });

// Get next nonce
export async function getNextNonce(address: string) {
  return await publicClient.getTransactionCount({
    address: address as Address,
    blockTag: "pending", // important: includes pending txs
  });
}

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
  getBalance: (address: string) =>
    callContractMethod(idrxTokenContract.read.balanceOf, [address as Address]),
  readAllowance: (address: string) =>
    callContractMethod(idrxTokenContract.read.allowance, [
      address as Address,
      serverInstanceAddress as Address,
    ]),

  mintIDRX: (recipientAddress: string, amountRupiah: number) => {
    // Konversi Rupiah sebelum dikirim ke Smart Contract
    const dealAmount = convertRupiahToWad(amountRupiah);

    return callContractMethod(idrxTokenContract.write.mockPayment, [
      recipientAddress as Address,
      dealAmount,
    ]);
  },

  approveIDRX: async (userId: string, amount: number) => {
    const brandWallet = await getWallet(userId);

    const decimals = 18;
    const amountNumber = Math.floor(Number(amount));
    const dealAmount = BigInt(amountNumber) * 10n ** BigInt(decimals);
    console.log("Deal amount:", dealAmount.toString());

    const brandWalletClient = createWalletClient({
      account: brandWallet.account,
      chain: baseSepolia,
      transport: http("https://sepolia.base.org"),
    });

    let signature: string | undefined;
    if (
      "signTypedData" in brandWalletClient &&
      brandWalletClient.signTypedData
    ) {
      console.log("Signing permit");
      const nonce = await idrxTokenContract.read.nonces?.([
        brandWallet.account.address as Address,
      ]);

      const domain = {
        name: "Indonesian Rupiah X",
        version: "1",
        chainId: baseSepolia.id,
        verifyingContract: idrxTokenContract.address as Address,
      };
      const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };
      const deadline = Math.floor(Date.now() / 1000) + 3600;

      const message = {
        owner: brandWallet.account.address as Address,
        spender: serverInstanceAddress as Address,
        value: dealAmount,
        nonce,
        deadline,
      };

      signature = await brandWalletClient.signTypedData({
        domain,
        types,
        primaryType: "Permit",
        message,
      });

      console.log("Permit signature:", signature);
      const { v, r, s } = splitSignature(signature as Hash);
      return { dealAmount, deadline, v, r, s };
    }

    throw new AppError("Brand wallet does not support permit signing");
  },

  /**
   * Fund an existing deal using permit signature
   */
  fundExistingDeal: async (
    dealId: string,
    userId: string,
    brandAddress: string,
    amount: number
  ) => {
    // Get permit signature and dealAmount
    const { dealAmount, deadline, v, r, s } = await contractModel.approveIDRX(
      userId,
      amount
    );

    // Call fundDeal with permit parameters
    console.log("Funding deal with permit...");
    return callContractMethod(contract.write.fundDeal, [
      dealId,
      brandAddress,
      dealAmount,
      deadline,
      v,
      r,
      s,
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

  fundDeal: (
    dealId: string,
    brandAddress: string,
    dealAmount: bigint,
    deadline: number,
    v: number,
    r: Address,
    s: Address
  ) =>
    callContractMethod(contract.write.fundDeal, [
      dealId,
      brandAddress,
      dealAmount,
      deadline,
      v,
      r,
      s,
    ]),

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

// Split signature
function splitSignature(signature: `0x${string}`) {
  const sig = signature.slice(2); // remove 0x
  const r = "0x" + sig.slice(0, 64);
  const s = "0x" + sig.slice(64, 128);
  let v = parseInt(sig.slice(128, 130), 16);
  if (v < 27) v += 27; // adjust if necessary
  return { r: r as `0x${string}`, s: s as `0x${string}`, v };
}
