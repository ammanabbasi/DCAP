import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Controller, set, useForm } from 'react-hook-form';
import DatePicker from 'react-native-date-picker';
import {
  ActivityIndicator,
  Image,
  FlatList,
  Platform,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import PurchasePayment from '../PurchasePayment';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch, useSelector } from 'react-redux';
import { icn } from '../../Assets/icn';
import Header from '../../Components/Header';
import InputBox from '../../Components/InputBox';
import PrimaryButton from '../../Components/PrimaryButton';
import { Colors } from '../../Theme/Colors';
import { hp, wp } from '../../Theme/Responsiveness';
import { styles } from './style';
import DropDown from '../../Components/DropDown';
import {
  bankTypes,
  editFinancialTransaction,
  expenseTypes,
  addVehiclePurchase,
  vehiclePurchase,
} from '../../Services/apis/APIs';
import Toast from 'react-native-toast-message';
import LoadingModal from '../../Components/LoadingModal';
const detailsData = [
  {
    img: icn?.images,
    name: 'Information',
  },
  {
    img: icn?.doc,
    name: 'Payment',
  }
]


const Purchase = ({ route }: any): any => {
  const params = route?.params;
  const dispatch = useDispatch();
  const navigation: any = useNavigation();
  const { data, loading, error } = useSelector((state: any) => state?.dropdownReducer);

  const [bankDropdownData, setBankDropdownData] = useState<any>([]);

  const [isPurchaseDateOpen, setIsPurchaseDateOpen] = useState<any>(false);
  const [purchaseDate, setPurchaseDate] = useState<any>(new Date());
  const [date, setDate] = useState<any>(new Date());
  const [open, setOpen] = useState<any>(false);
  const { control, handleSubmit, trigger, formState, resetField } = useForm();
  const [isLoading, setIsLoading] = useState<any>(true);
  const [purchaseInitialData, setPurchaseInitialData] = useState<any>(null);
  const [purchaseUpdateData, setPurchaseUpdateData] = useState<any>(null);
  const [isModal, setIsModal] = useState<any>(false);
  const [selectedItem, setSelectedItem] = useState<any>('Information');
  const [paymentData, setPaymentData] = useState<any>(null);
  const [paymentUpdatedData, setPaymentUpdatedData] = useState<any>(null);
  const [isPurchaseAdded, setIsPurchaseAdded] = useState<any>(false);
  const [initailPaymentData, setInitailPaymentData] = useState<any>(null);
  const [previourPaymentData, setPreviourPaymentData] = useState<any>(null);
  const [selectedPaymentDataForUpdate, setSelectedPaymentDataForUpdate] = useState<any>([]);

  useEffect(() => {
    console.log('paymentUpdatedData for purchase =====> ', paymentUpdatedData);
  }, [paymentUpdatedData]);


  useEffect(() => {
    console.log('initailPaymentData for purchase =====> ', initailPaymentData);
  }, [initailPaymentData]);

  // useEffect((: any) => {
  //   console.log('edit payment data for update purchase =====> ', selectedPaymentDataForUpdate);
  // }, [selectedPaymentDataForUpdate]);


  const handleDropdownChange = (field: any, value: any) => {
    console.log('field', field);
    console.log('value', value);
    setPurchaseUpdateData(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };
  const getVehiclePurchaseData = async () => {
    try {
      const payload = {
        vehicleID: params?.vehicleId,
      };
      const response = await vehiclePurchase(payload);
      console.log('This is response: ', response?.data);

      setInitailPaymentData(response?.data?.payment);
      setPreviourPaymentData(response?.data?.previousPayment);
      setIsPurchaseAdded(true);



      const purchaseDate = response?.data?.purchaseDate;
      const transactionDate = response?.data?.transactionDate;
      setPurchaseDate(purchaseDate ? new Date(purchaseDate) : new Date());
      setDate(transactionDate ? new Date(transactionDate) : new Date());
      setPurchaseInitialData(response?.data?.information);
      setPurchaseUpdateData(response?.data?.information);
    } catch (error: any) {
      console.log('This is error: ', error);
      Toast?.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    }
  };
  const getBankData = async () => {
    try {
      const response = await bankTypes();
      setBankDropdownData(response?.data);
    } catch (error: any) {
      console.log(error);
      Toast?.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
    }
  };
  // const getTypesData = async () => {
  //   try {
  //     const response = await expenseTypes();
  //     setTypes(response?.data);
  //   } catch (error: any) {
  //     console.log('This is error' , error);

  //     Toast?.show({
  //       type: 'error',
  //       text1: 'Error',
  //       text2: error?.response?.data?.message || 'Something went wrong!',
  //     });
  //   }
  // };
  const fetchData = async () => {
    try {
      setIsLoading(true);
      await Promise?.all([
        getVehiclePurchaseData(),
        getBankData(),
        // getTypesData(),
      ]);
    } catch (error: any) {
      console.error('Error fetching data', error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const onSave = async (data: any) => {
    try {
      console.log('Form Data:', data);

      if (!purchaseUpdateData?.boughtFromID) {
        Toast?.show({
          type: 'error',
          text1: 'Please select Bought From',
        });
        return;
      }
      if (!purchaseUpdateData?.buyerID) {
        Toast?.show({
          type: 'error',
          text1: 'Please select Buyer',
        });
        return;
      }
      setIsModal(true);
      const payload = {
        information: {
          ...purchaseUpdateData,
          purchasePrice: Number(data?.purchasePrice),
          memo: data?.memo,
          purchaseDate: purchaseDate?.toISOString(),
          vehicleID: params?.vehicleId,
        },
        payment: initailPaymentData
      };

      console.log('initailPaymentData', initailPaymentData);

      // Filter payments with paymentModeId 1 or 2
      const cashPayments = initailPaymentData?.filter((payment: any) => 
        payment?.paymentModeID === 1 || payment?.paymentModeID === 2 
      ) || [];

      // Calculate total payment amount
      const totalPaymentAmount = initailPaymentData?.reduce((sum: number, payment: any) => 
        sum + Number(payment?.amount), 0) || 0;

      // If cash payments exist, validate their sum matches purchase price
      console.log('cashPayments', cashPayments);
      if (cashPayments?.length > 0) {
        const cashPaymentTotal = cashPayments?.reduce((sum: number, payment: any) => 
          sum + Number(payment?.amount), 0);

        console.log('cashPaymentTotal', cashPaymentTotal);
        console.log('data?.purchasePrice', data?.purchasePrice);
        if (cashPaymentTotal !== Number(data?.purchasePrice)) {
          Toast?.show({
            type: 'error',
            text1: 'Error',
            text2: 'Total cash payment amount must equal purchase price',
          });
          return;
        }
      } else {
        // If no cash payments, validate total of all payments
        console.log('totalPaymentAmount', totalPaymentAmount);
        console.log('data?.purchasePrice', data?.purchasePrice);
        if (totalPaymentAmount !== Number(data?.purchasePrice)) {
          Toast?.show({
            type: 'error',
            text1: 'Error',
            text2: 'Total payment amount must equal purchase price',
          });
          return;
        }
      }

      // Make API call based on whether purchase exists
      console.log('payload ====> ', payload);
      const response = isPurchaseAdded 
        ? await editFinancialTransaction(payload)
        : await addVehiclePurchase(payload);

      if (response?.data?.success) {
        setIsPurchaseAdded(true);
        Toast?.show({
          type: 'success',
          text1: 'Success',
          text2: 'Purchase updated successfully',
        });
        navigation?.goBack();
      }
    } catch (error: any) {
      console.log(error?.response?.data);
      Toast?.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setIsModal(false);
    }
  };


  const renderOptions = ({ item, index }: any) => {
    const isSelected = selectedItem === item?.name;

    return (
      <TouchableOpacity
        onPress={() => setSelectedItem(item?.name)}
        style={[
          styles?.optionContainer,
          isSelected && styles?.selectedOptionContainer
        ]}>
        <Image
          resizeMode="contain"
          source={item?.img}
          style={[
            styles?.optionImg,
            isSelected && styles?.selectedOptionImg
          ]}
        />
        <Text style={[
          styles?.optionText,
          isSelected && styles?.selectedOptionText
        ]}>{item?.name}</Text>
      </TouchableOpacity>
    );
  };




  const renderContent = (): any => {
    if (isLoading || loading) {
      return (
        <ActivityIndicator
          color={Colors?.primary}
          style={styles?.activityIndicator}
          size={Platform?.OS == 'android' ? wp(11) : 'large'}
        />
      );
    }

    if (selectedItem === 'Payment') {
      return <PurchasePayment previourPaymentData={previourPaymentData} isPurchaseAdded={isPurchaseAdded} initailPaymentData={initailPaymentData} setInitailPaymentData={setInitailPaymentData} />;
    }

    return (
      <View style={styles?.content}>
        <Text style={styles?.placeholderText}>Purchase Price</Text>
        <Controller
          control={control}
          defaultValue={purchaseInitialData?.purchasePrice?.toString()}
          rules={{
            required: 'Purchase Price is required',
          }}
          render={({ field: { onChange, value } }: any) => (
            <InputBox
              placeholder="Enter purchase price"
              numberOfCharacter={80}
              value={value}
              keyboardType="dialpad"
              onChangeText={onChange}
              borderLess
            />
          )}
          name="purchasePrice"
        />
        {formState?.errors?.purchasePrice && (
          <Text style={styles?.error}>Purchase Price is required</Text>
        )}
        <Text style={styles?.placeholderText}>Purchase Date</Text>
        <TouchableOpacity
          onPress={() => {
            setOpen(true);
            setIsPurchaseDateOpen(true);
          }}>
          <InputBox
            borderLess
            value={purchaseDate?.toDateString()}
            style={{ paddingVertical: hp(0.4) }}
            onChangeText={() => {}}
            disabled
            numberOfCharacter={80}
          />
        </TouchableOpacity>
        <Text style={styles?.placeholderText}>Bought From</Text>
        <DropDown
          data={data?.boughtFrom}
          placeholder={'Select Bought From'}
          valueField="buyerID"
          labelField="description"
          value={purchaseInitialData?.boughtFromID}
          setValue={(value:any)=> handleDropdownChange('boughtFromID', value)}
          rightIcon
        />
        {formState?.errors?.boughtFrom && (
          <Text style={styles?.error}>Bought From is required</Text>
        )}
        <Text style={styles?.placeholderText}>Buyer</Text>
        <DropDown
          data={data?.buyer}
          placeholder={'Select'}
          valueField="buyerId"
          labelField="description"
          value={purchaseInitialData?.buyerID}
          setValue={(value:any) => handleDropdownChange('buyerID', value)}
          rightIcon
        />
        {/* <Text style={styles?.placeholderText}>Bank</Text>
          <DropDown
            data={bankDropdownData}
            labelField="BusinessName"
            valueField="BankID"
            placeholder={'Select Bank'}
            value={purchaseInitialData?.bankID}
            setValue={value => handleDropdownChange('bankID', value)}
            rightIcon
          /> */}
        <Text style={styles?.placeholderText}>Memo</Text>
        <Controller
          control={control}
          defaultValue={purchaseInitialData?.memo?.toString()}
          rules={{
            required: 'Memo is required',
          }}
          render={({ field: { onChange, value } }: any) => (
            <InputBox
              placeholder="Write here..."
              numberOfCharacter={200}
              value={value}
              onChangeText={onChange}
              style={{ height: hp(20), alignItems: 'flex-start' }}
              inputStyle={{
                height: hp(20),
                textAlignVertical: 'top',
                width: wp(90),
              }}
              multiline
            />
          )}
          name="memo"
        />
        {formState?.errors?.memo && (
          <Text style={styles?.error}>Memo is required</Text>
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
          style={{ marginTop: hp(5) }}
          title="Save"
          onPress={handleSubmit(onSave)}
        />
      </View>
    );
  };

  return (<ScrollView>
    <View style={styles?.mainView}>
      <View>
        <Header
          title="Purchase"
          leftIcn={icn?.back}
          style={styles?.subContainer}
          leftIcnStyle={styles?.backIcn}
          onLeftIconPress={() => navigation?.goBack()}
        />

        <View style={{ flexDirection: 'row', marginLeft: wp(5) }}>
          {detailsData?.map((item: any, index: any) => renderOptions({ item, index }))}
        </View>
      </View>

      {renderContent()}
      <LoadingModal visible={isModal} />
    </View>
    </ScrollView>
  );
};

export default Purchase;
