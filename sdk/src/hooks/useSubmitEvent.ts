import { type ChainLoyaltyClient } from "../client";
import { type EventIngestionRequest } from "../types";
import { useChainLoyaltyMutation } from "./useChainLoyaltyMutation";

export interface SubmitEventInput {
  payload: EventIngestionRequest;
  idempotencyKey?: string;
}

export function useSubmitEvent(client: ChainLoyaltyClient) {
  return useChainLoyaltyMutation(({ payload, idempotencyKey }: SubmitEventInput) =>
    client.ingestEvent(payload, idempotencyKey),
  );
}
