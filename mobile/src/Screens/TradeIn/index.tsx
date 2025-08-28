import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {
  ActivityIndicator,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-toast-message';
import {useDispatch, useSelector} from 'react-redux';
import {saveCrmDropDown} from '../../redux/slices/crmDropdownSlice';
import {icn} from '../../Assets/icn';
import DropDown from '../../Components/DropDown';
import Header from '../../Components/Header';
import InputBox from '../../Components/InputBox';
import PrimaryButton from '../../Components/PrimaryButton';
import {
  getTradeRequest,
  modelByMake,
  tradeRequest,
  trimByModel,
  crmDropdowns,
} from '../../Services/apis/APIs';
import {Colors} from '../../Theme/Colors';
import {hp, wp} from '../../Theme/Responsiveness';
import {styles} from './style';
import LoadingModal from '../../Components/LoadingModal';

interface TradeData {
  vin?: string;
  year?: number;
  ownerNo?: number;
  mileage?: number;
  transmission?: string;
  vehicleFeatures?: string;
  vehicleHistory?: string;
  videoUrl?: string;
  vehicleAmount?: number;
  ownerComments?: string;
  tradeAllowance?: number;
  payoff?: number;
  isAccidented?: boolean;
  previousPaintWork?: boolean;
  previousBodyWork?: boolean;
  needsPaintWork?: boolean;
  needsBodyWork?: boolean;
  makeID?: number;
  modelID?: number;
  exteriorColorID?: number;
  interiorColorID?: number;
  mileageStatusID?: number;
  exteriorConditionID?: number;
  interiorConditionID?: number;
  existingLienId?: number;
}

const TradeIn = ({route}:any) => {
  const params = route?.params;
  const dispatch = useDispatch();
  const [tradeData, setTradeData] = useState<TradeData>({});
  const { data: crmData, loading: crmLoading, error: crmError } = useSelector((state:any) => state?.crmDropdownReducer);
  const { data, loading, error } = useSelector((state:any) => state?.dropdownReducer);
  const navigation = useNavigation();
  const [isNeedPaint, setIsNeedPaint] = useState<boolean>(false);
  const [isNeedBody, setIsNeedBody] = useState<boolean>(false);
  const [modalDropdown, setModalDropdown] = useState<any[]>([]);
  const [isAccidental, setIsAccidental] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);

  // Fallback condition data if not provided by API
  const defaultConditions = [
    { label: 'Excellent', value: 1 },
    { label: 'Good', value: 2 },
    { label: 'Fair', value: 3 },
    { label: 'Poor', value: 4 },
  ];

  const {control, handleSubmit, formState, reset} = useForm();


  // console.log('Control is : ===> ', data);
  console.log('Control is : ===> ', data?.relationship);
  console.log('All data keys:', Object.keys(data));
  console.log('Full data object------------{{{{}}}}:', JSON.stringify(data, null, 2));


  const handleDropdownChange = (field: any, value: any) => {
    setTradeData((prevState:any) => ({
      ...prevState,
      [field]: value,
    }));
  };
  const getVehicleModelByMake = async () => {
    try {
      if (!tradeData?.makeID) {
        return;
      }
      const payload = {
        makeID: tradeData?.makeID,
      };
      const response = await modelByMake(payload);
      setModalDropdown(response?.data?.data || []);
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
  const getTrade = async () => {
    try {
      setIsLoading(true);
      const response = await getTradeRequest({
        customerID:params?.item?.customerID
      });
      console.log('Response in Trade', response?.data);
      setTradeData(response?.data?.data);
      const resData = response?.data?.data;
      setIsAccidental(resData?.isAccidented == 1);
      reset({
        vin: resData?.vin?.toString() || '',
        year: resData?.year?.toString() || '',
        ownerNo: resData?.ownerNo?.toString() || '',
        mileage: resData?.mileage?.toString() || '',
        transmission: resData?.transmission?.toString() || '',
        features: resData?.vehicleFeatures?.toString() || '',
        history: resData?.vehicleHistory?.toString() || '',
        videoUrl: resData?.videoUrl?.toString() || '',
        vehicleAmount: resData?.vehicleAmount?.toString() || '',
        comments: resData?.ownerComments?.toString() || '',
        tradeAllowance: resData?.tradeAllowance?.toString() || '',
        payOff: resData?.payoff?.toString() || '',
      });
    } catch (error:any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setIsLoading(false);
    }
  };
  console.log("data?.interiorCondition_______________}}}}}}}}",data?.interiorCondition);
  console.log("crmData condition data:", crmData);
  console.log("crmData existingLien:", crmData?.existingLien);
  
  const getCrmDropdowns = async () => {
    try {
      const response = await crmDropdowns();
      console.log('CRM Dropdowns Response:', response?.data);
      console.log('CRM Dropdowns existingLien:', response?.data?.existingLien);
      dispatch(saveCrmDropDown(response?.data));
    } catch (error:any) {
      console.log('Error loading CRM dropdowns:', error);
    }
  };

  const onSave = async (data: any) => {
    if (!tradeData?.modelID) {
      Toast.show({
        type: 'error',
        text1: 'Model is required',
      });
      return;
    }
    if (!tradeData?.mileageStatusID) {
      Toast.show({
        type: 'error',
        text1: 'Mileage status is required',
      });
      return;
    }
    if (!tradeData?.exteriorConditionID) {
      Toast.show({
        type: 'error',
        text1: 'Exterior condition is required',
      });
      return;
    }
    try {
      setIsModalLoading(true);
      const response = await tradeRequest({
        customerID: params?.item?.customerID,
        ...data,
        ...tradeData,
        isAccidented: isAccidental,
      });
      // console.log('Resp on Submit: ', JSON.stringify(response?.data));
      navigation.goBack();
    } catch (error:any    ) {
      Toast.show({
        type: 'error',
        text1: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setIsModalLoading(false);
    }
  };
  useEffect(() => {
    getTrade();
    getCrmDropdowns();
  }, []);
  useEffect(() => {
    getVehicleModelByMake();
  }, [tradeData?.makeID]);
  return (
    <View style={styles.mainView}>
      <Header
        title="Trade In"
        leftIcn={icn.back}
        style={styles.subContainer}
        leftIcnStyle={styles.backIcn}
        onLeftIconPress={() => navigation.goBack()}
      />
      {loading || isLoading ? (
        <ActivityIndicator
          color={Colors.primary}
          style={styles.activityIndicator}
          size={Platform.OS == 'android' ? wp(11) : 'large'}
        />
      ) : (
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}>
          <Text style={styles.placeholderText}>VIN</Text>
          <Controller
            control={control}
            rules={{
              required: 'VIN is required',
            }}
            render={({field: {onChange, value}}) => (
              <InputBox
                placeholder="Enter Vin"
                numberOfCharacter={80}
                value={value}
                onChangeText={onChange}
                borderLess
              />
            )}
            name="vin"
          />
          {formState?.errors?.vin && (
            <Text style={styles.error}>{formState?.errors?.vin?.message as string}</Text>
          )}
          <Text style={styles.placeholderText}>Year</Text>
          <Controller
            control={control}
            rules={{
              required: 'Year is required',
            }}
            render={({field: {onChange, value}}) => (
              <InputBox
                placeholder="Enter Year"
                numberOfCharacter={4}
                value={value}
                keyboardType="number-pad"
                onChangeText={onChange}
                borderLess
              />
            )}
            name="year"
          />
          {formState?.errors?.year && (
            <Text style={styles.error}>{formState?.errors?.year?.message as string}</Text>
          )}
          <Text style={styles.placeholderText}>Exterior Color</Text>
          <DropDown
            data={data?.vehicleExteriorColor}
            placeholder={'Select'}
            value={Number(tradeData?.exteriorColorID)}
            labelField="description"
            valueField="ExteriorColorID"
            setValue={(value:any) => handleDropdownChange('exteriorColorID', value)}
            rightIcon
          />
          {formState?.errors?.exteriorColor && (
            <Text style={styles.error}>Exterior Color is required</Text>
          )}
          <Text style={styles.placeholderText}>Interior Color</Text>
          <DropDown
            data={data?.vehicleExteriorColor}
            placeholder={'Select'}
            value={Number(tradeData?.interiorColorID)}
            labelField="description"
            valueField="ExteriorColorID"
            setValue={(value:any) => handleDropdownChange('interiorColorID', value)}
            rightIcon
          />
          <Text style={styles.placeholderText}>Make</Text>
          <DropDown
            data={data?.vehicleMake}
            placeholder={'Select'}
            value={Number(tradeData?.makeID)}
            labelField="description"
            valueField="makeID"
            setValue={(value:any) => handleDropdownChange('makeID', value)}
            rightIcon
          />
          <Text style={styles.placeholderText}>Model</Text>
          <DropDown
            data={modalDropdown}
            placeholder={'Select'}
            labelField="description"
            valueField="modelID"
            value={Number(tradeData?.modelID)}
            setValue={(value:any) => handleDropdownChange('modelID', value)}
            rightIcon
          />
          <Text style={styles.placeholderText}>Owner No</Text>
          <Controller
            control={control}
            rules={{
              required: 'Owner No is required',
            }}
            render={({field: {onChange, value}}) => (
              <InputBox
                placeholder="Enter Owner no"
                numberOfCharacter={80}
                value={value}
                onChangeText={onChange}
                keyboardType="number-pad"
                borderLess
              />
            )}
            name="ownerNo"
          />
          {formState?.errors?.ownerNo && (
            <Text style={styles.error}>{formState?.errors?.ownerNo?.message as string}</Text>
          )}
          <Text style={styles.placeholderText}>Mileage</Text>
          <Controller
            control={control}
            rules={{
              required: 'Mileage is required',
            }}
            render={({field: {onChange, value}}) => (
              <InputBox
                placeholder="Enter Mileage"
                numberOfCharacter={80}
                value={value}
                onChangeText={onChange}
                borderLess
                keyboardType="number-pad"
              />
            )}
            name="mileage"
          />
          {formState?.errors?.mileage && (
            <Text style={styles.error}>{formState?.errors?.mileage?.message as string}</Text>
          )}
          <Text style={styles.placeholderText}>Mileage Status</Text>
          <DropDown
            data={data?.mileageStatus}
            placeholder={'Select'}
            value={Number(tradeData?.mileageStatusID)}
            labelField="description"
            valueField="mileageStatusID"
            setValue={(value:any) => handleDropdownChange('mileageStatusID', value)}
            rightIcon
          />
          <Text style={styles.placeholderText}>Transmission</Text>
          <Controller
            control={control}
            rules={{
              required: 'Transmission is required',
            }}
            render={({field: {onChange, value}}) => (
              <InputBox
                placeholder="Enter transmission"
                numberOfCharacter={800}
                value={value}
                onChangeText={onChange}
                borderLess
              />
            )}
            name="transmission"
          />
          {formState?.errors?.transmission && (
            <Text style={styles.error}>
              {formState?.errors?.transmission?.message as string}
            </Text>
          )}
          <Text style={styles.placeholderText}>Features</Text>
          <Controller
            control={control}
            rules={{
              required: 'Features is required',
            }}
            render={({field: {onChange, value}}) => (
              <InputBox
                placeholder="Type Here.."
                numberOfCharacter={80}
                value={value}
                onChangeText={onChange}
                borderLess
              />
            )}
            name="features"
          />
          {formState?.errors?.features && (
            <Text style={styles.error}>{formState?.errors?.features?.message as string}</Text>
          )}
          <Text style={styles.placeholderText}>History</Text>
          <Controller
            control={control}
            rules={{
              required: 'History is required',
            }}
            render={({field: {onChange, value}}) => (
              <InputBox
                placeholder="Type Here.."
                numberOfCharacter={80}
                value={value}
                onChangeText={onChange}
                borderLess
              />
            )}
            name="history"
          />
          {formState?.errors?.history && (
            <Text style={styles.error}>{formState?.errors?.history?.message as string}</Text>
          )}
          <Text style={styles.placeholderText}>Exterior Condition</Text>
          <DropDown
            data={crmData?.exteriorCondition || defaultConditions}
            placeholder={'Select'}
            value={Number(tradeData?.exteriorConditionID)}
            labelField="label"
            valueField="value"
            setValue={(value:any) =>
              handleDropdownChange('exteriorConditionID', value)
            }
            rightIcon
          />
          <Text style={styles.placeholderText}>Interior Condition</Text>
          <DropDown
            data={crmData?.interiorCondition || defaultConditions}
            placeholder={'Select'}
            value={Number(tradeData?.interiorConditionID)}
            labelField="label"
            valueField="value"
            setValue={(value:any) =>
              handleDropdownChange('interiorConditionID', value)
            }
            rightIcon
          />
          <Text style={styles.placeholderText}>Video Url</Text>
          <Controller
            control={control}
            rules={{
              required: 'Video Url is required',
            }}
            render={({field: {onChange, value}}) => (
              <InputBox
                placeholder="Type Here.."
                numberOfCharacter={80}
                value={value}
                onChangeText={onChange}
                borderLess
              />
            )}
            name="videoUrl"
          />
          {formState?.errors?.videoUrl && (
            <Text style={styles.error}>{formState?.errors?.videoUrl?.message as string}</Text>
          )}
          <Text style={styles.placeholderText}>Vehicle Amount</Text>
          <Controller
            control={control}
            rules={{
              required: 'Vehicle Amount is required',
            }}
            render={({field: {onChange, value}}) => (
              <InputBox
                placeholder="Enter amount"
                numberOfCharacter={80}
                value={value}
                onChangeText={onChange}
                borderLess
                keyboardType="number-pad"
              />
            )}
            name="vehicleAmount"
          />
          {formState?.errors?.vehicleAmount && (
            <Text style={styles.error}>{formState?.errors?.vehicleAmount?.message as string}</Text>
          )}
          <Text style={styles.placeholderText}>Comments</Text>
          <Controller
            control={control}
            rules={{
              required: 'Comments is required',
            }}
            render={({field: {onChange, value}}) => (
              <InputBox
                placeholder="Type Here..."
                numberOfCharacter={80}
                value={value}
                onChangeText={onChange}
                borderLess
              />
            )}
            name="comments"
          />
          {formState?.errors?.comments && (
            <Text style={styles.error}>{formState?.errors?.comments?.message as string}</Text>
          )}
          <Text style={styles.placeholderText}>Trade Allowance</Text>
          <Controller
            control={control}
            rules={{
              required: 'Trade Allowance is required',
            }}
            render={({field: {onChange, value}}) => (
              <InputBox
                placeholder="Trade Allowance"
                numberOfCharacter={80}
                keyboardType="dialpad"
                value={value}
                onChangeText={onChange}
                borderLess
              />
            )}
            name="tradeAllowance"
          />
          {formState?.errors?.tradeAllowance && (
            <Text style={styles.error}>{formState?.errors?.tradeAllowance?.message as string}</Text>
          )}
          <Text style={styles.placeholderText}>Existing Len</Text>
          <DropDown
            data={crmData?.existingLien}
            placeholder={'Select'}
            value={Number(tradeData?.existingLienId)}
            labelField="description"
            valueField="existingLienId"
            setValue={(value:any) => handleDropdownChange('existingLienId', value)}
            rightIcon
          />
          <Text style={styles.placeholderText}>Pay Off</Text>
          <Controller
            control={control}
            rules={{
              required: 'Pay Off is required',
            }}
            render={({field: {onChange, value}}) => (
              <InputBox
                placeholder="Enter pay off"
                numberOfCharacter={80}
                value={value}
                keyboardType="dialpad"
                onChangeText={onChange}
                borderLess
              />
            )}
            name="payOff"
          />
          {formState?.errors?.payOff && (
            <Text style={styles.error}>{formState?.errors?.payOff?.message as string}</Text>
          )}
          <View style={styles.checkboxTabContainer}>
            <View style={styles.centerSpaceContainer}>
              <BouncyCheckbox
                size={wp(5)}
                style={{width: wp(44)}}
                isChecked={tradeData?.previousPaintWork}
                onPress={(checked:any) =>
                  handleDropdownChange('previousPaintWork', checked)
                }
                text="Previous Paint Work"
                textStyle={{
                  textDecorationLine: 'none',
                  color: '#15161F',
                }}
                textContainerStyle={{marginLeft: wp(2)}}
                innerIconStyle={{
                  borderRadius: wp(1),
                  borderWidth: wp(0.4),
                  borderColor: Colors.primary,
                  backgroundColor: tradeData?.previousPaintWork
                    ? Colors.primary
                    : Colors.white,
                }}
                iconImageStyle={{width: wp(3), height: hp(1), marginRight: 0}}
              />
              <BouncyCheckbox
                size={wp(5)}
                isChecked={tradeData?.previousBodyWork}
                onPress={(checked:any) =>
                  handleDropdownChange('previousBodyWork', checked)
                }
                text="Previous Body Work"
                textStyle={{
                  textDecorationLine: 'none',
                  color: '#15161F',
                }}
                textContainerStyle={{marginLeft: wp(2)}}
                innerIconStyle={{
                  borderRadius: wp(1),
                  borderWidth: wp(0.4),
                  borderColor: Colors.primary,
                  backgroundColor: tradeData?.previousBodyWork
                    ? Colors.primary
                    : 'transparent',
                }}
                iconImageStyle={{width: wp(3), height: hp(1), marginRight: 0}}
              />
            </View>
            <View style={styles.checkboxRow}>
              <BouncyCheckbox
                size={wp(5)}
                style={{width: wp(44)}}
                isChecked={tradeData?.needsPaintWork}
                onPress={(checked:any) =>
                  handleDropdownChange('needsPaintWork', checked)
                }
                text="Needs Paint Work"
                textStyle={{
                  textDecorationLine: 'none',
                  color: '#15161F',
                }}
                textContainerStyle={{marginLeft: wp(2)}}
                innerIconStyle={{
                  borderRadius: wp(1),
                  borderWidth: wp(0.4),
                  borderColor: Colors.primary,
                  backgroundColor: tradeData?.needsPaintWork
                    ? Colors.primary
                    : 'transparent',
                }}
                iconImageStyle={{width: wp(3), height: hp(1), marginRight: 0}}
              />
              <BouncyCheckbox
                size={wp(5)}
                isChecked={tradeData?.needsBodyWork}
                onPress={(checked:any) =>
                  handleDropdownChange('needsBodyWork', checked)
                }
                text="Needs Body Work"
                textStyle={{
                  textDecorationLine: 'none',
                  color: '#15161F',
                }}
                textContainerStyle={{marginLeft: wp(2)}}
                innerIconStyle={{
                  borderRadius: wp(1),
                  borderWidth: wp(0.4),
                  borderColor: Colors.primary,
                  backgroundColor: tradeData?.needsBodyWork
                    ? Colors.primary
                    : 'transparent',
                }}
                iconImageStyle={{width: wp(3), height: hp(1), marginRight: 0}}
              />
            </View>
          </View>
          <View style={styles.cont}>
            <Text style={styles.accidentText}>
              Has Vehicle been in accident
            </Text>
            <View style={styles.yesNoContainer}>
              <TouchableOpacity
                style={styles.centerRowContainer}
                onPress={() => setIsAccidental(true)}>
                <View style={styles.outerCircle}>
                  {isAccidental && <View style={styles.blueDot}></View>}
                </View>
                <Text style={styles.yesNoText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionContainer}
                onPress={() => setIsAccidental(false)}>
                <View style={styles.outerCircle}>
                  {!isAccidental && <View style={styles.blueDot}></View>}
                </View>
                <Text style={styles.yesNoText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
          <PrimaryButton
            style={{marginTop: hp(5)}}
            title="Save"
            onPress={handleSubmit(onSave)}
          />
        </KeyboardAwareScrollView>
      )}
      <LoadingModal visible={isModalLoading} message="Saving..." />
    </View>
  );
};

export default TradeIn;
