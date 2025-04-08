import { useState, useEffect, useCallback } from 'react';

interface PageParam {
  /**
   * The page number or cursor for the next page
   */
  pageParam: number | string;
}

type GetNextPageParamFunction<TData> = 
  (lastPage: TData, allPages: TData[]) => number | string | null | undefined;

interface InfiniteQueryOptions<TData, TError> {
  /**
   * Enable or disable the query
   */
  enabled?: boolean;
  
  /**
   * Callback executed when data is fetched successfully
   */
  onSuccess?: (data: TData[]) => void;
  
  /**
   * Callback executed when fetching fails
   */
  onError?: (error: TError) => void;
  
  /**
   * Initial page parameter
   */
  initialPageParam?: number | string;
  
  /**
   * Function to get the next page parameter
   */
  getNextPageParam: GetNextPageParamFunction<TData>;
  
  /**
   * Automatically retry failed queries
   */
  retry?: boolean | number;
  
  /**
   * Dependencies array that will trigger a refetch when changed
   */
  deps?: any[];
}

interface InfiniteQueryResult<TData, TError> {
  /**
   * The fetched data pages
   */
  data: TData[];
  
  /**
   * If the query is currently loading the first page
   */
  isLoading: boolean;
  
  /**
   * If the query is currently fetching (initial load or next page)
   */
  isFetching: boolean;
  
  /**
   * If the query is fetching the next page
   */
  isFetchingNextPage: boolean;
  
  /**
   * If the query encountered an error
   */
  isError: boolean;
  
  /**
   * The error object if the query encountered an error
   */
  error: TError | null;
  
  /**
   * If there are more pages to load
   */
  hasNextPage: boolean;
  
  /**
   * Function to fetch the next page
   */
  fetchNextPage: () => Promise<TData | undefined>;
  
  /**
   * Function to manually refetch all pages
   */
  refetch: () => Promise<TData[]>;
}

/**
 * A hook for fetching paginated data
 * 
 * @param queryKey - Unique key for the query
 * @param queryFn - Function that returns a promise resolving to the page data
 * @param options - Configuration options for the infinite query
 * @returns Infinite query result object
 */
export function useInfiniteQuery<TData = unknown, TError = Error>(
  queryKey: string | string[],
  queryFn: (params: PageParam) => Promise<TData>,
  options: InfiniteQueryOptions<TData, TError>
): InfiniteQueryResult<TData, TError> {
  const {
    enabled = true,
    onSuccess,
    onError,
    initialPageParam = 1,
    getNextPageParam,
    retry = 3,
    deps = [],
  } = options;

  const [dataPages, setDataPages] = useState<TData[]>([]);
  const [error, setError] = useState<TError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [currentPageParam, setCurrentPageParam] = useState<number | string>(initialPageParam);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);

  // Convert queryKey to string for caching purposes
  const cacheKey = Array.isArray(queryKey) ? queryKey.join('-') : queryKey;

  // Function to fetch a page
  const fetchPage = useCallback(async (
    pageParam: number | string,
    isNextPage = false
  ): Promise<TData> => {
    if (isNextPage) {
      setIsFetchingNextPage(true);
    }
    setIsFetching(true);
    
    if (dataPages.length === 0 && !isNextPage) {
      setIsLoading(true);
    }
    
    try {
      const result = await queryFn({ pageParam });
      
      if (!isNextPage) {
        // First page or refetch
        setDataPages([result]);
      } else {
        // Next page
        setDataPages(prev => [...prev, result]);
      }
      
      setError(null);
      setIsError(false);
      
      // Determine if there are more pages
      const nextPageParam = getNextPageParam(result, isNextPage ? [...dataPages, result] : [result]);
      setHasNextPage(nextPageParam != null);
      
      if (nextPageParam != null) {
        setCurrentPageParam(nextPageParam);
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
      setIsFetchingNextPage(false);
    }
  }, [cacheKey, queryFn, getNextPageParam, dataPages, onError, ...deps]);

  // Function to fetch the next page
  const fetchNextPage = useCallback(async (): Promise<TData | undefined> => {
    if (!hasNextPage || isFetchingNextPage) {
      return undefined;
    }
    
    try {
      const result = await fetchPage(currentPageParam, true);
      
      if (onSuccess) {
        onSuccess([...dataPages, result]);
      }
      
      return result;
    } catch (err) {
      // Error already handled in fetchPage
      return undefined;
    }
  }, [
    hasNextPage,
    isFetchingNextPage,
    currentPageParam,
    fetchPage,
    dataPages,
    onSuccess,
  ]);

  // Function to refetch all pages
  const refetch = useCallback(async (): Promise<TData[]> => {
    try {
      // Reset to initial state
      setCurrentPageParam(initialPageParam);
      
      // Fetch first page
      const firstPageResult = await fetchPage(initialPageParam);
      let results = [firstPageResult];
      let allPages = [firstPageResult];
      
      // Recursively fetch next pages
      let nextParam = getNextPageParam(firstPageResult, allPages);
      while (nextParam != null) {
        const nextPageResult = await fetchPage(nextParam, true);
        results.push(nextPageResult);
        allPages.push(nextPageResult);
        nextParam = getNextPageParam(nextPageResult, allPages);
      }
      
      if (onSuccess) {
        onSuccess(results);
      }
      
      return results;
    } catch (err) {
      // Error already handled in fetchPage
      return [];
    }
  }, [initialPageParam, fetchPage, getNextPageParam, onSuccess]);

  // Initial fetch
  useEffect(() => {
    if (enabled && dataPages.length === 0) {
      fetchPage(initialPageParam).catch(() => {
        // Error is already handled in fetchPage
      });
    }
  }, [enabled, fetchPage, initialPageParam, dataPages.length]);

  return {
    data: dataPages,
    isLoading,
    isFetching,
    isFetchingNextPage,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    refetch,
  };
}

/**
 * A type to help with the queryFn parameters when making Axios requests for paginated data
 */
export type InfiniteQueryFn<TData> = (params: PageParam) => Promise<TData>;

/**
 * A utility type to create an infinite query function from an API method
 */
export type ApiInfiniteQueryFn<TData, TParams extends any[]> = 
  (pageParam: number | string, ...params: TParams) => Promise<TData>;

/**
 * Create an infinite query function from an API method
 * 
 * @param apiFn - The API method to call
 * @param params - Additional parameters to pass to the API method
 * @returns An infinite query function that can be used with useInfiniteQuery
 */
export function createInfiniteQueryFn<TData, TParams extends any[]>(
  apiFn: ApiInfiniteQueryFn<TData, TParams>,
  ...params: TParams
): InfiniteQueryFn<TData> {
  return ({ pageParam }) => apiFn(pageParam, ...params);
} 