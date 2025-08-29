import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// import DatePicker from 'react-native-date-picker'; // Temporarily disabled
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import SwitchToggle from 'react-native-switch-toggle';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import { icn } from '../../Assets/icn';
import DropDown from '../../Components/DropDown';
import Header from '../../Components/Header';
import InputBox from '../../Components/InputBox';
import PrimaryButton from '../../Components/PrimaryButton';
import {
  addVehicleBasic,
  modelByMake,
  trimByModel,
  updateVehicleBasics,
  vehicleBasicData,
  getVehicleMake,
  getVehicleBodyStyle,
  decode,
} from '../../Services/apis/APIs';
import { Colors } from '../../Theme/Colors';
import { hp, wp } from '../../Theme/Responsiveness';
import { styles } from './style';
import LoadingModal from '../../Components/LoadingModal';
import { storage } from '../../redux/mmkv/storage';
import { red } from 'react-native-reanimated/lib/typescript/Colors';

const Basics = ({ route }: { route: any }) => {
  const params = route?.params;
  const previousParams = params?.params;
  const changeHandler = params?.changeHandler;
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state: any) => state?.dropdownReducer);
  const navigation = useNavigation();
  const [houseTitle, setHouseTitle] = useState<any>(false);
  const [isNew, setIsNew] = useState<any>(false);
  const [date, setDate] = useState<any>(new Date());
  const [open, setOpen] = useState<any>(false);
  const { control, handleSubmit, trigger, formState, resetField, setValue } = useForm();
  const [isLoading, setIsLoading] = useState<any>(true);
  const [isModal, setIsModal] = useState<any>(false);
  const [vehicleBasicsApiData, setVehicleBasicsApiData] = useState<any>(
    {
      ...params?.item,
      year: params?.item?.modelYear
    }
  );
  const [vehicleBasicsUpdatedData, setVehicleBasicsUpdatedData] = useState<any>(
    {
      ...params?.item,
      year: params?.item?.modelYear
    }
  );

  const [modalDropdown, setModalDropdown] = useState<any>([]);
  const [trimDropdown, setTrimDropdown] = useState<any>([]);






  const handleDropdownChange = (field: any, value: any) => {
    setVehicleBasicsUpdatedData((prevState: any = {}) => ({
      ...prevState,
      [field]: value,
    }));
  };
  const [vehicleMake, setVehicleMake] = useState<any>([])
  const [vehicleBodyStyle, setVehicleBodyStyle] = useState<any>([])


  useEffect(() => {
    const getVehicleMakeData = async () => {
      const response = await getVehicleMake();
      console.log('Response from getVehicleMake:', response?.data);
      setVehicleMake(response?.data?.data);

      console.log('Vehicle Make: ', response?.data?.data);
      console.log('Vehicle Make Length: ', response?.data?.data?.length);

    };
    getVehicleMakeData();
  }, []);
  useEffect(() => {
    const getVehicleBodyStyleData = async () => {
      const response = await getVehicleBodyStyle();
      setVehicleBodyStyle(response?.data?.data);
      console.log('Vehicle Body Style Length: ', response?.data?.data?.length);

    };
    getVehicleBodyStyleData();
  }, []);

  // function calculateAgeInDays(...args: any[]): any: any {
  //   const givenDate = new Date(dateString);
  //   const currentDate = new Date();
  //   const differenceInMilliseconds = currentDate - givenDate;
  //   const differenceInDays = Math.floor(
  //     differenceInMilliseconds / (1000 * 60 * 60 * 24),
  //   );

  //   return differenceInDays;
  // }

  const calculateAgeInDays = (startDateString: any) => {
    const startDate = new Date(startDateString);
    const currentDate = new Date();

    // Calculate time difference in milliseconds
    const timeDiff = currentDate?.getTime() - startDate?.getTime();

    // Convert milliseconds to days
    const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    return dayDiff;
  };


  const getVehicleBasicData = async () => {
    try {
      if (params?.vehicleId) {
        setIsLoading(true);
        const payload = {
          VehicleID: params?.vehicleId,
        };
        const response = await vehicleBasicData(payload);
        console.log('Get Basics: ', response?.data?.data);
        const apiData = response?.data?.data;
        setVehicleBasicsApiData(apiData);
        setVehicleBasicsUpdatedData(apiData);
        setDate(new Date(apiData?.InStockDate));
        setHouseTitle(apiData?.TitleInHouse);
        setIsNew(apiData?.IsNew);
        // Set form values after API data is loaded
        setValue('year', apiData?.modelYear?.toString() || apiData?.ModelYear?.toString() || '');
        setValue('vin', apiData?.VIN || '');
        setValue('subtitle', apiData?.SubTitle || '');
        setValue('titleComment', apiData?.TitleComments || '');
        setValue('titleNo', apiData?.TitleNo || '');
        setValue('mileage', apiData?.Mileage?.toString() || '');
        setValue('curbWeight', apiData?.CurbWeight?.toString() || '');
        setValue('Mpg', apiData?.MPGCity?.toString() || '');
        setValue('hwy', apiData?.MPGHwy?.toString() || '');
        setValue('noOfDoors', apiData?.NoOfDoors?.toString() || '');
      } else if (params?.item) {
        // Handle case when data comes from params (not from API)
        const itemData = params?.item;
        setVehicleBasicsApiData(itemData);
        setVehicleBasicsUpdatedData(itemData);
        setDate(new Date(itemData?.InStockDate || new Date()));
        setHouseTitle(itemData?.TitleInHouse);
        setIsNew(itemData?.IsNew);
        // Set form values for params data
        setValue('year', itemData?.modelYear?.toString() || itemData?.ModelYear?.toString() || '');
        setValue('vin', itemData?.VIN || '');
        setValue('subtitle', itemData?.SubTitle || '');
        setValue('titleComment', itemData?.TitleComments || '');
        setValue('titleNo', itemData?.TitleNo || '');
        setValue('mileage', itemData?.Mileage?.toString() || '');
        setValue('curbWeight', itemData?.CurbWeight?.toString() || '');
        setValue('Mpg', itemData?.MPGCity?.toString() || '');
        setValue('hwy', itemData?.MPGHwy?.toString() || '');
        setValue('noOfDoors', itemData?.NoOfDoors?.toString() || '');
      }
    } catch (error: any) {
      console.log('Error: ', error?.response?.data);
      Toast?.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setIsLoading(false);
    }
  };
  const getVehicleModelByMake = async () => {
    try {
      if (!vehicleBasicsUpdatedData?.MakeID) {
        return;
      }
      const payload = {
        makeID: vehicleBasicsUpdatedData?.MakeID,
      };
      const response = await modelByMake(payload);
      setModalDropdown(response?.data?.data || []);
    } catch (error: any) {
      console.log('Error: ', error?.response?.data);
      Toast?.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
    }
  };
  const getVehicleTrimByModel = async () => {
    try {
      if (!vehicleBasicsUpdatedData?.ModelID) {
        return;
      }
      const payload = {
        ModelID: vehicleBasicsUpdatedData?.ModelID,
      };
      const response = await trimByModel(payload);
      setTrimDropdown(response?.data?.data || []);
    } catch (error: any) {
      console.log('Error: ', error?.response?.data);
      Toast?.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
    }
  };
  const onSave = async (data: any) => {
    console.log('Data: ', vehicleBasicsUpdatedData);
    try {
      if (!vehicleBasicsUpdatedData?.MakeID) {
        Toast?.show({
          type: 'error',
          text1: 'Please select Make',
        });
        return;
      }
      if (!vehicleBasicsUpdatedData?.ModelID) {
        Toast?.show({
          type: 'error',
          text1: 'Please select Model',
        });
        return;
      }
      // if (!vehicleBasicsUpdatedData?.TrimID) {
      //   Toast?.show({
      //     type: 'error',
      //     text1: 'Please select Trim',
      //   });
      //   return;
      // }
      // if (!vehicleBasicsUpdatedData?.EngineID) {
      //   Toast?.show({
      //     type: 'error',
      //     text1: 'Please select Engine',
      //   });
      //   return;
      // }
      // if (!vehicleBasicsUpdatedData?.TransmissionID) {
      //   Toast?.show({
      //     type: 'error',
      //     text1: 'Please select Transmission',
      //   });
      //   return;
      // }
      // if (!vehicleBasicsUpdatedData?.FuelTypeID) {
      //   Toast?.show({
      //     type: 'error',
      //     text1: 'Please select Fuel Type',
      //   });
      //   return;
      // }
      // if (!vehicleBasicsUpdatedData?.DriveTypeID) {
      //   Toast?.show({
      //     type: 'error',
      //     text1: 'Please select Drive Type',
      //   });
      //   return;
      // }
      setIsModal(true);
      const payload = {
        ...vehicleBasicsUpdatedData,
        MPGCity: data?.Mpg,
        CurbWeight: data?.curbWeight,
        MPGHwy: data?.hwy,
        Mileage: data?.mileage,
        NoOfDoors: data?.noOfDoors,
        SubTitle: data?.subtitle,
        TitleComments: data?.titleComment,
        TitleNo: data?.titleNo,
        VIN: params?.isExist ? vehicleBasicsApiData?.VIN : data?.vin,
        TitleInHouse: houseTitle,
        IsNew: isNew,
        InStockDate: date,
        ModelYear: data?.year,
      };
      console.log('Payload: ', payload);
      let response;
      if (params?.isExist) {
        response = await updateVehicleBasics(payload);
      } else {
        response = await addVehicleBasic(payload);
        console.log('Resp From add vehicle basics: ', JSON.stringify(response?.data));

        // Add null check before storing vehicleId
        if (response?.data?.vehicleId?.VehicleID) {
          storage?.set('vehicleId', response?.data?.vehicleId?.VehicleID);
        } else {
          console.log('Warning: No vehicleId found in response data');
        }
      }
      changeHandler(payload);
      navigation?.goBack();
    } catch (error: any) {
      console.log('this is Error: ', error);
      Toast?.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setIsModal(false);
    }
  };
  useEffect(() => {
    getVehicleBasicData();
  }, []);

  useEffect(() => {
    getVehicleModelByMake();
  }, [vehicleBasicsUpdatedData?.MakeID]);
  useEffect(() => {
    getVehicleTrimByModel();
  }, [vehicleBasicsUpdatedData?.ModelID]);
  console.log('Vehicle Basics Updated Data: ', vehicleBasicsUpdatedData);
  const handleVinSearch = async () => {
    try {
      const vin = control?._formValues?.vin;
      if (!vin) {
        Toast?.show({
          type: 'error',
          text1: 'Please enter VIN',
        });
        return;
      }

      setIsLoading(true);
      const response = await decode({ vin });
      const decodedData = response?.data?.data;



      if (decodedData) {
        setVehicleBasicsUpdatedData(prev => ({
          ...prev,
          // update dropdown-driven state
          MakeID: decodedData?.MakeID,
          ModelID: decodedData?.ModelID,
          TrimID: decodedData?.TrimID,
          EngineID: decodedData?.EngineID,
          TransmissionID: decodedData?.TransmissionID,
          FuelTypeID: decodedData?.FuelTypeID,
          DriveTypeID: decodedData?.DriveTypeID,
          VIN: decodedData?.VIN,
          InStockDate: new Date(decodedData?.InStockDate),
          ExteriorColorID: decodedData?.ExteriorColorID,
          InteriorColorID: decodedData?.InteriorColorID,
          InteriorSurfaceID: decodedData?.InteriorSurfaceID,
          VehicleLocationID: decodedData?.VehicleLocationID,
          VehicleReconID: decodedData?.VehicleReconID,
        }));


        console.log('Decoded Data: ===> ', decodedData);
        // update form-controlled fields
        setValue('vin', decodedData?.VIN || '');
        setValue('year', decodedData?.modelYear?.toString() || '');
        setValue('subtitle', decodedData?.SubTitle || '');
        setValue('titleComment', decodedData?.TitleComments || '');
        setValue('titleNo', decodedData?.TitleNo || '');
        setValue('mileage', decodedData?.Mileage?.toString() || '');
        setValue('curbWeight', decodedData?.CurbWeight?.toString() || '');
        setValue('Mpg', decodedData?.MPGCity?.toString() || '');
        setValue('hwy', decodedData?.MPGHwy?.toString() || '');
        setValue('noOfDoors', decodedData?.NoOfDoors?.toString() || '');
      }
      console.log('Decoded Year:', decodedData?.ModelYear);
      console.log('Decoded Subtitle:', decodedData?.SubTitle);
      console.log('Decoded Mileage:', decodedData?.Mileage);
    } catch (error: any) {
      Toast?.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setIsLoading(false);
    }
  };






  return (<View style={styles?.mainView}>
      <Header
        title="Basic"
        leftIcn={icn?.back}
        style={styles?.subContainer}
        leftIcnStyle={styles?.backIcn}
        onLeftIconPress={() => navigation?.goBack()}
      />
      {isLoading || loading ? (
        <ActivityIndicator
          color={Colors?.primary}
          style={styles?.activityIndicator}
          size={Platform?.OS == 'android' ? wp(11) : 'large'}
        />
      ) : (<>
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles?.content}>
            <Text style={styles?.placeholderText}>VIN</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Controller
                control={control}
                // disabled={params?.isExist}
                defaultValue={vehicleBasicsApiData?.VIN}
                rules={{
                  required: 'VIN is required', }}

                render={({ field: { onChange, value } }: any) => (
                  <InputBox
                    placeholder="Enter VIN"
                    numberOfCharacter={80}
                    // disabled={params?.isExist}
                    value={value}
                    onChangeText={(text: any) => {
                      console.log('VIN Input Value:', text);
                      onChange(text);
                      setVehicleBasicsApiData(prevState => ({
                        ...prevState,
                        VIN: text,
                      }));
                    }}
                    borderLess
                    style={{ flex: 1 }}
                  />

                )}
                name="vin"
              />

              <View style={{ marginLeft: 8, backgroundColor: Colors?.primary, borderRadius: 10, width: wp(12), height: hp(6), alignItems: 'center', justifyContent: 'center' }}>

                <TouchableOpacity onPress={handleVinSearch} >
                  <Image source={icn?.scanner} style={{ width: 15, height: 15, tintColor: 'white' }} />
                </TouchableOpacity>
              </View>
            </View>
            {formState?.errors?.vin && (
              <Text style={styles?.error}>Vin is required</Text>
            )}
            {/* <View style={styles?.centerSpaceContainer}> */}
            {/* <Text style={styles?.placeholderText}>Vehicle Type</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
            <Text style={{ 
                marginRight: wp(2), 
                color: houseTitle ? Colors?.parrot : Colors?.shadeGrey,
                fontSize: 12
              }}>
                {houseTitle ? 'New' : 'Used'}
              </Text>
              <SwitchToggle
                switchOn={houseTitle}
                onPress={() => setHouseTitle(!houseTitle)}
                backgroundColorOff={'white'}
                circleColorOff={Colors?.lightWhite}
                backgroundColorOn={'white'}
                circleColorOn={Colors?.parrot}
                containerStyle={{
                  width: wp(15),
                  height: hp(3.3),
                  borderRadius: 25,
                  padding: 5,
                  borderColor: houseTitle ? Colors?.parrot : Colors?.lightWhite,
                  borderWidth: wp(0.3),
                }}
                circleStyle={styles?.circleStyle}
              />
            </View>
          </View> */}
            <Text style={styles?.placeholderText}>Year</Text>
            <Controller
              control={control}
              name="year"
              rules={{
                required: 'Year is required',
              }}
              defaultValue={vehicleBasicsApiData?.modelYear?.toString() || vehicleBasicsApiData?.ModelYear?.toString() || ''}
              render={({ field: { onChange, value } }: any) => (
                <InputBox
                  placeholder="Enter Year"
                  value={value}
                  onChangeText={onChange}
                  numberOfCharacter={20}
                  borderLess

                />
              )}
            />
            {formState?.errors?.year && (
              <Text style={styles?.error}>Year is required</Text>
            )}
            <Text style={styles?.placeholderText}>Make</Text>
            <Controller
              control={control}
              name="MakeID"
              defaultValue={vehicleBasicsUpdatedData?.MakeID}
              rules={{
                required: 'Make is required',
              }}
              render={({ field: { onChange, value } }: any) => (
                <DropDown
                  data={vehicleMake}
                  placeholder={'Select'}
                  value={value}
                  labelField="description"
                  valueField="makeID"
                  setValue={(value: any) => {
                    const label = vehicleMake?.find((data: any) => data?.makeID === value)?.description
                    onChange(value);
                    handleDropdownChange('MakeID', value)
                    handleDropdownChange('Make', label)
                  }}
                  rightIcon
                />
              )}
            />
            {formState?.errors?.MakeID && (
              <Text style={styles?.error}>Make is required</Text>
            )}
            <Text style={styles?.placeholderText}>Model</Text>
            <Controller
              control={control}
              defaultValue={vehicleBasicsUpdatedData?.ModelID}
              name="ModelID"
              rules={{
                required: 'Model is required',
              }}
              render={({ field: { onChange, value } }: any) => (
                <DropDown
                  data={modalDropdown}
                  placeholder={'Select'}
                  value={value}
                  labelField="description"
                  valueField="modelID"
                  setValue={(value: any) => {
                    const label = modalDropdown?.find((data: any) => data?.modelID === value)?.description
                    onChange(value);
                    handleDropdownChange('ModelID', value)
                    handleDropdownChange('Model', label)
                  }}
                  rightIcon
                />
              )}
            />
            {formState?.errors?.ModelID && (
              <Text style={styles?.error}>Model is required</Text>
            )}
            <Text style={styles?.placeholderText}>Trim</Text>
            <DropDown
              data={trimDropdown}
              placeholder={'Select'}
              value={vehicleBasicsUpdatedData?.TrimID}
              labelField="description"
              valueField="TrimID"
              setValue={(value: any) => handleDropdownChange('TrimID', value)}
              rightIcon
            />
            <Text style={styles?.placeholderText}>Body Style</Text>
            <DropDown
              data={vehicleBodyStyle}
              placeholder={'Select'}
              value={vehicleBasicsUpdatedData?.BodyStyleID}
              labelField="Description"
              valueField="bodyStyleID"
              setValue={(value: any) => handleDropdownChange('BodyStyleID', value)}
              rightIcon
            />
            <Text style={styles?.placeholderText}>Engine</Text>
            <DropDown
              data={data?.vehicleEngine}
              placeholder={'Select'}
              value={vehicleBasicsUpdatedData?.EngineID}
              labelField="description"
              valueField="EngineID"
              setValue={(value: any) => handleDropdownChange('EngineID', value)}
              rightIcon
            />
            <Text style={styles?.placeholderText}>Transmission</Text>
            <DropDown
              data={data?.vehicleTransmission}
              placeholder={'Select'}
              value={vehicleBasicsUpdatedData?.TransmissionID}
              labelField="description"
              valueField="TransmissionID"
              setValue={(value: any) => handleDropdownChange('TransmissionID', value)}
              rightIcon
            />
            <Text style={styles?.placeholderText}>Fuel Type</Text>
            <DropDown
              data={data?.vehicleFuelType}
              placeholder={'Select'}
              value={vehicleBasicsUpdatedData?.FuelTypeID}
              labelField="description"
              valueField="FuelTypeID"
              setValue={(value: any) => handleDropdownChange('FuelTypeID', value)}
              rightIcon
            />
            <Text style={styles?.placeholderText}>Drive Type</Text>
            <DropDown
              data={data?.vehicleDriveType}
              placeholder={'Select'}
              value={vehicleBasicsUpdatedData?.DriveTypeID}
              labelField="description"
              valueField="driveTypeID"
              setValue={(value: any) => handleDropdownChange('DriveTypeID', value)}
              rightIcon
            />
            <View style={styles?.centerSpaceContainer}>
              <View>
                <Text style={styles?.placeholderText}>MPG City</Text>
                <Controller
                  control={control}
                  defaultValue={vehicleBasicsUpdatedData?.MPGCity?.toString()}
                  render={({ field: { onChange, value } }: any) => (
                    <InputBox
                      placeholder="Enter Mpg City"
                      numberOfCharacter={20}
                      value={value}
                      keyboardType="dialpad"
                      onChangeText={onChange}
                      borderLess
                      width={wp(43)}
                    />
                  )}
                  name="Mpg"
                />
                {formState?.errors?.Mpg && (
                  <Text style={styles?.error}>MPG City is required</Text>
                )}
              </View>
              <View>
                <Text style={styles?.placeholderText}>Hwy</Text>
                <Controller
                  control={control}
                  defaultValue={vehicleBasicsUpdatedData?.MPGHwy?.toString()}
                  render={({ field: { onChange, value } }: any) => (
                    <InputBox
                      placeholder="Enter Hwy"
                      numberOfCharacter={20}
                      value={value}
                      keyboardType="dialpad"
                      onChangeText={onChange}
                      width={wp(43)}
                      borderLess
                    />
                  )}
                  name="hwy"
                />
                {formState?.errors?.hwy && (
                  <Text style={styles?.error}>Hwy is required</Text>
                )}
              </View>
            </View>
            <Text style={styles?.placeholderText}>No Of Doors</Text>
            <Controller
              control={control}
              defaultValue={vehicleBasicsUpdatedData?.NoOfDoors}
              render={({ field: { onChange, value } }: any) => (
                <InputBox
                  placeholder="Enter no of doors"
                  numberOfCharacter={4000}
                  value={value}
                  keyboardType="dialpad"
                  onChangeText={onChange}
                  borderLess
                />
              )}
              name="noOfDoors"
            />
            {formState?.errors?.noOfDoors && (
              <Text style={styles?.error}>No Of Doors is required</Text>
            )}
            <View>
              <Text style={styles?.placeholderText}>Sub Title</Text>
              <Controller
                control={control}
                name="subtitle"
                render={({ field: { onChange, value } }: any) => (
                  <InputBox
                    placeholder="Enter sub-title"
                    value={value ?? ''}
                    onChangeText={onChange}
                    borderLess
                    numberOfCharacter={40}
                  />
                )}
              />
              {formState?.errors?.subtitle && (
                <Text style={styles?.error}>Sub Title is required</Text>
              )}
            </View>
            {/* <View style={styles?.centerSpaceContainer}>
            <Text style={styles?.placeholderText}>Sub Title</Text>
            <SwitchToggle
              switchOn={toggle}
              onPress={() => setToggle(!toggle)}
              backgroundColorOff={'white'}
              circleColorOff={Colors?.lightWhite}
              backgroundColorOn={'white'}
              circleColorOn={Colors?.parrot}
              containerStyle={{
                marginTop: 16,
                width: wp(15),
                height: hp(3?.3),
                borderRadius: 25,
                padding: 5,
                borderColor: toggle ? Colors?.parrot : Colors?.lightWhite,
                borderWidth: wp(0?.3),
              }}
              circleStyle={styles?.circleStyle}
            />
          </View> */}
            <Text style={styles?.placeholderText}>In Stock</Text>
            <TouchableOpacity onPress={() => setOpen(true)}>
              <InputBox
                rightIcon={icn?.downArrow}
                borderLess
                value={date?.toDateString()}
                style={{ paddingVertical: hp(0.4) }}
                onChangeText={() => { }}
                numberOfCharacter={20}
                disabled
              />
            </TouchableOpacity>
            {/* DatePicker temporarily disabled - needs proper import */}
        {/*<DatePicker
              modal
              open={open}
              date={date}
              mode="date"
              onConfirm={selectedDate => {
                setOpen(false);
                setDate(selectedDate);
              }}
              onCancel={() => {
                setOpen(false);
              }}
            />*/}
            <Text style={styles?.ageText}>
              Age: {calculateAgeInDays(vehicleBasicsUpdatedData?.PurchaseDate)} Days
            </Text>
            <View style={styles?.centerSpaceContainer}>
              <View>
                <Text style={styles?.placeholderText}>Mileage</Text>
                <Controller
                  control={control}
                  defaultValue={vehicleBasicsUpdatedData?.Mileage?.toString()}
                  rules={{
                    required: 'Mileage is required',
                  }}
                  render={({ field: { onChange, value } }: any) => (
                    <InputBox
                      placeholder="Enter Mileage"
                      numberOfCharacter={20}
                      value={value}
                      onChangeText={onChange}
                      borderLess
                      width={wp(43)}
                      keyboardType="number-pad"
                    />
                  )}
                  name="mileage"
                />
                {formState?.errors?.mileage && (
                  <Text style={styles?.error}>Mileage is required</Text>
                )}
              </View>
              <View>
                <Text style={styles?.placeholderText}>Mileage Status</Text>
                <DropDown
                  style={{ width: wp(45) }}
                  data={data?.mileageStatus}
                  placeholder={'Select'}
                  value={vehicleBasicsUpdatedData?.MileageStatusID}
                  labelField="description"
                  valueField="mileageStatusID"
                  setValue={(value: any) =>
                    handleDropdownChange('MileageStatusID', value)
                  }
                  rightIcon
                />
              </View>
            </View>
            <View>
              <Text style={styles?.placeholderText}>Curb Weight</Text>
              <Controller
                control={control}
                defaultValue={vehicleBasicsUpdatedData?.CurbWeight}
                render={({ field: { onChange, value } }: any) => (
                  <InputBox
                    placeholder="Enter curb weight"
                    numberOfCharacter={40}
                    value={value}
                    onChangeText={onChange}
                    borderLess
                  />
                )}
                name="curbWeight"
              />
              {formState?.errors?.curbWeight && (
                <Text style={styles?.error}>Curb Weight is required</Text>
              )}
            </View>
            <Text style={styles?.placeholderText}>Exterior Color</Text>
            <DropDown
              data={data?.vehicleExteriorColor}
              placeholder={'Select'}
              value={vehicleBasicsUpdatedData?.ExteriorColorID}
              labelField="description"
              valueField="ExteriorColorID"
              setValue={(value: any) => handleDropdownChange('ExteriorColorID', value)}
              rightIcon
            />
            <Text style={styles?.placeholderText}>Interior Color</Text>
            <DropDown
              data={data?.vehicleExteriorColor}
              placeholder={'Select'}
              value={vehicleBasicsUpdatedData?.InteriorColorID}
              labelField="description"
              valueField="ExteriorColorID"
              setValue={(value: any) => handleDropdownChange('InteriorColorID', value)}
              rightIcon
            />
            <Text style={styles?.placeholderText}>Interior surface</Text>
            <DropDown
              data={data?.vehicleInteriorSurface}
              placeholder={'Select'}
              value={vehicleBasicsUpdatedData?.InteriorSurfaceID}
              labelField="description"
              valueField="id"
              setValue={(value: any) => handleDropdownChange('InteriorSurfaceID', value)}
              rightIcon
            />
            <View style={styles?.centerSpaceContainer}>
              <Text style={styles?.placeholderText}>Is New</Text>
              <SwitchToggle
                switchOn={isNew}
                onPress={() => setIsNew(!isNew)}
                backgroundColorOff={'white'}
                circleColorOff={Colors?.lightWhite}
                backgroundColorOn={'white'}
                circleColorOn={Colors?.parrot}
                containerStyle={{
                  marginTop: 16,
                  width: wp(15),
                  height: hp(3.3),
                  borderRadius: 25,
                  padding: 5,
                  borderColor: isNew ? Colors?.parrot : Colors?.lightWhite,
                  borderWidth: wp(0.3),
                }}
                circleStyle={styles?.circleStyle}
              />
            </View>
            <View style={styles?.centerSpaceContainer}>
              <Text style={styles?.placeholderText}>Title In House</Text>
              <SwitchToggle
                switchOn={houseTitle}
                onPress={() => setHouseTitle(!houseTitle)}
                backgroundColorOff={'white'}
                circleColorOff={Colors?.lightWhite}
                backgroundColorOn={'white'}
                circleColorOn={Colors?.parrot}
                containerStyle={{
                  marginTop: 16,
                  width: wp(15),
                  height: hp(3.3),
                  borderRadius: 25,
                  padding: 5,
                  borderColor: houseTitle ? Colors?.parrot : Colors?.lightWhite,
                  borderWidth: wp(0.3),
                }}
                circleStyle={styles?.circleStyle}
              />
            </View>
            <View>
              <Text style={styles?.placeholderText}>Title No</Text>
              <Controller
                control={control}
                defaultValue={vehicleBasicsUpdatedData?.TitleNo}
                render={({ field: { onChange, value } }: any) => (
                  <InputBox
                    placeholder="Enter title no"
                    numberOfCharacter={40}
                    value={value}
                    onChangeText={onChange}
                    borderLess
                  />
                )}
                name="titleNo"
              />
              {formState?.errors?.titleNo && (
                <Text style={styles?.error}>Title no is required</Text>
              )}
            </View>
            <View>
              <Text style={styles?.placeholderText}>Title Comment</Text>
              <Controller
                control={control}
                defaultValue={vehicleBasicsUpdatedData?.TitleComments?.toString()}
                render={({ field: { onChange, value } }: any) => (
                  <InputBox
                    placeholder="Enter title comment"
                    numberOfCharacter={40}
                    value={value}
                    onChangeText={onChange}
                    borderLess
                  />
                )}
                name="titleComment"
              />
              {formState?.errors?.titleComment && (
                <Text style={styles?.error}>Title comment is required</Text>
              )}
            </View>
            <Text style={styles?.placeholderText}>Location</Text>
            <DropDown
              data={data?.vehicleLocations}
              placeholder={'Select'}
              value={vehicleBasicsUpdatedData?.VehicleLocationID}
              labelField="description"
              valueField="vehicleLocationID"
              setValue={(value: any) => handleDropdownChange('VehicleLocationID', value)}
              rightIcon
            />
            <Text style={styles?.placeholderText}>Vehicle Recon</Text>
            <DropDown
              data={data?.reconCenters}
              placeholder={'Select'}
              value={vehicleBasicsUpdatedData?.VehicleReconID}
              labelField="description"
              valueField="VehicleReconID"
              setValue={(value: any) => handleDropdownChange('VehicleReconID', value)}
              rightIcon
            />
          </KeyboardAwareScrollView>

          <View style={{ width: '100%', paddingHorizontal: 16, paddingVertical: 12 }}>
            <PrimaryButton
              style={{ width: '100%' }}
              title="Save"
              onPress={handleSubmit(onSave)}
            />
          </View>
        </>
      )}
      <LoadingModal visible={isModal} />
    </View>
  );
};

export default Basics;
