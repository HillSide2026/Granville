import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Beneficiary, CreateBeneficiaryInput } from '@/types/granville'

export function useBeneficiaries() {
  const qc = useQueryClient()

  const query = useQuery<Beneficiary[]>({
    queryKey: ['beneficiaries'],
    queryFn: () => api.get('/beneficiaries').then((r) => r.data),
  })

  const create = useMutation<Beneficiary, Error, CreateBeneficiaryInput>({
    mutationFn: (input) => api.post('/beneficiaries', input).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['beneficiaries'] }),
  })

  const update = useMutation<Beneficiary, Error, { id: string; patch: Partial<CreateBeneficiaryInput> }>({
    mutationFn: ({ id, patch }) => api.patch(`/beneficiaries/${id}`, patch).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['beneficiaries'] }),
  })

  const remove = useMutation<void, Error, string>({
    mutationFn: (id) => api.delete(`/beneficiaries/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['beneficiaries'] }),
  })

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    create: (input: CreateBeneficiaryInput) => create.mutateAsync(input),
    update: (id: string, patch: Partial<CreateBeneficiaryInput>) => update.mutateAsync({ id, patch }),
    remove: (id: string) => remove.mutateAsync(id),
  }
}
