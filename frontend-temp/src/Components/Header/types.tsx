import { StyleProp, ViewStyle, ImageStyle } from 'react-native';

export interface Props {
  onLeftIconPress?:()=> void;
  onRightFirstIconPress?:()=> void;
  onRightSecondIconPress?:()=> void;
  leftIcn?:any;
  title?:string;
  rightFirstIcn?:any;
  rightSecondIcn?:any;
  style?:StyleProp<ViewStyle>;
  leftIcnStyle?:StyleProp<ImageStyle>;
  rightFirstIcnStyle?:StyleProp<ImageStyle>;
  rightSecondIcnStyle?:StyleProp<ImageStyle>;
  blueBackground?:boolean;
  leftIcnColor?:string;
}
