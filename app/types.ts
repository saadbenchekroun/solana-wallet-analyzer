export type WalletInteraction = {
  InteractingWallet: string
  TransactionCount: number
  TotalValueReceived: number
  TotalValueSent: number
  Flow: "in" | "out"
}

export type WalletAnalysis = {
  walletOfInterest: string
  totalTransactions: number
  totalValue: number
  uniqueWallets: number
  averageTransactionValue: number
  interactions: WalletInteraction[]
}

export type SavedWallet = {
  walletOfInterest: string
  topInteractions: WalletInteraction[]
  savedAt: string
}

