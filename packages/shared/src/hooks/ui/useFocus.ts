import { useState, useRef, useCallback, RefObject } from 'react';
import { Platform } from 'react-native';

interface UseFocusReturn<T> {
  /**
   * Ref that should be attached to the element to track
   */
  ref: RefObject<T>;
  
  /**
   * Whether the element is currently focused
   */
  isFocused: boolean;
  
  /**
   * Function to focus the element
   */
  focus: () => void;
  
  /**
   * Function to blur the element
   */
  blur: () => void;
  
  /**
   * Props that can be spread onto the element
   */
  focusProps: {
    onFocus: () => void;
    onBlur: () => void;
  };
}

/**
 * Hook to track the focus state of an element
 * 
 * @returns Object with ref, focus state, and focus/blur functions
 */
export function useFocus<T extends { focus?: () => void; blur?: () => void }>(): UseFocusReturn<T> {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const ref = useRef<T>(null);
  
  const focus = useCallback(() => {
    if (ref.current && ref.current.focus) {
      ref.current.focus();
    }
  }, []);
  
  const blur = useCallback(() => {
    if (ref.current && ref.current.blur) {
      ref.current.blur();
    }
  }, []);
  
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);
  
  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);
  
  // Only use these props on web platform
  const focusProps = Platform.OS === 'web' 
    ? { onFocus: handleFocus, onBlur: handleBlur }
    : { onFocus: handleFocus, onBlur: handleBlur };
  
  return {
    ref,
    isFocused,
    focus,
    blur,
    focusProps,
  };
} 