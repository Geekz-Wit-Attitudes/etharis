export const ESCROW_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_CONTRACT as `0x${string}`
export const USDT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_USDT_CONTRACT as `0x${string}`

export const ESCROW_ABI = [
  {
    inputs: [
      { name: 'contractId', type: 'string' },
      { name: 'creator', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
      { name: 'briefHash', type: 'string' },
    ],
    name: 'createContract',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'contractId', type: 'string' }],
    name: 'depositFund',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ name: 'contractId', type: 'string' }],
    name: 'releaseFund',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'contractId', type: 'string' },
      { name: 'reason', type: 'string' },
    ],
    name: 'initDispute',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'contractId', type: 'string' },
      { name: 'accept8020', type: 'bool' },
    ],
    name: 'resolveDispute',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'contractId', type: 'string' }],
    name: 'getContract',
    outputs: [
      {
        components: [
          { name: 'brand', type: 'address' },
          { name: 'creator', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
          { name: 'status', type: 'uint8' },
        ],
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const USDT_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const
