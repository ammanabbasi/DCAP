import {useIsFocused, useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {useDispatch, useSelector} from 'react-redux';
import {icn} from '../../Assets/icn';
import Header from '../../Components/Header';
import {styles} from './style';
import {saveUser} from '../../redux/slices/userSlice';
import Toast from 'react-native-toast-message';
import {profile} from '../../Services/apis/APIs';
import {Colors} from '../../Theme/Colors';
import {wp} from '../../Theme/Responsiveness';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const Profile = (): any => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector((state: any) => state?.userReducer?.user);
  const [photoUri, setPhotoUri] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState<any>(true);
  const openGallery = (): any => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, response => {
      if (response?.didCancel) {
        console.log('User cancelled image picker');
      } else if (response?.errorCode) {
        console.log('ImagePicker Error: ', response?.errorMessage);
      } else {
        setPhotoUri(response?.assets?.[0].uri);
      }
    });
  };
  const getProfileData = async () => {
    try {
      setIsLoading(true);
      const payload = {
        userID: user?.id,
      };
      const response = await profile(payload);
      dispatch(saveUser({...(user || {}), ...response?.data}));
    } catch (error: any) {
      Toast?.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getProfileData();
  }, []);
  return (
    <View style={styles?.mainView}>
      <View style={styles?.profileHeader}>
        <Header
          // leftIcn={icn?.drawer}
          onLeftIconPress={() => {}}
          rightFirstIcn={icn?.message}
          // rightSecondIcn={icn?.setting}
          onRightFirstIconPress={() => navigation?.navigate('Chat')}
          title="Profile"
          blueBackground
        />
        {isLoading ? (
          <ActivityIndicator
            color={Colors?.primary}
            style={styles?.activityIndicator}
            size={Platform?.OS == 'android' ? wp(11) : 'large'}
          />
        ) : (
          <View style={styles?.imgContainer}>
            <View style={styles?.whiteRadius}>
              <Image
                source={user?.Image ? {uri: user?.Image} : icn?.sampleUser}
                style={styles?.userImg}
                resizeMode="cover"
              />
            </View>
          </View>
        )}
      </View>
      {!isLoading && (
        <KeyboardAwareScrollView contentContainerStyle={styles?.subContainer}>
          <Text style={styles?.userName}>{user?.name}</Text>
          <Text style={styles?.userEmail}>{user?.EmailAddress}</Text>
          <TouchableOpacity
            style={styles?.optionContainer}
            onPress={() => {
              navigation?.navigate('EditProfile');
            }}>
            <View style={styles?.spaceContainer}>
              <View style={styles?.rowContainer}>
                <Image
                  source={icn?.edit}
                  style={styles?.leftIcn}
                  resizeMode="contain"
                />
                <Text style={styles?.infoText}>Edit Profile</Text>
              </View>
              <Image
                source={icn?.next}
                style={styles?.rightIcn}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles?.optionContainer} onPress={() => {}}>
            <View style={styles?.spaceContainer}>
              <View style={styles?.rowContainer}>
                <Image
                  source={icn?.world}
                  style={styles?.leftIcn}
                  resizeMode="contain"
                />
                <Text style={styles?.infoText}>Select Language</Text>
              </View>
              <Image
                source={icn?.next}
                style={styles?.rightIcn}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles?.optionContainer}
            onPress={() => {
              navigation?.navigate('ChangePassword');
            }}>
            <View style={styles?.spaceContainer}>
              <View style={styles?.rowContainer}>
                <Image
                  source={icn?.key}
                  style={styles?.leftIcn}
                  resizeMode="contain"
                />
                <Text style={styles?.infoText}>Change Password</Text>
              </View>
              <Image
                source={icn?.next}
                style={styles?.rightIcn}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles?.optionContainer}
            onPress={() => {
              dispatch(saveUser(null));
              navigation?.replace('Login');
            }}>
            <View style={styles?.spaceContainer}>
              <View style={styles?.rowContainer}>
                <Image
                  source={icn?.logout}
                  style={styles?.leftIcn}
                  resizeMode="contain"
                />
                <Text style={styles?.infoText}>Logout</Text>
              </View>
              <Image
                source={icn?.next}
                style={styles?.rightIcn}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        </KeyboardAwareScrollView>
      )}
    </View>
  );
};

export default Profile;
