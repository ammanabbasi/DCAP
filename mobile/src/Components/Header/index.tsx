import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import {useTheme } from 'react-native-paper';
import { useStyle } from './style';
import { Props } from './types';
import { wp } from '../../Theme/Responsiveness';
import { Colors, rgba } from '../../Theme/Colors';
const Header: React.FC<Props> = props => {
  const styles = useStyle();
  const theme = useTheme();
  const navigation = useNavigation();
  return (
    <View style={[styles.flexRow, props.style]}>
      <TouchableOpacity
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        onPress={props?.onLeftIconPress ? props?.onLeftIconPress : () => { }}>
        <Image
          source={props?.leftIcn}
          style={[styles.leftIcn, props?.leftIcnStyle]}
          resizeMode="contain"
          tintColor={props?.blueBackground ? 'white' : props?.leftIcnColor || undefined}
        />
      </TouchableOpacity>
      <Text
        style={[
          styles.nameText,
          { color: props?.blueBackground ? 'white' : Colors.black },
        ]}>
        {props?.title}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={props?.onRightFirstIconPress}
          style={[
            styles.icnContainer,
            { backgroundColor: 'transparent' }
          ]}>
          <Image
            source={props?.rightFirstIcn}
            style={[
              styles.rightIcns,
              {
                opacity: props?.rightFirstIcn ? 1 : 0,
              },
              props?.rightFirstIcnStyle,
            ]}
            resizeMode="contain"
            tintColor={props?.blueBackground ? 'white' : undefined}
          />
        </TouchableOpacity>
        {props?.rightSecondIcn && (
          <TouchableOpacity
            onPress={props?.onRightSecondIconPress}
            style={[
              styles.icnContainer,
              { marginLeft: wp(2) },
              {
                backgroundColor: props?.blueBackground
                  ? rgba('F5F5F5', 0.15)
                  : Colors.dullWhite,
              },
            ]}>
            <Image
              source={props?.rightSecondIcn}
              style={[styles.rightIcns, props?.rightSecondIcnStyle]}
              resizeMode="contain"
              tintColor={props?.blueBackground ? 'white' : undefined}
            />
          </TouchableOpacity>
        )}
        
      </View>
    </View>
  );
};

export default Header;
