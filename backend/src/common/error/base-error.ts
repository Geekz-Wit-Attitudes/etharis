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
    // Default fallback message
    let message =
      err instanceof ContractFunctionRevertedError
        ? "Contract function reverted"
        : "Contract function execution error";

    // Try to extract custom Solidity error name from Viem error object
    const viemError = err as any;
    const errorName: string | undefined =
      viemError?.data?.errorName ||
      viemError?.metaMessages?.[0]?.match(/Error:\s*(\w+)/)?.[1];

    // If we know the Solidity error name, map to a readable message
    if (errorName && ContractError.contractErrorMessages[errorName]) {
      message = ContractError.contractErrorMessages[errorName];
    }

    // Extract short message / reason if no known mapping exists
    const rawDetails =
      (typeof viemError.reason === "string" && viemError.reason) ||
      (typeof viemError.shortMessage === "string" && viemError.shortMessage) ||
      viemError.message;

    const details = ContractError.cleanErrorDetails(rawDetails);

    super(message, 400, {
      contractError: errorName || "UnknownContractError",
      raw: details,
    });
  }

  private static cleanErrorDetails(details: string): string {
    if (!details) return "";
    // Try to extract readable reason from common revert patterns
    const revertMatch = details.match(
      /reverted with the following reason:\s*(.+?)(?:\n|$)/i
    );
    if (revertMatch?.[1]) {
      return revertMatch[1].trim();
    }
    return details.replace(/\n\s*/g, " ").trim();
  }

  private static readonly contractErrorMessages: Record<string, string> = {
    DealAlreadyExists: "A deal with the given ID already exists.",
    InvalidAddress: "One or more provided addresses are invalid.",
    CreatorCannotBeBrand: "The creator and brand addresses cannot be the same.",
    AmountMustBeGreaterThanZero: "The deal amount must be greater than zero.",
    DeadlineMustBeInFuture: "The deadline must be set to a future timestamp.",
    BriefHashRequired: "Brief hash is required when creating a deal.",
    DealNotFound: "The specified deal could not be found.",
    InvalidDealStatus: "The deal cannot be modified in its current status.",
    NotAuthorized: "You are not authorized to perform this action.",
    DealAlreadyFunded: "This deal has already been funded.",
    InsufficientBalance:
      "The brand's IDRX balance is insufficient to fund the deal.",
    InsufficientAllowance:
      "The brand has not approved enough IDRX tokens for transfer.",
    DealNotFunded: "The deal must be funded before it can be accepted.",
    SubmissionDeadlinePassed: "The submission deadline has already passed.",
    ContentUrlRequired: "Content URL must be provided when submitting content.",
    ReviewPeriodNotEnded: "The review period has not ended yet.",
    ReviewPeriodEnded: "The review period has already ended.",
    ReasonRequired: "A reason must be provided to initiate a dispute.",
    DeadlineNotPassed: "The deadline has not passed yet.",
    CannotCancelThisDeal: "This deal cannot be canceled in its current state.",
    FeeTooHigh: "The specified platform fee exceeds the allowed maximum (10%).",
    CannotWithdrawIDRX:
      "You cannot withdraw the IDRX token using this function.",
    InvalidDealID: "The provided deal ID is invalid or empty.",
    InvalidAmount: "The specified amount is invalid or zero.",
    PermitFailed:
      "Failed to process token permit — invalid or expired signature.",
  };
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, details);
  }
}
