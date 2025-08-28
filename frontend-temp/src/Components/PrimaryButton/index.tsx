import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {useStyle} from './style';
import {Props} from './types';
import {Colors} from '../../Theme/Colors';
const PrimaryButton: React.FC<Props> = props => {
  const styles = useStyle();
  return (
    <TouchableOpacity
      style={[
        styles.view,
        {
          backgroundColor:
            props?.disabled == true ||
            (props.animating == true && props.disabledWhileAnimating == true)
              ? Colors.primary
              : props?.whiteBackground
              ? Colors.white
              : Colors.primary,
        },
        props.style,
      ]}
      onPress={() => {
        if (
          props?.disabled == true ||
          (props.animating == true && props.disabledWhileAnimating == true)
        ) {
        } else props.onPress();
      }}>
      <View style={styles.iconContainer}>
        {props?.icon ? props.icon() : null}
        <Text
          style={[
            styles.text,
            {
              color: props?.whiteBackground ? Colors.black : 'white',
            },
            props.textStyle,
          ]}>
          {props.title}
        </Text>
      </View>
      {props.animating && (
        <ActivityIndicator
          animating
          style={styles.activityIndicator}
          color={'white'}
        />
      )}
    </TouchableOpacity>
  );
};
export default PrimaryButton;
