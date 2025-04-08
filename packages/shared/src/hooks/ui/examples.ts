import { useDisclosure, UseDisclosureReturn } from './useDisclosure';
import { useMediaQuery, breakpoints, useBreakpointValue } from './useMediaQuery';
import { useClickOutside } from './useClickOutside';
import { useFocus, UseFocusReturn } from './useFocus';
import { useHover, UseHoverReturn } from './useHover';

/**
 * Examples of how to use the UI hooks
 * 
 * This file contains functions that demonstrate how to use each UI hook.
 * These are not actual React components but examples of how the hooks work.
 */

// Example of using useDisclosure hook
export function useDisclosureExample(): UseDisclosureReturn {
  const disclosure = useDisclosure({
    defaultIsOpen: false,
    onOpen: () => console.log('Opened!'),
    onClose: () => console.log('Closed!'),
    onChange: (isOpen: boolean) => console.log(`Changed to: ${isOpen}`)
  });
  
  // Usage in a component:
  // <Button onPress={disclosure.onToggle}>
  //   {disclosure.isOpen ? 'Close' : 'Open'}
  // </Button>
  
  return disclosure;
}

// Example of using useMediaQuery hook
export function useMediaQueryExample() {
  // Check if the screen is desktop size
  const isDesktop = useMediaQuery({ minWidth: breakpoints.lg });
  
  // Check if the screen is mobile size
  const isMobile = useMediaQuery({ maxWidth: breakpoints.sm });
  
  // Check using a CSS-like query string
  const isLandscape = useMediaQuery('(min-width: 768px) and (min-height: 480px)');
  
  // Using breakpoint values for responsive designs
  const fontSize = useBreakpointValue({
    base: 14, // default
    sm: 16,   // small screens
    md: 18,   // medium screens
    lg: 20,   // large screens
    xl: 24,   // extra large screens
  });
  
  return {
    isDesktop,
    isMobile,
    isLandscape,
    fontSize
  };
}

// Example of using useClickOutside hook
export function useClickOutsideExample() {
  // Get a ref and disclosure state
  const ref = { current: null };
  const disclosure = useDisclosure();
  
  // Setup the click outside handler
  useClickOutside(ref, disclosure.onClose);
  
  // Usage in a component:
  // <View>
  //   <Button onPress={disclosure.onToggle}>Open Dropdown</Button>
  //   {disclosure.isOpen && (
  //     <View ref={ref}>Dropdown content</View>
  //   )}
  // </View>
  
  return { ref, ...disclosure };
}

// Example of using useFocus hook
export function useFocusExample(): UseFocusReturn<any> {
  const focus = useFocus<any>();
  
  // Usage in a component:
  // <View>
  //   <Button onPress={focus.focus}>Focus Input</Button>
  //   <Input 
  //     ref={focus.ref}
  //     placeholder="Type here"
  //     {...focus.focusProps}
  //   />
  //   <Text>Input is {focus.isFocused ? 'focused' : 'not focused'}</Text>
  // </View>
  
  return focus;
}

// Example of using useHover hook
export function useHoverExample(): UseHoverReturn<any> {
  const hover = useHover<any>();
  
  // Usage in a component:
  // <View
  //   ref={hover.ref}
  //   {...hover.hoverProps}
  //   style={{ 
  //     backgroundColor: hover.isHovered ? '#3498db' : '#f0f0f0',
  //   }}
  // >
  //   <Text>{hover.isHovered ? 'Hovering!' : 'Hover over me'}</Text>
  // </View>
  
  return hover;
} 