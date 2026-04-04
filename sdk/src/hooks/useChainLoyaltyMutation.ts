import {
  type UseMutationOptions,
  type UseMutationResult,
  useMutation,
} from "@tanstack/react-query";

export function useChainLoyaltyMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn">,
): UseMutationResult<TData, Error, TVariables> {
  return useMutation({
    mutationFn,
    ...(options ?? {}),
  });
}
