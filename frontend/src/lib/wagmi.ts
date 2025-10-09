'use client';

import { http, createStorage, cookieStorage } from 'wagmi'
import { baseSepolia, sepolia } from 'wagmi/chains'
import { Chain, getDefaultConfig } from '@rainbow-me/rainbowkit'

const projectId = 'b88bdf2db44c67f34d9bbd8e65853473';

const supportedChains: Chain[] = [baseSepolia, sepolia];

export const config = getDefaultConfig({
   appName: 'WalletConnection',
   projectId,
   chains: supportedChains as any,
   ssr: true,
   storage: createStorage({
      storage: cookieStorage,
   }),
   transports: {
      [baseSepolia.id]: http(
         `https://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`
      ),
      [sepolia.id]: http(
         `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`
      )
   }
});

declare module "wagmi" {
   interface Register {
      config: typeof config
   }
}