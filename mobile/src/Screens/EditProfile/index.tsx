import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import {launchImageLibrary} from 'react-native-image-picker';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useDispatch, useSelector} from 'react-redux';
import {icn} from '../../Assets/icn';
import Header from '../../Components/Header';
import InputBox from '../../Components/InputBox';
import PrimaryButton from '../../Components/PrimaryButton';
import {Colors} from '../../Theme/Colors';
import {hp, wp} from '../../Theme/Responsiveness';
import {styles} from './style';
import {editProfile} from '../../Services/apis/APIs';
import Toast from 'react-native-toast-message';
import LoadingModal from '../../Components/LoadingModal';
import {saveUser} from '../../redux/slices/userSlice';

const EditProfile = (): any => {
  const user = useSelector((state: any) => state?.userReducer?.user);
  const dispatch = useDispatch();
  const navigation: any = useNavigation();
  const [isChecked, setIsChecked] = useState<any>(user?.ReplyEmailIncludeSignature);
  const [signature, setSignature] = useState<any>(null);
  const [isEmail, setIsEmail] = useState<any>(user?.NotifyNewEmail);
  const [isMessage, setIsMessage] = useState<any>(user?.NotifyNewTextMessage);
  const [isCRM, setIsCRM] = useState<any>(user?.NotifyNewLead);
  const [isLead, setIsLead] = useState<any>(user?.NotifyNewAssignment);
  const {control, handleSubmit, trigger, formState, resetField} = useForm();
  const [photoUri, setPhotoUri] = useState<any>(user?.Image || undefined);
  const [isLoading, setIsLoading] = useState<any>(false);
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
  const onSubmit = async (data: any) => {
    try {
      console.log( "this is data" ,data);
      setIsLoading(true);
      const payload = {
        userID: user?.id,
      };
      payload?.name = data?.username;
      payload?.Street = data?.streetNumber;
      payload?.City = data?.city;
      payload?.ZIPCode = data?.zipCode;
      payload?.EmailAddress = data?.email;
      payload?.PhoneNumber = data?.phone;
      payload?.Signature = signature;
      payload?.NotifyNewEmail = isEmail;
      payload?.NotifyNewTextMessage = isMessage;
      payload?.NotifyNewLead = isCRM;
      payload?.NotifyNewAssignment = isLead;
      payload?.ReplyEmailIncludeSignature = isChecked;
      payload?.Image = photoUri;
      const response = await editProfile(payload);
      dispatch(saveUser({...(user || {}), ...response?.data?.data}));
      navigation?.goBack();
    } catch (error: any) {
      console.log(error?.response?.data);
      Toast?.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message,
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (<View style={styles?.mainView}>
      <View style={styles?.profileHeader}>
        <Header
          leftIcn={icn?.back}
          onLeftIconPress={() => navigation?.goBack()}
          leftIcnStyle={styles?.leftIcn}
          title="Profile"
          blueBackground
        />
        <View style={styles?.imgContainer}>
          <View style={styles?.whiteRadius}>
            <Image
              source={photoUri ? {uri: photoUri} : icn?.sampleUser}
              style={styles?.userImg}
              resizeMode="cover"
            />
            <TouchableOpacity onPress={openGallery} style={styles?.penContainer}>
              <Image
                source={icn?.pen}
                style={styles?.penIcn}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles?.userInfoContainer}>
        <Text style={styles?.userName}>{user?.name}</Text>
        <Text style={styles?.userEmail}>{user?.EmailAddress}</Text>
      </View>
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles?.contentContainer}>
        <View style={styles?.controller}>
          <Text style={styles?.bluePlaceholderText}>Name</Text>
          <Controller
            control={control}
            defaultValue={user?.name}
            rules={{
              required: 'Username is required',
            }}
            render={({field: {onChange, value}}: any) => (
              <InputBox
                placeholder="Name"
                numberOfCharacter={20}
                value={value}
                onChangeText={onChange}
                borderLess
              />
            )}
            name="username"
          />
          {formState?.errors?.username && (
            <Text style={styles?.error}>Name is required</Text>
          )}
        </View>
        <View style={styles?.controller}>
          <Text style={styles?.bluePlaceholderText}>Email</Text>
          <Controller
            control={control}
            defaultValue={user?.EmailAddress}
            rules={{
              required: 'Email is required',
            }}
            render={({field: {onChange, value}}: any) => (
              <InputBox
                placeholder="Email"
                numberOfCharacter={20}
                value={value}
                onChangeText={onChange}
              />
            )}
            name="email"
          />
          {formState?.errors?.email && (
            <Text style={styles?.error}>Email is required</Text>
          )}
        </View>
        <View style={styles?.controller}>
          <Text style={styles?.blackPlaceholderText}>Phone</Text>
          <Controller
            control={control}
            defaultValue={user?.PhoneNumber}
            rules={{
              required: 'Phone is required',
            }}
            render={({field: {onChange, value}}: any) => (
              <InputBox
                placeholder="Phone"
                numberOfCharacter={20}
                value={value}
                onChangeText={onChange}
                borderLess
              />
            )}
            name="phone"
          />
          {formState?.errors?.phone && (
            <Text style={styles?.error}>Phone is required</Text>
          )}
        </View>
        <View style={styles?.controller}>
          <Text style={styles?.blackPlaceholderText}>City</Text>
          <Controller
            control={control}
            defaultValue={user?.City}
            // rules={{
            //   required: 'City is required',
            // }}
            render={({field: {onChange, value}}: any) => (
              <InputBox
                placeholder="City"
                numberOfCharacter={20}
                value={value}
                onChangeText={onChange}
                borderLess
              />
            )}
            name="city"
          />
          {/* {formState?.errors?.city && (
            <Text style={styles?.error}>City is required</Text>
          )} */}
        </View>
        <View style={styles?.controller}>
          <Text style={styles?.blackPlaceholderText}>Street Number</Text>
          <Controller
            control={control}
            defaultValue={user?.Street}
            // rules={{
            //   required: 'Street Number is required',
            // }}
            render={({field: {onChange, value}}: any) => (
              <InputBox
                placeholder="Street Number"
                numberOfCharacter={20}
                value={value}
                onChangeText={onChange}
                borderLess
              />
            )}
            name="streetNumber"
          />
          {/* {formState?.errors?.streetNumber && (
            <Text style={styles?.error}>Street number is required</Text>
          )} */}
        </View>
        <View style={styles?.controller}>
          <Text style={styles?.blackPlaceholderText}>Zip Code</Text>
          <Controller
            control={control}
            defaultValue={user?.ZIPCode}
            // rules={{
            //   required: 'Zip code is required',
            // }}
            render={({field: {onChange, value}}: any) => (
              <InputBox
                placeholder="Zip Code"
                numberOfCharacter={20}
                value={value}
                onChangeText={onChange}
                borderLess
              />
            )}
            name="zipCode"
          />
          {/* {formState?.errors?.zipCode && (
            <Text style={styles?.error}>Zip code is required</Text>
          )} */}
        </View>
        <BouncyCheckbox
          isChecked={isChecked}
          onPress={() => setIsChecked(!isChecked)}
          text="Include Signature in Reply Email"
          textStyle={{
            textDecorationLine: 'none',
            color: '#000',
          }}
          innerIconStyle={{
            borderRadius: wp(1),
            borderWidth: wp(0.4),
            borderColor: Colors?.primary,
            backgroundColor: isChecked ? Colors?.primary : 'transparent',
          }}
          iconImageStyle={{width: wp(3), height: hp(1)}}
        />
        <InputBox
          placeholder=""
          numberOfCharacter={200}
          value={signature}
          onChangeText={txt => setSignature(txt)}
          style={{height: hp(20), alignItems: 'flex-start', marginTop: hp(3)}}
          inputStyle={{
            height: hp(20),
            textAlignVertical: 'top',
            width: wp(90),
          }}
          borderLess
          multiline
        />
        <BouncyCheckbox
          isChecked={isEmail}
          onPress={() => setIsEmail(!isEmail)}
          text="I receive a new email"
          textStyle={{
            textDecorationLine: 'none',
            color: '#000',
          }}
          innerIconStyle={{
            borderRadius: wp(1),
            borderWidth: wp(0.4),
            borderColor: Colors?.primary,
            backgroundColor: isEmail ? Colors?.primary : 'transparent',
          }}
          style={{marginTop: hp(2)}}
          iconImageStyle={{width: wp(3), height: hp(1)}}
        />
        <BouncyCheckbox
          isChecked={isMessage}
          onPress={() => setIsMessage(!isMessage)}
          text="I receive a new text message as SMS"
          textStyle={{
            textDecorationLine: 'none',
            color: '#000',
          }}
          innerIconStyle={{
            borderRadius: wp(1),
            borderWidth: wp(0.4),
            borderColor: Colors?.primary,
            backgroundColor: isMessage ? Colors?.primary : 'transparent',
          }}
          style={{marginTop: hp(2)}}
          iconImageStyle={{width: wp(3), height: hp(1)}}
        />
        <BouncyCheckbox
          isChecked={isCRM}
          onPress={() => setIsCRM(!isCRM)}
          text="A new lead comes into CRM"
          textStyle={{
            textDecorationLine: 'none',
            color: '#000',
          }}
          innerIconStyle={{
            borderRadius: wp(1),
            borderWidth: wp(0.4),
            borderColor: Colors?.primary,
            backgroundColor: isCRM ? Colors?.primary : 'transparent',
          }}
          style={{marginTop: hp(2)}}
          iconImageStyle={{width: wp(3), height: hp(1)}}
        />
        <BouncyCheckbox
          isChecked={isLead}
          onPress={() => setIsLead(!isLead)}
          text="I am assigned a Lead"
          textStyle={{
            textDecorationLine: 'none',
            color: '#000',
          }}
          innerIconStyle={{
            borderRadius: wp(1),
            borderWidth: wp(0.4),
            borderColor: Colors?.primary,
            backgroundColor: isLead ? Colors?.primary : 'transparent',
          }}
          style={{marginTop: hp(2)}}
          iconImageStyle={{width: wp(3), height: hp(1)}}
        />
        <PrimaryButton
          style={{marginTop: hp(3)}}
          onPress={handleSubmit(onSubmit)}
          title={'Update'}
        />
      </KeyboardAwareScrollView>
      <LoadingModal visible={isLoading} />
    </View>
  );
};

export default EditProfile;
