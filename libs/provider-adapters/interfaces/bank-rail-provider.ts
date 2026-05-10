import type {
  BankBeneficiary,
  BankPaymentInstruction,
  BankPaymentResult,
  BankPaymentStatus,
  BankStatement,
  BankTransaction,
  BeneficiaryInput,
} from "./provider-types.ts";

export interface BankRailProvider {
  createBeneficiary(input: BeneficiaryInput): Promise<BankBeneficiary>;
  initiatePayment(input: BankPaymentInstruction): Promise<BankPaymentResult>;
  getPaymentStatus(paymentId: string): Promise<BankPaymentStatus>;
  listTransactions(
    accountId: string,
    from: Date,
    to: Date,
  ): Promise<BankTransaction[]>;
  getStatement(accountId: string, from: Date, to: Date): Promise<BankStatement>;
}
