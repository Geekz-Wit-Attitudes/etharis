import { abbreviateMoney } from "@/lib/utils";
import { useBalance } from "wagmi";
import { useAccount } from "wagmi";

export default () => {
    const { address, isConnected } = useAccount();
  const tokenAddress = '0x2556B39a73F3eE138706b141017b817d18E3df1e'; // Replace with the actual token contract address

  const { data: tokenBalance, isError, isLoading } = useBalance({
    address: address,
    token: tokenAddress,
  });
  
  return {
    symbol: tokenBalance ? tokenBalance.symbol : "",
    tokenBalance: tokenBalance ? abbreviateMoney(tokenBalance.formatted) : "", 
    isLoading, 
    isError,
  }
}