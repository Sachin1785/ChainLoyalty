// src/types/errors.ts
var ChainLoyaltyError = class extends Error {
  constructor(params) {
    super(params.message);
    this.name = "ChainLoyaltyError";
    this.code = params.code;
    this.status = params.status;
    this.requestId = params.requestId;
    this.details = params.details;
  }
};
export {
  ChainLoyaltyError
};
//# sourceMappingURL=index.js.map