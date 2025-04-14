import { useState, useRef, useCallback, RefObject } from 'react';
import { Platform } from 'react-native';

interface UseHoverReturn<T> {
  /**
   * Ref that should be attached to the element to track
   */
  ref: RefObject<T>;
  
  /**
   * Whether the element is currently hovered
   */
  isHovered: boolean;
  
  /**
   * Props that can be spread onto the element
   */
  hoverProps: {
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
  };
}

/**
 * Hook to track the hover state of an element
 * 
 * @returns Object with ref, hover state, and hover props
 */
export function useHover<T extends Element>(): UseHoverReturn<T> {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const ref = useRef<T>(null);
  
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);
  
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);
  
  // Only use these props on web platform
  const hoverProps = Platform.OS === 'web'
    ? { onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave }
    : {};
  
  return {
    ref,
    isHovered,
    hoverProps,
  };
} 