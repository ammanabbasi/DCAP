import React from 'react';
import {Platform, StyleSheet} from 'react-native';
import {hp, wp} from '../../Theme/Responsiveness';
import {Colors} from '../../Theme/Colors';
import DeviceInfo from 'react-native-device-info';
export const useStyle = (): any => {
  const styles = (): any =>
    StyleSheet.create({
      tabbarIcon: {
        fontSize: wp(20),
      },
      tabbar: {
        backgroundColor: Colors.primary,
        // height: hp(7.5),
        height: DeviceInfo.isTablet() ? hp(10) : hp(7.5), // taller on tablet
        paddingTop:hp(0.5),
        paddingBottom: hp(0.6),
        borderTopWidth: 0,
        flexDirection:'row',
        elevation: 0,
        shadowOpacity: 0,
        borderStartStartRadius: wp(5),
        borderTopRightRadius: wp(5),
     
        // paddingRight: DeviceInfo.isTablet() ? wp(8) : wp(4), // add right padding for symmetry
        justifyContent: 'space-evenly',
         // helps with spacing on large screens
        //  alignItems:'center',
      },
    });
  return React.useMemo(() => styles(), []);
};
