import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {Image, Text, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-toast-message';
import {useDispatch, useSelector} from 'react-redux';
import {icn} from '../../Assets/icn';
import Header from '../../Components/Header';
import InputBox from '../../Components/InputBox';
import LoadingModal from '../../Components/LoadingModal';
import PrimaryButton from '../../Components/PrimaryButton';
import {updatePassword} from '../../Services/apis/APIs';
import {styles} from './style';

const ChangePassword = (): any => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {control, handleSubmit, trigger, formState, resetField} = useForm();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const user = useSelector((state: any) => state?.userReducer?.user);
  const onSubmit = async (data: any) => {
    if (data?.newPassword !== data?.confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Passwords do not match',
      });
      return;
    }
    try {
      setIsLoading(true);
      const payload = {
        UserID: user?.id,
        oldPassword: data?.oldPassword,
        newPassword: data?.newPassword,
      };
      const response = await updatePassword(payload);
      navigation.goBack();
    } catch (error: any) {
      console.log(error?.response?.data);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message,
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <View style={styles.mainView}>
      <View style={styles.profileHeader}>
        <Header
          leftIcnStyle={styles.leftIcn}
          leftIcn={icn.back}
          onLeftIconPress={() => navigation.goBack()}
          title="Change Password"
          blueBackground
        />
        <View style={styles.imgContainer}>
          <View style={styles.whiteRadius}>
            <Image
              source={user?.Image ? {uri: user?.Image} : icn.sampleUser}
              style={styles.userImg}
              resizeMode="cover"
            />
          </View>
        </View>
      </View>
      <View style={styles.userInfoContainer}>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.EmailAddress}</Text>
      </View>
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}>
        <View style={styles.controller}>
          <Text style={styles.blackPlaceholderText}>Old Password</Text>
          <Controller
            control={control}
            rules={{
              required: 'Old Password is required',
            }}
            render={({field: {onChange, value}}) => (
              <InputBox
                placeholder="********"
                numberOfCharacter={20}
                value={value}
                onChangeText={onChange}
                type="password"
                borderLess
              />
            )}
            name="oldPassword"
          />
          {formState?.errors?.oldPassword && (
            <Text style={styles.error}>Old password is required</Text>
          )}
        </View>
        <View style={styles.controller}>
          <Text style={styles.blackPlaceholderText}>New Password</Text>
          <Controller
            control={control}
            rules={{
              required: 'New password is required',
            }}
            render={({field: {onChange, value}}) => (
              <InputBox
                placeholder="********"
                numberOfCharacter={20}
                value={value}
                onChangeText={onChange}
                type="password"
                borderLess
              />
            )}
            name="newPassword"
          />
          {formState?.errors?.newPassword && (
            <Text style={styles.error}>New password is required</Text>
          )}
        </View>
        <View style={styles.controller}>
          <Text style={styles.blackPlaceholderText}>Confirm Password</Text>
          <Controller
            control={control}
            rules={{
              required: 'Confirm password is required',
            }}
            render={({field: {onChange, value}}) => (
              <InputBox
                placeholder="********"
                numberOfCharacter={20}
                value={value}
                onChangeText={onChange}
                type="password"
                borderLess
              />
            )}
            name="confirmPassword"
          />
          {formState?.errors?.confirmPassword && (
            <Text style={styles.error}>Confirm password is required</Text>
          )}
        </View>
        <PrimaryButton
          style={styles.button}
          onPress={handleSubmit(onSubmit)}
          title={'Update'}
        />
      </KeyboardAwareScrollView>
      <LoadingModal visible={isLoading} />
    </View>
  );
};

export default ChangePassword;
