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
import {bankTypes} from '../../Services/apis/APIs';

const Consignment = ({route}: any): any => {
  const params = route?.params;
  const dispatch = useDispatch();
  const {data} = useSelector((state: any) => state?.dropdownReducer);
  const navigation = useNavigation();
  const [isDropFocused, setIsDropFocused] = useState<boolean>(false);
  const [bankData, setBankData] = useState<any[]>([]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);

  const {control, handleSubmit, formState, watch, setValue} = useForm({
    defaultValues: {
      amount: params?.item?.Amount?.toString() || '',
      suggestedPrice: params?.item?.suggestedPrice?.toString() || '',
      memo: params?.item?.Memo?.toString() || '',
      transactionDate: new Date(params?.item?.TransactionDate || Date.now()),
      floorplan: {
        FloorplanID: params?.item?.FloorplanID,
        Floorplan_Name: params?.item?.Floorplan_Name,
      },
      isHandWritten: params?.item?.Mode === 'Hand Written' ? true : params?.item?.isPrint === 0 ? true : false,
      consignment: {
        consignmentProviderID: params?.item?.ConsignmentProviderID,
        description: params?.item?.ConsignmentProviderName,
      },
    },
    mode: 'onChange'
  });

  console.log('this is params for consignment ', params?.item)

  const handleSave = (data: any) => {
    if (!data.consignment?.consignmentProviderID) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select consignment',
      });
      return;
    }

    params?.setSelectedItem(prevState => {
      if(params?.isEditingPayment) {
        return {
          ...params?.item,
          CheckNo: data?.chequeNo,
          Memo: data?.memo,
          Amount: data?.amount,
          TransactionDate: data.transactionDate,
          isPrint: data.isHandWritten ? 0 : 1,
          ConsignmentProviderID: data.consignment?.consignmentProviderID,
          ConsignmentProvider_Name: data.consignment?.description,
          SuggestedSalePrice: data.suggestedPrice,
          PaymentModeID: 2,
          itemIndex: params?.itemIndex,
        };
      }

      const existingPayment = prevState?.payment || [];
      const isEditingPayment = typeof params?.itemIndex === 'number' && typeof existingPayment[params?.itemIndex] === 'object';

      const updatedPayment = isEditingPayment
        ? existingPayment.map((item: any, index: any) =>
            index === params?.itemIndex
              ? {
                  ...item,
                  CheckNo: data?.chequeNo,
                  Memo: data?.memo,
                  Amount: data?.amount,
                  TransactionDate: data.transactionDate,
                  isPrint: data.isHandWritten ? 0 : 1,
                  ConsignmentProviderID: data.consignment?.consignmentProviderID,
                  ConsignmentProvider_Name: data.consignment?.description,
                  SuggestedSalePrice: data.suggestedPrice,
                  PaymentModeID: 2,
                }
              : item,
          )
        : [
            ...existingPayment,
            {
              CheckNo: data?.chequeNo,
              Memo: data?.memo,
              Amount: data?.amount,
              TransactionDate: data.transactionDate,
              isPrint: data.isHandWritten ? 0 : 1,
              ConsignmentProviderID: data.consignment?.consignmentProviderID,
              ConsignmentProvider_Name: data.consignment?.description,
              SuggestedSalePrice: data.suggestedPrice,
              PaymentModeID: 2,
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

  const handleDateSelect = (selectedDate: any) => {
    setIsDatePickerOpen(false);
    setValue('transactionDate', selectedDate);
  };


  console.log('this is formState suggestedPrice',params?.item?.suggestedPrice);
  console.log('Consignment Provider:', {
    id: params?.item?.ConsignmentProviderID,
    name: params?.item?.ConsignmentProviderName
  });

  return (
    <View style={styles.mainView}>
      <Header
        title="Consignment"
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
        <Text style={styles.placeholderText}>Amount <Text style={styles.required}>*</Text></Text>
        <Controller
          control={control}
          rules={{
            required: 'Amount is required',
            pattern: {
              value: /^\d+(\.\d{1,2})?$/,
              message: 'Please enter a valid amount'
            },
            min: {
              value: 0.01,
              message: 'Amount must be greater than 0'
            }
          }}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="$0.00"
              numberOfCharacter={80}
              value={value}
              keyboardType="decimal-pad"
              placeholderTextColor={Colors.greyIcn}
              onChangeText={onChange}
              borderLess
            />
          )}
          name="amount"
        />
        {formState?.errors?.amount && (
          <Text style={styles.error}>{formState?.errors?.amount.message}</Text>
        )}

        <Text style={styles.placeholderText}>Suggested Price <Text style={styles.required}>*</Text></Text>
        <Controller
          control={control}
          rules={{
            required: 'Suggested Price is required',
            pattern: {
              value: /^\d+(\.\d{1,2})?$/,
              message: 'Please enter a valid price'
            },
            min: {
              value: 0.01,
              message: 'Price must be greater than 0'
            }
          }}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="$0.00"
              numberOfCharacter={80}
              value={value}
              keyboardType="decimal-pad"
              placeholderTextColor={Colors.greyIcn}
              onChangeText={onChange}
              borderLess
            />
          )}
          name="suggestedPrice"
        />
        {formState?.errors?.suggestedPrice && (
          <Text style={styles.error}>{formState?.errors?.suggestedPrice.message}</Text>
        )}

        <Text style={styles.placeholderText}>Date <Text style={styles.required}>*</Text></Text>
        <Controller
          control={control}
          rules={{
            required: 'Date is required',
            validate: value => value instanceof Date || 'Please select a valid date'
          }}
          render={({field: {value}}) => (
            <TouchableOpacity onPress={() => setIsDatePickerOpen(true)}>
              <InputBox
                borderLess
                value={value.toDateString()}
                style={{paddingVertical: hp(0.4)}}
                onChangeText={() => {}}
                disabled
              />
            </TouchableOpacity>
          )}
          name="transactionDate"
        />
        {formState?.errors?.transactionDate && (
          <Text style={styles.error}>{formState?.errors?.transactionDate.message}</Text>
        )}

        <Text style={styles.placeholderText}>Consignment <Text style={styles.required}>*</Text></Text>
        <Controller
          control={control}
          rules={{
            required: 'Consignment is required',
            validate: value => value?.consignmentProviderID || 'Please select a consignment'
          }}
          render={({field: {value, onChange}}) => (
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
              data={data?.consignmentProviders}
              maxHeight={hp(20)}
              labelField="description"
              valueField="consignmentProviderID"
              placeholder={'Select Consignment'}
              value={value}
              onChange={item => {
                onChange({
                  consignmentProviderID: item?.consignmentProviderID,
                  description: item?.description,
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
          )}
          name="consignment"
        />
        {formState?.errors?.consignment && (
          <Text style={styles.error}>{formState?.errors?.consignment.message}</Text>
        )}

        <Text style={styles.placeholderText}>Memo <Text style={styles.required}>*</Text></Text>
        <Controller
          control={control}
          rules={{
            required: 'Memo is required',
            minLength: {
              value: 3,
              message: 'Memo must be at least 3 characters'
            },
            maxLength: {
              value: 300,
              message: 'Memo cannot exceed 300 characters'
            }
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
          <Text style={styles.error}>{formState?.errors?.memo.message}</Text>
        )}

        <DatePicker
          modal
          open={isDatePickerOpen}
          date={watch('transactionDate')}
          mode="date"
          theme="light"
          onConfirm={handleDateSelect}
          onCancel={() => setIsDatePickerOpen(false)}
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

export default Consignment;
