import {
  type UseQueryOptions,
  type UseQueryResult,
  useQuery,
} from "@tanstack/react-query";

export function useChainLoyaltyQuery<TData>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData>, "queryKey" | "queryFn">,
): UseQueryResult<TData> {
  return useQuery({
    queryKey,
    queryFn,
    ...(options ?? {}),
  });
}
