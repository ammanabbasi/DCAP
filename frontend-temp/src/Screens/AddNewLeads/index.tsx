import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {Text, View} from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useDispatch} from 'react-redux';
import {icn} from '../../Assets/icn';
import Header from '../../Components/Header';
import InputBox from '../../Components/InputBox';
import PrimaryButton from '../../Components/PrimaryButton';
import {Colors} from '../../Theme/Colors';
import {hp, wp} from '../../Theme/Responsiveness';
import {styles} from './style';
import DropDown from '../../Components/DropDown';
import Toast from 'react-native-toast-message';
import {addLead} from '../../Services/apis/APIs';
import LoadingModal from '../../Components/LoadingModal';
const AddNewLeads = ({route}: any): any => {
  const params = route?.params;
  const dispatch = useDispatch();
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigation: any = useNavigation();
  const [vehicleTypeId, setVehicleTypeId] = useState<any>(null);
  const {control, handleSubmit, trigger, formState, resetField} = useForm();
  const onSave = async (data: any) => {
    if (!vehicleTypeId) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select lead type',
      });
      return
    }
    try {
      setIsLoading(true);
      const keyMapping = {
        firstName: 'firstName',
        lastName: 'lastName',
        phone: 'phoneNumber',
        email: 'emailAddress',
        streetNumber: 'street',
        city: 'city',
        state: 'state',
        coFirstName: 'coBuyerFirstName',
        coLastName: 'coBuyerLastName',
        coEmail: 'coBuyerEmailAddress',
        coPhone: 'coBuyerPhoneNumber',
        coStreetNumber: 'coBuyerStreet',
        coCity: 'coBuyerCity',
        coState: 'coBuyerState',
      };

      const transformedData = Object.keys(keyMapping).reduce((acc: any, key: any) => {
        acc[keyMapping[key]] = data[key];
        return acc;
      }, {});
      transformedData['typeID'] = vehicleTypeId;
      const response = await addLead(transformedData);
      console.log("this is response:" , response);
      
      navigation.goBack();
    } catch (error: any) {
      console.log("this is error:" , error);
      console.log("this is error:" , error?.response);
      
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <View style={styles.mainView}>
      <Header
        title="Add New Leads"
        leftIcn={icn.back}
        style={styles.subContainer}
        leftIcnStyle={styles.backIcn}
        rightFirstIcn={icn.scanner}
        onRightSecondIconPress={() => navigation.navigate('UploadImages')}
        onRightFirstIconPress={() => navigation.navigate('ScanDocument')}
        rightSecondIcn={icn.cam}
        onLeftIconPress={() => navigation.goBack()}
      />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: hp(5),
          paddingHorizontal: wp(3),
        }}>
        <Text style={styles.placeholderText}>First Name</Text>
        <Controller
          control={control}
          rules={{
            required: 'First Name is required',
          }}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="First Name"
              numberOfCharacter={80}
              value={value}
              placeholderTextColor={Colors.greyIcn}
              onChangeText={onChange}
              borderLess
            />
          )}
          name="firstName"
        />
        {formState?.errors?.firstName && (
          <Text style={styles.error}>First Name is required</Text>
        )}
        <Text style={styles.placeholderText}>Last Name</Text>
        <Controller
          control={control}
          rules={{
            required: 'Last Name is required',
          }}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="Last Name"
              numberOfCharacter={80}
              value={value}
              placeholderTextColor={Colors.greyIcn}
              onChangeText={onChange}
              borderLess
            />
          )}
          name="lastName"
        />
        {formState?.errors?.lastName && (
          <Text style={styles.error}>Last Name is required</Text>
        )}
        <Text style={styles.placeholderText}>Email</Text>
        <Controller
          control={control}
          rules={{
            required: 'Email is required',
          }}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="Email"
              numberOfCharacter={80}
              value={value}
              placeholderTextColor={Colors.greyIcn}
              onChangeText={onChange}
              borderLess
            />
          )}
          name="email"
        />
        {formState?.errors?.email && (
          <Text style={styles.error}>Email is required</Text>
        )}
        <Text style={styles.placeholderText}>Phone</Text>
        <Controller
          control={control}
          rules={{
            required: 'Phone is required',
          }}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="Phone"
              numberOfCharacter={80}
              value={value}
              keyboardType="dialpad"
              placeholderTextColor={Colors.greyIcn}
              onChangeText={onChange}
              borderLess
            />
          )}
          name="phone"
        />
        {formState?.errors?.phone && (
          <Text style={styles.error}>Phone is required</Text>
        )}
        <Text style={styles.placeholderText}>Lead Type</Text>
        <DropDown
          data={params?.dropdownData}
          placeholder={'Select'}
          labelField="description"
          valueField="leadTypeId"
          value={vehicleTypeId}
          style={styles.filterDropDownContainer}
          setValue={setVehicleTypeId}
          rightIcon
        />
        <Text style={styles.placeholderText}>Company</Text>
        <Controller
          control={control}
          rules={{
            required: 'Company is required',
          }}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="Company"
              numberOfCharacter={80}
              value={value}
              placeholderTextColor={Colors.greyIcn}
              onChangeText={onChange}
              borderLess
            />
          )}
          name="company"
        />
        {formState?.errors?.company && (
          <Text style={styles.error}>Company is required</Text>
        )}
        <Text style={styles.placeholderText}>City</Text>
        <Controller
          control={control}
          rules={{
            required: 'City is required',
          }}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="City"
              numberOfCharacter={80}
              value={value}
              placeholderTextColor={Colors.greyIcn}
              onChangeText={onChange}
              borderLess
            />
          )}
          name="city"
        />
        {formState?.errors?.city && (
          <Text style={styles.error}>City is required</Text>
        )}
        <Text style={styles.placeholderText}>State</Text>
        <Controller
          control={control}
          rules={{
            required: 'State is required',
          }}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="State"
              numberOfCharacter={80}
              value={value}
              placeholderTextColor={Colors.greyIcn}
              onChangeText={onChange}
              borderLess
            />
          )}
          name="state"
        />
        {formState?.errors?.state && (
          <Text style={styles.error}>State is required</Text>
        )}
        <Text style={styles.placeholderText}>Street Number</Text>
        <Controller
          control={control}
          rules={{
            required: 'Street Number is required',
          }}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="Street Number"
              numberOfCharacter={80}
              value={value}
              keyboardType="dialpad"
              placeholderTextColor={Colors.greyIcn}
              onChangeText={onChange}
              borderLess
            />
          )}
          name="streetNumber"
        />
        {formState?.errors?.streetNumber && (
          <Text style={styles.error}>Street Number is required</Text>
        )}
        <Text style={styles.placeholderText}>Zip Code</Text>
        <Controller
          control={control}
          rules={{
            required: 'Zip Code is required',
          }}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="Zip Code"
              numberOfCharacter={80}
              value={value}
              placeholderTextColor={Colors.greyIcn}
              onChangeText={onChange}
              borderLess
            />
          )}
          name="zipCode"
        />
        {formState?.errors?.zipCode && (
          <Text style={styles.error}>Zip Code is required</Text>
        )}
        <BouncyCheckbox
          isChecked={isChecked}
          onPress={() => setIsChecked(!isChecked)}
          text="Co-Buyer"
          style={{marginTop: hp(1)}}
          textStyle={{
            textDecorationLine: 'none',
            color: '#000',
          }}
          innerIconStyle={{
            borderRadius: wp(1),
            borderWidth: wp(0.4),
            borderColor: Colors.primary,
            backgroundColor: isChecked ? Colors.primary : 'transparent',
          }}
          iconImageStyle={{width: wp(3), height: hp(1)}}
        />
        {isChecked && (
          <View>
            <Text style={styles.placeholderText}>First Name</Text>
            <Controller
              control={control}
              rules={{
                required: 'First Name is required',
              }}
              render={({field: {onChange, value}}) => (
                <InputBox
                  placeholder="First Name"
                  numberOfCharacter={80}
                  value={value}
                  placeholderTextColor={Colors.greyIcn}
                  onChangeText={onChange}
                  borderLess
                />
              )}
              name="coFirstName"
            />
            {formState?.errors?.coFirstName && (
              <Text style={styles.error}>First Name is required</Text>
            )}
            <Text style={styles.placeholderText}>Last Name</Text>
            <Controller
              control={control}
              rules={{
                required: 'Last Name is required',
              }}
              render={({field: {onChange, value}}) => (
                <InputBox
                  placeholder="Last Name"
                  numberOfCharacter={80}
                  value={value}
                  placeholderTextColor={Colors.greyIcn}
                  onChangeText={onChange}
                  borderLess
                />
              )}
              name="coLastName"
            />
            {formState?.errors?.coLastName && (
              <Text style={styles.error}>Last Name is required</Text>
            )}
            <Text style={styles.placeholderText}>Email</Text>
            <Controller
              control={control}
              rules={{
                required: 'Email is required',
              }}
              render={({field: {onChange, value}}) => (
                <InputBox
                  placeholder="Email"
                  numberOfCharacter={80}
                  value={value}
                  placeholderTextColor={Colors.greyIcn}
                  onChangeText={onChange}
                  borderLess
                />
              )}
              name="coEmail"
            />
            {formState?.errors?.coEmail && (
              <Text style={styles.error}>Email is required</Text>
            )}
            <Text style={styles.placeholderText}>Phone</Text>
            <Controller
              control={control}
              rules={{
                required: 'Phone is required',
              }}
              render={({field: {onChange, value}}) => (
                <InputBox
                  placeholder="Phone"
                  numberOfCharacter={80}
                  value={value}
                  keyboardType="dialpad"
                  placeholderTextColor={Colors.greyIcn}
                  onChangeText={onChange}
                  borderLess
                />
              )}
              name="coPhone"
            />
            {formState?.errors?.coPhone && (
              <Text style={styles.error}>Phone is required</Text>
            )}
            <Text style={styles.placeholderText}>Company</Text>
            <Controller
              control={control}
              rules={{
                required: 'Company is required',
              }}
              render={({field: {onChange, value}}) => (
                <InputBox
                  placeholder="Company"
                  numberOfCharacter={80}
                  value={value}
                  placeholderTextColor={Colors.greyIcn}
                  onChangeText={onChange}
                  borderLess
                />
              )}
              name="coCompany"
            />
            {formState?.errors?.coCompany && (
              <Text style={styles.error}>Company is required</Text>
            )}
            <Text style={styles.placeholderText}>City</Text>
            <Controller
              control={control}
              rules={{
                required: 'City is required',
              }}
              render={({field: {onChange, value}}) => (
                <InputBox
                  placeholder="City"
                  numberOfCharacter={80}
                  value={value}
                  placeholderTextColor={Colors.greyIcn}
                  onChangeText={onChange}
                  borderLess
                />
              )}
              name="coCity"
            />
            {formState?.errors?.coCity && (
              <Text style={styles.error}>City is required</Text>
            )}
            <Text style={styles.placeholderText}>State</Text>
            <Controller
              control={control}
              rules={{
                required: 'State is required',
              }}
              render={({field: {onChange, value}}) => (
                <InputBox
                  placeholder="State"
                  numberOfCharacter={80}
                  value={value}
                  placeholderTextColor={Colors.greyIcn}
                  onChangeText={onChange}
                  borderLess
                />
              )}
              name="coState"
            />
            {formState?.errors?.coState && (
              <Text style={styles.error}>State is required</Text>
            )}
            <Text style={styles.placeholderText}>Street Number</Text>
            <Controller
              control={control}
              rules={{
                required: 'Street Number is required',
              }}
              render={({field: {onChange, value}}) => (
                <InputBox
                  placeholder="Street Number"
                  numberOfCharacter={80}
                  value={value}
                  keyboardType="dialpad"
                  placeholderTextColor={Colors.greyIcn}
                  onChangeText={onChange}
                  borderLess
                />
              )}
              name="coStreetNumber"
            />
            {formState?.errors?.coStreetNumber && (
              <Text style={styles.error}>Street Number is required</Text>
            )}
            <Text style={styles.placeholderText}>Zip Code</Text>
            <Controller
              control={control}
              rules={{
                required: 'Zip Code is required',
              }}
              render={({field: {onChange, value}}) => (
                <InputBox
                  placeholder="Zip Code"
                  numberOfCharacter={80}
                  value={value}
                  placeholderTextColor={Colors.greyIcn}
                  onChangeText={onChange}
                  borderLess
                />
              )}
              name="coZipCode"
            />
            {formState?.errors?.coZipCode && (
              <Text style={styles.error}>Zip Code is required</Text>
            )}
          </View>
        )}
        <PrimaryButton
          style={styles.button}
          title="Save"
          onPress={handleSubmit(onSave)}
        />
      </KeyboardAwareScrollView>
      <LoadingModal visible={isLoading} />
    </View>
  );
};

export default AddNewLeads;
