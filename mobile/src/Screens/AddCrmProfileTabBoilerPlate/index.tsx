import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import DatePicker from 'react-native-date-picker';
import DocumentPicker from 'react-native-document-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch, useSelector } from 'react-redux';
import { icn } from '../../Assets/icn';
import DropDown from '../../Components/DropDown';
import Header from '../../Components/Header';
import InputBox from '../../Components/InputBox';
import PrimaryButton from '../../Components/PrimaryButton';
import { Colors } from '../../Theme/Colors';
import { hp, wp } from '../../Theme/Responsiveness';
import { styles } from './style';
import getVehicleDocuments from '../Documents';
import {
  updateCrmAppointment,
  // updateCrmNote,
  updateCrmSms,
  getCategoryStatus,
  updateCrmTask,
  addTask,
  // addNote,
  addSms,
  addAppointment,
  // uploadVehicleDocuments,
  addVehicleOfInterest,
  addVehicleWishlist,
  updateCrmVehicleOfInterest,
  getSetVehicle,
  vehicleFilter,
  crmDropdowns,
} from '../../Services/apis/APIs';
import Toast from 'react-native-toast-message';
import LoadingModal from '../../Components/LoadingModal';
import { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { DocumentPickerResponse } from 'react-native-document-picker';
export type AddCrmProfileTabBoilerPlateRouteParams = {
  from: string;
  description?: string;
  file?: DocumentPickerResponse | null;
  refreshDocuments?: () => Promise<void>;
  item?: any;
  isEdit?: boolean;
};
const dropdownData = [
  { label: 'Option', value: 'Value' },
  { label: 'Option', value: 'Value' },
  { label: 'Option', value: 'Value' },
  { label: 'Option', value: 'Value' },
  { label: 'Option', value: 'Value' },
  { label: 'Option', value: 'Value' },
];
const AddCrmProfileTabBoilerPlate = (props: any) => {
  console.log('Component rendered');
  console.log('Component rendered with params.from:', props?.route?.params?.from);
  const params = props?.route?.params;
  console.log('ROUTE PARAMS:', params);
  const { data, loading, error } = useSelector(
    (state: any) => state?.crmDropdownReducer,
  );
  const [updatedData, setUpdatedData] = useState<any>(() => {
    if (params?.from === 'Note' && params?.item) {
      // Initialize note data for editing
      return {
        ...params.item,
        noteId: params?.item?.noteId || params?.item?.taskId,
        description: params?.item?.description || params?.item?.notes,
        notes: params?.item?.description || params?.item?.notes,
        customerID: params?.item?.customerID || params?.customerID,
      };
    }
    if (params?.from === 'Sms' && params?.item) {
      // Initialize SMS data for editing
      return {
        ...params.item,
        smsID: params?.item?.smsID || params?.item?.taskId, // SMS might have taskId
        message: params?.item?.message || params?.item?.description,
        description: params?.item?.message || params?.item?.description,
        customerID: params?.item?.customerID || params?.customerID,
      };
    }
    if (params?.from === 'Appointment' && params?.item) {
      // Initialize appointment data for editing
      return {
        ...params.item,
        appointmentID: params?.item?.appointmentID,
        taskName: params?.item?.taskName || params?.item?.taskTitle,
        taskTitle: params?.item?.taskTitle || params?.item?.taskName,
        dueDate: params?.item?.dueDate ? new Date(params?.item?.dueDate) : new Date(),
        description: params?.item?.description,
        location: params?.item?.location,
        attendeeID: params?.item?.attendeeID,
        categoryStatusID: params?.item?.categoryStatusID,
        customerID: params?.item?.customerID || params?.customerID,
        time: params?.item?.time,
      };
    }
    if (params?.from === 'Vehicle Of Interest' && params?.item) {
      const { vehicleInterestId, ...rest } = params.item;
      return { ...rest, dueDate: new Date() };
    }
    if (params?.from === 'Task' && params?.item) {
      return {
        ...params.item,
        taskId: params?.item?.taskId,
        taskName: params?.item?.taskName,
        taskTitle: params?.item?.taskTitle,
        taskTypeId: params?.item?.taskTypeId,
        categoryStatusID: params?.item?.categoryStatusID,
        customerID: params?.item?.customerID,
        dueDate: params?.item?.dueDate ? new Date(params?.item?.dueDate) : new Date(),
        description: params?.item?.description,
        time: params?.item?.time
      };
    }
    return { dueDate: new Date() };
  });
  console.log('Initial updatedData:', updatedData);
  const dispatch = useDispatch();
  const navigation: any = useNavigation();
  const [outcomeValue, setOutcomeValue] = useState<any>(null);
  const [isDateClicked, setIsDateClicked] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [attendeeValue, setAttendeeValue] = useState<any>(null);
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
  const { control, handleSubmit, trigger, formState, resetField, setValue } = useForm();
  const [file, setFile] = useState<DocumentPickerResponse | null>(null);
  const [categoryStatus, setCategoryStatus] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<any>(new Date());
  type VehicleInfo = { vehicleId: number; modelYear: string; modelId: number; [key: string]: any } | null;
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>(null);

  const mySharedValue = useSharedValue(1);

  const userID = useSelector((state: any) => state?.userReducer?.user?.id);
  console.log('USER ID that is being used', userID);

  const [attendeeData, setAttendeeData] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategoryStatus = async () => {
      console.log('Updated Data in Task ------------> ', params?.from);
      const response = await getCategoryStatus(
                                                {
                                                  taskTypeID: params?.from === 'Appointment' ? 7 : updatedData?.taskTypeId
                                                });
                                                
      console.log('Response From Category Status', response?.data?.data);
      
      setCategoryStatus(response?.data?.data);
      
      
    };
    fetchCategoryStatus();
  }, [updatedData?.taskTypeId]);

  useEffect(() => {
    // If editing an SMS, map taskId to smsID for update logic
    if (params?.from === 'Sms' && (params?.item?.taskId || params?.item?.smsID)) {
      setUpdatedData((prev: any) => ({
        ...prev,
        smsID: params?.item?.smsID || params?.item?.taskId,
        message: params?.item?.message || params?.item?.description,
        description: params?.item?.message || params?.item?.description,
      }));
    }
  }, [params?.item]);

  useEffect(() => {
    if (params?.from === 'Vehicle Of Interest' || params?.from === 'Wishlist' || params?.from === 'Set Vehicle') {
      const fetchDropdownData = async () => {
        try {
          const response = await crmDropdowns();
          console.log('Fetched dropdown data:', response.data);
          setUpdatedData((prevData: any) => ({
            ...prevData,
            years: response?.data?.years,
            makes: response?.data?.makes,
            models: response?.data?.models,
          }));
        } catch (error: any) {
          console.error('Error fetching dropdown data:', error);
        }
      };
      fetchDropdownData();
    }
  }, [params?.from]);

  useEffect(() => {
    if (params?.from === 'Appointment') {
      const fetchAttendeeData = async () => {
        try {
          const response = await crmDropdowns();
          console.log('Attendee data:', response?.data?.attendee);
          setAttendeeData(response?.data?.attendee || []);
        } catch (error: any) {
          console.error('Error fetching attendee data:', error);
        }
      };
      
      fetchAttendeeData();
    }
  }, [params?.from]);

  const updateData = (key: string, value: any) => {
    setUpdatedData((prevData: any) => ({
      ...prevData,
      [key]: value,



    }));
  };

  console.log('params.from:', params?.from);

  const parseDate = (value: any) => {
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value;
    }
    if (typeof value === 'string') {
      const parsedDate = new Date(value);
      return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
    }
    return new Date();
  };
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker?.types?.allFiles],
      });
      setFile(result);
    } catch (err: any) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User canceled document picker');
      } else {
        console.error('Unknown error: ', err);
      }
    }
  };
  const onUpdate = async (data: any) => {
    console.log('From is : ===> ' , params?.from);
    
    try {
      setIsModalLoading(true);
      
      if (params?.from === 'Vehicle Of Interest') {
        const payload = {
          customerId: params?.customerID || updatedData?.customerId,
          modelYear: updatedData?.modelYear,
          makeId: updatedData?.makeId,
          modelId: updatedData?.modelId,
          memo: updatedData?.memo,
          trimId: updatedData?.trimId,
          exteriorColorId: updatedData?.exteriorColorId,
          interiorColorId: updatedData?.interiorColorId,
          mileage: updatedData?.mileage,
        };

        // Validate required fields
        if (!payload.customerId || !payload.modelYear || !payload.makeId || !payload.modelId || !payload.memo) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'All required fields must be provided.',
          });
          setIsModalLoading(false);
          return;
        }

        try {
          if (updatedData?.vehicleInterestId) {
            console.log("SCREEN: Update Vehicle Of Interest logic running", payload);
            await updateCrmVehicleOfInterest({ vehicleInterestId: updatedData.vehicleInterestId, ...payload });
          } else {
            console.log("SCREEN: Add Vehicle Of Interest logic running", payload);
            await addVehicleOfInterest(payload);
          }
        } catch (error: any) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: (error as any)?.response?.data?.message || 'Something went wrong!',
          });
        } finally {
          setIsModalLoading(false);
        }
        return;
      } else if (params?.from === 'Wishlist') {
        const payload = {
          modelYear: updatedData?.modelYear,
          makeId: updatedData?.makeId,
          modelId: updatedData?.modelId,
          expirationDate: updatedData?.expirationDate,
          memo: updatedData?.memo,
        };

        // Validate required fields
        if (!payload.modelYear || !payload.makeId || !payload.modelId || !payload.expirationDate || !payload.memo) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'All required fields must be provided.',
          });
          setIsModalLoading(false);
          return;
        }

        try {
          if (updatedData?.vehicleInterestId) {
            console.log("SCREEN: Update Vehicle Of Interest logic running", payload);
            await updateCrmVehicleOfInterest({ vehicleInterestId: updatedData.vehicleInterestId, ...payload });
          } else {
            console.log("SCREEN: Add Vehicle Of Interest logic running", payload);
            await addVehicleOfInterest(payload);
          }
        } catch (error: any) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: (error as any)?.response?.data?.message || 'Something went wrong!',
          });
        } finally {
          setIsModalLoading(false);
        }
        return;
      }
    } catch (error: any) {
      console.log('Error in wwwww onUpdate', error);
      console.log((error as any)?.response?.data);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: (error as any)?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setIsModalLoading(false);
      navigation.goBack();
    }
  };
  const onSave = (data: any) => {
    onUpdate(data);
  };
  function safeParseDate(val: string | number | Date | undefined | null): Date {
    if (!val || val === '' || val === 'Invalid Date') return new Date();
    const d = new Date(val);
    if (
      isNaN(d.getTime()) ||
      d.getFullYear() < 1000 ||
      d.getFullYear() > 9999
    ) {
      return new Date();
    }
    return d;
  }


  let dateField = new Date();
  if (params?.from === 'Wishlist') {
    dateField = safeParseDate(updatedData?.expirationDate);
  } else if (params?.from === 'Vehicle Of Interest') {
    dateField = safeParseDate(updatedData?.addedOn || updatedData?.lastUpdatedOn || new Date());
  } else if (params?.from === 'Task' || params?.from === 'Appointment') {
    dateField = safeParseDate(updatedData?.dueDate);
  }
  console.log('Final date for DatePicker:', dateField, typeof dateField, dateField instanceof Date, isNaN(dateField.getTime()));
  console.log('addedOn:', updatedData?.addedOn, 'lastUpdatedOn:', updatedData?.lastUpdatedOn);
  if (!(dateField instanceof Date) || isNaN(dateField.getTime())) {
    dateField = new Date();
  }
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: mySharedValue.value,
  }));
  console.log('Date passed to DatePicker:', safeParseDate(updatedData?.dueDate));
