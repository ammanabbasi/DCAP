import React, {useEffect, useRef, useState} from 'react';
import {Image, Pressable, Text, TextInput, View} from 'react-native';
import {useStyle} from './style';
import {Props} from './types';
import {icn} from '../../Assets/icn';
import { Colors } from '../../Theme/Colors';
const Searchbar: React.FC<Props> = props => {
  const styles = useStyle();
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const handleFocus = (): any => {
    setIsFocused(true);
    if (props?.isFocused) props.isFocused(true);
  };
  const handleBlur = (): any => {
    setIsFocused(false);
    if (props?.isFocused) props.isFocused(false);
  };
  const textInputRef = useRef(null);
  // useEffect(() => {
  //   textInputRef.current?.focus();
  // }, []);
  return (
    <Pressable
      style={[
        // isFocused
        //   ? {
        //       backgroundColor: theme?.colors?.transparentGreenBackground,
        //       borderColor: theme?.colors?.primaryButton,
        //       borderWidth: widthPercentageToDP(0.25),
        //     }
        //   : {backgroundColor: theme?.colors?.dullGreyBackground},
        styles.searchParent,
        props?.styles,
      ]}
      onPress={props?.onPress}>
      <View style={styles.rowFlex}>
        <View style={styles.subRowFlex}>
          <Image
            source={icn.search}
            style={styles.searchIcon}
            resizeMode="contain"
          />
          {props?.dummy ? (
            <Pressable onPress={props?.onPress}>
              <Text style={styles.dummySearch}>{props?.placeholder}</Text>
            </Pressable>
          ) : (
            <TextInput
              ref={textInputRef}
              onChangeText={val => {
                props.onChangeText(val);
              }}
              style={[styles.search,props?.inputStyle]}
              value={props?.value}
              // focusable={false}
              onPressIn={props?.onPress}
              placeholder={props?.placeholder}
              // onFocus={props?.onFocus ? props?.onFocus : handleFocus}
              onBlur={handleBlur}
              onSubmitEditing={props?.onSubmitEditing}
              placeholderTextColor={
                props?.placeholderColor
                  ? props?.placeholderColor
                  : Colors.greyIcn
              }
            />
          )}
        </View>
        {props?.rightIcon ? props.rightIcon() : null}
      </View>
      {/* <View style={styles.searchView} /> */}
    </Pressable>
  );
};
export default React.memo(Searchbar);
