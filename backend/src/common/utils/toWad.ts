// Mengasumsikan Anda memiliki toWad yang sudah terdefinisi
import { parseUnits } from 'viem';

/**
 * @param amount Number atau BigInt dari jumlah Rupiah.
 * @returns BigInt representasi amount dalam WAD (10^18).
 */
export const toWad = (amount: number | bigint): bigint => {
    return parseUnits(amount.toString(), 18);
};
