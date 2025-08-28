import React from 'react';
import { StyleSheet } from 'react-native';
import { hp, wp } from '../../Theme/Responsiveness';
import Typography from '../../Theme/Typography';
import { Colors } from '../../Theme/Colors';
export const useStyle = (): any => {
  const styles = (): any =>
    StyleSheet.create({
      flexRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: hp(1)
      },
      nameText: {
        fontFamily: Typography?.poppins?.Medium,
        color: Colors.black,
        fontSize: wp(5.2),
      },
      leftIcn: {
        width: wp(5),
        height: hp(2.5),
      },
      rightIcns: {
        width: wp(5),
        height: hp(2.5),
      },
      icnContainer: {
        backgroundColor: Colors.dullWhite,
        padding: wp(1.5),
        borderRadius: wp(100),
      },
      // Menu related styles from CarModelList
      optionSpaceContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: hp(0.5),
      },
      optionName: {
        color: Colors.black,
        fontSize: wp(3.5),
        fontFamily: Typography?.poppins?.Regular,
      },
      forwardIcn: {
        width: wp(3.5),
        height: hp(2),
        marginLeft: wp(3)
      },
      menuOptionContainer: {
        position: 'relative',
        zIndex: 1000,
        backgroundColor: 'white',
        paddingHorizontal: wp(2),
        paddingVertical: hp(1),
        borderRadius: wp(2),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 24,
      },
      optionIcn: {
        width: wp(5.5),
        height: hp(3),
        marginTop: hp(0.2),
      }

    });
  return React.useMemo(() => styles(), []);
};
