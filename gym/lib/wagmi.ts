import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

// Define the Monad Testnet chain
export const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'MonadExplorer', url: 'https://testnet.monadexplorer.com' },
  },
} as const

export const config = createConfig({
  chains: [monadTestnet, mainnet, sepolia],
  connectors: [
    injected(),
  ],
  transports: {
    [monadTestnet.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})
