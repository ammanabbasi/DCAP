import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {Image, Text, TouchableOpacity, View} from 'react-native';
// import DatePicker from 'react-native-date-picker'; // Temporarily disabled
import {Dropdown} from 'react-native-element-dropdown';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-toast-message';
import {useDispatch} from 'react-redux';
import {icn} from '../../Assets/icn';
import Header from '../../Components/Header';
import InputBox from '../../Components/InputBox';
import PrimaryButton from '../../Components/PrimaryButton';
import {bankTypes} from '../../Services/apis/APIs';
import {Colors} from '../../Theme/Colors';
import {hp, wp} from '../../Theme/Responsiveness';
import {styles} from './style';
const monthData = [
  {value: 1, label: '1'},
  {value: 2, label: '2'},
  {value: 3, label: '3'},
  {value: 4, label: '4'},
  {value: 5, label: '5'},
  {value: 6, label: '6'},
  {value: 7, label: '7'},
  {value: 8, label: '8'},
  {value: 9, label: '9'},
  {value: 10, label: '10'},
  {value: 11, label: '11'},
  {value: 12, label: '12'},
];
const yearData = [
  {value: 2024, label: '2024'},
  {value: 2025, label: '2025'},
  {value: 2026, label: '2026'},
  {value: 2027, label: '2027'},
  {value: 2028, label: '2028'},
  {value: 2029, label: '2029'},
  {value: 2030, label: '2030'},
  {value: 2031, label: '2031'},
  {value: 2032, label: '2032'},
  {value: 2033, label: '2033'},
  {value: 2034, label: '2034'},
  {value: 2035, label: '2035'},
  {value: 2036, label: '2036'},
  {value: 2037, label: '2037'},
  {value: 2038, label: '2038'},
  {value: 2039, label: '2039'},
  {value: 2040, label: '2040'},
  {value: 2041, label: '2041'},
  {value: 2042, label: '2042'},
  {value: 2043, label: '2043'},
  {value: 2044, label: '2044'},
  {value: 2045, label: '2045'},
  {value: 2046, label: '2046'},
  {value: 2047, label: '2047'},
  {value: 2048, label: '2048'},
  {value: 2049, label: '2049'},
  {value: 2050, label: '2050'},
];

