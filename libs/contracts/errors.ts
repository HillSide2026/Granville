export type GranvilleErrorCode =
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "INTERNAL_ERROR"
  | "IDEMPOTENCY_CONFLICT";

export interface GranvilleError {
  error: { code: GranvilleErrorCode; message: string; details?: unknown };
}
