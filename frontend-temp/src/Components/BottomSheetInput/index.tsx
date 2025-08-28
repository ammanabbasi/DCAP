import {BottomSheetTextInput} from '@gorhom/bottom-sheet';
import React, {useState} from 'react';
import {Colors} from '../../Theme/Colors';
import {useStyle} from './style';
import {Props} from './types';
import {wp} from '../../Theme/Responsiveness';
const BottomSheetInput: React.FC<Props> = props => {
  const styles = useStyle();
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const onTextChange = (text: string) => {
    if (!props.disabled) {
      props.onChangeText(text);
    }
  };
  return (
    <BottomSheetTextInput
      placeholder={props?.placeholder}
      value={props.value}
      multiline={props?.multiline ? true : false}
      keyboardType={props?.keyboardType === 'normal' ? 'default' : props?.keyboardType}
      onChangeText={val => {
        const cleanNumber = val.replace(/[^0-9]/g, '');
        const numericTypes = ['number-pad', 'numeric', 'decimal-pad', 'phone-pad'];
        onTextChange(numericTypes.includes(props?.keyboardType || '') ? cleanNumber : val);
      }}
      cursorColor={Colors.black}
      placeholderTextColor={Colors.greyIcn}
      onFocus={() => {
        if (!props.disabled) setIsFocused(true);
      }}
      onBlur={() => {
        setIsFocused(false);
        setTimeout(() => {
          props?.onBlur ? props?.onBlur() : null;
        }, 1000);
      }}
      style={[
        styles.primaryInput,
        {
          borderWidth: isFocused ? wp(0.3) : 0,
        },
        props?.style,
      ]}
    />
  );
};

export default BottomSheetInput;
