import { StyleProp, ViewStyle } from 'react-native';

export interface Props {
  onChangeText: (key: string) => void;
  value?: string;
  styles?: any;
  onFocus?: () => void;
  isFocused?: (val:boolean) => void;
  onBlur?: () => void;
  placeholder?: string;
  dummy?: boolean;
  placeholderColor?: string;
  onPress?: () => void;
  onSubmitEditing?:()=>void;
  rightIcon?: any;
  inputStyle?:any;
}
