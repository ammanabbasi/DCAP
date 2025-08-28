import { AccessibilityInfo, Platform } from 'react-native';
import { Logger } from '../config/buildConfig';

/**
 * Accessibility utilities for production-ready app
 */

// Check if screen reader is enabled
export const isScreenReaderEnabled = async (): Promise<boolean> => {
  try {
    const isEnabled = await AccessibilityInfo.isScreenReaderEnabled();
    Logger.log('[A11Y] Screen reader enabled:', isEnabled);
    return isEnabled;
  } catch (error: any) {
    Logger.error('[A11Y] Error checking screen reader:', error);
    return false;
  }
};

// Check if reduce motion is enabled (iOS)
export const isReduceMotionEnabled = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'ios') {
      const isEnabled = await AccessibilityInfo.isReduceMotionEnabled();
      Logger.log('[A11Y] Reduce motion enabled:', isEnabled);
      return isEnabled;
    }
    return false;
  } catch (error: any) {
    Logger.error('[A11Y] Error checking reduce motion:', error);
    return false;
  }
};

// Announce message to screen reader
export const announceForAccessibility = (message: string): void => {
  try {
    AccessibilityInfo.announceForAccessibility(message);
    Logger.log('[A11Y] Announced:', message);
  } catch (error: any) {
    Logger.error('[A11Y] Error announcing:', error);
  }
};

// Set accessibility focus to element
export const setAccessibilityFocus = (reactTag: number): void => {
  try {
    AccessibilityInfo.setAccessibilityFocus(reactTag);
    Logger.log('[A11Y] Set focus to:', reactTag);
  } catch (error: any) {
    Logger.error('[A11Y] Error setting focus:', error);
  }
};

// Common accessibility props for different component types
export const getAccessibilityProps = {
  button: (label: string, hint?: string, disabled = false) => ({
    accessible: true,
    accessibilityRole: 'button' as const,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityState: { disabled },
  }),
  
  textInput: (label: string, value?: string, placeholder?: string) => ({
    accessible: true,
    accessibilityRole: 'text' as const,
    accessibilityLabel: label,
    accessibilityValue: value ? { text: value } : undefined,
    accessibilityHint: placeholder,
  }),
  
  text: (text: string, header = false) => ({
    accessible: true,
    accessibilityRole: header ? ('header' as const) : ('text' as const),
    accessibilityLabel: text,
  }),
  
  image: (description: string, decorative = false) => ({
    accessible: !decorative,
    accessibilityRole: 'image' as const,
    accessibilityLabel: decorative ? undefined : description,
  }),
  
  list: (itemCount: number) => ({
    accessible: true,
    accessibilityRole: 'list' as const,
    accessibilityLabel: `List with ${itemCount} items`,
  }),
  
  tab: (label: string, selected = false) => ({
    accessible: true,
    accessibilityRole: 'tab' as const,
    accessibilityLabel: label,
    accessibilityState: { selected },
  }),
  
  switch: (label: string, checked = false) => ({
    accessible: true,
    accessibilityRole: 'switch' as const,
    accessibilityLabel: label,
    accessibilityState: { checked },
  }),
  
  link: (label: string, url?: string) => ({
    accessible: true,
    accessibilityRole: 'link' as const,
    accessibilityLabel: label,
    accessibilityHint: url ? `Opens ${url}` : 'Opens link',
  }),
  
  search: (placeholder: string, value?: string) => ({
    accessible: true,
    accessibilityRole: 'search' as const,
    accessibilityLabel: placeholder,
    accessibilityValue: value ? { text: value } : undefined,
  }),
};

// Format currency for screen readers
export const formatCurrencyForA11y = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Format date for screen readers
export const formatDateForA11y = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Format phone number for screen readers
export const formatPhoneForA11y = (phone: string): string => {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Format as individual digits for better pronunciation
  return digits.split('').join(' ');
};

// Common accessibility labels
export const A11Y_LABELS = {
  CLOSE: 'Close',
  BACK: 'Go back',
  MENU: 'Open menu',
  SEARCH: 'Search',
  FILTER: 'Filter results',
  SORT: 'Sort options',
  REFRESH: 'Refresh',
  EDIT: 'Edit',
  DELETE: 'Delete',
  SAVE: 'Save',
  CANCEL: 'Cancel',
  NEXT: 'Next',
  PREVIOUS: 'Previous',
  LOADING: 'Loading',
  ERROR: 'Error occurred',
  SUCCESS: 'Action completed successfully',
  REQUIRED_FIELD: 'Required field',
  OPTIONAL_FIELD: 'Optional field',
} as const;

export default {
  isScreenReaderEnabled,
  isReduceMotionEnabled,
  announceForAccessibility,
  setAccessibilityFocus,
  getAccessibilityProps,
  formatCurrencyForA11y,
  formatDateForA11y,
  formatPhoneForA11y,
  A11Y_LABELS,
};
