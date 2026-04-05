import * as _tanstack_react_query from '@tanstack/react-query';
import { UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { ChainLoyaltyClient } from '../client/index.js';
import { h as RewardBalance, k as RewardsHistoryResponse, d as LeaderboardResponse, E as EventIngestionRequest, b as EventIngestionResponse } from '../api-smVj4T5E.js';

declare function useChainLoyaltyMutation<TData, TVariables>(mutationFn: (variables: TVariables) => Promise<TData>, options?: Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn">): UseMutationResult<TData, Error, TVariables>;

declare function useChainLoyaltyQuery<TData>(queryKey: readonly unknown[], queryFn: () => Promise<TData>, options?: Omit<UseQueryOptions<TData>, "queryKey" | "queryFn">): UseQueryResult<TData>;

declare function useRewardBalance(client: ChainLoyaltyClient, walletAddress: string, enabled?: boolean): _tanstack_react_query.UseQueryResult<RewardBalance>;
declare function useRewardHistory(client: ChainLoyaltyClient, walletAddress: string, page?: number, pageSize?: number, enabled?: boolean): _tanstack_react_query.UseQueryResult<RewardsHistoryResponse>;

declare function useLeaderboard(client: ChainLoyaltyClient, page?: number, pageSize?: number, enabled?: boolean): _tanstack_react_query.UseQueryResult<LeaderboardResponse>;

interface SubmitEventInput {
    payload: EventIngestionRequest;
    idempotencyKey?: string;
}
declare function useSubmitEvent(client: ChainLoyaltyClient): _tanstack_react_query.UseMutationResult<EventIngestionResponse, Error, SubmitEventInput>;

export { type SubmitEventInput, useChainLoyaltyMutation, useChainLoyaltyQuery, useLeaderboard, useRewardBalance, useRewardHistory, useSubmitEvent };
