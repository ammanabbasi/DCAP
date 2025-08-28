import React from 'react';
import {StyleSheet} from 'react-native';
import {wp} from '../../Theme/Responsiveness';
import Typography from '../../Theme/Typography';
export const useStyle = (): any => {
  const styles = (): any =>
    StyleSheet.create({
      view: {
        justifyContent: 'center',
        alignItems: 'center',
        width: wp(94),
        paddingVertical: wp(3.4),
        borderRadius: wp(3),
      },
      activityIndicator: {
        position: 'absolute',
        right: wp(3),
      },
      text: {
        fontFamily: Typography?.poppins?.Bold,
        fontSize: wp(4),
      },
      iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
      },
    });
  return React.useMemo(() => styles(), []);
};
