export const iconRegistry = {
  wallet: '/icons/finance/wallet.svg',
  shield: '/icons/security/shield.svg',
  bank: '/icons/finance/bank.svg',
  'payment-flow': '/icons/payments/payment-flow.svg',
  compliance: '/icons/security/compliance.svg',
  analytics: '/icons/navigation/analytics.svg',
} as const

export type IconName = keyof typeof iconRegistry
