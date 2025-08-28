import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Text,
  View,
  ScrollView,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import { icn } from '../../Assets/icn';
import DropDown from '../../Components/DropDown';
import Header from '../../Components/Header';
import InputBox from '../../Components/InputBox';
import LoadingModal from '../../Components/LoadingModal';
import PrimaryButton from '../../Components/PrimaryButton';
import { wp, hp } from '../../Theme/Responsiveness';
import {
  updateCrmSms,
  addSms,
} from '../../Services/apis/APIs';
import { styles } from './style';
import type { RouteProp } from '@react-navigation/native';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const dropdownData = [
  { label: 'Option', value: 'Value' },
  { label: 'Option', value: 'Value' },
  { label: 'Option', value: 'Value' },
  { label: 'Option', value: 'Value' },
  { label: 'Option', value: 'Value' },
  { label: 'Option', value: 'Value' },
];

const Sms = ({route}: {route: RouteProp<any, any>}) => {
  const params = route?.params;
  const {control, handleSubmit, setValue} = useForm();
  const navigation: any = useNavigation();
  const user = useSelector((state: any) => state?.userReducer?.user);
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
  const [outcomeValue, setOutcomeValue] = useState<any>(null);

  const { smsToEdit, onSmsEdited } = params || {};
  const isEditMode = !!smsToEdit;

  useEffect(() => {
    if (isEditMode && smsToEdit) {
      setValue('description', smsToEdit.message || smsToEdit.description || '');
    } else {
      setValue('description', '');
    }
  }, [isEditMode, smsToEdit]);

  const handleSaveSms = async (data: any) => {
    try {
      setIsModalLoading(true);
      const customerID = params?.item?.customerID || params?.item?.customerId;
      
      if (isEditMode) {
        const payload = {
          smsID: smsToEdit.smsID || smsToEdit.taskId,
          message: String(data?.description || '').trim(),
        };
        
        console.log('Update SMS Payload:', payload);
        const response = await updateCrmSms(payload);
        console.log('Update response:', response);
      } else {
        const payload = {
          customerID: customerID,
          message: String(data?.description || '').trim(),
          userID: user?.id,
        };
        
        console.log('Add SMS Payload:', payload);
        const response = await addSms(payload);
        console.log('Add response:', response);
      }
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: isEditMode ? 'SMS updated successfully' : 'SMS added successfully',
      });

      if (onSmsEdited) {
        await onSmsEdited();
      }
      
      navigation.goBack();

    } catch (error: any) {
      console.error('SMS save error:', error?.response?.data || error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setIsModalLoading(false);
    }
  };

  return (
    <View style={styles.mainView}>
      <Header
        title={isEditMode ? "SMS" : "SMS"}
        leftIcn={icn.back}
        style={{marginLeft: wp(3)}}
        onLeftIconPress={() => navigation.goBack()}
      />
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: hp(5) }}
      >
        <Text style={styles.placeholderText}>Template</Text>
        <DropDown
          data={dropdownData}
          placeholder="Select"
          value={outcomeValue}
          setValue={setOutcomeValue}
          rightIcon
        />

        <Text style={styles.placeholderText}>Description</Text>
        <Controller
          control={control}
          rules={{ required: 'Description is required' }}
          render={({ field: { onChange, value } }) => (
            <InputBox
              placeholder="Type here..."
              value={value}
              onChangeText={onChange}
              multiline
              numberOfCharacter={320}
              style={{ height: hp(16), alignItems: 'flex-start' }}
              inputStyle={{
                height: hp(16),
                textAlignVertical: 'top',
                width: wp(90),
              }}
            />
          )}
          name="description"
        />

        <Text style={styles.maxCharText}>Max 320 Characters.</Text>

        <PrimaryButton
          title={isEditMode ? "Send" : "Send"}
          style={styles.submitButton}
          onPress={handleSubmit(handleSaveSms)}
        />
      </ScrollView>
      <LoadingModal visible={isModalLoading} message={isEditMode ? "Updating..." : "Sending..."} />
    </View>
  );
};

export default Sms; 