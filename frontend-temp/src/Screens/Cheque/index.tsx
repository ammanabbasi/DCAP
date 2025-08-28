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
import {useDispatch} from 'react-redux';
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
import {bankTypes} from '../../Services/apis/APIs';

const Cheque = ({route}: any): any => {
  const params = route?.params;
  console.log(params)
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [isDropFocused, setIsDropFocused] = useState<boolean>(false);
  const [bankData, setBankData] = useState<any[]>([]);
  const [bankValue, setBankValue] = useState<any>({
    BankID: params?.item?.BankID,
    Bank_Name: params?.item?.Bank_Name,
  });
  const [isHandWrittenSelected, setIsHandWrittenSelected] = useState<boolean>(
    params?.item?.Mode === 'Hand Written'
      ? true
      : params?.item?.isPrint === 0
      ? true
      : false,
  );
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
    params?.setSelectedItem(prevState => {

      console.log('isEditingPayment', params?.isEditingPayment);
      if(params?.isEditingPayment){
        console.log('isEditingPayment', params?.isEditingPayment);
        return  {
          ...params?.item,
          CheckNo: data?.chequeNo,
          Memo: data?.memo,
          Amount: data?.amount,
          TransactionDate: date,
          isPrint: isHandWrittenSelected ? 0 : 1,
          BankID: bankValue?.BankID,
          Bank_Name: bankValue?.Bank_Name,
          PaymentModeID: 3,
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
                  CheckNo: data?.chequeNo,
                  Memo: data?.memo,
                  Amount: data?.amount,
                  TransactionDate: date,
                  isPrint: isHandWrittenSelected ? 0 : 1,
                  BankID: bankValue?.BankID,
                  Bank_Name: bankValue?.Bank_Name,
                  PaymentModeID: 3,
                }
              : item,
          )
        : [
            ...existingPayment,
            {
              CheckNo: data?.chequeNo,
              Memo: data?.memo,
              Amount: data?.amount,
              TransactionDate: date,
              isPrint: isHandWrittenSelected ? 0 : 1,
              BankID: bankValue?.BankID,
              Bank_Name: bankValue?.Bank_Name,
              PaymentModeID: 3,
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
        title="Cheque"
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
          containerStyle={styles.dropdownContainer}
          placeholderStyle={styles.placeholderStyle}
          onFocus={() => setIsDropFocused(true)}
          onBlur={() => setIsDropFocused(false)}
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
        <Text style={styles.placeholderText}>Cheque No</Text>
        <Controller
          control={control}
          defaultValue={params?.item?.CheckNo?.toString()}
          rules={{
            required: 'Cheque No is required',
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
          name="chequeNo"
        />
        {formState?.errors?.chequeNo && (
          <Text style={styles.error}>Cheque No is required</Text>
        )}
        <View style={styles.selectionContainer}>
          <View style={styles.rowContainer}>
            <TouchableOpacity
              style={styles.rowContainer}
              onPress={() => setIsHandWrittenSelected(true)}>
              <View style={styles.outerCircle}>
                {isHandWrittenSelected && <View style={styles.blueDot}></View>}
              </View>
              <Text style={styles.blackPlaceholderText}>Handwritten</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.rowContainer}>
            <TouchableOpacity
              style={styles.rowContainer}
              onPress={() => setIsHandWrittenSelected(false)}>
              <View style={styles.outerCircle}>
                {!isHandWrittenSelected && <View style={styles.blueDot}></View>}
              </View>
              <Text style={styles.blackPlaceholderText}>Print Later</Text>
            </TouchableOpacity>
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
      </ScrollView>
    </View>
  );
};

export default Cheque;
