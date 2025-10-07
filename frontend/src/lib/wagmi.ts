'use client';

import { http, createStorage, cookieStorage } from 'wagmi'
import { sepolia, baseSepolia } from 'wagmi/chains'
import { Chain, getDefaultConfig } from '@rainbow-me/rainbowkit'

const projectId = 'b88bdf2db44c67f34d9bbd8e65853473';

const supportedChains: Chain[] = [sepolia, baseSepolia];

export const config = getDefaultConfig({
   appName: 'WalletConnection',
   projectId,
   chains: supportedChains as any,
   ssr: true,
   storage: createStorage({
    storage: cookieStorage,
   }),
  transports: supportedChains.reduce((obj, chain) => ({ ...obj, [chain.id]: http() }), {})
 });