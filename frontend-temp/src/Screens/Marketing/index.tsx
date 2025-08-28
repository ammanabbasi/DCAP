import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Image, Platform, Text, View } from 'react-native';
import { RadioButton } from 'react-native-paper';
import { Dropdown } from 'react-native-element-dropdown';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import SwitchToggle from 'react-native-switch-toggle';
import { useDispatch, useSelector } from 'react-redux';
import { icn } from '../../Assets/icn';
import Header from '../../Components/Header';
import InputBox from '../../Components/InputBox';
import PrimaryButton from '../../Components/PrimaryButton';
import { Colors } from '../../Theme/Colors';
import { hp, wp } from '../../Theme/Responsiveness';
import { styles } from './style';
import DropDown from '../../Components/DropDown';
import { RootStackScreenProps } from '../../Navigation/type';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';

// Marketing data interface
interface MarketingData {
  UseRetailPrice?: boolean;
  InternetPrice?: number | string;
  RetailPrice?: number | string;
  WholesalePrice?: number | string;
  WholesaleLightID?: number;
  WholesaleComments?: string;
  isBlueForWholesale?: boolean;
  ReducedAmount?: number | string;
  MMRWholesaleAvg?: number | string;
  MonthlyPayment?: number | string;
  Financed?: boolean;
  KBBPrice?: number | string;
  VehicleNADAPrice?: number | string;
  isPublished?: boolean;
  SpotLight?: boolean;
  Featured?: boolean;
  Certified?: boolean;
  LowMileage?: boolean;
  isSoldPublished?: boolean;
  ShowHighLights?: boolean;
  ShowCarFaxReportLink?: boolean;
  HideCarFaxSnapshot?: boolean;
  IsFrameDamage?: boolean;
  ReducedPrice?: boolean;
  LocalTrade?: boolean;
  NoHagglePricing?: boolean;
  ShowCarGurusLink?: boolean;
  SalePending?: boolean;
  ShowAutoCheckReport?: boolean;
  RequestWebPrice?: boolean;
  MilitaryDiscount?: boolean;
  Warranty3MonthOR3000Miles?: boolean;
  HideMoneyLabels?: boolean;
  ShowGreenLightInspection?: boolean;
  TitleStatusID?: number;
  WarrantyTypeID?: number;
  [key: string]: any;
}

import {
  updateVehicleMarketing,
  vehicleMarketing,
} from '../../Services/apis/APIs';
import Toast from 'react-native-toast-message';
import LoadingModal from '../../Components/LoadingModal';

type Props = RootStackScreenProps<'Marketing'>;

