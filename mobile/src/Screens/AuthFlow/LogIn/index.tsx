import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Image,
  Platform,
  StatusBar,
  Text,
  View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import { icn } from '../../../Assets/icn';
import InputBox from '../../../Components/InputBox';
import LoadingModal from '../../../Components/LoadingModal';
import PrimaryButton from '../../../Components/PrimaryButton';
import { saveUser, saveUserAssignedUrl } from '../../../redux/slices/userSlice';
import { login } from '../../../Services/apis/authAPIs';
import { Colors } from '../../../Theme/Colors';
import { hp } from '../../../Theme/Responsiveness';
import Typography from '../../../Theme/Typography';
import { styles } from './style';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { img } from '../../../Assets/img';
import { RootStackScreenProps } from '../../../Navigation/type';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';

type Props = RootStackScreenProps<'Login'>;

const LogIn: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const userUrl = useAppSelector(state => state?.userReducer?.userAssignedUrl);
  const [isUrlEntered, setIsUrlEntered] = useState<boolean>(userUrl ? true : true);
  const [url, setUrl] = useState<string>('');
  const [urlError, setUrlError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {control, handleSubmit, trigger, formState, resetField} = useForm();
  const isValidUrl = (text: string): boolean => {
    const urlPattern =
      /^https:\/\/[a-zA-Z0-9-]+\.autodealerscloud\.com(\/.*)?$/;
    return urlPattern.test(text);
  };
  const handleUrlChange = (text: string) => {
    if (!text) {
      setUrlError('Url is required');
    } 
    // else if (!isValidUrl(text)) {
    //   setUrlError('Invalid Url');
    // } 
    else {
      setUrlError(undefined);
    }
    setUrl(text);
  };

  const handleNext = async () => {
    if (!url) {
      setUrlError('Url is required');
    } 
    // else if (!isValidUrl(url)) {
    //   setUrlError('Invalid Url');
    // } 
    else {
      setUrlError(undefined);
      setIsUrlEntered(true);
      dispatch(saveUserAssignedUrl(url));
    }
  };
  const handleNavigation = (): any => {
    setTimeout(() => {
      if(isFocused){
        setIsLoading(false);
      navigation.replace('BottomTab');
      }
    }, 0);
  };
  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      const payload = {
        username: data?.username,
        password: data?.password,
      };
      const response = await login(payload);
      // console.log("Res => ",response?.data)
      dispatch(saveUser(response?.data));
      const token = response?.data?.token;
      if (token) {
        await AsyncStorage.setItem('token', token);
      }
      handleNavigation();
    } catch (error: any) {
      if (error.isAxiosError) {
        console.log("Axios Error Details:");
        console.log("Message:", error.message);
        console.log("Code:", error.code);
        console.log("Config:", error.config);
        if (error.response) {
          console.log("Status:", error?.response?.status);
          console.log("Data:", error?.response?.data);
          console.log("Headers:", error?.response?.headers);
        } else if (error.request) {
          console.log("Request:", error.request);
        } else {
          console.log("Error:", error.message);
        }
      } else {
        console.log("Error => ", error);
      }
      setIsLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message,
      });
    }
  };
  function parseNameFromURL(url: string): any {
    const urlWithoutProtocol = url.replace(/^https?:\/\//, '');
    let name = urlWithoutProtocol.split('.')[0];
    name = name.charAt(0).toUpperCase() + name.slice(1);
    return name;
  }
  
  return (
    <View style={styles.mainView}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <KeyboardAwareScrollView
        style={styles.mainView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: Colors.primary,
        }}>
        {/* <Image resizeMode="contain" source={icn.logo} style={styles.icn} /> */}
        <Image resizeMode="contain" source={img.splash} style={styles.image} />    
        <View style={styles.whiteSheet}>
          <Text
            style={[
              styles.signInText,
              {
                fontFamily: isUrlEntered
                  ? Typography?.poppins?.SemiBold
                  : Typography?.poppins?.ExtraBold,
              },
            ]}>
            Sign In
          </Text>
          <Text style={styles.greetText}>
            Hello {userUrl ? parseNameFromURL(userUrl) : 'again'}, you've been
            missed!
          </Text>
          {!isUrlEntered ? (
            <>
              <Text style={styles.placeholderText}>Site URL</Text>
              <InputBox
                placeholder="Your Site URL"
                numberOfCharacter={40}
                value={url}
                onChangeText={handleUrlChange}
                rightIcon={icn.world}
              />
              {urlError && <Text style={styles.error}>{urlError}</Text>}
              <Text style={styles.example}>@AutoDEALERSCLOUD.COM</Text>
            </>
          ) : (
            <>
              <Text style={styles.placeholderText}>User Name</Text>
              <Controller
                control={control}
                rules={{
                  required: 'Username is required',
                }}
                render={({field: {onChange, value}}) => (
                  <InputBox
                    placeholder="Username"
                    numberOfCharacter={20}
                    value={value}
                    onChangeText={onChange}
                    rightIcon={icn.user}
                  />
                )}
                name="username"
              />
              {formState?.errors?.username && (
                <Text style={styles.error}>User name is required</Text>
              )}
              <Text style={styles.passwordPlaceholderText}>Password</Text>
              <Controller
                control={control}
                rules={{
                  required: 'Password is required',
                }}
                render={({field: {onChange, value}}) => (
                  <InputBox
                    placeholder="Password"
                    numberOfCharacter={20}
                    value={value}
                    onChangeText={onChange}
                    type="password"
                    borderLess
                  />
                )}
                name="password"
              />
              {formState?.errors?.password && (
                <Text style={styles.error}>Password is required</Text>
              )}
            </>
          )}
          <PrimaryButton
            style={[
              styles.button,
              {
                marginTop: isUrlEntered
                  ? Platform.OS == 'ios'
                    ? hp(22)
                    : hp(21.7)
                  : hp(30),
              },
            ]}
            onPress={isUrlEntered ? handleSubmit(onSubmit) : handleNext}
            title={isUrlEntered ? 'Login' : 'Next'}
          />
        </View>
        <LoadingModal visible={isLoading} message={'Please wait...'} />
      </KeyboardAwareScrollView>
    </View>
  );
};

export default LogIn;
