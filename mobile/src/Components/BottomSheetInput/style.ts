import React from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from '../../Theme/Colors';
import { hp, wp } from '../../Theme/Responsiveness';
import Typography from '../../Theme/Typography';
export const useStyle = (): any => {
  const styles = (): any =>
    StyleSheet.create({
      view: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
      },
      icon: {
        width: wp(6),
        height: wp(3),
      },
      eye: {
        position: 'absolute',
        right: wp(3),
      },
      clear: {
        position: 'absolute',
        right: wp(3),
      },
      input: {
        width: wp(67),
        paddingHorizontal: wp(2),
        fontFamily: Typography?.poppins?.Regular,
        fontSize: wp(3.6),
        paddingVertical: hp(1.3),
      },
      textView: {
        paddingHorizontal: wp(2),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:'space-between',
        borderWidth: wp(0.2),
        borderRadius: wp(2),
        borderColor:Colors.primary,
        width: wp(92),
        backgroundColor: 'white',
      },
      icons: {
        height: hp(2.1),
        width: wp(4.1),
      },
      rightIcon: {
        height: hp(2.5),
        width: wp(5),
      },
      errorMessage: {
        color: 'red',
        textAlign: 'center',
      },
      primaryInput: {
        width: wp(94),
        fontSize:wp(3.6),
        borderColor: Colors.primary,
        color: Colors.black,
        paddingVertical: hp(1.3),
        borderRadius: wp(2),
        fontFamily: Typography?.poppins?.Regular,
        backgroundColor: Colors.dullWhite,
        paddingHorizontal: wp(4),
      },
    });

  return React.useMemo(() => styles(), []);
};
