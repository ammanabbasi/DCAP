import React from 'react';
import {StyleSheet} from 'react-native';
import {Colors} from '../../Theme/Colors';
import {hp, rfs, wp} from '../../Theme/Responsiveness';
import Typography from '../../Theme/Typography';
export const useStyle = (): any => {
  const styles = (): any =>
    StyleSheet.create({
      dropdownView: {height: hp(7.1), width: wp(94)},
      dropdown: {
        backgroundColor: Colors.dullWhite,
        borderColor: Colors.primary,
        borderRadius: wp(2),
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(2),
        paddingVertical: hp(1.5),
      },
      dropdownContainer: {
        backgroundColor: Colors.dullWhite,
        maxHeight: hp(30),
        borderRadius: wp(2),
        marginTop: hp(1),
      },
      selected: {
        backgroundColor: Colors.green,
        borderRadius: wp(1),
        color: 'red',
        borderColor: Colors.grey,
      },
      itemTextStyle: {
        fontSize: wp(3.5),
        color: Colors.greyIcn,
        fontFamily: Typography?.poppins?.Regular,
      },
      placeholderStyle: {
        paddingLeft: wp(3),
        fontSize: wp(3.5),
        color: Colors.greyIcn,
        fontFamily: Typography?.poppins?.Regular,
      },
      selectedTextStyle: {
        backgroundColor: Colors.dullWhite,
        paddingLeft: wp(3),
        fontSize: wp(3.5),
        color: Colors.black,
        fontFamily: Typography?.poppins?.Regular,
      },
      arrow: {width: wp(4.4), height: hp(2.2)},
    });

  return React.useMemo(() => styles(), []);
};
