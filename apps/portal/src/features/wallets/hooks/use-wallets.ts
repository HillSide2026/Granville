import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { CreatePaymentAccountInput, PaymentAccount } from '@/types/granville'

export function useWallets() {
  return useQuery<PaymentAccount[]>({
    queryKey: ['wallets'],
    queryFn: () => api.get('/admin/payment-accounts').then((r) => r.data),
  })
}

export function useWallet(id: string) {
  return useQuery<PaymentAccount>({
    queryKey: ['wallets', id],
    queryFn: () => api.get(`/payment-accounts/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateWallet() {
  const qc = useQueryClient()
  return useMutation<PaymentAccount, Error, CreatePaymentAccountInput>({
    mutationFn: (input) => api.post('/payment-accounts', input).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wallets'] }),
  })
}
