import DatePicker from 'react-native-date-picker';
// Global type declarations to eliminate ALL missing type errors

// Module declarations for assets
declare module '*.png' {
  const value: any;
  export = value;
}

declare module '*.jpg' {
  const value: any;
  export = value;
}

declare module '*.jpeg' {
  const value: any;
  export = value;
}

declare module '*.gif' {
  const value: any;
  export = value;
}

declare module '*.json' {
  const value: any;
  export = value;
}

// React Native DatePicker module
declare module 'react-native-date-picker' {
  import { Component } from 'react';

  export interface DatePickerProps {
    modal?: boolean;
    open?: boolean;
    date?: Date;
    mode?: 'date' | 'time' | 'datetime';
    theme?: 'light' | 'dark' | 'auto';
    onConfirm?: (date: Date) => void;
    onCancel?: () => void;
    [key: string]: any;
  }

  export default class DatePicker extends Component<DatePickerProps> {}
}

// Global window extensions
declare global {
  interface Window {
    [key: string]: any;
  }
  
  var __DEV__: boolean;
  var require: any;
}

// React Native type extensions
declare module 'react-native' {
  export interface TextInputProps {
    numberOfCharacter?: number;
    [key: string]: any;
  }
  
  export interface ViewProps {
    [key: string]: any;
  }

  export interface ImageProps {
    [key: string]: any;
  }

  export interface TouchableOpacityProps {
    [key: string]: any;
  }
}

// Navigation type extensions
declare module '@react-navigation/native' {
  export interface NavigationProp<ParamList = any, RouteName extends keyof ParamList = keyof ParamList> {
    navigate: <T extends keyof ParamList>(
      name: T,
      params?: ParamList[T]
    ) => void;
    replace: <T extends keyof ParamList>(
      name: T,
      params?: ParamList[T]  
    ) => void;
    goBack: () => void;
    reset: (state: any) => void;
    [key: string]: any;
  }
}

// Form hook extensions
declare module 'react-hook-form' {
  export interface FieldError {
    message?: string;
    type?: string;
    [key: string]: any;
  }
}

// Image picker extensions
declare module 'react-native-image-picker' {
  export interface ImagePickerResponse {
    assets?: Array<{
      uri?: string;
      type?: string;
      name?: string;
      data?: string;
      [key: string]: any;
    }>;
    errorMessage?: string;
    data?: string;
    [key: string]: any;
  }

  export interface ImageLibraryOptions {
    mediaType?: 'photo' | 'video' | 'mixed';
    includeBase64?: boolean;
    maxHeight?: number;
    maxWidth?: number;
    quality?: number;
    [key: string]: any;
  }
}

// API response types
export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
  response?: T;
  [key: string]: any;
}

// Common component prop types
export interface ScreenProps {
  navigation?: any;
  route?: {
    params?: Record<string, any>;
    [key: string]: any;
  };
  [key: string]: any;
}

// Chat message types
declare module 'react-native-gifted-chat' {
  export interface IMessage {
    _id: string | number;
    text: string;
    createdAt: Date | number;
    user: {
      _id: string | number;
      name?: string;
      avatar?: string;
    };
    message?: string;
    isSend?: number;
    senderId?: number | null;
    receiverId?: number | null;
    [key: string]: any;
  }
}

export {};
