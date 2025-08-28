import AsyncStorage from '@react-native-async-storage/async-storage';
import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {PaperProvider, Snackbar} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {disableSnackbar} from '../redux/slices/snackbarSlice';
import Stack from './Stack';
import {Platform, SafeAreaView, Image, TouchableOpacity} from 'react-native';
import {Colors} from '../Theme/Colors';
import Toast, {BaseToast} from 'react-native-toast-message';
import {hp, wp} from '../Theme/Responsiveness';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {profile} from '../Services/apis/APIs';
import {saveUser} from '../redux/slices/userSlice';
import { icn } from '../Assets/icn'
// import VehicleRelated from '../Screens/VehicleRelated';
const AppStack = (): any => {
  // useEffect(() => {
  //   AsyncStorage.clear();
  // }, []);
  const message = useSelector((state:any) => state?.snackbarReducer?.snackbarMessage);
  const isVisible = useSelector((state:any) => state?.snackbarReducer?.snackbarVisible);

  const dispatch = useDispatch();
  const backgroundColor = useSelector(
    (state:any) => state?.themeReducer?.safeAreaViewBackground,
  );
  useEffect(() => {
    setTimeout(() => {
      dispatch(disableSnackbar());
    }, 3000);
  }, [isVisible, dispatch]);
  const toastConfig = {
    success: (props:any) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: 'green',
          width: '90%',
          minHeight: hp(8),
          maxHeight: hp(20),
        }}
        text1Style={{
          fontSize: wp(3.5),
          fontWeight: 'bold',
        }}
        text2Style={{
          fontSize: wp(3.2),
          flexWrap: 'wrap',
          flexShrink: 1,
          numberOfLines: undefined,
          lineHeight: wp(4.5),
          textAlignVertical: 'top',
        }}
        renderTrailingIcon={() => (
          <TouchableOpacity onPress={() => Toast.hide()}>
            <Image
              source={icn.cross}
              style={{ width: 20, height: 20}}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
        text2NumberOfLines={0}
      />
    ),
    error: (props:any) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: 'red',
          width: '90%',
          minHeight: hp(8),
          maxHeight: hp(20),
        }}
        text1Style={{
          fontSize: wp(3.5),
          fontWeight: 'bold',
        }}
        text2Style={{
          fontSize: wp(3.2),
          flexWrap: 'wrap',
          flexShrink: 1,
          numberOfLines: undefined,
          lineHeight: wp(4.5),
          textAlignVertical: 'top',
        }} 
        renderTrailingIcon={() => (
          <TouchableOpacity onPress={() => Toast.hide()}>
            <Image
              source={icn.cross}
              style={{ width: 15, height: 15, marginTop: hp(1), marginRight: wp(1) }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
        text2NumberOfLines={0}
      />
    ),
  };
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <PaperProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <SafeAreaView style={{flex: 1, backgroundColor: backgroundColor}}>
              <Stack />
              <Snackbar
                visible={isVisible}
                onDismiss={() => {}}
                style={{zIndex: 5000}}>
                {message}
              </Snackbar>
            </SafeAreaView>
            <Toast
              config={toastConfig}
              topOffset={Platform.OS == 'android' ? hp(3) : hp(7)}
              visibilityTime={5000}
            />
          </NavigationContainer>
        </SafeAreaProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
};

export default AppStack;
