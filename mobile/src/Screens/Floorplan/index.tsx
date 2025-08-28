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

const Floorplan = ({route}: any): any => {
  const params = route?.params;
  console.log(params)
  const dispatch = useDispatch();
  const {data} = useSelector((state: any) => state?.dropdownReducer);
  const navigation = useNavigation();
  const [isDropFocused, setIsDropFocused] = useState<boolean>(false);
  const [bankData, setBankData] = useState<any[]>([]);
  const [floorplanValue, setFloorplanValue] = useState<any>({
    FloorplanID: params?.item?.FloorplanID,
    Floorplan_Name: params?.item?.Floorplan_Name,
  });
  console.log('this is floorplan ', data?.floorPlans)
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
  const [appliedDate, setAppliedDate] = useState<any>(
    new Date(params?.item?.AppliedDate || Date.now()),
  );
  const [open, setOpen] = useState<boolean>(false);
  const [isAppliedDateOpen, setIsAppliedDateOpen] = useState<boolean>(false);
  const {control, handleSubmit, trigger, formState, resetField} = useForm();
  const handleSave = (data: any) => {
    if (!floorplanValue) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select floorplan',
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
          AppliedDate: appliedDate,
          isPrint: isHandWrittenSelected ? 0 : 1,
          FloorplanID: floorplanValue?.FloorplanID,
          Floorplan_Name: floorplanValue?.Floorplan_Name,
          PaymentModeID: 1,
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
                  AppliedDate: appliedDate,
                  isPrint: isHandWrittenSelected ? 0 : 1,
                  FloorplanID: floorplanValue?.FloorplanID,
                  Floorplan_Name: floorplanValue?.Floorplan_Name,
                  PaymentModeID: 1,
                }
              : item,
          )
        : [
            ...existingPayment,
            {
              Memo: data?.memo,
              Amount: data?.amount,
              TransactionDate: date,
              AppliedDate: appliedDate,
              isPrint: isHandWrittenSelected ? 0 : 1,
              FloorplanID: floorplanValue?.FloorplanID,
              Floorplan_Name: floorplanValue?.Floorplan_Name,
              PaymentModeID: 1,
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
        title="Floorplan"
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
        <TouchableOpacity onPress={() => {
          setOpen(true);
          setIsAppliedDateOpen(false);
        }}>
          <InputBox
            borderLess
            value={date.toDateString()}
            style={{paddingVertical: hp(0.4)}}
            onChangeText={() => {}}
            disabled
          />
        </TouchableOpacity>
        <Text style={styles.placeholderText}>Floorplan</Text>
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
          data={data?.floorPlans}
          maxHeight={hp(20)}
          labelField="description"
          valueField="floorPlanID"
          placeholder={'Select Floorplan'}
          value={floorplanValue?.Floorplan_Name}
          onChange={item => {
            setFloorplanValue({
              FloorplanID: item?.floorPlanID,
              Floorplan_Name: item?.description,
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
      
      <Text style={styles.placeholderText}>Applied Date</Text>
        <TouchableOpacity onPress={() => {
          setOpen(true);
          setIsAppliedDateOpen(true);
        }}>
          <InputBox
            borderLess
            value={appliedDate.toDateString()}
            style={{paddingVertical: hp(0.4)}}
            onChangeText={() => {}}
            disabled
          />
        </TouchableOpacity>
      
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
          date={isAppliedDateOpen ? appliedDate : date}
          mode="date"
          theme="light"
          onConfirm={selectedDate => {
            setOpen(false);
            if (isAppliedDateOpen) {
              setAppliedDate(selectedDate);
            } else {
              setDate(selectedDate);
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

export default Floorplan;
