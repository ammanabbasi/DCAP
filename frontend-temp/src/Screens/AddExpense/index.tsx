import {useIsFocused, useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {Image, ScrollView, Text, View} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import {useDispatch} from 'react-redux';
import {icn} from '../../Assets/icn';
import Header from '../../Components/Header';
import InputBox from '../../Components/InputBox';
import PrimaryButton from '../../Components/PrimaryButton';
import {Colors} from '../../Theme/Colors';
import {hp, wp} from '../../Theme/Responsiveness';
import {styles} from './style';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-toast-message';
import {expenseTypes} from '../../Services/apis/APIs';

const AddExpense = ({route}:any) => {
  const params = route?.params;
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const navigation: any = useNavigation();
  const [typeValue, setTypeValue] = useState<any>(null);
  const [isDropFocused, setIsDropFocused] = useState<boolean>(false);
  const [types, setTypes] = useState<any[]>([]);
  const {control, handleSubmit, trigger, formState, resetField} = useForm();
  const handleSave = (data: any) => {
    if (!typeValue) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select type',
      });
      return;
    }
    
    // Find the selected type description
    const selectedType = types.find((item: any) => item?.VehicleExpenseTypeID === typeValue);
    
    params?.setSelectedItem((prevState:any) => {
      const existingExpense = prevState?.expense || [];

      const isEditing =
        typeof params?.itemIndex === 'number' &&
        typeof existingExpense[params?.itemIndex] === 'object';

      const updatedExpense = isEditing
        ? existingExpense.map((item:any, index:any) => {
            return index === params?.itemIndex
              ? {
                  ...item,
                  vehicle: data?.vehicle,
                  VehicleExpenseTypeID: typeValue,
                  ExpenseType: selectedType?.Description,
                  ReferenceNo: data?.referenceNo,
                  ExpenseDescription: data?.description,
                  ExpenseAmount: data?.amount,
                }
              : item;
          })
        : [
            ...existingExpense,
            {
              VehicleExpenseID: params?.item?.VehicleExpenseID,
              vehicle: data?.vehicle,
              VehicleExpenseTypeID: typeValue,
              ExpenseType: selectedType?.Description,
              ReferenceNo: data?.referenceNo,
              ExpenseDescription: data?.description,
              ExpenseAmount: data?.amount,
            },
          ];
      return {
        ...prevState,
        expense: updatedExpense,
      };
    });
    navigation.goBack();
  };
  const getTypesData = async () => {
    try {
      const response = await expenseTypes();
      setTypes(response?.data);
      const result = response?.data?.find(
        (item:any) => item?.Description === params?.item?.ExpenseType,
      );
      if (result?.VehicleExpenseTypeID)
        setTypeValue(result?.VehicleExpenseTypeID);
    } catch (error:any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    }
  };
  useEffect(() => {
    getTypesData();
  }, []);
  useEffect(() => {
    if (isFocused && params?.item?.VehicleExpenseTypeID) {
      setTypeValue(params?.item?.VehicleExpenseTypeID);
    }
  }, [isFocused, params]);
  return (
    <View style={styles.mainView}>
      <Header
        title="Add Expenses"
        leftIcn={icn.back}
        leftIcnStyle={styles.backIcn}
        style={styles.subContainer}
        onLeftIconPress={() => navigation.goBack()}
      />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        extraHeight={hp(1)}
        contentContainerStyle={{
          paddingBottom: hp(3),
          paddingHorizontal: wp(3),
        }}>
        <Text style={styles.placeholderText}>Vehicle</Text>
        <Controller
          control={control}
          disabled
          defaultValue={params?.carName}
          rules={{
            required: 'Vehicle is required',
          }}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="2011 Jeep Compass"
              numberOfCharacter={80}
              value={value}
              placeholderTextColor={Colors.greyIcn}
              onChangeText={onChange}
              borderLess
              disabled
            />
          )}
          name="vehicle"
        />
        {formState?.errors?.vehicle && (
          <Text style={styles.error}>Vehicle is required</Text>
        )}
        <Text style={styles.placeholderText}>Type</Text>
        <Dropdown
          style={[
            styles.dropdown,
            {
              borderWidth: isDropFocused ? wp(0.3) : 0,
            },
          ]}
          containerStyle={styles.dropdownContainer}
          placeholderStyle={styles.placeholderStyle}
          itemTextStyle={styles.itemTextStyle}
          selectedTextStyle={styles.selectedTextStyle}
          activeColor={Colors.dullWhite}
          onFocus={() => setIsDropFocused(true)}
          onBlur={() => setIsDropFocused(false)}
          showsVerticalScrollIndicator={false}
          data={types}
          maxHeight={hp(20)}
          labelField="Description"
          valueField="VehicleExpenseTypeID"
          placeholder={'Select'}
          value={typeValue}
          search
          searchPlaceholder="Search Types..."
          onChange={(item:any) => {
            setTypeValue(item?.VehicleExpenseTypeID);
          }}
          renderRightIcon={() => (
            <Image
              source={icn.downArrow}
              style={styles.arrow}
              resizeMode="contain"
            />
          )}
        />
        <Text style={styles.placeholderText}>Reference No</Text>
        <Controller
          control={control}
          defaultValue={params?.item?.ReferenceNo?.toString()}
          rules={{
            required: 'Reference No is required',
          }}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="12345"
              numberOfCharacter={80}
              value={value}
              placeholderTextColor={Colors.greyIcn}
              onChangeText={onChange}
              borderLess
            />
          )}
          name="referenceNo"
        />
        {formState?.errors?.referenceNo && (
          <Text style={styles.error}>Reference No is required</Text>
        )}
        <Text style={styles.placeholderText}>Description</Text>
        <Controller
          control={control}
          defaultValue={params?.item?.ExpenseDescription}
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
          name="description"
        />
        {formState?.errors?.description && (
          <Text style={styles.error}>Description is required</Text>
        )}
        <Text style={styles.placeholderText}>Amount</Text>
        <Controller
          control={control}
          defaultValue={params?.item?.ExpenseAmount?.toString()}
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
        <PrimaryButton
          style={styles.button}
          title="Save"
          onPress={handleSubmit(handleSave)}
        />
      </KeyboardAwareScrollView>
    </View>
  );
};

export default AddExpense;
