import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {Image, Platform, Text, TouchableOpacity, View} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {Dropdown} from 'react-native-element-dropdown';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useDispatch} from 'react-redux';
import {icn} from '../../Assets/icn';
import Header from '../../Components/Header';
import InputBox from '../../Components/InputBox';
import PrimaryButton from '../../Components/PrimaryButton';
import {Colors} from '../../Theme/Colors';
import {hp, wp} from '../../Theme/Responsiveness';
import {styles} from './style';
import Toast from 'react-native-toast-message';
import {bankTypes} from '../../Services/apis/APIs';

const PaymentMethodBoilerPlate = props => {
  const params = props?.route?.params;
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [bankValue, setBankValue] = useState<any>({
    BankID: params?.item?.BankID,
    Bank_Name: params?.item?.Bank_Name,
  });
  const [isPurchaseDateOpen, setIsPurchaseDateOpen] = useState<boolean>(false);
  const [purchaseDate, setPurchaseDate] = useState<any>(new Date());
  const [date, setDate] = useState<any>(
    new Date(params?.item?.TransactionDate || Date.now()),
  );
  const [isDropFocused, setIsDropFocused] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [bankData, setBankData] = useState<any[]>([]);
  const {control, handleSubmit, trigger, formState, resetField} = useForm();
  const handleSave = (data: any) => {
    if (params?.from !== 'Pay Letter' && !bankValue) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select bank',
      });
      return;
    }
    const newEntry = {
      Memo: data?.memo,
      Amount: data?.amount,
      TransactionDate: date,
      PaymentModeID:
        params?.from === 'EFT' ? 5 : params?.from === 'Cash' ? 6 : 17,
    };
    if (params?.from !== 'Pay Letter') {
      newEntry['BankID'] = bankValue?.BankID;
      newEntry['Bank_Name'] = bankValue?.Bank_Name;
    }
    params?.setSelectedItem(prevState => {


      console.log('isEditingPayment', params?.isEditingPayment);
      if(params?.isEditingPayment){
        console.log('isEditingPayment', params?.isEditingPayment);
        return  {
          ...params?.item,
          Memo: data?.memo,
          Amount: data?.amount,
          TransactionDate: date,
          BankID: bankValue?.BankID,
          Bank_Name: bankValue?.Bank_Name,
          PaymentModeID: params?.from === 'EFT' ? 5 : params?.from === 'Cash' ? 6 : 17,
          itemIndex: params?.itemIndex,
        };
      }


      const existingPayment = prevState?.payment || [];
    
      const isEditingPayment =
        typeof params?.itemIndex === 'number' &&
        typeof existingPayment[params?.itemIndex] === 'object';
    
      const updatedPayment = isEditingPayment
        ? existingPayment.map((item: any, index: any) =>
            index === params?.itemIndex
              ? {
                  ...item,
                  ...newEntry,
                }
              : item,
          )
        : [...existingPayment, { ...newEntry }];
    
      return {
        ...prevState,
        payment: updatedPayment,
      };
    });    
    navigation.goBack();
  };
  const getBankTypesData = async () => {
    try {
      const response = await bankTypes();
      setBankData(response?.data);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    }
  };
  useEffect(() => {
    getBankTypesData();
  }, []);
  return (
    <View style={styles.mainView}>
      <Header
        title={params?.from}
        leftIcn={icn.back}
        style={styles.subContainer}
        leftIcnStyle={styles.backIcn}
        onLeftIconPress={() => navigation.goBack()}
      />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: hp(5),
          paddingHorizontal: wp(3),
        }}>
        <Text style={styles.placeholderText}>Amount</Text>
        <Controller
          control={control}
          defaultValue={params?.item?.Amount?.toString()}
          rules={{
            required: 'Amount is required',
          }}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="$0.00"
              numberOfCharacter={80}
              value={value}
              keyboardType="dialpad"
              placeholderTextColor={Colors.greyIcn}
              onChangeText={onChange}
              borderLess
            />
          )}
          name="amount"
        />
        {formState?.errors?.amount && (
          <Text style={styles.error}>Amount is required</Text>
        )}
        <Text style={styles.placeholderText}>Date</Text>
        <TouchableOpacity onPress={() => setOpen(true)}>
          <InputBox
            borderLess
            value={date.toDateString()}
            style={{paddingVertical: hp(0.4)}}
            onChangeText={() => {}}
            disabled
            numberOfCharacter={50}
          />
        </TouchableOpacity>
        {params?.from != 'Pay Letter' && (
          <>
            <Text style={styles.placeholderText}>Bank</Text>
            <Dropdown
              style={[
                styles.dropdown,
                {
                  borderWidth: isDropFocused ? wp(0.3) : 0,
                },
              ]}
              onFocus={() => setIsDropFocused(true)}
              onBlur={() => setIsDropFocused(false)}
              containerStyle={styles.dropdownContainer}
              placeholderStyle={styles.placeholderStyle}
              itemTextStyle={styles.itemTextStyle}
              selectedTextStyle={styles.selectedTextStyle}
              activeColor={Colors.dullWhite}
              showsVerticalScrollIndicator={false}
              data={bankData}
              maxHeight={hp(20)}
              labelField="BusinessName"
              valueField="BankID"
              placeholder={'Select'}
              value={bankValue}
              search
              searchPlaceholder="Search banks..."
              onChange={item => {
                setBankValue({
                  BankID: item?.BankID,
                  Bank_Name: item?.BusinessName,
                });
              }}
              renderRightIcon={() => (
                <Image
                  source={icn.downArrow}
                  style={styles.arrow}
                  resizeMode="contain"
                />
              )}
            />
          </>
        )}

        <Text style={styles.placeholderText}>Memo</Text>
        <Controller
          control={control}
          defaultValue={params?.item?.Memo?.toString()}
          rules={{
            required: 'Memo is required',
          }}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="Write here..."
              numberOfCharacter={300}
              value={value}
              onChangeText={onChange}
              style={{height: hp(16), alignItems: 'flex-start'}}
              inputStyle={{
                height: hp(16),
                textAlignVertical: 'top',
                width: wp(90),
              }}
              multiline
            />
          )}
          name="memo"
        />
        {formState?.errors?.memo && (
          <Text style={styles.error}>Memo is required</Text>
        )}
        <DatePicker
          modal
          open={open}
          date={date}
          mode="date"
          theme="light"
          onConfirm={selectedDate => {
            setOpen(false);
            setIsPurchaseDateOpen(false);
            if (!isPurchaseDateOpen) setDate(selectedDate);
            else if (isPurchaseDateOpen) {
              setPurchaseDate(selectedDate);
            }
          }}
          onCancel={() => {
            setOpen(false);
          }}
        />

        <PrimaryButton
          style={{
            marginTop:
              params?.from == 'Pay Letter'
                ? Platform.OS == 'ios'
                  ? hp(37)
                  : hp(42)
                : Platform.OS == 'ios'
                ? hp(25)
                : hp(30),
          }}
          title="Save"
          onPress={handleSubmit(handleSave)}
        />
      </KeyboardAwareScrollView>
    </View>
  );
};

export default PaymentMethodBoilerPlate;
