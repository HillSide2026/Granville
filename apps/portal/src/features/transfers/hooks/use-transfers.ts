import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CreatePaymentOrderInput, PaymentAttempt, PaymentOrder } from "@/types/granville";

export function useTransfers() {
  return useQuery<PaymentOrder[]>({
    queryKey: ["transfers"],
    queryFn: () => api.get("/payments").then((r) => r.data),
  });
}

export function useTransfer(id: string) {
  return useQuery<PaymentOrder>({
    queryKey: ["transfers", id],
    queryFn: () => api.get(`/payments/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function usePaymentAttempts(paymentId: string) {
  return useQuery<PaymentAttempt[]>({
    queryKey: ["payment-attempts", paymentId],
    queryFn: async () => [],
    enabled: !!paymentId,
  });
}

export function useCreateTransfer() {
  const qc = useQueryClient();
  return useMutation<PaymentOrder, Error, CreatePaymentOrderInput>({
    mutationFn: (input) => api.post("/payments", input).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transfers"] }),
  });
}

export function useSubmitTransfer() {
  const qc = useQueryClient();
  return useMutation<PaymentOrder, Error, string>({
    mutationFn: (id) => api.post(`/payments/${id}/submit`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transfers"] }),
  });
}

export function useCancelTransfer() {
  const qc = useQueryClient();
  return useMutation<PaymentOrder, Error, string>({
    mutationFn: (id) => api.post(`/payments/${id}/cancel`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transfers"] }),
  });
}

export function useRetryTransfer() {
  const qc = useQueryClient();
  return useMutation<PaymentOrder, Error, string>({
    mutationFn: (id) => api.post(`/payments/${id}/retry`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transfers"] }),
  });
}