console.log("set vehicle", updatedData?.makeId, updatedData?.modelYear, updatedData?.modelId);

  const handleSearchVehicle = async () => {
    if (params?.from !== 'Set Vehicle') return;

    console.log('Search Vehicle button clicked');

    // Check if necessary data is available
    if (!updatedData?.makeId || !updatedData?.modelYear || !updatedData?.modelId) {
      console.warn('Missing data for vehicle search:', {
        makeId: updatedData?.makeId,
        modelYear: updatedData?.modelYear,
        modelId: updatedData?.modelId,
      });
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Missing data for vehicle search.',
      });
      return;
    }

    const payload = {
      makeID: updatedData?.makeId,
      modelYear: updatedData?.modelYear,
      modelID: updatedData?.modelId,
    };

    console.log('Payload sent to vehicleFilter API:', payload);

    try {
      const response = await vehicleFilter(payload);
      console.log('Response from vehicleFilter:', response);

      if (response?.data?.vehicles?.length > 0) {
        console.log('Vehicle found:', response?.data?.vehicles?.[0].vehicleInfo);
        setVehicleInfo(response?.data?.vehicles?.[0].vehicleInfo);
      } else {
        console.warn('No vehicle found with the provided criteria.');
        Toast.show({
          type: 'error',
          text1: 'Not found',
          text2: 'No vehicle found with the provided criteria.',
        });
        setVehicleInfo(null);
      }
    } catch (error: any) {
      console.error('Error during vehicleFilter API call:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to search vehicle.' });
      setVehicleInfo(null);
    }
  };
  console.log('Dropdown Data - Years:', data?.years);
  console.log('Dropdown Data - Makes:', data?.makes);
  console.log('Dropdown Data - Models:', data?.models);

 
  const dropdownStyle = {
    opacity: 1, // Ensure visibility
    display: 'flex',
  };

  useEffect(() => {
    console.log('Component rendered with params:', params);
    console.log('Current tab:', params?.from);
    if (params?.from === 'Set Vehicle') {
      console.log('Set Vehicle tab is active');
      console.log('Data for search:', {
        makeId: updatedData?.makeId,
        modelYear: updatedData?.modelYear,
        modelId: updatedData?.modelId,
      });
    } else {
      console.log('Not on Set Vehicle tab');
    }
  }, [params?.from, updatedData]);

  useEffect(() => {
    console.log('Tab changed to:', params?.from);
  }, [params?.from]);

  // Add useEffect to handle form initialization for tasks
  useEffect(() => {
    if (params?.from === 'Task' && params?.item) {
      // Set form values when editing a task
      resetField('taskName', { defaultValue: params?.item?.taskName });
      resetField('description', { defaultValue: params?.item?.description });
    }
  }, [params?.from, params?.item]);

  // Add useEffect to fetch CRM dropdowns when component mounts
  useEffect(() => {
    const fetchCrmDropdowns = async () => {
      try {
        const response = await crmDropdowns();
        console.log('Fetched CRM dropdown data:', response.data);
        // If you're using Redux, dispatch the action to save it
        // dispatch(saveCrmDropDown(response.data));
      } catch (error: any) {
        console.error('Error fetching CRM dropdown data:', error);
      }
    };
    
    fetchCrmDropdowns();
  }, []);

  useEffect(() => {
    // Pre-populate form fields when editing
    if (params?.from === 'Note' && params?.item && params?.isEdit) {
      setValue('notes', params?.item?.description || params?.item?.notes || '');
      setValue('description', params?.item?.description || params?.item?.notes || '');
    }
    if (params?.from === 'Sms' && params?.item && params?.isEdit) {
      setValue('description', params?.item?.message || params?.item?.description || '');
    }
    if (params?.from === 'Appointment' && params?.item && params?.isEdit) {
      setValue('taskName', params?.item?.taskName || params?.item?.taskTitle || '');
      setValue('description', params?.item?.description || '');
      setValue('location', params?.item?.location || '');
      setValue('categoryStatusID', params?.item?.categoryStatusID);
      setValue('attendeeID', params?.item?.attendeeID);
    }
  }, [params?.item, params?.isEdit, setValue]);

  const getScreenTitle = (): any => {
    if (params?.from === 'Appointment') {
      return params?.isEdit ? 'Edit Appointment' : 'Add Appointment';
    }
    if (params?.from === 'Sms') {
      return 'SMS';
    }
    if (params?.from === 'Task') {
      return 'Task';
    }
    if (params?.from === 'Note') {
      return 'Note';
    }
    // For other cases, you can customize as needed
    return params?.from || 'Add';
  };

  return (
    <View style={styles.mainView}>
      <Header
        title={getScreenTitle()}
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
        {params?.from === 'Vehicle Of Interest' ? (
          <View>
            {/* Year Dropdown */}
            <Text style={styles.placeholderText}>Year</Text>
            <DropDown
              data={data?.years || []}
              placeholder="Select"
              value={updatedData?.modelYear}
              setValue={(value: string) => updateData('modelYear', value)}
              labelField="label"
              valueField="value"
              rightIcon
            />
            {/* Make Dropdown */}
            <Text style={styles.placeholderText}>Make</Text>
            <DropDown
              data={data?.makes || []}
              placeholder="Select"
              value={updatedData?.makeId}
              setValue={(value: string) => updateData('makeId', value)}
              labelField="label"
              valueField="value"
              rightIcon
            />

            {/* Model Dropdown */}
            <Text style={styles.placeholderText}>Model</Text>
            <DropDown
              data={data?.models || []}
              placeholder="Select"
              value={updatedData?.modelId}
              setValue={(value: string) => updateData('modelId', value)}
              rightIcon
            />
            {/* Trim */}
            <Text style={styles.placeholderText}>Trim</Text>
            <InputBox
              placeholder="Abc"
              value={updatedData?.trimId}
              onChangeText={(value: string) = numberOfCharacter={50}> updateData('trimId', value)}
              borderLess
              numberOfCharacter={100}
            />
            {/* Mileage */}
            <Text style={styles.placeholderText}>Mileage</Text>
            <InputBox
              placeholder="100"
              value={updatedData?.mileage}
              onChangeText={(value: string) = numberOfCharacter={50}> updateData('mileage', value)}
              borderLess
              numberOfCharacter={100}
            />
            {/* Color (Ext) */}
            <Text style={styles.placeholderText}>Color (Ext)</Text>
            <InputBox
              placeholder="Black"
              value={updatedData?.exteriorColorId}
              onChangeText={(value: string) = numberOfCharacter={50}> updateData('exteriorColorId', value)}
              borderLess
              numberOfCharacter={100}
            />
            {/* Color (Int) */}
            <Text style={styles.placeholderText}>Color (Int)</Text>
            <InputBox
              placeholder="Blue"
              value={updatedData?.interiorColorId}
              onChangeText={(value: string) = numberOfCharacter={50}> updateData('interiorColorId', value)}
              borderLess
              numberOfCharacter={100}
            />
            {/* Memo */}
            <Text style={styles.placeholderText}>Memo</Text>
            <InputBox
              placeholder="ABC"
              value={updatedData?.memo}
              onChangeText={(value: string) = numberOfCharacter={50}> updateData('memo', value)}
              borderLess
              numberOfCharacter={100}
            />
            <PrimaryButton
              style={{ marginTop: hp(4) }}
              title="Add"
              onPress={handleSubmit(onSave)}
            />
          </View>
        ) :params?.from === 'Set Vehicle' ? (
          <View>
            <Text style={styles.placeholderText}>Stock</Text>
            <InputBox
              placeholder="00000"
              value={updatedData?.stock}
              onChangeText={(value: string) = numberOfCharacter={50}> updateData('stock', value)}
              borderLess
              numberOfCharacter={100}
            />
        
            <Text style={styles.placeholderText}>VIN</Text>
            <InputBox
              placeholder="#01234565857909"
              value={updatedData?.vin}
              onChangeText={(value: string) = numberOfCharacter={50}> updateData('vin', value)}
              borderLess
              numberOfCharacter={100}
            />
        
            <Text style={styles.placeholderText}>Year</Text>
            <DropDown
              data={data?.years || []}
              placeholder="Select"
              value={updatedData?.modelYear}
              setValue={(value: string) => updateData('modelYear', value)}
              labelField="label"
              valueField="value"
              rightIcon
            />
        
            <Text style={styles.placeholderText}>Make</Text>
            <DropDown
              data={data?.makes || []}
              placeholder="Select"
              value={updatedData?.makeId}
              setValue={(value: string) => updateData('makeId', value)}
              labelField="label"
              valueField="value"
              rightIcon
            />
        
            <Text style={styles.placeholderText}>Model</Text>
            <DropDown
              data={data?.models || []}
              placeholder="Select"
              value={updatedData?.modelId}
              setValue={(value: string) => updateData('modelId', value)}
              labelField="label"
              valueField="value"
              rightIcon
            />
        
            <PrimaryButton
              style={{ marginTop: hp(4) }}
              title="Search Vehicle"
              onPress={handleSearchVehicle}
            />
          </View>
        ): params?.from === 'Wishlist' ? (
          <View>
            {/* Year Dropdown */}
            <Text style={styles.placeholderText}>Year</Text>
            <DropDown
              data={data?.years || []}
              placeholder="Select"
              value={updatedData?.modelYear}
              setValue={(value: string) => updateData('modelYear', value)}
              rightIcon
            />
            {/* Make Dropdown */}
            <Text style={styles.placeholderText}>Make</Text>
            <DropDown
              data={data?.makes || []}
              placeholder="Select"
              value={updatedData?.makeId}
              setValue={(value: string) => updateData('makeId', value)}
              rightIcon
            />
            {/* Model Dropdown */}
            <Text style={styles.placeholderText}>Model</Text>
            <DropDown
              data={data?.models || []}
              placeholder="Select"
              value={updatedData?.modelId}
              setValue={(value: string) => updateData('modelId', value)}
              rightIcon
            />
            {/* Expires */}
            <Text style={styles.placeholderText}>Expires</Text>
            <InputBox
              placeholder="1-10-2024"
              value={updatedData?.expirationDate}
              onChangeText={(value: string) = numberOfCharacter={50}> updateData('expirationDate', value)}
              borderLess
              numberOfCharacter={100}
            />
            {/* Memo */}
            <Text style={styles.placeholderText}>Memo</Text>
            <InputBox
              placeholder="ABC"
              value={updatedData?.memo}
              onChangeText={(value: string) = numberOfCharacter={50}> updateData('memo', value)}
              borderLess
              numberOfCharacter={100}
            />
            <PrimaryButton
              style={{ marginTop: hp(4) }}
              title="Add"
              onPress={handleSubmit(onSave)}
            />
          </View>
        ) : params?.from == 'Note' ? (
          <View>
            <Text style={styles.placeholderText}>Notes</Text>
            <Controller
              control={control}
              defaultValue={updatedData?.description}
              rules={{
                required: 'Notes is required',
              }}
              render={({ field: { onChange, value } }) => (
                <InputBox
                  placeholder="Type here..."
                  numberOfCharacter={350}
                  value={value}
                  onChangeText={onChange}
                  style={{ height: hp(16), alignItems: 'flex-start' }}
                  inputStyle={{
                    height: hp(16),
                    textAlignVertical: 'top',
                    width: wp(90),
                  }}
                  multiline
                />
              )}
              name="notes"
            />
            {formState?.errors?.notes && (
              <Text style={styles.error}>Notes is required</Text>
            )}
          </View>
        ) : params?.from == 'Document' ? (
          <View>
            <Text style={styles.placeholderText}>Description</Text>
            <Controller
              control={control}
              defaultValue={updatedData?.Description}
              rules={{
                required: 'Description is required',
              }}
              render={({ field: { onChange, value } }) => (
                <InputBox
                  placeholder="Type here..."
                  numberOfCharacter={350}
                  value={value}
                  onChangeText={onChange}
                  style={{ height: hp(16), alignItems: 'flex-start' }}
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
            <Text
              style={[
                styles.placeholderText,
                {
                  marginTop: hp(3),
                },
              ]}>
              Upload Document
            </Text>
            <View style={styles.dottedView}>
              <TouchableOpacity
                style={styles.verticalAlign}
                onPress={pickDocument}>
                <Image
                  resizeMode="contain"
                  source={icn.documentUpload}
                  style={styles.imgPicker}
                />
                <Text style={styles.dropText}>
                  Drop your image here, or{' '}
                  <Text style={styles.browse}>Browse</Text>
                </Text>
                <Text style={styles.dropSubText}>Maximum file size 50mb</Text>
              </TouchableOpacity>
            </View>
            {file?.name ? (
              <View style={styles.selectedFile}>
                <Text style={styles.selectedText}>{file.name}</Text>
              </View>
            ) : null}
          </View>
        ) : params?.from == 'Sms' ? (
          <View>
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
              defaultValue={updatedData?.description}
              rules={{
                required: 'Description is required',
              }}
              render={({ field: { onChange, value } }) => (
                <InputBox
                  placeholder="Type here..."
                  numberOfCharacter={320}
                  value={value}
                  onChangeText={onChange}
                  style={{ height: hp(16), alignItems: 'flex-start' }}
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
            <Text style={styles.maxCharText}>Max 320 Characters.</Text>
          </View>
        ) : (
          <View>
            <Text style={styles.placeholderText}>Title</Text>
            <Controller
              control={control}
              defaultValue={
                params?.from === 'Task'
                  ? updatedData?.taskName
                  : updatedData?.taskName
              }
              rules={{
                required: 'Title is required',
              }}
              render={({ field: { onChange, value } }) => (
                <InputBox
                  placeholder="Title"
                  numberOfCharacter={280}
                  value={value}
                  placeholderTextColor={Colors.greyIcn}
                  onChangeText={onChange}
                  borderLess
                />
              )}
              name="taskName"
            />
            {formState?.errors?.taskName && (
              <Text style={styles.error}>Title is required</Text>
            )}
            <Text style={styles.placeholderText}>
              {params?.from == 'Task'
                ? 'Due Date'
                : params?.from == 'Appointment' && 'From'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setIsDateClicked(true);
                setOpen(true);
              }}>
              <InputBox
                borderLess
                value={safeParseDate(updatedData?.dueDate)?.toDateString()}
                style={{ paddingVertical: hp(0.4) }}
                onChangeText={() = numberOfCharacter={50}> { }}
                disabled
                rightIcon={icn.calender}
                numberOfCharacter={100}
              />
            </TouchableOpacity>
            <Text style={styles.placeholderText}>Time</Text>
            <TouchableOpacity
              onPress={() => {
                setIsDateClicked(false);
                setOpen(true);
              }}>
              <InputBox
                borderLess
                value={
                  params?.from == 'Task'
                    ? updatedData?.time
                    : updatedData?.addedTime
                }
                style={{ paddingVertical: hp(0.4) }}
                onChangeText={() = numberOfCharacter={50}> { }}
                disabled
                rightIcon={icn.blueClock}
                numberOfCharacter={100}
              />
            </TouchableOpacity>
            {params?.from == 'Appointment' && (
              <View>
                <Text style={styles.placeholderText}>Attendee</Text>
                <DropDown
                  data={attendeeData}
                  placeholder={'Select'}
                  value={updatedData?.attendeeID}
                  labelField="attendeeName"
                  valueField="attendeeID"
                  setValue={(value: any) => updateData('attendeeID', value)}
                  rightIcon
                />
              </View>
            )}
            {params?.from !== 'Appointment' && (
              <View>
                <Text style={styles.placeholderText}>Task Type</Text>
                <DropDown
                  data={data?.taskType}
                  placeholder={'Select'}
                  value={updatedData?.taskTypeId}
                  labelField="description"
                  valueField="taskTypeId"
                  setValue={(value: any) => updateData('taskTypeId', value)}
                  rightIcon
                />
              </View>
            )}
            <Text style={styles.placeholderText}>Out Come</Text>
            <DropDown
              data={categoryStatus}
              placeholder={'Select'}
              value={
                params?.from === 'Appointment'
                  ? updatedData?.categoryStatusID
                  : updatedData?.categoryStatusID
              }
              labelField="description"
              valueField="categoryStatusID"
              setValue={(value: any) =>
                updateData(
                  params?.from === 'Appointment'
                    ? 'categoryStatusID'
                    : 'categoryStatusID',
                  value,
                )
              }
              rightIcon
            />
            {params?.from === 'Appointment' && (
              <View>
                <Text style={styles.placeholderText}>Where</Text>
                <Controller
                  control={control}
                  defaultValue={updatedData?.location}
                  rules={{
                    required: 'Where is required',
                  }}
                  render={({ field: { onChange, value } }) => (
                    <InputBox
                      placeholder="Type here..."
                      numberOfCharacter={280}
                      value={value}
                      placeholderTextColor={Colors.greyIcn}
                      onChangeText={onChange}
                      borderLess
                    />
                  )}
                  name="location"
                />
                {formState?.errors?.location && (
                  <Text style={styles.error}>Location is required</Text>
                )}
              </View>
            )}
            <Text style={styles.placeholderText}>Description</Text>
            <Controller
              control={control}
              defaultValue={updatedData?.description}
              rules={{
                required: 'Description is required',
              }}
              render={({ field: { onChange, value } }) => (
                <InputBox
                  placeholder="Type here..."
                  numberOfCharacter={300}
                  value={value}
                  onChangeText={onChange}
                  style={{ height: hp(16), alignItems: 'flex-start' }}
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
            <DatePicker
              modal
              open={open}
              date={dateField}
              mode={isDateClicked ? 'date' : 'time'}
              theme="light"
              onConfirm={date => {
                setOpen(false);
                if (isDateClicked) {
                  if (params?.from === 'Wishlist') {
                    updateData('expirationDate', date);
                  } else if (params?.from === 'Task' || params?.from === 'Appointment') {
                    updateData('dueDate', date);
                  }
                  // No date update for Vehicle Of Interest
                } else {
                  const formattedTime = new Date(date).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  });
                  updateData('time', formattedTime);
                }
              }}
              onCancel={() => setOpen(false)}
            />
          </View>
        )}
        {params?.from !== 'Wishlist' && params?.from !== 'Vehicle Of Interest' && (
          <PrimaryButton
            style={{
              marginTop:
                params?.from == 'Note'
                  ? hp(55)
                  : params?.from == 'Document'
                  ? hp(24)
                  : params?.from == 'Sms'
                  ? hp(42)
                  : hp(4),
            }}
            title="Send"
            onPress={handleSubmit(onSave)}
          />
        )}
        {params?.from === 'Set Vehicle' && (
          <PrimaryButton

          
          title="Search Vehicle"
          onPress={handleSearchVehicle}
          />
        )}
        {/* console.log("set vehicle", updatedData?.makeId, updatedData?.modelYear, updatedData?.modelId); */}
      </KeyboardAwareScrollView>
      <LoadingModal visible={isModalLoading} message="Saving..." />
      {vehicleInfo && (
        <View style={{ marginTop: 20 }}>
          <Text>Vehicle ID: {vehicleInfo.VehicleID}</Text>
          <Text>Year: {vehicleInfo.ModelYear}</Text>
          <Text>Model: {vehicleInfo.Model}</Text>
          <Text>Make: {vehicleInfo.Make}</Text>
          {/* Add more fields as needed */}
        </View>
      )}
    </View>
  );
};
export default AddCrmProfileTabBoilerPlate;