const Marketing: React.FC<Props> = ({ route: any, navigation }: any) => {
  const params = route?.params;
  const changeHandler = params?.changeHandler;
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state: any) => state?.dropdownReducer);
  const employee = useAppSelector((state: any) => state?.employeeRoleReducer?.data);
  const { control, handleSubmit, trigger, formState, resetField } = useForm();
  const [isLoading, setIsLoading] = useState<any>(true);
  const [marketingInitialData, setMarketingInitialData] = useState<any>(null);
  const [marketingUpdateData, setMarketingUpdatedData] = useState<any>(null);
  const [isModal, setIsModal] = useState<any>(false);
  const getVehicleMarketingData = async () => {
    try {
      setIsLoading(true);
      const payload = {
        VehicleID: params?.vehicleId,
      };
      const response = await vehicleMarketing(payload);
      setMarketingInitialData(response?.data || {});
      setMarketingUpdatedData(response?.data || {});
    } catch (error: any) {
      console.log(error);
      Toast?.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleDataChange = (field: keyof MarketingData, value: any) => {
    setMarketingUpdatedData(prevState => ({
      ...(prevState || {}),
      [field]: value,
    }));
  };


  console.log('employee can change price: =====> ', employee?.CanChangePrice);


  const onSave = async (data: any) => {
    try {
      setIsModal(true);
      const payload = {
        ...marketingUpdateData,
        InternetPrice: data?.internetPrice,
        KBBPrice: data?.kbbPrice,
        MonthlyPayment: data?.monthlyPayment,
        MMRWholesaleAvg: data?.mrr,
        VehicleNADAPrice: data?.nadaPrice,
        RetailPrice: data?.retailPrice || null,
        WholesaleComments: data?.wholesaleComponents,
        WholesalePrice: data?.wholesalePrice || null,
        ReducedAmount: data?.reduced || null,
        VehicleID: params?.vehicleId,
      };
      const response = await updateVehicleMarketing(payload);
      changeHandler(payload);
      navigation?.goBack();
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
  useEffect(() => {
    getVehicleMarketingData();
  }, []);
  return (
    <>
      <View style={styles?.mainView}>
        <Header
          title="Marketing"
          style={styles?.subContainer}
          leftIcn={icn?.back}
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
              {/* <View style={styles?.centerSpaceContainer}>
            <Text style={[styles?.placeholderText: any, { marginTop: 0 }]}>
              Use Retail Price
            </Text>
            <SwitchToggle
              switchOn={marketingUpdateData?.UseRetailPrice}
              onPress={() =>
                handleDataChange(
                  'UseRetailPrice',
                  !marketingUpdateData?.UseRetailPrice,
                )
              }
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
                borderColor: marketingUpdateData?.UseRetailPrice
                  ? Colors?.parrot
                  : Colors?.lightWhite,
                borderWidth: wp(0.3),
              }}
              circleStyle={styles?.circleStyle}
            />
          </View> */}
              <View style={styles?.centerSpaceContainer2}>
                <Text style={[styles?.placeholderText, { marginTop: 10 }]}>
                  Use Price
                </Text>

                <View style={styles?.radioContainer}>
                  <View style={styles?.radioOptionContainer}>
                    <Text style={styles?.radioLabel} onPress={() => handleDataChange('UseRetailPrice', true)}  >Retail</Text>
                    <RadioButton
                      value="Retail"
                      status={marketingUpdateData?.UseRetailPrice === true ? 'checked' : 'unchecked'}
                      onPress={() =>
                        handleDataChange('UseRetailPrice', true)  // Set Retail price
                      }
                    />
                  </View>

                  <View style={styles?.radioOptionContainer}>
                    <Text style={styles?.radioLabel} onPress={() => handleDataChange('UseRetailPrice', false)}>Internet</Text>
                    <RadioButton
                      value="Internet"
                      status={marketingUpdateData?.UseRetailPrice === false ? 'checked' : 'unchecked'}
                      onPress={() =>
                        handleDataChange('UseRetailPrice', false)  // Set Internet price
                      }
                    />
                  </View>
                </View>
              </View>



              <Text style={styles?.placeholderText}>Internet Price</Text>
              <Controller
                control={control}
                defaultValue={marketingInitialData?.InternetPrice?.toString()}
                rules={{
                  required: 'Internet Price is required',
                }}
                render={({ field: { onChange, value } }: any) => (
                  <InputBox
                    placeholder="Enter internet price"
                    numberOfCharacter={80}
                    keyboardType="dialpad"
                    disabled={employee?.CanChangePrice === false}
                    value={value}
                    onChangeText={onChange}
                    borderLess
                  />
                )}
                name="internetPrice"
              />
              {formState?.errors?.internetPrice && (
                <Text style={styles?.error}>Internet Price is required</Text>
              )}
              <Text style={styles?.placeholderText}>Retail Price</Text>
              <Controller
                control={control}
                defaultValue={marketingInitialData?.RetailPrice?.toString()}
                // rules={{
                //   required: 'Retail Price is required',
                // }}
                render={({ field: { onChange, value } }: any) => (
                  <InputBox
                    placeholder="Enter retail price"
                    numberOfCharacter={80}
                    value={value}
                    disabled={employee?.CanChangePrice === false}
                    keyboardType="dialpad"
                    onChangeText={onChange}
                    borderLess
                  />
                )}
                name="retailPrice"
              />
              {/* {formState?.errors?.retailPrice && (
            <Text style={styles?.error}>Retail Price is required</Text>
          )} */}
              <Text style={styles?.placeholderText}>Wholesale Price</Text>
              <Controller
                control={control}
                defaultValue={marketingInitialData?.WholesalePrice?.toString()}
                // rules={{
                //   required: 'Wholesale Price is required',
                // }}
                render={({ field: { onChange, value } }: any) => (
                  <InputBox
                    placeholder="Enter wholesale price"
                    numberOfCharacter={80}
                    value={value}
                    keyboardType="dialpad"
                    onChangeText={onChange}
                    borderLess
                  />
                )}
                name="wholesalePrice"
              />
              {/* {formState?.errors?.wholesalePrice && (
            <Text style={styles?.error}>Wholesale Price is required</Text>
          )} */}
              <Text style={styles?.placeholderText}>Wholesale Lights</Text>
              <DropDown
                data={data?.wholesaleLights}
                placeholder={'Select'}
                value={marketingInitialData?.WholesaleLightID}
                labelField="description"
                valueField="wholesaleLightID"
                setValue={value => handleDataChange('WholesaleLightID', value)}
                rightIcon
              />
              <Text style={styles?.placeholderText}>Wholesale Comments</Text>
              <Controller
                control={control}
                defaultValue={marketingInitialData?.WholesaleComments?.toString()}
                render={({ field: { onChange, value } }: any) => (
                  <InputBox
                    placeholder="Enter wholesale commments"
                    numberOfCharacter={80}
                    value={value}
                    onChangeText={onChange}
                    borderLess
                  />
                )}
                name="wholesaleComponents"
              />
              {formState?.errors?.wholesaleComponents && (
                <Text style={styles?.error}>Wholesale Components is required</Text>
              )}
              <View style={styles?.centerSpaceContainer}>
                <Text style={styles?.placeholderText}>Blue Title Attached</Text>
                <SwitchToggle
                  switchOn={marketingUpdateData?.isBlueForWholesale}
                  onPress={() =>
                    handleDataChange(
                      'isBlueForWholesale',
                      !marketingUpdateData?.isBlueForWholesale,
                    )
                  }
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
                    borderColor: marketingUpdateData?.isBlueForWholesale
                      ? Colors?.parrot
                      : Colors?.lightWhite,
                    borderWidth: wp(0.3),
                  }}
                  circleStyle={styles?.circleStyle}
                />
              </View>
              <View style={styles?.centerSpaceContainer}>
                <View>
                  <Text style={styles?.placeholderText}>Reduced</Text>
                  <Controller
                    control={control}
                    defaultValue={marketingInitialData?.ReducedAmount?.toString()}
                    // rules={{
                    //   required: 'Reduced is required',
                    // }}
                    render={({ field: { onChange, value } }: any) => (
                      <InputBox
                        placeholder="Reduced price"
                        numberOfCharacter={20}
                        value={value}
                        keyboardType="dialpad"
                        onChangeText={onChange}
                        borderLess
                        width={wp(43)}
                      />
                    )}
                    name="reduced"
                  />
                  {/* {formState?.errors?.reduced && (
                <Text style={styles?.error}>Reduced is required</Text>
              )} */}
                </View>
                <View>
                  <Text style={styles?.placeholderText}>MMR</Text>
                  <Controller
                    control={control}
                    defaultValue={marketingInitialData?.MMRWholesaleAvg?.toString()}
                    render={({ field: { onChange, value } }: any) => (
                      <InputBox
                        placeholder="Mrr"
                        numberOfCharacter={20}
                        value={value}
                        keyboardType="dialpad"
                        onChangeText={onChange}
                        width={wp(43)}
                        borderLess
                      />
                    )}
                    name="mrr"
                  />
                  {formState?.errors?.mrr && (
                    <Text style={styles?.error}>MRR is required</Text>
                  )}
                </View>
              </View>
              <Text style={styles?.placeholderText}>Monthly Payment</Text>
              <Controller
                control={control}
                defaultValue={marketingInitialData?.MonthlyPayment?.toString()}
                render={({ field: { onChange, value } }: any) => (
                  <InputBox
                    placeholder="Enter monthly payment"
                    numberOfCharacter={80}
                    value={value}
                    keyboardType="dialpad"
                    onChangeText={onChange}
                    borderLess
                  />
                )}
                name="monthlyPayment"
              />
              {formState?.errors?.monthlyPayment && (
                <Text style={styles?.error}>Monthly Payment is required</Text>
              )}
              <View style={styles?.centerSpaceContainer}>
                <Text style={styles?.placeholderText}>Financed</Text>
                <SwitchToggle
                  switchOn={marketingUpdateData?.Financed}
                  onPress={() =>
                    handleDataChange('Financed', !marketingUpdateData?.Financed)
                  }
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
                    borderColor: marketingUpdateData?.Financed
                      ? Colors?.parrot
                      : Colors?.lightWhite,
                    borderWidth: wp(0.3),
                  }}
                  circleStyle={styles?.circleStyle}
                />
              </View>
              <Text style={styles?.placeholderText}>KBB Price</Text>
              <Controller
                control={control}
                defaultValue={marketingInitialData?.KBBPrice?.toString()}
                render={({ field: { onChange, value } }: any) => (
                  <InputBox
                    placeholder="Enter kbb price"
                    numberOfCharacter={80}
                    keyboardType="dialpad"
                    value={value}
                    onChangeText={onChange}
                    borderLess
                  />
                )}
                name="kbbPrice"
              />
              {formState?.errors?.kbbPrice && (
                <Text style={styles?.error}>KBB Price is required</Text>
              )}
              <Text style={styles?.placeholderText}>NADA Price</Text>
              <Controller
                control={control}
                defaultValue={marketingInitialData?.VehicleNADAPrice?.toString()}
                render={({ field: { onChange, value } }: any) => (
                  <InputBox
                    placeholder="Enter nada price"
                    numberOfCharacter={80}
                    value={value}
                    keyboardType="dialpad"
                    onChangeText={onChange}
                    borderLess
                  />
                )}
                name="nadaPrice"
              />
              {formState?.errors?.nadaPrice && (
                <Text style={styles?.error}>NADA Price is required</Text>
              )}
              <View style={styles?.centerSpaceContainer}>
                <Text style={styles?.placeholderText}>Published</Text>
                <SwitchToggle
                  switchOn={marketingUpdateData?.isPublished}
                  onPress={() =>
                    handleDataChange(
                      'isPublished',
                      !marketingUpdateData?.isPublished,
                    )
                  }
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
                    borderColor: marketingUpdateData?.isPublished
                      ? Colors?.parrot
                      : Colors?.lightWhite,
                    borderWidth: wp(0.3),
                  }}
                  circleStyle={styles?.circleStyle}
                />
              </View>
              <View style={styles?.centerSpaceContainer}>
                <Text style={styles?.placeholderText}>Spot Light</Text>
                <SwitchToggle
                  switchOn={marketingUpdateData?.SpotLight}
                  onPress={() =>
                    handleDataChange('SpotLight', !marketingUpdateData?.SpotLight)
                  }
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
                    borderColor: marketingUpdateData?.SpotLight
                      ? Colors?.parrot
                      : Colors?.lightWhite,
                    borderWidth: wp(0.3),
                  }}
                  circleStyle={styles?.circleStyle}
                />
              </View>
              <View style={styles?.centerSpaceContainer}>
                <Text style={styles?.placeholderText}>Featured</Text>
                <SwitchToggle
                  switchOn={marketingUpdateData?.Featured}
                  onPress={() =>
                    handleDataChange('Featured', !marketingUpdateData?.Featured)
                  }
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
                    borderColor: marketingUpdateData?.Featured
                      ? Colors?.parrot
                      : Colors?.lightWhite,
                    borderWidth: wp(0.3),
                  }}
                  circleStyle={styles?.circleStyle}
                />
              </View>
              <View style={styles?.centerSpaceContainer}>
                <Text style={styles?.placeholderText}>Certified</Text>
                <SwitchToggle
                  switchOn={marketingUpdateData?.Certified}
                  onPress={() =>
                    handleDataChange('Certified', !marketingUpdateData?.Certified)
                  }
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
                    borderColor: marketingUpdateData?.Certified
                      ? Colors?.parrot
                      : Colors?.lightWhite,
                    borderWidth: wp(0.3),
                  }}
                  circleStyle={styles?.circleStyle}
                />
              </View>
              <View style={styles?.centerSpaceContainer}>
                <Text style={styles?.placeholderText}>Low Mileage</Text>
                <SwitchToggle
                  switchOn={marketingUpdateData?.LowMileage}
                  onPress={() =>
                    handleDataChange('LowMileage', !marketingUpdateData?.LowMileage)
                  }
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
                    borderColor: marketingUpdateData?.LowMileage
                      ? Colors?.parrot
                      : Colors?.lightWhite,
                    borderWidth: wp(0.3),
                  }}
                  circleStyle={styles?.circleStyle}
                />
              </View>
              <View style={styles?.centerSpaceContainer}>
                <Text style={styles?.placeholderText}>Sold Published</Text>
                <SwitchToggle
                  switchOn={marketingUpdateData?.isSoldPublished}
                  onPress={() =>
                    handleDataChange(
                      'isSoldPublished',
                      !marketingUpdateData?.isSoldPublished,
                    )
                  }
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
                    borderColor: marketingUpdateData?.isSoldPublished
                      ? Colors?.parrot
                      : Colors?.lightWhite,
                    borderWidth: wp(0.3),
                  }}
                  circleStyle={styles?.circleStyle}
                />
              </View>
              <View style={styles?.centerSpaceContainer}>
                <Text style={styles?.placeholderText}>Show Highlights</Text>
                <SwitchToggle
                  switchOn={marketingUpdateData?.ShowHighLights}
                  onPress={() =>
                    handleDataChange(
                      'ShowHighLights',
                      !marketingUpdateData?.ShowHighLights,
                    )
                  }
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
                    borderColor: marketingUpdateData?.ShowHighLights
                      ? Colors?.parrot
                      : Colors?.lightWhite,
                    borderWidth: wp(0.3),
                  }}
                  circleStyle={styles?.circleStyle}
                />
              </View>
              <View style={styles?.centerSpaceContainer}>
                <Text style={styles?.placeholderText}>Show CARFAX</Text>
                <SwitchToggle
                  switchOn={marketingUpdateData?.ShowCarFaxReportLink}
                  onPress={() =>
                    handleDataChange(
                      'ShowCarFaxReportLink',
                      !marketingUpdateData?.ShowCarFaxReportLink,
                    )
                  }
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
                    borderColor: marketingUpdateData?.ShowCarFaxReportLink
                      ? Colors?.parrot
                      : Colors?.lightWhite,
                    borderWidth: wp(0.3),
                  }}
                  circleStyle={styles?.circleStyle}
                />
              </View>
              <View style={styles?.centerSpaceContainer}>
                <Text style={styles?.placeholderText}>Hide Car Fax Snapshot</Text>
                <SwitchToggle
                  switchOn={marketingUpdateData?.HideCarFaxSnapshot}
                  onPress={() =>
                    handleDataChange(
                      'HideCarFaxSnapshot',
                      !marketingUpdateData?.HideCarFaxSnapshot,
                    )
                  }
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
                    borderColor: marketingUpdateData?.HideCarFaxSnapshot
                      ? Colors?.parrot
                      : Colors?.lightWhite,
                    borderWidth: wp(0.3),
                  }}
                  circleStyle={styles?.circleStyle}
                />
              </View>
              <View style={styles?.centerSpaceContainer}>
                <Text style={styles?.placeholderText}>Frame Damage</Text>
                <SwitchToggle
                  switchOn={marketingUpdateData?.IsFrameDamage}
                  onPress={() =>
                    handleDataChange(
                      'IsFrameDamage',
                      !marketingUpdateData?.IsFrameDamage,
                    )
                  }
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
                    borderColor: marketingUpdateData?.IsFrameDamage
                      ? Colors?.parrot
                      : Colors?.lightWhite,
                    borderWidth: wp(0.3),
                  }}
                  circleStyle={styles?.circleStyle}
                />
              </View>
              <View style={styles?.centerSpaceContainer}>
                <Text style={styles?.placeholderText}>Reduced Price</Text>
                <SwitchToggle
                  switchOn={marketingUpdateData?.ReducedPrice}
                  onPress={() =>
                    handleDataChange(
                      'ReducedPrice',
                      !marketingUpdateData?.ReducedPrice,
                    )
                  }
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
                    borderColor: marketingUpdateData?.ReducedPrice
                      ? Colors?.parrot
                      : Colors?.lightWhite,
                    borderWidth: wp(0.3),
                  }}
                  circleStyle={styles?.circleStyle}
                />
              </View>
              <View style={styles?.centerSpaceContainer}>
                <Text style={styles?.placeholderText}>Local Trade</Text>
                <SwitchToggle
                  switchOn={marketingUpdateData?.LocalTrade}
                  onPress={() =>
                    handleDataChange('LocalTrade', !marketingUpdateData?.LocalTrade)
                  }
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
                    borderColor: marketingUpdateData?.LocalTrade
                      ? Colors?.parrot
                      : Colors?.lightWhite,
                    borderWidth: wp(0.3),
                  }}
                  circleStyle={styles?.circleStyle}
                />
              </View>
              <View style={styles?.centerSpaceContainer}>
                <Text style={styles?.placeholderText}>No Haggle Pricing</Text>
                <SwitchToggle
                  switchOn={marketingUpdateData?.NoHagglePricing}
                  onPress={() =>
                    handleDataChange(
                      'NoHagglePricing',
                      !marketingUpdateData?.NoHagglePricing,
                    )
                  }
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
                    borderColor: marketingUpdateData?.NoHagglePricing
                      ? Colors?.parrot
                      : Colors?.lightWhite,
                    borderWidth: wp(0.3),
                  }}
                  circleStyle={styles?.circleStyle}
                />
              </View>
              <View style={styles?.centerSpaceContainer}>
                <Text style={styles?.placeholderText}>Show CarGurus Link</Text>
                <SwitchToggle
                  switchOn={marketingUpdateData?.ShowCarGurusLink}
                  onPress={() =>
                    handleDataChange(
                      'ShowCarGurusLink',
                      !marketingUpdateData?.ShowCarGurusLink,
                    )
                  }
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
                    borderColor: marketingUpdateData?.ShowCarGurusLink
                      ? Colors?.parrot
                      : Colors?.lightWhite,
                    borderWidth: wp(0.3),
                  }}
                  circleStyle={styles?.circleStyle}
                />
              </View>
              {/* ==== */}
              <View style={styles?.centerSpaceContainer}>
                <Text style={styles?.placeholderText}>Sale Pending</Text>
                <SwitchToggle
                  switchOn={marketingUpdateData?.SalePending}
                  onPress={() =>
                    handleDataChange(
                      'SalePending',
                      !marketingUpdateData?.SalePending,
                    )
                  }
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
                    borderColor: marketingUpdateData?.SalePending
                      ? Colors?.parrot
                      : Colors?.lightWhite,
                    borderWidth: wp(0.3),
                  }}
                  circleStyle={styles?.circleStyle}
                />
              </View>
              {/* ==== */}
              <View style={styles?.centerSpaceContainer}>
                <Text style={styles?.placeholderText}>Show Auto Check Report</Text>
                <SwitchToggle
                  switchOn={marketingUpdateData?.ShowAutoCheckReport}
                  onPress={() =>
                    handleDataChange(
                      'ShowAutoCheckReport',
                      !marketingUpdateData?.ShowAutoCheckReport,
                    )
                  }
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
                    borderColor: marketingUpdateData?.ShowAutoCheckReport
                      ? Colors?.parrot
                      : Colors?.lightWhite,
                    borderWidth: wp(0.3),
                  }}
                  circleStyle={styles?.circleStyle}
                />
              </View>
              {/* ==== */}

              <View style={styles?.centerSpaceContainer}>
                <Text style={styles?.placeholderText}>Request Web Price</Text>
                <SwitchToggle
                  switchOn={marketingUpdateData?.RequestWebPrice}
                  onPress={() =>
                    handleDataChange(
                      'RequestWebPrice',
                      !marketingUpdateData?.RequestWebPrice,
                    )
                  }
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
                    borderColor: marketingUpdateData?.RequestWebPrice
                      ? Colors?.parrot
                      : Colors?.lightWhite,
                    borderWidth: wp(0.3),
                  }}
                  circleStyle={styles?.circleStyle}
                />
              </View>
              {/* ==== */}
              <View style={styles?.centerSpaceContainer}>
                <Text style={styles?.placeholderText}>Military Discount</Text>
                <SwitchToggle
                  switchOn={marketingUpdateData?.MilitaryDiscount}
                  onPress={() =>
                    handleDataChange(
                      'MilitaryDiscount',
                      !marketingUpdateData?.MilitaryDiscount,
                    )
                  }
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
                    borderColor: marketingUpdateData?.MilitaryDiscount
                      ? Colors?.parrot
                      : Colors?.lightWhite,
                    borderWidth: wp(0.3),
                  }}
                  circleStyle={styles?.circleStyle}
                />
              </View>
              {/* ==== */}
              <View style={styles?.centerSpaceContainer}>
                <Text style={styles?.placeholderText}>Warranty 3 Month OR 3000 Miles</Text>
                <SwitchToggle
                  switchOn={marketingUpdateData?.Warranty3MonthOR3000Miles}
                  onPress={() =>
                    handleDataChange(
                      'Warranty3MonthOR3000Miles',
                      !marketingUpdateData?.Warranty3MonthOR3000Miles,
                    )
                  }
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
                    borderColor: marketingUpdateData?.Warranty3MonthOR3000Miles
                      ? Colors?.parrot
                      : Colors?.lightWhite,
                    borderWidth: wp(0.3),
                  }}
                  circleStyle={styles?.circleStyle}
                />
              </View>
              {/* ==== */}
              <View style={styles?.centerSpaceContainer}>
                <Text style={styles?.placeholderText}>Hide Monroney Labels</Text>
                <SwitchToggle
                  switchOn={marketingUpdateData?.HideMoneyLabels}
                  onPress={() =>
                    handleDataChange(
                      'HideMoneyLabels',
                      !marketingUpdateData?.HideMoneyLabels,
                    )
                  }
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
                    borderColor: marketingUpdateData?.HideMoneyLabels
                      ? Colors?.parrot
                      : Colors?.lightWhite,
                    borderWidth: wp(0.3),
                  }}
                  circleStyle={styles?.circleStyle}
                />
              </View>
              {/* ==== */}
              <View style={styles?.centerSpaceContainer}>
                <Text style={styles?.placeholderText}>Show Carketa</Text>
                <SwitchToggle
                  switchOn={marketingUpdateData?.ShowGreenLightInspection}
                  onPress={() =>
                    handleDataChange(
                      'ShowGreenLightInspection',
                      !marketingUpdateData?.ShowGreenLightInspection,
                    )
                  }
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
                    borderColor: marketingUpdateData?.ShowGreenLightInspection
                      ? Colors?.parrot
                      : Colors?.lightWhite,
                    borderWidth: wp(0.3),
                  }}
                  circleStyle={styles?.circleStyle}
                />
              </View>
              {/* ==== */}

              <Text style={styles?.placeholderText}>Title Status</Text>
              <DropDown
                data={data?.titleStatusEnum}
                placeholder={'Select'}
                value={marketingUpdateData?.TitleStatusID}
                labelField="description"
                valueField="titleStatusID"
                setValue={value => handleDataChange('TitleStatusID', value)}
                rightIcon
              />
              <Text style={styles?.placeholderText}>Warranty</Text>
              <DropDown
                data={data?.warranty}
                placeholder={'Select'}
                value={marketingUpdateData?.WarrantyTypeID}
                labelField="description"
                valueField="warrantyTypeID"
                setValue={value => handleDataChange('WarrantyTypeID', value)}
                rightIcon
              />
            </KeyboardAwareScrollView>
            <View style={{ width: '100%', paddingHorizontal: 16, paddingVertical: 4}}>
              <PrimaryButton
                title="Save"
                onPress={handleSubmit(onSave)}
              />
            </View>
          </>
        )}
        <LoadingModal visible={isModal} />
      </View>
    </>
  );
};

export default Marketing;
