import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { Logger } from '../config/buildConfig';

/**
 * Custom hook for accessibility state management
 */
export const useAccessibility = (): any => {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState<boolean>(false);
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let screenReaderChangedListener: any;
    let reduceMotionChangedListener: any;

    const initializeAccessibility = async () => {
      try {
        // Check initial states
        const [screenReader, reduceMotion] = await Promise.all([
          AccessibilityInfo.isScreenReaderEnabled(),
          AccessibilityInfo.isReduceMotionEnabled?.() || Promise.resolve(false),
        ]);

        setIsScreenReaderEnabled(screenReader);
        setIsReduceMotionEnabled(reduceMotion);
        
        Logger.log('[A11Y Hook] Initial state:', { screenReader, reduceMotion });

        // Set up listeners
        screenReaderChangedListener = AccessibilityInfo.addEventListener(
          'screenReaderChanged',
          (enabled: boolean) => {
            setIsScreenReaderEnabled(enabled);
            Logger.log('[A11Y Hook] Screen reader changed:', enabled);
          }
        );

        if (AccessibilityInfo.addEventListener) {
          reduceMotionChangedListener = AccessibilityInfo.addEventListener(
            'reduceMotionChanged' as any,
            (enabled: boolean) => {
              setIsReduceMotionEnabled(enabled);
              Logger.log('[A11Y Hook] Reduce motion changed:', enabled);
            }
          );
        }

        setIsLoading(false);
      } catch (error: any) {
        Logger.error('[A11Y Hook] Error initializing accessibility:', error);
        setIsLoading(false);
      }
    };

    initializeAccessibility();

    // Cleanup
    return () => {
      if (screenReaderChangedListener?.remove) {
        screenReaderChangedListener.remove();
      } else if (typeof screenReaderChangedListener === 'function') {
        screenReaderChangedListener();
      }
      
      if (reduceMotionChangedListener?.remove) {
        reduceMotionChangedListener.remove();
      } else if (typeof reduceMotionChangedListener === 'function') {
        reduceMotionChangedListener();
      }
    };
  }, []);

  const announceForAccessibility = (message: string) => {
    if (isScreenReaderEnabled) {
      AccessibilityInfo.announceForAccessibility(message);
      Logger.log('[A11Y Hook] Announced:', message);
    }
  };

  return {
    isScreenReaderEnabled,
    isReduceMotionEnabled,
    isLoading,
    announceForAccessibility,
  };
};

/**
 * Hook for focus management
 */
export const useFocusManagement = (): any => {
  const setAccessibilityFocus = (reactTag: number) => {
    try {
      AccessibilityInfo.setAccessibilityFocus(reactTag);
      Logger.log('[Focus] Set focus to:', reactTag);
    } catch (error: any) {
      Logger.error('[Focus] Error setting focus:', error);
    }
  };

  return { setAccessibilityFocus };
};

export default useAccessibility;
