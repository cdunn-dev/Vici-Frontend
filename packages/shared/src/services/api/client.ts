/**
 * API Client
 * 
 * A minimal HTTP client based on the fetch API with
 * interceptors, error handling, and authentication support.
 */

// Types
export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  timeout?: number;
}

export interface APIResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

export type RequestInterceptor = (config: RequestOptions) => RequestOptions | Promise<RequestOptions>;
export type ResponseInterceptor = (response: Response) => Response | Promise<Response>;
export type ErrorInterceptor = (error: any) => any;

export interface Interceptors {
  request: RequestInterceptor[];
  response: ResponseInterceptor[];
  error: ErrorInterceptor[];
}

/**
 * Creates an API client with the given base URL.
 * 
 * @param baseURL - The base URL for all requests
 * @returns The API client instance
 */
export function createAPIClient(baseURL: string) {
  const interceptors: Interceptors = {
    request: [],
    response: [],
    error: [],
  };

  // Add authorization header interceptor
  const addAuthInterceptor = (getToken: () => string | null | undefined) => {
    interceptors.request.push((config) => {
      const token = getToken();
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return config;
    });
  };

  /**
   * Adds query parameters to a URL
   */
  const appendQueryParams = (url: string, params?: Record<string, any>): string => {
    if (!params) return url;

    const queryString = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');

    return queryString ? `${url}${url.includes('?') ? '&' : '?'}${queryString}` : url;
  };

  /**
   * Makes an HTTP request
   */
  const request = async <T = any>(
    method: Method,
    url: string,
    options: RequestOptions = {}
  ): Promise<APIResponse<T>> => {
    let config: RequestOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Apply request interceptors
    for (const interceptor of interceptors.request) {
      config = await interceptor(config);
    }

    // Extract params to build query string
    const { params, timeout, ...fetchOptions } = config;
    
    // Append query parameters for all request types
    const fullUrl = `${baseURL}${appendQueryParams(url, params)}`;

    // Setup timeout if provided
    let timeoutId: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
      if (timeout) {
        timeoutId = setTimeout(() => {
          reject(new Error(`Request timeout after ${timeout}ms`));
        }, timeout);
      }
    });

    try {
      // Make the fetch request with optional timeout
      const fetchPromise = fetch(fullUrl, fetchOptions);
      let response: Response;
      
      if (timeout) {
        response = await Promise.race([fetchPromise, timeoutPromise]);
        clearTimeout(timeoutId!);
      } else {
        response = await fetchPromise;
      }

      // Apply response interceptors
      for (const interceptor of interceptors.response) {
        response = await interceptor(response);
      }

      // Parse response
      let data: T;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else if (contentType?.includes('text/')) {
        data = await response.text() as unknown as T;
      } else {
        data = await response.blob() as unknown as T;
      }

      // Handle error responses
      if (!response.ok) {
        const error = new Error(response.statusText) as any;
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (error) {
      // Apply error interceptors
      let processedError = error;
      for (const interceptor of interceptors.error) {
        processedError = await interceptor(processedError);
      }
      throw processedError;
    }
  };

  return {
    /**
     * Adds an interceptor for requests
     */
    addRequestInterceptor: (interceptor: RequestInterceptor) => {
      interceptors.request.push(interceptor);
    },

    /**
     * Adds an interceptor for responses
     */
    addResponseInterceptor: (interceptor: ResponseInterceptor) => {
      interceptors.response.push(interceptor);
    },

    /**
     * Adds an interceptor for errors
     */
    addErrorInterceptor: (interceptor: ErrorInterceptor) => {
      interceptors.error.push(interceptor);
    },

    /**
     * Adds authentication interceptor
     */
    setAuthTokenProvider: (getToken: () => string | null | undefined) => {
      addAuthInterceptor(getToken);
    },

    /**
     * Makes a GET request
     */
    get: <T = any>(url: string, options?: RequestOptions) => 
      request<T>('GET', url, options),

    /**
     * Makes a POST request
     */
    post: <T = any>(url: string, data?: any, options?: RequestOptions) => 
      request<T>('POST', url, { ...options, body: data ? JSON.stringify(data) : undefined }),

    /**
     * Makes a PUT request
     */
    put: <T = any>(url: string, data?: any, options?: RequestOptions) => 
      request<T>('PUT', url, { ...options, body: data ? JSON.stringify(data) : undefined }),

    /**
     * Makes a PATCH request
     */
    patch: <T = any>(url: string, data?: any, options?: RequestOptions) => 
      request<T>('PATCH', url, { ...options, body: data ? JSON.stringify(data) : undefined }),

    /**
     * Makes a DELETE request
     */
    delete: <T = any>(url: string, options?: RequestOptions) => 
      request<T>('DELETE', url, options),
  };
}

// Export types
export type APIClient = ReturnType<typeof createAPIClient>; 