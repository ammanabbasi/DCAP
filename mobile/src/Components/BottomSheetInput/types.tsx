import { StyleProp, ViewStyle, KeyboardTypeOptions } from 'react-native';

export interface Props {
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfCharacter?: number;
  keyboardType?: KeyboardTypeOptions;
  inputStyle?: any;
  value: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  blueBorder?:boolean;
  onSubmitEditing?:()=>void;
  onBlur?:()=>void;
}
