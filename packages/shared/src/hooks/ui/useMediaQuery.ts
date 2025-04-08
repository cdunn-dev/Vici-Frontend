import { useEffect, useState } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

/**
 * Breakpoints for common device sizes
 */
export const breakpoints = {
  sm: 480,
  md: 768,
  lg: 992,
  xl: 1280,
};

type QueryObject = {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
};

type Query = QueryObject | string;

/**
 * Parse a media query string into a query object
 */
const parseQueryString = (query: string): QueryObject => {
  const queryObj: QueryObject = {};
  
  // Parse min-width
  const minWidthMatch = query.match(/\(min-width:\s*(\d+)px\)/);
  if (minWidthMatch && minWidthMatch[1]) {
    queryObj.minWidth = parseInt(minWidthMatch[1], 10);
  }
  
  // Parse max-width
  const maxWidthMatch = query.match(/\(max-width:\s*(\d+)px\)/);
  if (maxWidthMatch && maxWidthMatch[1]) {
    queryObj.maxWidth = parseInt(maxWidthMatch[1], 10);
  }
  
  // Parse min-height
  const minHeightMatch = query.match(/\(min-height:\s*(\d+)px\)/);
  if (minHeightMatch && minHeightMatch[1]) {
    queryObj.minHeight = parseInt(minHeightMatch[1], 10);
  }
  
  // Parse max-height
  const maxHeightMatch = query.match(/\(max-height:\s*(\d+)px\)/);
  if (maxHeightMatch && maxHeightMatch[1]) {
    queryObj.maxHeight = parseInt(maxHeightMatch[1], 10);
  }
  
  return queryObj;
};

/**
 * Check if dimensions match a media query
 */
const matchesQuery = (dimensions: ScaledSize, queryObj: QueryObject): boolean => {
  const { width, height } = dimensions;
  const { minWidth, maxWidth, minHeight, maxHeight } = queryObj;
  
  // Check if width constraints are satisfied
  const widthMatches = 
    (minWidth === undefined || width >= minWidth) && 
    (maxWidth === undefined || width <= maxWidth);
  
  // Check if height constraints are satisfied
  const heightMatches = 
    (minHeight === undefined || height >= minHeight) && 
    (maxHeight === undefined || height <= maxHeight);
  
  return widthMatches && heightMatches;
};

/**
 * A hook for responsive design, similar to CSS media queries.
 * 
 * @param query - Media query as an object or string (e.g. '(min-width: 768px)')
 * @returns Whether the current dimensions match the query
 */
export function useMediaQuery(query: Query): boolean {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));
  const [matches, setMatches] = useState<boolean>(false);
  
  useEffect(() => {
    // Parse query if it's a string
    const queryObj = typeof query === 'string' ? parseQueryString(query) : query;
    
    // Check initial match
    setMatches(matchesQuery(dimensions, queryObj));
    
    // Set up listener for dimension changes
    const handleChange = ({ window }: { window: ScaledSize }) => {
      setDimensions(window);
      setMatches(matchesQuery(window, queryObj));
    };
    
    const subscription = Dimensions.addEventListener('change', handleChange);
    
    // Clean up listener
    return () => {
      subscription.remove();
    };
  }, [query, dimensions]);
  
  return matches;
}

/**
 * A hook that returns true if the screen width is greater than the provided breakpoint
 * 
 * @param breakpoint - The minimum width breakpoint or a custom width in pixels
 * @returns Whether the current width is greater than the breakpoint
 */
export function useBreakpointValue<T>(values: Record<string, T>, defaultValue?: T): T | undefined {
  const isSm = useMediaQuery({ minWidth: breakpoints.sm });
  const isMd = useMediaQuery({ minWidth: breakpoints.md });
  const isLg = useMediaQuery({ minWidth: breakpoints.lg });
  const isXl = useMediaQuery({ minWidth: breakpoints.xl });
  
  if (isXl && values.xl !== undefined) return values.xl;
  if (isLg && values.lg !== undefined) return values.lg;
  if (isMd && values.md !== undefined) return values.md;
  if (isSm && values.sm !== undefined) return values.sm;
  if (values.base !== undefined) return values.base;
  
  return defaultValue;
} 