const CreditCard = ({route}: any): any => {
  const params = route?.params;
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [bankValue, setBankValue] = useState<any>({
    BankID: params?.item?.BankID,
    Bank_Name: params?.item?.Bank_Name,
  });
  const [monthValue, setMonthValue] = useState<any>(params?.item?.ExpiryMonth);
  const [isDropFocused, setIsDropFocused] = useState<boolean>(false);
  const [isExpiryMonthFocused, setIsExpiryMonthFocused] = useState<boolean>(false);
  const [isExpiryYearFocused, setIsExpiryYearFocused] = useState<boolean>(false);
  const [yearValue, setYearValue] = useState<any>(params?.item?.ExpiryYear);
  const [isHandWrittenSelected, setIsHandWrittenSelected] = useState<boolean>(true);
  const [bankData, setBankData] = useState<any[]>([]);
  const [isPurchaseDateOpen, setIsPurchaseDateOpen] = useState<boolean>(false);
  const [purchaseDate, setPurchaseDate] = useState<any>(new Date());
  const [date, setDate] = useState<any>(
    new Date(params?.item?.TransactionDate || Date.now()),
  );
  const [open, setOpen] = useState<boolean>(false);
  const {control, handleSubmit, trigger, formState, resetField} = useForm();
  const handleSave = (data: any) => {
    if (!bankValue) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select bank',
      });
      return;
    }
    if (!monthValue) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select expiry month',
      });
      return;
    }
    if (!yearValue) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select expiry year',
      });
      return;
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
          PaymentModeID: 11,
          ExpiryMonth: monthValue,
          ExpiryYear: yearValue,
          CardNumber: data?.cardNo,
          CardHolderName: data?.cardHolderName,
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
                  Memo: data?.memo,
                  Amount: data?.amount,
                  TransactionDate: date,
                  BankID: bankValue?.BankID,
                  Bank_Name: bankValue?.Bank_Name,
                  ExpiryMonth: monthValue,
                  ExpiryYear: yearValue,
                  CardNumber: data?.cardNo,
                  CardHolderName: data?.cardHolderName,
                }
              : item,
          )
        : [
            ...existingPayment,
            {
              Memo: data?.memo,
              Amount: data?.amount,
              TransactionDate: date,
              BankID: bankValue?.BankID,
              Bank_Name: bankValue?.Bank_Name,
              PaymentModeID: 11,
              ExpiryMonth: monthValue,
              ExpiryYear: yearValue,
              CardNumber: data?.cardNo,
              CardHolderName: data?.cardHolderName,
              IsSwiped:1,
            },
          ];

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
        title="Credit Card"
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
        <Text style={styles.placeholderText}>Card No</Text>
        <Controller
          control={control}
          defaultValue={params?.item?.CardNumber?.toString()}
          rules={{
            required: 'Card No is required',
          }}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="1234567890"
              numberOfCharacter={80}
              value={value}
              keyboardType="dialpad"
              placeholderTextColor={Colors.greyIcn}
              onChangeText={onChange}
              borderLess
            />
          )}
          name="cardNo"
        />
        {formState?.errors?.cardNo && (
          <Text style={styles.error}>Card No is required</Text>
        )}
        <Text style={styles.placeholderText}>Card Holder Name</Text>
        <Controller
          control={control}
          defaultValue={params?.item?.CardHolderName?.toString()}
          rules={{
            required: 'Card Holder Name is required',
          }}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="John"
              numberOfCharacter={80}
              value={value}
              placeholderTextColor={Colors.greyIcn}
              onChangeText={onChange}
              borderLess
            />
          )}
          name="cardHolderName"
        />
        {formState?.errors?.cardHolderName && (
          <Text style={styles.error}>Card Holder Name is required</Text>
        )}
        <View style={styles.centerSpaceContainer}>
          <View>
            <Text style={styles.placeholderText}>Expiry Month</Text>
            <Dropdown
              style={[
                styles.smallDropdown,
                {
                  borderWidth: isExpiryMonthFocused ? wp(0.3) : 0,
                },
              ]}
              onFocus={() => setIsExpiryMonthFocused(true)}
              onBlur={() => setIsExpiryMonthFocused(false)}
              containerStyle={styles.dropdownContainer}
              placeholderStyle={styles.placeholderStyle}
              itemTextStyle={styles.itemTextStyle}
              selectedTextStyle={styles.selectedTextStyle}
              activeColor={Colors.dullWhite}
              showsVerticalScrollIndicator={false}
              data={monthData}
              maxHeight={hp(20)}
              labelField="label"
              valueField="value"
              placeholder={'Select'}
              value={monthValue}
              onChange={item => {
                setMonthValue(item?.value);
              }}
              renderRightIcon={() => (
                <Image
                  source={icn.downArrow}
                  style={styles.arrow}
                  resizeMode="contain"
                />
              )}
            />
          </View>
          <View>
            <Text style={styles.placeholderText}>Expiry Year</Text>
            <Dropdown
              style={[
                styles.smallDropdown,
                {
                  borderWidth: isExpiryYearFocused ? wp(0.3) : 0,
                },
              ]}
              onFocus={() => setIsExpiryYearFocused(true)}
              onBlur={() => setIsExpiryYearFocused(false)}
              containerStyle={styles.dropdownContainer}
              placeholderStyle={styles.placeholderStyle}
              itemTextStyle={styles.itemTextStyle}
              selectedTextStyle={styles.selectedTextStyle}
              activeColor={Colors.dullWhite}
              showsVerticalScrollIndicator={false}
              data={yearData}
              maxHeight={hp(20)}
              labelField="label"
              valueField="value"
              placeholder={'Select'}
              value={yearValue}
              onChange={item => {
                setYearValue(item?.value);
              }}
              renderRightIcon={() => (
                <Image
                  source={icn.downArrow}
                  style={styles.arrow}
                  resizeMode="contain"
                />
              )}
            />
          </View>
        </View>
        <Text style={styles.placeholderText}>Memo</Text>
        <Controller
          control={control}
          defaultValue={params?.item?.Memo?.toString()}
          rules={{
            required: 'Description is required',
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
          style={styles.button}
          title="Save"
          onPress={handleSubmit(handleSave)}
        />
      </KeyboardAwareScrollView>
    </View>
  );
};

export default CreditCard;
