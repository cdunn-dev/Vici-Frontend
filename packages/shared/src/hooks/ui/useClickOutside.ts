import { useEffect, RefObject } from 'react';
import { Platform } from 'react-native';

/**
 * Hook that detects clicks outside of a specified element
 * 
 * @param ref - Reference to the element to detect clicks outside of
 * @param handler - Callback function to run when a click outside is detected
 * @param enabled - Whether the detection is enabled
 */
export function useClickOutside<T extends Element>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void,
  enabled: boolean = true
): void {
  useEffect(() => {
    // Skip for React Native on mobile platforms
    if (Platform.OS !== 'web' || !enabled) {
      return;
    }

    const listener = (event: MouseEvent | TouchEvent) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      
      handler(event);
    };

    // Use mousedown and touchstart for better performance than click
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, enabled]);
} 