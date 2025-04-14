import { useState, useCallback } from 'react';

interface MutationOptions<TData, TVariables, TError> {
  /**
   * Callback executed when mutation is successful
   */
  onSuccess?: (data: TData, variables: TVariables) => void;
  
  /**
   * Callback executed when mutation fails
   */
  onError?: (error: TError, variables: TVariables) => void;
  
  /**
   * Callback executed when mutation is settled (either succeeded or failed)
   */
  onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables) => void;
}

interface MutationResult<TData, TError> {
  /**
   * The data returned by the mutation
   */
  data: TData | undefined;
  
  /**
   * If the mutation is currently running
   */
  isLoading: boolean;
  
  /**
   * If the mutation encountered an error
   */
  isError: boolean;
  
  /**
   * If the mutation was successful
   */
  isSuccess: boolean;
  
  /**
   * The error object if the mutation encountered an error
   */
  error: TError | null;
  
  /**
   * Reset the mutation to its initial state
   */
  reset: () => void;
}

type MutateFn<TData, TVariables> = (variables: TVariables) => Promise<TData>;

/**
 * A hook for creating, updating, or deleting data
 * 
 * @param mutationFn - Function that performs the mutation
 * @param options - Configuration options for the mutation
 * @returns Mutation result object and mutation function
 */
export function useMutation<TData = unknown, TVariables = unknown, TError = Error>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: MutationOptions<TData, TVariables, TError> = {}
): [MutateFn<TData, TVariables>, MutationResult<TData, TError>] {
  const { onSuccess, onError, onSettled } = options;
  
  const [state, setState] = useState<{
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    data: TData | undefined;
    error: TError | null;
  }>({
    isLoading: false,
    isError: false,
    isSuccess: false,
    data: undefined,
    error: null,
  });
  
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isError: false,
      isSuccess: false,
      data: undefined,
      error: null,
    });
  }, []);
  
  const mutate = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setState(prevState => ({ ...prevState, isLoading: true }));
      
      try {
        const data = await mutationFn(variables);
        
        setState({
          isLoading: false,
          isError: false,
          isSuccess: true,
          data,
          error: null,
        });
        
        if (onSuccess) {
          onSuccess(data, variables);
        }
        
        if (onSettled) {
          onSettled(data, null, variables);
        }
        
        return data;
      } catch (err) {
        const error = err as TError;
        
        setState({
          isLoading: false,
          isError: true,
          isSuccess: false,
          data: undefined,
          error,
        });
        
        if (onError) {
          onError(error, variables);
        }
        
        if (onSettled) {
          onSettled(undefined, error, variables);
        }
        
        throw error;
      }
    },
    [mutationFn, onSuccess, onError, onSettled]
  );
  
  return [
    mutate,
    {
      ...state,
      reset,
    },
  ];
}

/**
 * A type to help with the mutationFn parameters when making Axios requests
 */
export type MutationFn<TData, TVariables> = (variables: TVariables) => Promise<TData>;

/**
 * A utility type to create a mutation function from an API method
 */
export type ApiMutationFn<TData, TVariables, TParams extends any[]> = 
  (variables: TVariables, ...params: TParams) => Promise<TData>;

/**
 * Create a mutation function from an API method
 * 
 * @param apiFn - The API method to call
 * @param params - Additional parameters to pass to the API method
 * @returns A mutation function that can be used with useMutation
 */
export function createMutationFn<TData, TVariables, TParams extends any[]>(
  apiFn: ApiMutationFn<TData, TVariables, TParams>,
  ...params: TParams
): MutationFn<TData, TVariables> {
  return (variables: TVariables) => apiFn(variables, ...params);
} 