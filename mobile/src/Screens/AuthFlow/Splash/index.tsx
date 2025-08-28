import {useIsFocused, useNavigation} from '@react-navigation/native';
import React, {useEffect, useLayoutEffect} from 'react';
import {Image, StatusBar, View} from 'react-native';
import {img} from '../../../Assets/img';
import {Colors} from '../../../Theme/Colors';
import {styles} from './style';
import {useDispatch, useSelector} from 'react-redux';
import {updateSafeAreaBackground} from '../../../redux/slices/themeSlice';
interface LogIn {
  navigation?: any;
}
const Splash: React.FC<LogIn> = (props: LogIn) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const user = useSelector((state: any) => state?.userReducer?.user);
  const dispatch = useDispatch();
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (user) {
        navigation.replace('BottomTab');
      } else navigation.replace('Login');
    }, 1700);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);
  useLayoutEffect(() => {
    if (isFocused) dispatch(updateSafeAreaBackground(Colors.primary));
  }, [isFocused]);
  useEffect(() => {
    const blurListener = navigation.addListener('blur': any, (: any) =>
      dispatch(updateSafeAreaBackground('white')),
    );
    const beforeRemoveListener = navigation.addListener('beforeRemove': any, (: any) =>
      dispatch(updateSafeAreaBackground('white')),
    );
    return () => {
      blurListener();
      beforeRemoveListener();
    };
  }, [navigation]);
  return (
    <View style={styles.mainView}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      {/* <View style={styles.imageContainer}> */}
      <Image source={img.splash} style={styles.image} />
      {/* </View> */}
    </View>
  );
};
export default Splash;
