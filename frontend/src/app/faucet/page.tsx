"use client"

import { ConnectButton } from '@/components/ConnectButton'
import { ESCROW_ABI, IDRX_ABI, IDRX_CONTRACT_ADDRESS } from '@/lib/contracts'
import { useWriteContract } from 'wagmi'

const FaucetPage = () => {
  const { writeContract: faucet, data: faucetHash } = useWriteContract()

  const handleFaucet = () => faucet({
    address: IDRX_CONTRACT_ADDRESS,
    abi: IDRX_ABI,
    functionName: 'faucet',
    args: [],
  })


  return (
    <div className='flex justify-center items-center h-screen w-screen flex-col gap-5'>
      <p>connect dulu pak</p>
      <ConnectButton />
      <button className='btn-primary' onClick={handleFaucet}>Faucet 1 juta IDRX letsgooo</button>
    </div>
  )
}

export default FaucetPage
