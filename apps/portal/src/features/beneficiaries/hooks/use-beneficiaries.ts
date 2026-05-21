import { useState, useCallback } from 'react'
import { randomUUID } from '@/lib/utils'
import type { Beneficiary, CreateBeneficiaryInput } from '@/types/granville'

const STORAGE_KEY = 'granville_beneficiaries'

function load(): Beneficiary[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function save(items: Beneficiary[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function useBeneficiaries() {
  const [items, setItems] = useState<Beneficiary[]>(load)

  const create = useCallback((input: CreateBeneficiaryInput): Beneficiary => {
    const next: Beneficiary = {
      ...input,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    }
    setItems((prev) => {
      const updated = [next, ...prev]
      save(updated)
      return updated
    })
    return next
  }, [])

  const update = useCallback((id: string, patch: Partial<CreateBeneficiaryInput>) => {
    setItems((prev) => {
      const updated = prev.map((b) => (b.id === id ? { ...b, ...patch } : b))
      save(updated)
      return updated
    })
  }, [])

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const updated = prev.filter((b) => b.id !== id)
      save(updated)
      return updated
    })
  }, [])

  return { items, create, update, remove }
}
