import {
  ContractFunctionExecutionError,
  ContractFunctionRevertedError,
} from "viem";

export class AppError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(message: string, statusCode = 500, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;

    // Fix prototype chain (needed for instanceof)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ContractError extends AppError {
  constructor(
    err: ContractFunctionExecutionError | ContractFunctionRevertedError
  ) {
    let message =
      err instanceof ContractFunctionRevertedError
        ? "Contract function reverted"
        : "Contract function execution error";

    const error =
      (typeof (err as any).reason === "string" && (err as any).reason) ||
      (typeof (err as any).shortMessage === "string" &&
        (err as any).shortMessage) ||
      err.message;

    const details = ContractError.cleanErrorDetails(error);

    super(message, 400, details);
  }

  private static cleanErrorDetails(details: string): string {
    // Extract the actual error reason from verbose messages
    // Pattern: "The contract function \"name\" reverted with the following reason:\n<reason>"
    const revertMatch = details.match(
      /reverted with the following reason:\s*(.+?)(?:\n|$)/i
    );
    if (revertMatch?.[1]) {
      return revertMatch[1].trim();
    }

    // Fallback: remove newlines and extra whitespace
    return details.replace(/\n\s*/g, " ").trim();
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, details);
  }
}
