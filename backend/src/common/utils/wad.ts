import { formatUnits, parseUnits } from "viem";

/**
 * @param amount Number atau BigInt dari jumlah Rupiah.
 * @returns BigInt representasi amount dalam WAD (10^18).
 */
export const convertRupiahToWad = (amount: number | bigint): bigint => {
  return parseUnits(amount.toString(), 18);
};

export const convertWadToRupiah = (amount: bigint): string => {
  return formatUnits(amount, 18);
};
