import { useState, useEffect, useCallback } from 'react';

interface QueryOptions<TData, TError> {
  /**
   * Enable or disable the query
   */
  enabled?: boolean;
  
  /**
   * Callback executed when data is fetched successfully
   */
  onSuccess?: (data: TData) => void;
  
  /**
   * Callback executed when fetching fails
   */
  onError?: (error: TError) => void;
  
  /**
   * Automatically retry failed queries
   */
  retry?: boolean | number;
  
  /**
   * Time in milliseconds after which the query will be considered stale and refetched
   */
  staleTime?: number;
  
  /**
   * Time in milliseconds after which an inactive query will be garbage collected
   */
  cacheTime?: number;
  
  /**
   * Dependencies array that will trigger a refetch when changed
   */
  deps?: any[];
}

interface QueryResult<TData, TError> {
  /**
   * The fetched data
   */
  data: TData | undefined;
  
  /**
   * If the query is currently loading
   */
  isLoading: boolean;
  
  /**
   * If the query is currently fetching (initial load or refetch)
   */
  isFetching: boolean;
  
  /**
   * If the query encountered an error
   */
  isError: boolean;
  
  /**
   * The error object if the query encountered an error
   */
  error: TError | null;
  
  /**
   * Function to manually refetch the data
   */
  refetch: () => Promise<TData>;
}

/**
 * A hook for fetching, caching, and updating data
 * 
 * @param queryKey - Unique key for the query
 * @param queryFn - Function that returns a promise resolving to the query data
 * @param options - Configuration options for the query
 * @returns Query result object
 */
export function useQuery<TData = unknown, TError = Error>(
  queryKey: string | string[],
  queryFn: () => Promise<TData>,
  options: QueryOptions<TData, TError> = {}
): QueryResult<TData, TError> {
  const {
    enabled = true,
    onSuccess,
    onError,
    retry = 3,
    staleTime = 0,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    deps = [],
  } = options;

  const [data, setData] = useState<TData | undefined>(undefined);
  const [error, setError] = useState<TError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Convert queryKey to string for caching purposes
  const cacheKey = Array.isArray(queryKey) ? queryKey.join('-') : queryKey;

  const fetchData = useCallback(async (): Promise<TData> => {
    // Don't fetch if not enabled
    if (!enabled) {
      return Promise.reject(new Error('Query is disabled'));
    }
    
    // Check if we're already loading
    if (isFetching) {
      return Promise.reject(new Error('Query is already fetching'));
    }
    
    // Check if the data is still fresh
    const now = Date.now();
    if (data !== undefined && now - lastFetchTime < staleTime) {
      return Promise.resolve(data);
    }
    
    setIsFetching(true);
    if (data === undefined) {
      setIsLoading(true);
    }
    
    try {
      const result = await queryFn();
      setData(result);
      setError(null);
      setIsError(false);
      setLastFetchTime(Date.now());
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      setError(err as TError);
      setIsError(true);
      
      if (onError) {
        onError(err as TError);
      }
      
      throw err;
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [cacheKey, enabled, data, isFetching, lastFetchTime, staleTime, queryFn, onSuccess, onError, ...deps]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchData().catch(() => {
        // Error is already handled in fetchData
      });
    }
  }, [fetchData, enabled]);

  return {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch: fetchData,
  };
}

/**
 * A type to help with the queryFn parameters when making Axios requests
 */
export type QueryFn<TData> = () => Promise<TData>;

/**
 * A utility type to create a query function from an API method
 */
export type ApiQueryFn<TData, TParams extends any[]> = 
  (...params: TParams) => Promise<TData>;

/**
 * Create a query function from an API method
 * 
 * @param apiFn - The API method to call
 * @param params - Parameters to pass to the API method
 * @returns A query function that can be used with useQuery
 */
export function createQueryFn<TData, TParams extends any[]>(
  apiFn: ApiQueryFn<TData, TParams>,
  ...params: TParams
): QueryFn<TData> {
  return () => apiFn(...params);
} 