export class ChainLoyaltyError extends Error {
  readonly code: string;
  readonly status?: number;
  readonly requestId?: string;
  readonly details?: unknown;

  constructor(params: {
    code: string;
    message: string;
    status?: number;
    requestId?: string;
    details?: unknown;
  }) {
    super(params.message);
    this.name = "ChainLoyaltyError";
    this.code = params.code;
    this.status = params.status;
    this.requestId = params.requestId;
    this.details = params.details;
  }
}
