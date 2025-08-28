import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { hp, wp } from '../../Theme/Responsiveness';
import { Colors } from '../../Theme/Colors';
import Typography from '../../Theme/Typography';
export const useStyle = (): any => {
  const styles = (): any =>
    StyleSheet.create({
      searchIcon: {
        width: wp(4.5),
        height: hp(2.25),
      },
      search: {
        color: Colors.black,
        fontFamily: Typography?.poppins?.Regular,
        fontSize:wp(3.4),
        paddingLeft:wp(2.5),
        width: wp(80),
        paddingVertical:hp(1.2)
      },
      dummySearch: {
        color: Colors.greyIcn,
        fontFamily: Typography?.poppins?.Regular,
        fontSize:wp(3.4),
        paddingLeft:wp(2.5),
        width: wp(80),
        paddingVertical:hp(1.4)
        
      },
      searchParent: {
        borderRadius: wp(2),
        marginTop: hp(2),
        alignSelf: 'center',
        backgroundColor:Colors.dullWhite
      },
      rowFlex:{
        paddingHorizontal:wp(2),
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
      },
      subRowFlex:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
      },
    });
  return React.useMemo(() => styles(), []);
};
