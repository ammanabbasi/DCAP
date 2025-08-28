import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';

import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {icn} from '../../Assets/icn';
import Header from '../../Components/Header';
import {hp, wp} from '../../Theme/Responsiveness';
import {styles} from './style';
import InputBox from '../../Components/InputBox';
import {Controller, useForm} from 'react-hook-form';
import {Dropdown} from 'react-native-element-dropdown';
import {Colors} from '../../Theme/Colors';
import SwitchToggle from 'react-native-switch-toggle';
// import DatePicker from 'react-native-date-picker'; // Temporarily disabled
import PrimaryButton from '../../Components/PrimaryButton';
import Toast from 'react-native-toast-message';
import {bankTypes, updateCarfax} from '../../Services/apis/APIs';
import LoadingModal from '../../Components/LoadingModal';

interface CarDetailsFormProps {
  route?: any;
}

const CarDetailsForm: React.FC<CarDetailsFormProps> = ({route}) => {
  const params = route?.params;
  const dispatch = useDispatch();
  const {data} = useSelector((state: any) => state?.dropdownReducer);
  const navigation = useNavigation();
  const [isDropFocused, setIsDropFocused] = useState<boolean>(false);
  const [bankData, setBankData] = useState<any[]>([]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);


  console.log('this is carfax data: ', params?.carfaxData);

  const carfax = params?.carfaxData || {};

  const {control, handleSubmit, formState, watch, setValue} = useForm({
    defaultValues: {
      expiryDate: carfax.expiryDate ? new Date(carfax.expiryDate) : new Date(),
      ownerNo: carfax.ownerNo !== undefined ? String(carfax.ownerNo) : '',
      buybackGuarantee: carfax.buyBackGurantee === true ? 'True' : 'False',
      majorProblem: carfax.majorProblem === true ? 'True' : 'False',
      serviceRecords: carfax.serviceRecords !== undefined ? String(carfax.serviceRecords) : '',
    },
    mode: 'onChange'
  });

  // console.log('this is params for consignment ', params?.item)

  const handleSave = async (data: {
    expiryDate: Date;
    ownerNo: string;
    buybackGuarantee: string;
    majorProblem: string;
    serviceRecords: string;
  }) => {
    try {
        console.log('This is params:' , params);
        
      const payload = {
        vehicleId: params?.vehicleId,
        expiryDate: data?.expiryDate?.toISOString().split('T')[0],
        ownerNo: parseInt(data.ownerNo),
        buybackGuarantee: data.buybackGuarantee === 'True',
        majorProblem: data.majorProblem === 'True',
        serviceRecords: parseInt(data.serviceRecords),
        reportType:'VHR'
      };
      setIsLoading(true);
      console.log('This is payload: ', payload);
      const response = await updateCarfax(payload);
      console.log('This is response: ', response);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Carfax updated successfully!',
      });
      setIsLoading(false);
      navigation.goBack();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || error?.message || 'Something went wrong!',
      });
      setIsLoading(false);
      navigation.goBack();
    }
  };

 

 

  const handleDateSelect = (selectedDate: any) => {
    setIsDatePickerOpen(false);
    setValue('expiryDate', selectedDate);
  };




  return (
    <View style={styles.mainView}>
      <Header
        title="Car Details"
        leftIcn={icn.back}
        leftIcnStyle={styles.backIcn}
        onLeftIconPress={() => navigation.goBack()}
        style={styles.subContainer}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: hp(5),
          paddingHorizontal: wp(3),
        }}>
        {/* Expiry Date */}
        <Text style={styles.placeholderText}>Expiry Date</Text>
        <Controller
          control={control}
          rules={{
            required: 'Expiry Date is required',
            validate: value => value instanceof Date || 'Please select a valid date'
          }}
          render={({field: {value}}) => (
            <TouchableOpacity onPress={() => setIsDatePickerOpen(true)}>
              <InputBox
                borderLess
                value={value ? value.toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) : ''}
                style={{paddingVertical: hp(0.4)}}
                onChangeText={() => {}}
                disabled
                numberOfCharacter={80}
                keyboardType="normal"
              />
            </TouchableOpacity>
          )}
          name="expiryDate"
        />
        {formState?.errors?.expiryDate && (
          <Text style={styles.error}>{formState?.errors?.expiryDate.message}</Text>
        )}

        {/* Owner No */}
        <Text style={styles.placeholderText}>Owner No</Text>
        <Controller
          control={control}
          rules={{
            required: 'Owner No is required',
            pattern: {
              value: /^\d+$/,
              message: 'Please enter a valid number'
            }
          }}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="1"
              numberOfCharacter={10}
              value={value}
              keyboardType="dialpad"
              placeholderTextColor={Colors.greyIcn}
              onChangeText={onChange}
              borderLess
            />
          )}
          name="ownerNo"
        />
        {formState?.errors?.ownerNo && (
          <Text style={styles.error}>{formState?.errors?.ownerNo.message}</Text>
        )}

        {/* Buyback Guarantee */}
        <Text style={styles.placeholderText}>Buyback Gurantee</Text>
        <Controller
          control={control}
          render={({field: {onChange, value}}) => (
            <Dropdown
              style={styles.dropdown}
              containerStyle={styles.dropdownContainer}
              placeholderStyle={styles.placeholderStyle}
              itemTextStyle={styles.itemTextStyle}
              selectedTextStyle={styles.selectedTextStyle}
              activeColor={Colors.dullWhite}
              showsVerticalScrollIndicator={false}
              data={[{label: 'True', value: 'True'}, {label: 'False', value: 'False'}]}
              maxHeight={hp(20)}
              labelField="label"
              valueField="value"
              placeholder={'Select'}
              value={value}
              onChange={item => onChange(item.value)}
              renderRightIcon={() => (
                <Image
                  source={icn.downArrow}
                  style={styles.arrow}
                  resizeMode="contain"
                />
              )}
            />
          )}
          name="buybackGuarantee"
        />

        {/* Major Problem */}
        <Text style={styles.placeholderText}>Major Problem</Text>
        <Controller
          control={control}
          render={({field: {onChange, value}}) => (
            <Dropdown
              style={styles.dropdown}
              containerStyle={styles.dropdownContainer}
              placeholderStyle={styles.placeholderStyle}
              itemTextStyle={styles.itemTextStyle}
              selectedTextStyle={styles.selectedTextStyle}
              activeColor={Colors.dullWhite}
              showsVerticalScrollIndicator={false}
              data={[{label: 'True', value: 'True'}, {label: 'False', value: 'False'}]}
              maxHeight={hp(20)}
              labelField="label"
              valueField="value"
              placeholder={'Select'}
              value={value}
              onChange={item => onChange(item.value)}
              renderRightIcon={() => (
                <Image
                  source={icn.downArrow}
                  style={styles.arrow}
                  resizeMode="contain"
                />
              )}
            />
          )}
          name="majorProblem"
        />

        {/* Service Records */}
        <Text style={styles.placeholderText}>Service Records</Text>
        <Controller
          control={control}
          rules={{
            required: 'Service Records is required',
            pattern: {
              value: /^\d+$/,
              message: 'Please enter a valid number'
            }
          }}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="5"
              numberOfCharacter={10}
              value={value}
              keyboardType="dialpad"
              placeholderTextColor={Colors.greyIcn}
              onChangeText={onChange}
              borderLess
            />
          )}
          name="serviceRecords"
        />
        {formState?.errors?.serviceRecords && (
          <Text style={styles.error}>{formState?.errors?.serviceRecords.message}</Text>
        )}

        {/* DatePicker temporarily disabled for build - re-enable after fixing dependency
        <DatePicker
          modal
          open={isDatePickerOpen}
          date={watch('expiryDate')}
          mode="date"
          theme="light"
          onConfirm={handleDateSelect}
          onCancel={() => setIsDatePickerOpen(false)}
        /> */}

        <PrimaryButton
          style={styles.button}
          title="Save"
          onPress={handleSubmit(handleSave)}
        />
      </ScrollView>

      {isLoading && <LoadingModal visible={isLoading} message={'Updating Carfax...'} />}
    </View>
  );
};

export default CarDetailsForm;