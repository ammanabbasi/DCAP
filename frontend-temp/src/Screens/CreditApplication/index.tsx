import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import {useDispatch, useSelector} from 'react-redux';
import {icn} from '../../Assets/icn';
import Header from '../../Components/Header';
import {Colors} from '../../Theme/Colors';
import {hp, wp} from '../../Theme/Responsiveness';
import {Address} from './Address';
import {BasicInfo} from './BasicInfo';
import {CreditApp} from './CreditApp';
import {Employment} from './Employment';
import {Reference} from './Reference';
import {styles} from './style';
import {useForm, FormProvider} from 'react-hook-form';
import {
  creditApplication,
  getCreditApplication,
} from '../../Services/apis/APIs';
import Toast from 'react-native-toast-message';
import LoadingModal from '../../Components/LoadingModal';
import {
  flattenApplicationData,
  unflattenApplicationData,
} from '../../Utils/helperFunctions';

const tabsData = [
  {name: 'Basic Info', icn: icn.creditProfile},
  {name: 'Credit App', icn: icn.creditBalance},
  {name: 'Address', icn: icn.address},
  {name: 'Employment', icn: icn.employment},
  {name: 'Reference', icn: icn.reference},
];

const CreditApplication = ({route}: any): any => {
  const params = route?.params;
  const dispatch = useDispatch();
  const navigation: any = useNavigation();
  const methods = useForm();
  const resetForm = methods.reset;
  const {loading} = useSelector((state: any) => state?.dropdownReducer);
  const [buyerSelectedTab, setBuyerSelectedTab] = useState<string>('Basic Info');
  const [coBuyerSelectedTab, setCoBuyerSelectedTab] = useState<string>('Basic Info');
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
  const [isPrintModalVisible, setIsPrintModalVisible] = useState<boolean>(false);
  const [isBuyerSelected, setIsBuyerSelected] = useState<boolean>(true);
  const [creditData, setCreditData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const selectedTab = isBuyerSelected ? buyerSelectedTab : coBuyerSelectedTab;
  const handleTabSelect = tabName => {
    if (isBuyerSelected) {
      setBuyerSelectedTab(tabName);
    } else {
      setCoBuyerSelectedTab(tabName);
    }
  };

  const getTrade = async () => {
    console.log('params is : ' , params);
    try {
      setIsLoading(true);
      const payload = {
        customerID: params?.item?.customerID,
        coBuyerID: params?.item?.coBuyerID,
      };
      console.log('payload is : ' , payload);
      
      const response = await getCreditApplication(payload);
      console.log('response is : ' , response?.data);
      setCreditData(response?.data);
      const formData = flattenApplicationData(response?.data);
      resetForm(formData);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSave = useCallback(async () => {
    try {
      setIsModalLoading(true);
      const allValues = methods.getValues();
      const payload = unflattenApplicationData(allValues);
      console.log('payload is for creditApplication: ' , payload);
      const response = await creditApplication(payload);
      console.log('response is for creditApplication: ' , response?.data);
      navigation.goBack();
    } catch (error: any) {
      console.log('Error: ', error?.response?.data);
      Toast.show({
        type: 'error',
        text1: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setIsModalLoading(false);
    }
  }, [methods, creditApplication, setIsModalLoading, unflattenApplicationData]);

  const renderTabs = ({item, index}: {item: any, index: number}) => {
    return (
      <TouchableOpacity
        onPress={() => handleTabSelect(item?.name)}
        style={[
          styles.screenTabContainer,
          {
            backgroundColor:
              selectedTab == item?.name ? Colors.primary : Colors.dullWhite,
          },
        ]}>
        <View style={styles.centerRowContainer}>
          <Image
            source={item?.icn}
            style={styles.tabIcn}
            resizeMode="contain"
            tintColor={
              selectedTab == item?.name ? Colors.white : Colors.greyIcn
            }
          />
          <Text
            style={[
              styles.tabText,
              {
                color:
                  selectedTab == item?.name ? Colors.white : Colors.greyIcn,
              },
            ]}>
            {item?.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderContent = (): any => {
    if (isBuyerSelected) {
      switch (buyerSelectedTab) {
        case 'Basic Info':
          return (
            <BasicInfo
              data={creditData?.buyer}
              onSave={onSave}
              userType="buyer"
            />
          );
        case 'Credit App':
          return (
            <CreditApp
              userType="buyer"
              data={creditData?.buyer}
              onSave={onSave}
              onPrintPress={() => setIsPrintModalVisible(true)}
            />
          );
        case 'Address':
          return (
            <Address
              data={creditData?.buyer}
              onSave={onSave}
              userType="buyer"
            />
          );
        case 'Employment':
          return (
            <Employment
              data={creditData?.buyer}
              onSave={onSave}
              userType="buyer"
            />
          );
        case 'Reference':
          return (
            <Reference
              data={creditData?.buyer}
              onSave={onSave}
              userType="buyer"
            />
          );
        default:
          return null;
      }
    } else {
      switch (coBuyerSelectedTab) {
        case 'Basic Info':
          return (
            <BasicInfo
              data={creditData?.coBuyer}
              onSave={onSave}
              userType="coBuyer"
            />
          );
        case 'Credit App':
          return (
            <CreditApp
              userType="coBuyer"
              data={creditData?.coBuyer}
              onSave={onSave}
              onPrintPress={() => setIsPrintModalVisible(true)}
            />
          );
        case 'Address':
          return (
            <Address
              data={creditData?.coBuyer}
              onSave={onSave}
              userType="coBuyer"
            />
          );
        case 'Employment':
          return (
            <Employment
              data={creditData?.coBuyer}
              onSave={onSave}
              userType="coBuyer"
            />
          );
        case 'Reference':
          return (
            <Reference
              data={creditData?.coBuyer}
              onSave={onSave}
              userType="coBuyer"
            />
          );
        default:
          return null;
      }
    }
  };

  useEffect(() => {
    getTrade();
  }, []);

  return (
    <View style={styles.mainView}>
      <Header
        title="Credit Application"
        leftIcn={icn.back}
        style={styles.subContainer}
        leftIcnStyle={styles.backIcn}
        onLeftIconPress={() => navigation.goBack()}
      />
      {isLoading || loading ? (
        <ActivityIndicator
          color={Colors.primary}
          style={styles.activityIndicator}
          size={Platform.OS == 'android' ? wp(11) : 'large'}
        />
      ) : (
        <>
          <View style={styles.subContainer}>
            <View style={styles.rowView}>
              <TouchableOpacity
                onPress={() => setIsBuyerSelected(true)}
                style={[
                  styles.portion,
                  {
                    borderBottomWidth: isBuyerSelected ? wp(0.3) : wp(0),
                    borderColor: Colors.primary,
                  },
                ]}>
                <Text
                  style={[
                    styles.portionText,
                    {
                      color: isBuyerSelected ? Colors.primary : Colors.black,
                    },
                  ]}>
                  Buyer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsBuyerSelected(false)}
                style={[
                  styles.portion,
                  {
                    borderBottomWidth: isBuyerSelected ? wp(0) : wp(0.3),
                    borderColor: Colors.primary,
                  },
                ]}>
                <Text
                  style={[
                    styles.portionText,
                    {
                      color: isBuyerSelected ? Colors.black : Colors.primary,
                    },
                  ]}>
                  Co Buyer
                </Text>
              </TouchableOpacity>
            </View>
            <FlatList
              style={{marginVertical: hp(2)}}
              data={tabsData}
              renderItem={renderTabs}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
          <FormProvider {...methods}>{renderContent()}</FormProvider>
          <Modal backdropOpacity={0.5} isVisible={isPrintModalVisible}>
            <View style={styles.modalContainer}>
              <View style={styles.centerSpaceContainer}>
                <Text style={styles.modelText}>Print</Text>
                <TouchableOpacity onPress={() => setIsPrintModalVisible(false)}>
                  <Image
                    source={icn.cross}
                    style={styles.crossIcn}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.modelLayoutContainer}>
                <View style={styles.centerRowContainer}>
                  <Image
                    source={icn.page}
                    style={styles.pageIcn}
                    resizeMode="contain"
                  />
                  <Text style={styles.layoutText}>Layout A</Text>
                </View>
                <Image
                  source={icn.forward}
                  style={styles.forwardIcn}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.modelLayoutContainer}>
                <View style={styles.centerRowContainer}>
                  <Image
                    source={icn.page}
                    style={styles.pageIcn}
                    resizeMode="contain"
                  />
                  <Text style={styles.layoutText}>Layout B</Text>
                </View>
                <Image
                  source={icn.forward}
                  style={styles.forwardIcn}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.modelLayoutContainer}>
                <View style={styles.centerRowContainer}>
                  <Image
                    source={icn.page}
                    style={styles.pageIcn}
                    resizeMode="contain"
                  />
                  <Text style={styles.layoutText}>Layout C</Text>
                </View>
                <Image
                  source={icn.forward}
                  style={styles.forwardIcn}
                  resizeMode="contain"
                />
              </View>
            </View>
          </Modal>
        </>
      )}
      <LoadingModal visible={isModalLoading} />
    </View>
  );
};

export default CreditApplication;
