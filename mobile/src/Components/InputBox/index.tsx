import React, {useState} from 'react';
import {
  I18nManager,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {icn} from '../../Assets/icn';
import {Colors} from '../../Theme/Colors';
import {wp} from '../../Theme/Responsiveness';
import {useStyle} from './style';
import {Props} from './types';
const InputBox: React.FC<Props> = props => {
  const styles = useStyle();
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [isPaswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const togglePassword = (): any => {
    setIsPasswordVisible((prev: boolean) => !prev);
  };
  const clear = (): any => {
    props.onChangeText('');
    setTimeout(() => {
      props?.onBlur ? props?.onBlur() : null;
    }, 1000);
  };

  const onTextChange = (text: string) => {
    if (!props.disabled) {
      props.onChangeText(text);
    }
  };
  return (
    <>
      <View
        style={[
          styles.textView,
          {
            width: props?.width ? props.width : wp(94),
            backgroundColor: Colors.dullWhite,
            borderWidth: !isFocused && !props?.blueBorder ? 0 : wp(0.3),
          },
          props.style,
        ]}
        onLayout={props?.onLayout}>
        {props.renderIcon != null ? props.renderIcon() : null}
        {props.disabled ? (
          <Text
            style={[
              styles.input,
              {
                maxWidth: props?.width ? props?.width - wp(8) : wp(67),
                includeFontPadding: false,
                color: Colors.placeholderText,
                textAlign: 'left',
              },
            ]}>
            {props?.value}
          </Text>
        ) : (
          <TextInput
            onChangeText={val => {
              if (onTextChange) {
                const cleanNumber = val.replace(/[^0-9]/g, '');
                const numericTypes = ['dialpad', 'number-pad', 'decimal-pad', 'numeric', 'phone-pad'];
                onTextChange(
                  numericTypes.includes(props?.keyboardType || '') ? cleanNumber : val,
                );
              }
            }}
            value={props.value}
            multiline={props?.multiline ? true : false}
            style={[
              styles.input,
              {
                color: Colors.black,
                width: props?.width ? props?.width - wp(8) : wp(78),
                includeFontPadding: false,
              },
              props?.inputStyle,
            ]}
            placeholderTextColor={
              props?.placeholderTextColor
                ? props?.placeholderTextColor
                : Colors.placeholderText
            }
            onFocus={() => {
              if (!props.disabled) {
                setIsFocused(true);
                if (props?.onFocus) props?.onFocus();
              }
            }}
            maxLength={props?.numberOfCharacter}
            keyboardType={
              props.keyboardType === 'dialpad' ? 'phone-pad' : 
              props.keyboardType === 'normal' ? 'default' : 
              props.keyboardType || 'default'
            }
            onBlur={() => {
              setIsFocused(false);
              props?.onBlur ? props?.onBlur() : null;
            }}
            autoCapitalize="none"
            placeholder={props.placeholder}
            textAlign={I18nManager.isRTL ? 'right' : 'left'}
            autoCorrect={false}
            scrollEnabled
            secureTextEntry={
              props.type == 'password' && !isPaswordVisible ? true : false
            }
          />
        )}
        {props.type === 'password' && (
          <TouchableOpacity onPress={togglePassword} style={styles.eye}>
            <Image
              source={isPaswordVisible ? icn.eye : icn.eye}
              style={styles.rightIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
        {props.rightIcon && (
          <Image
            source={props?.rightIcon}
            style={styles.rightIcon}
            tintColor={props?.blueRight ? Colors.primary : undefined}
            resizeMode="contain"
          />
        )}
      </View>
    </>
  );
};

export default InputBox;
