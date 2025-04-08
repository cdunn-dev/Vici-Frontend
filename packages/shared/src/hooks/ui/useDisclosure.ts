import { useState, useCallback } from 'react';

interface UseDisclosureProps {
  /**
   * The default value of the disclosure
   */
  defaultIsOpen?: boolean;
  
  /**
   * Function called when the disclosure is opened
   */
  onOpen?: () => void;
  
  /**
   * Function called when the disclosure is closed
   */
  onClose?: () => void;
  
  /**
   * Function called when the disclosure state changes
   */
  onChange?: (isOpen: boolean) => void;
}

interface UseDisclosureReturn {
  /**
   * Whether the disclosure is currently open
   */
  isOpen: boolean;
  
  /**
   * Function to open the disclosure
   */
  onOpen: () => void;
  
  /**
   * Function to close the disclosure
   */
  onClose: () => void;
  
  /**
   * Function to toggle the disclosure
   */
  onToggle: () => void;
  
  /**
   * Props that can be spread onto disclosure trigger elements
   */
  getDisclosureProps: () => { 
    'aria-expanded': boolean;
    onClick: () => void;
  };
  
  /**
   * Props that can be spread onto the disclosure content
   */
  getContentProps: () => { 
    hidden: boolean;
    'aria-hidden': boolean;
  };
}

/**
 * Hook to help manage disclosure state (open/close) of components like modals, drawers, etc.
 * 
 * @param props - Configuration options
 * @returns Methods and state for managing disclosure
 */
export function useDisclosure(props: UseDisclosureProps = {}): UseDisclosureReturn {
  const {
    defaultIsOpen = false,
    onOpen: onOpenProp,
    onClose: onCloseProp,
    onChange,
  } = props;

  const [isOpen, setIsOpen] = useState<boolean>(defaultIsOpen);

  const onOpen = useCallback(() => {
    if (!isOpen) {
      setIsOpen(true);
      onOpenProp?.();
      onChange?.(true);
    }
  }, [isOpen, onOpenProp, onChange]);

  const onClose = useCallback(() => {
    if (isOpen) {
      setIsOpen(false);
      onCloseProp?.();
      onChange?.(false);
    }
  }, [isOpen, onCloseProp, onChange]);

  const onToggle = useCallback(() => {
    const action = isOpen ? onClose : onOpen;
    action();
  }, [isOpen, onOpen, onClose]);

  const getDisclosureProps = useCallback(() => ({
    'aria-expanded': isOpen,
    onClick: onToggle,
  }), [isOpen, onToggle]);

  const getContentProps = useCallback(() => ({
    hidden: !isOpen,
    'aria-hidden': !isOpen,
  }), [isOpen]);

  return {
    isOpen,
    onOpen,
    onClose,
    onToggle,
    getDisclosureProps,
    getContentProps,
  };
} 