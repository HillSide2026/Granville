import type { GranvilleErrorCode } from "../../../libs/contracts/errors.ts";

export class HttpError extends Error {
  statusCode: number;
  code: GranvilleErrorCode;

  constructor(statusCode: number, message: string, code?: GranvilleErrorCode) {
    super(message);
    this.statusCode = statusCode;
    this.code = code ?? httpStatusToCode(statusCode);
  }
}

export function httpStatusToCode(status: number): GranvilleErrorCode {
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 409) return "CONFLICT";
  if (status === 400) return "VALIDATION_ERROR";
  return "INTERNAL_ERROR";
}
