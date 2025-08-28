import React, {useState} from 'react';
import {Dropdown} from 'react-native-element-dropdown';
import {Colors} from '../../Theme/Colors';
import {useStyle} from './style';
import {Props} from './types';
import {hp, wp} from '../../Theme/Responsiveness';
import {Image} from 'react-native';
import {icn} from '../../Assets/icn';
const DropDown: React.FC<Props> = props => {
  const styles = useStyle();
  const isDataValid = Array.isArray(props?.data) && props?.data?.length > 0;
  const [isFocused, setIsFocused] = useState<boolean>(false);
  return (
    <Dropdown
      style={[
        styles.dropdown,
        {
          borderWidth: isFocused ? wp(0.3) : 0,
        },
        props?.style,
      ]}
      containerStyle={styles.dropdownContainer}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      placeholderStyle={styles.placeholderStyle}
      itemTextStyle={styles.itemTextStyle}
      selectedTextStyle={styles.selectedTextStyle}
      activeColor={Colors.dullWhite}
      showsVerticalScrollIndicator={false}
      dropdownPosition={props?.dropdownPosition || 'bottom'}
      data={isDataValid ? props?.data : []}
      maxHeight={props?.maxHeight ? props?.maxHeight : hp(20)}
      labelField={props?.labelField ?? 'label'}
      valueField={props?.valueField ?? 'value'}
      placeholder={props.placeholder}
      value={props.value}
      onChange={(item: any) => {
        const selectedValue = props?.valueField
          ? item?.[props.valueField]
          : item?.value;
        props.setValue(selectedValue);
        if (props?.onChange) {
          props?.onChange(item);
        }
      }}
      renderRightIcon={() =>
        props?.rightIcon ? (
          <Image
            source={icn.downArrow}
            style={styles.arrow}
            resizeMode="contain"
          />
        ) : undefined
      }
    />
  );
};

export default DropDown;
