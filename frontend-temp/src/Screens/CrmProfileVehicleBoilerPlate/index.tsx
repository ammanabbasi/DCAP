import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
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
import Toast from 'react-native-toast-message';
import {
  updateCrmVehicleOfInterest,
  updateCrmVehicleWishlist,
  updateCrmAppointment,
  addAppointment,
  addVehicleOfInterest,
  searchVehicleForSet,
  crmDropdowns,
  addVehicleWishlist,
  getVehicleMake,
  modelByMake,
  trimByModel,
  } from '../../Services/apis/APIs';
import LoadingModal from '../../Components/LoadingModal';
import { saveCrmDropDown } from '../../redux/slices/crmDropdownSlice';

const CrmProfileVehicleBoilerPlate = (props:any) => {
  const params = props?.route?.params;
  console.log("CrmProfileVehicleBoilerPlate", params);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { data, loading, error } = useSelector((state:any) => state?.dropdownReducer);
  const [date, setDate] = useState<any>(new Date());
  const [time, setTime] = useState<string>('5:09 PM');
  const [isDateClicked, setIsDateClicked] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const { control, handleSubmit, trigger, formState, resetField } = useForm();
  const [vehicleData, setVehicleData] = useState<any>(() => {
    const item = params?.item || {};
    return {
      ...item,
      exteriorColorId: item.exteriorColorId || item.ExteriorColorID || '',
      interiorColorId: item.interiorColorId || item.InteriorColorID || '',
    };
  });
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
  const [vehicleMake,setVehicleMake] = useState<any[]>([])
  const [vehicleModel, setVehicleModel] = useState<any[]>([]);
  const [vehicleTrim, setVehicleTrim] = useState<any[]>([]);
  useEffect(()=>{
    const getVehicleMakeData = async () => {
      const response = await getVehicleMake({});
      console.log('Response from getVehicleMake:', response.data);
      setVehicleMake(response?.data?.data);

      console.log('Vehicle Make: ', response?.data?.data);
      console.log('Vehicle Make Length: ', response?.data?.data.length);
      
    };
    getVehicleMakeData();
  },[]);


  const getCrmDropdowns = async () => {
    try {
      const response = await crmDropdowns();
      console.log('CRM Dropdown Response:', response?.data);
      dispatch(saveCrmDropDown(response?.data));
    } catch (error:any) {
      console.log('CRM Dropdown Error:', error?.response?.data);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    }
  };
  useEffect(() => {
    getCrmDropdowns();
  }, [params?.from]);

  const updateData = (key:string, value:any) => {
    setVehicleData((prevData:any) => ({
      ...prevData,
      [key]: value,
    }));
  };
  useEffect(() => {
    getVehicleModelByMake();
  }, [vehicleData?.makeId]);

  useEffect(() => {
    getVehicleTrimByModel();
  }, [vehicleData?.modelId]);
  const getVehicleTrimByModel = async () => {
    try {
      if (!vehicleData?.modelId) {
        return;
      }
      const payload = {
        ModelID: vehicleData?.modelId,
      };
      const response = await trimByModel(payload);
      setVehicleTrim(response?.data?.data || []);
      console.log('Vehicle Trim: ', response?.data?.data);
      console.log('Vehicle Trim Length: ', response?.data?.data.length);
    } catch (error:any) {
      console.log('Error: ', error?.response?.data);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
    }
  };  
  const getVehicleModelByMake = async () => {
    try {
      if (!vehicleData?.makeId) {
        return;
      }
      const payload = {
        makeID: vehicleData?.makeId,
      };
      const response = await modelByMake(payload);
      setVehicleModel(response?.data?.data || []);
      console.log('Vehicle Model: ', response?.data?.data);
      console.log('Vehicle Model Length: ', response?.data?.data.length);
    } catch (error:any) {   
      console.log('Error: ', error?.response?.data);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
    }
  };

  // {
  //   "year": 2024,
  //   "modelId": 151,
  //   "customerId": 242615,
  //   "userId": 242531,
  //   "expirationDate": "2025-01-31T12:00:00Z",
  //   "memo": "This is a test wishlist item."
  // }

  console.log("params?.from======?", params?.from)
  console.log('params?.item:', params?.item);
  console.log('vehicleData:', vehicleData);
  const onUpdate = async (data:any) => {
    try {
      setIsModalLoading(true);
      if (params?.from == 'Vehicle Of Interest') {
        if (!vehicleData?.year) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Model Year is required.',
          });
          setIsModalLoading(false);
          return;
        }

        if (!vehicleData?.exteriorColorId) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Please select a valid exterior color.',
          });
          setIsModalLoading(false);
          return;
        }

        // Prepare the payload
        console.log("===========vehicleData?.exteriorColorId==========", vehicleData?.exteriorColorId);
        const payload = {
          customerId:
            params?.item?.customerID ||
            params?.item?.customerId ||
            params?.customerID ||
            params?.customerId ||
            vehicleData?.customerID ||
            vehicleData?.customerId,
          modelYear: String(vehicleData?.year),
          makeId: vehicleData?.makeId,
          modelId: vehicleData?.modelId,
          ...(vehicleData?.exteriorColorId ? { exteriorColorId: Number(vehicleData.exteriorColorId) } : {}),
          memo: data?.memo || vehicleData?.memo || 'N/A',
          trimId: vehicleData?.trimId,
          interiorColorId: vehicleData?.interiorColorId,
          mileage: data?.mileage || vehicleData?.mileage,
        };
        console.log("==========payload vehicle of ineterst======",payload);
        let response;
        if (vehicleData?.vehicleInterestId) {
          // Update: include vehicleInterestId
          response = await updateCrmVehicleOfInterest({
            vehicleInterestId: vehicleData.vehicleInterestId,
            ...payload,
          });
          if (response?.data) {
            Toast.show({
              type: 'success',
              text1: 'Success',
              text2: 'Vehicle of Interest updated successfully',
              position: 'bottom',
            });
          }
        } else {
          // Add: do NOT include vehicleInterestId
          response = await addVehicleOfInterest(payload);
          if (response?.data) {
            Toast.show({
              type: 'success',
              text1: 'Success',
              text2: 'Vehicle of Interest added successfully',
              position: 'bottom',
            });
          }
        }

        if (params?.refreshList) {
          params.refreshList();
        }
        navigation.goBack();
      } else if (params?.from == 'Wishlist') {
        const payload = {
          year: vehicleData?.year,
          modelId: vehicleData?.modelId,
          customerId: params?.item?.customerID || params?.item?.customerId,
          userId: params?.item?.userID || params?.item?.userId,
          expirationDate: vehicleData?.expirationDate || new Date().toISOString().split('T')[0],
          memo: data?.memo || vehicleData?.memo || 'N/A',
        };

        let response;
        if (vehicleData?.wishListId) {
          // Update existing wishlist item
          response = await updateCrmVehicleWishlist({
            wishListId: vehicleData.wishListId,
            ...payload,
          });
          if (response?.data) {
            Toast.show({
              type: 'success',
              text1: 'Success',
              text2: 'Wishlist item updated successfully',
              position: 'bottom',
            });
          }
        } else {
          // Add new wishlist item
          response = await addVehicleWishlist(payload);
          if (response?.data) {
            Toast.show({
              type: 'success',
              text1: 'Success',
              text2: 'Vehicle Wishlist added successfully',
              position: 'bottom',
            });
          }
        }

        if (params?.refreshList) {
          params.refreshList();
        }
        navigation.goBack();
      } else if (params?.from == 'Set Vehicle') {
        try {
          console.log('This is data', { ...data, ...vehicleData });

          const payload = {
            stockNumber: data?.stock || null,
            vin: data?.vin || null,
            modelYear: data?.year || null,
            makeID: vehicleData?.makeId || null,
            modelID: vehicleData?.modelId || null,
          }
          console.log('Payload sent to Set Vehicle:', payload);
          const response = await searchVehicleForSet(payload);
          console.log('Response sent to Set Vehicle:', response?.data);

          if (response?.data?.vehicles) {
            params?.setResponce((prevData:any) => [...prevData, ...response?.data?.vehicles]);
          } else {
            Toast.show({
              type: 'error',
              text1: 'No Results',
              text2: 'No vehicles found with the provided criteria',
            });
          }
        } catch (error: any) {
          console.log('Error in Set Vehicle:', error?.response?.data);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: error?.response?.data?.message || 'Something went wrong!',
          });
        } finally {
          navigation.goBack();
        }
      } else if (params?.from == 'Appointment') {
        if (vehicleData?.appointmentID) {
          // Update existing appointment
          const payload = {
            appointmentID: vehicleData.appointmentID,
            location: data?.location || vehicleData?.location || '',
            attendeeID: data?.attendeeID || vehicleData?.attendeeID,
            categoryStatusID: data?.categoryStatusID || vehicleData?.categoryStatusID,
            dueDate: data?.dueDate || vehicleData?.dueDate,
            description: data?.description || vehicleData?.description || '',
            // add other fields as required by your backend
          };
          console.log('Payload sent to updateCrmAppointment:', payload);
          const response = await updateCrmAppointment(payload);
          if (params?.refreshAppointments && response?.data) {
            params.refreshAppointments(response.data);
          }
          navigation.goBack();
        } else {
          // Add new appointment
          const payload = {
            taskTitle: data?.taskName || vehicleData?.taskName || '',
            interactionTypeID: data?.taskTypeId || vehicleData?.taskTypeId || 7,
            customerID: params?.customerID || params?.item?.customerID || vehicleData?.customerID,
            dueDate: data?.dueDate || vehicleData?.dueDate,
            description: data?.description || vehicleData?.description || '',
            userID: params?.userID || vehicleData?.userID,
            location: data?.location || vehicleData?.location || '',
            attendeeID: data?.attendeeID || vehicleData?.attendeeID,
          };
          console.log('Payload sent to addAppointment:', payload);
          const response = await addAppointment(payload);
          if (params?.refreshAppointments && response?.data) {
            params.refreshAppointments(response.data);
          }
          navigation.goBack();
        }
      }
    } catch (error:any) {
      console.log(error?.response?.data);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setIsModalLoading(false);
    }
  };
  const onSave = (data:any) => {
    onUpdate(data);
  };
  const formatDate = (input:any) => {
    if (input instanceof Date && !isNaN(input.getTime())) {
      return (
        input.getFullYear() +
        '-' +
        String(input.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(input.getDate()).padStart(2, '0')
      );
    }
    if (typeof input === 'string' && !isNaN(Date.parse(input))) {
      const date = new Date(input);
      return (
        date.getFullYear() +
        '-' +
        String(date.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(date.getDate()).padStart(2, '0')
      );
    }
    return input;
  };


  console.log("data?.vehicleMake", data?.vehicleMake);
  console.log("data?.vehicleModel =========", params?.from);
  return (
    <View style={styles.mainView}>
      <Header
        title={`${params?.from}`}
        leftIcn={icn.back}
        style={styles.subContainer}
        leftIcnStyle={styles.backIcn}
        onLeftIconPress={() => navigation.goBack()}
      />
      {loading ? (
        <ActivityIndicator
          color={Colors.primary}
          style={styles.activityIndicator}
          size={Platform.OS == 'android' ? wp(11) : 'large'}
        />
      ) : (
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: hp(5),
            paddingHorizontal: wp(3),
          }}>
          <View>
            {params?.from == 'Set Vehicle' && (
              <View>
                <Text style={styles.placeholderText}>Stock</Text>
                <Controller
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <InputBox
                      placeholder="00000"
                      numberOfCharacter={280}
                      value={value}
                      placeholderTextColor={Colors.greyIcn}
                      onChangeText={onChange}
                      borderLess
                    />
                  )}
                  name="stock"
                />
                <Text style={styles.placeholderText}>VIN</Text>
                <Controller
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <InputBox
                      placeholder="#01234455857909"
                      numberOfCharacter={280}
                      value={value}
                      placeholderTextColor={Colors.greyIcn}
                      onChangeText={onChange}
                      borderLess
                    />
                  )}
                  name="vin"
                />
              </View>
            )}
            <View>
              <Text style={styles.placeholderText}>Year</Text>
              <Controller
                control={control}
                defaultValue={vehicleData?.year?.toString()}
                render={({ field: { onChange, value } }) => (
                  <InputBox
                    placeholder="Year"
                    numberOfCharacter={4}
                    value={value}
                    placeholderTextColor={Colors.greyIcn}
                    onChangeText={val => {
                      onChange(val);
                      updateData('year', val);
                    }}
                    borderLess
                  />
                )}
                name="year"
              />
            </View>
            <Text style={styles.placeholderText}>Make</Text>
          <DropDown
            data={vehicleMake}
            placeholder={'Select'}
            value={vehicleData?.makeId}
            labelField="description"
            valueField="makeID"
            setValue={(value: string | number) => updateData('makeId', value)}
            rightIcon
          />
          <Text style={styles.placeholderText}>Model</Text>
          <DropDown
            data={vehicleModel}
            placeholder={'Select'}
            labelField="description"
            valueField="modelID"
            value={vehicleData?.modelId}
            setValue={(value: string | number) => updateData('modelId', value)}
            rightIcon
          />
            {params?.from === 'Vehicle Of Interest' && (
              <View>
                <Text style={styles.placeholderText}>Trim</Text>
                <DropDown
                  data={vehicleTrim}
                  placeholder={'Select'}
                  value={vehicleData?.trimId}
                  labelField="description"
                  valueField="TrimID"
                  setValue={(value: string | number) => updateData('trimId', value)}
                  rightIcon
                />
                <Text style={styles.placeholderText}>Mileage</Text>
                <Controller
                  control={control}
                  defaultValue={vehicleData?.mileage?.toString()}
                  rules={{
                    required: 'Mileage is required',
                  }}
                  render={({ field: { onChange, value } }) => (
                    <InputBox
                      placeholder="Mileage"
                      numberOfCharacter={280}
                      value={value}
                      placeholderTextColor={Colors.greyIcn}
                      onChangeText={onChange}
                      borderLess
                    />
                  )}
                  name="mileage"
                />
                {formState?.errors?.mileage && (
                  <Text style={styles.error}>Mileage is required</Text>
                )}
                <Text style={styles.placeholderText}>Color (Ext)</Text>
                <DropDown
                  data={data?.vehicleExteriorColor}
                  placeholder={'Select'}
                  value={vehicleData?.exteriorColorId}
                  labelField="description"
                  valueField="ExteriorColorID"
                  setValue={(value: string | number) => updateData('exteriorColorId', value)}
                  rightIcon
                />
                <Text style={styles.placeholderText}>Color (Int)</Text>
                <DropDown
                  data={data?.vehicleExteriorColor}
                  placeholder={'Select'}
                  value={vehicleData?.interiorColorId}
                  labelField="description"
                  valueField="ExteriorColorID"
                  setValue={(value: string | number) => updateData('interiorColorId', value)}
                  rightIcon
                />
              </View>
            )}
            {params?.from === 'Wishlist' && (
              <View>
                <Text style={styles.placeholderText}>Expires</Text>
                <TouchableOpacity
                  onPress={() => {
                    setOpen(true);
                  }}
                  style={{ 
                    borderBottomWidth: 1,
                    borderBottomColor: Colors.greyIcn,
                    paddingVertical: hp(0.4)
                  }}>
                  <Text style={{ color: Colors.black }}>
                    {formatDate(vehicleData?.expirationDate) || 'Select Date'}
                  </Text>
                </TouchableOpacity>
                <DatePicker
                  modal
                  open={open}
                  date={date}
                  mode="date"
                  theme="light"
                  onConfirm={selectedDate => {
                    setOpen(false);
                    setDate(selectedDate);
                    updateData('expirationDate', selectedDate);
                  }}
                  onCancel={() => {
                    setOpen(false);
                  }}
                />
              </View>
            )}
            {params?.from !== 'Set Vehicle' && (
              <View>
                <Text style={styles.placeholderText}>Memo</Text>
                <Controller
                  control={control}
                  defaultValue={vehicleData?.memo}
                  rules={{
                    required: 'Memo is required',
                  }}
                  render={({ field: { onChange, value } }) => (
                    <InputBox
                      placeholder="Memo"
                      numberOfCharacter={280}
                      value={value}
                      placeholderTextColor={Colors.greyIcn}
                      onChangeText={onChange}
                      borderLess
                    />
                  )}
                  name="memo"
                />
                {formState?.errors?.memo && (
                  <Text style={styles.error}>Memo is required</Text>
                )}
              </View>
            )}
          
          </View>
          <PrimaryButton
            style={{

              
              marginTop:
                params?.from === 'Vehicle Of Interest' ? hp(4) : hp(25),
            }}
            title={params?.from === 'Set Vehicle' ? 'Search Vehicle' : 'Save'}
            onPress={handleSubmit(onSave)}
          />
        </KeyboardAwareScrollView>
      )}
      <LoadingModal visible={isModalLoading} message={error?.response?.data?.message || 'data successfully saved'} />
    </View>
  );
};

export default CrmProfileVehicleBoilerPlate;
