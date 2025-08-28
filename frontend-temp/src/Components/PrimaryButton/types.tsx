import { StyleProp, ViewStyle } from 'react-native';

export interface Props {
  title?: string;
  onPress: () => void;
  withArrow?: boolean;
  style?: StyleProp<ViewStyle>;
  animating?: boolean;
  textStyle?: any;
  icon?: any;
  disabled?: boolean;
  whiteBackground?:boolean;
  disabledWhileAnimating?: boolean;
}
