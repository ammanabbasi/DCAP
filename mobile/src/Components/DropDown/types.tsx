import {StyleProp, ViewStyle} from 'react-native';

export interface Props {
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  data: any[];
  maxHeight?: number;
  value: any;
  setValue: (value: any) => void;
  rightIcon?: boolean;
  placeholder: string;
  dropdownPosition?: 'auto' | 'bottom' | 'top';
  labelField?: string;
  valueField?: string;
  onChange?: (item: any) => void;
}
