import {useIsFocused, useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  PermissionsAndroid,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import Modal from 'react-native-modal';
import Toast from 'react-native-toast-message';
import {useDispatch, useSelector} from 'react-redux';
import {icn} from '../../Assets/icn';
import Header from '../../Components/Header';
import InputBox from '../../Components/InputBox';
import PrimaryButton from '../../Components/PrimaryButton';
import {
  expense,
  expenseTransaction,
  getVendors,
  updateExpenseTransaction,
  vehicleImages,
} from '../../Services/apis/APIs';
import {Colors} from '../../Theme/Colors';
import {hp, wp, WINDOW_WIDTH, rfs} from '../../Theme/Responsiveness';
import {styles} from './style';
import LoadingModal from '../../Components/LoadingModal';
import QRCode from 'react-native-qrcode-svg';
import RNFS from 'react-native-fs';
import ViewShot from 'react-native-view-shot';
import Barcode from '@kichiyaki/react-native-barcode-generator';


const CarExpenses = ({route}:any) => {
  const params = route?.params;
  const viewShotRef = useRef(null);
  const barCodeRef = useRef(null);
  const user = useSelector((state: any) => state) => state?.userReducer?.user);
  const {item} = params;
  const today = new Date();
  const dispatch = useDispatch();
  const [showPlusOptions, setShowPlusOptions] = useState<any>(false);
  const navigation: any = useNavigation();
  const [isBarVisible, setIsBarVisible] = useState<any>(false);
  const [isQrVisible, setIsQrVisible] = useState<any>(false);
  const [isMemoVisible, setIsMemoVisible] = useState<any>(false);
  const [optionsVisible, setOptionsVisible] = useState<any>(false);
  const [optionsVisibleIndex, setOptionsVisibleIndex] = useState<any>(-1);
  const [newValue, setNewValue] = useState<any>(null);
  const [methodSelected, setMethodSelected] = useState<any>('Expense');
  const [selectedTab, setSelectedTab] = useState<any>('Expenses');
  const {control, handleSubmit, setValue, formState, getValues} = useForm();
  const [isLoading, setIsLoading] = useState<any>(true);
  const [vendersData, setVendersData] = useState<any>([]);
 const [vehicleImagesData, setVehicleImagesData] = useState<any>>({});
  const isFocused = useIsFocused();
  const [isPlusClicked, setIsPlusClicked] = useState<any>(false);
  const [expenses, setExpenses] = useState<any>([]);
  const [flattenedExpenses, setFlattenedExpenses] = useState<any>([]);
  const [selectedItem, setSelectedItem] = useState<any>>({});
  const [page, setPage] = useState<any>(1);
  const [hasMore, setHasMore] = useState<any>(true);
  const [isNewPageLoading, setIsNewPageLoading] = useState<any>(false);
  const [dropdownPage, setDropdownPage] = useState<any>(1);
  const [dropdownHasMore, setDropdownHasMore] = useState<any>(true);
  const [isDropdownPageLoading, setIsDropdownPageLoading] = useState<any>(false);
  const flatListRef = useRef<FlatList>(null);
  const [totalExpense, setTotalExpense] = useState<any>(0);
  const [currentFlatListData, setCurrentFlatListData] = useState<any>([]);
  const [isSaving, setIsSaving] = useState<any>(false);
  const [isReferenceFocused, setIsReferenceFocused] = useState<any>(false);
  const [paymentOptionIndex, setPaymentOptionIndex] = useState<any>(-1);
  const isTablet = WINDOW_WIDTH >= 600;
  const deletedKeys = useRef({
    expense: [],
    payment: [],
  });

  const getVehicleImages = async (vehicleId: number) => {
    try {
      const payload = {
        VehicleID: vehicleId,
      };
      const response = await vehicleImages(payload);
      const data = response?.data;
      
      // Check if data is an array of images or a single image object
      let images:any[] = [];
      if (Array.isArray(data)) {
        images = data;
      } else if (data?.data && Array.isArray(data?.data)) {
        images = data?.data;
      } else if (data?.images && Array.isArray(data?.images)) {
        images = data?.images;
      } else if (data?.imagePath) {
        images = [data];
      }
      
      // Store images for this vehicle
      setVehicleImagesData(prev => ({
        ...prev,
        [vehicleId]: images
      }));
    } catch (error: any) {
      console.error('Error fetching vehicle images:', error);
    }
  };

  const requestStoragePermission = async () => {
    try {
      const permission = PermissionsAndroid?.PERMISSIONS?.WRITE_EXTERNAL_STORAGE;

      const hasPermission = await PermissionsAndroid?.check(permission);
      if (hasPermission) {
        return true;
      }

      const status = await PermissionsAndroid?.request(permission);
      console.log(status);
      return status === 'granted';
    } catch (error: any) {
      console.warn(err);
      return false;
    }
  };

  const saveToGallery = async (uri:any) => {
    try {
      const hasPermission = await requestStoragePermission();
      // if (!hasPermission) {
      //   Toast?.show({
      //     type: 'error',
      //     text1: 'Error',
      //     text2: 'Need storage permission',
      //   });
      //   return;
      // }

      const fileName = `QRCode_${Date.now()}.png`;
      const destPath = `${RNFS?.PicturesDirectoryPath}/${fileName}`;

      await RNFS?.copyFile(uri, destPath);
      Toast?.show({
        type: 'success',
        text1: 'Success',
        text2: 'Photo saved successfully!',
      });
    } catch (error: any) {
      console.error('Error saving image: ', error);
    } finally {
      setIsQrVisible(false);
      setIsBarVisible(false);
    }
  };

  const captureAndSaveQRCode = (): any => {
    viewShotRef?.current
      .capture()
      .then((uri:any) => {
        console.log('Captured image URI: ', uri);
        saveToGallery(uri);
      })
      .catch (error: any) => {
        console.error('Error capturing image: ', error);
      });
  };
  const captureAndSaveBarCode = (): any => {
    barCodeRef?.current
      .capture()
      .then((uri:any) => {
        // console.log('Captured image URI: ', uri);
        saveToGallery(uri);
      })
      .catch (error: any) => {
        console.error('Error capturing image: ', error);
      });
  };

  const formatDate = (dateString = today: any): any => {
    const date = new Date(dateString);
    const day = String(date?.getDate()).padStart(2, '0');
    const month = String(date?.getMonth() + 1).padStart(2, '0');
    const year = date?.getFullYear();

    return `${day}/${month}/${year}`;
  };



  const getDayDifference = (startDateString: any) => {
    const startDate = new Date(startDateString);
    const currentDate = new Date();
  
    // Calculate time difference in milliseconds
    const timeDiff = currentDate?.getTime() - startDate?.getTime();
  
    // Convert milliseconds to days
    const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
    return dayDiff;
  };


  const resetFlatList = (): any => {
    flatListRef?.current?.scrollToOffset({animated: true, offset: 0});
  };
  const handleMemoPlus = (): any => {
    if (selectedTab == 'Expenses') {
      (navigation as any).navigate('AddExpense', {
        setSelectedItem: setSelectedItem,
        carName: `${params?.item?.vehicleInfo?.ModelYear}${' '}${
          params?.item?.vehicleInfo?.Make
        }${' '}${params?.item?.vehicleInfo?.Model}`,
      });
    } else setShowPlusOptions(!showPlusOptions);
  };
  const handleChequePress = (): any => {
    setShowPlusOptions(false);
    (navigation as any).navigate('Cheque', {
      setSelectedItem: setSelectedItem,
    });
  };
  const handleEftPress = (): any => {
    setShowPlusOptions(false);
    (navigation as any).navigate('PaymentMethodBoilerPlate', {
      from: 'EFT',
      setSelectedItem: setSelectedItem,
    });
  };
  const handleCashPress = (): any => {
    setShowPlusOptions(false);
    (navigation as any).navigate('PaymentMethodBoilerPlate', {
      from: 'Cash',
      setSelectedItem: setSelectedItem,
    });
  };
  const handlePayLetterPress = (): any => {
    setShowPlusOptions(false);
    (navigation as any).navigate('PaymentMethodBoilerPlate', {
      from: 'Pay Letter',
      setSelectedItem: setSelectedItem,
    });
  };
  const handleCardPress = (): any => {
    setShowPlusOptions(false);
    (navigation as any).navigate('CreditCard', {setSelectedItem: setSelectedItem});
  };
  const onDiscardPress = (): any => {
    setSelectedTab('Expenses');
    setIsPlusClicked(false);
    setSelectedItem({});
    setValue('referenceNo', '');
    setNewValue(undefined);
    setMethodSelected('Expense');
    Object.keys(deletedKeys?.current).forEach(key => {
      deletedKeys?.current[key] = [];
    });
  };
  const handleExpenseDelete = (item: any, index: any) => {
    setOptionsVisible(false);
    setOptionsVisibleIndex(-1);
    setSelectedItem(prevData => ({
      ...prevData: any, expense: prevData?.expense?.filter(
        (item, expenseIndex: any) => expenseIndex !== index,
      ),
    }));
    if (item?.hasOwnProperty('TransactionID')) {
      deletedKeys?.current['expense']?.push(item?.VehicleExpenseID);
    }
  };
  const handlePaymentDelete = (item: any, index: any) => {
    setOptionsVisible(false);
    setOptionsVisibleIndex(-1);
    setSelectedItem(prevData => ({
      ...prevData: any, payment: prevData?.payment?.filter(
        (item, paymentIndex: any) => paymentIndex !== index,
      ),
    }));
    if (item?.hasOwnProperty('TransactionID')) {
      deletedKeys?.current['payment']?.push(item?.TransactionID);
    }
  };

  const handleExpenseEdit = (item: any, index: any) => {
    {
      setOptionsVisible(false);
      setOptionsVisibleIndex(-1);
      if (isPlusClicked) {
        navigation?.navigate('AddExpense', {
          item: item,
          itemIndex: index,
          setSelectedItem: setSelectedItem,
          carName: `${params?.item?.vehicleInfo?.ModelYear} ${params?.item?.vehicleInfo?.Make} ${params?.item?.vehicleInfo?.Model}`,
        });
      } else {
        setIsPlusClicked(true);
        resetFlatList();
      }
    }
  };

  const handlePaymentEdit = (item: any, index: any) => {
    setOptionsVisible(false);
    setPaymentOptionIndex(-1);
    if (item?.PaymentModeID == 3) {
      navigation?.navigate('Cheque', {
        item: item,
        itemIndex: index,
        setSelectedItem: setSelectedItem,
      });
    } else if (item?.PaymentModeID == 11 || item?.PaymentModeID == 4) {
      navigation?.navigate('CreditCard', {
        item: item,
        itemIndex: index,
        setSelectedItem: setSelectedItem,
      });
    } else if (
      item?.PaymentModeID == 5 ||
      item?.PaymentModeID == 6 ||
      item?.PaymentModeID == 17
    ) {
      navigation?.navigate('PaymentMethodBoilerPlate', {
        from:
          item?.PaymentModeID == 5
            ? 'EFT'
            : item?.PaymentModeID == 6
            ? 'Cash'
            : 'Pay Letter',
        item: item,
        itemIndex: index,
        setSelectedItem: setSelectedItem,
      });
    }
  };
  const onEndReached = (): any => {
    if (!isNewPageLoading && hasMore) {
      getExpenseList('footer');
    }
  };
  const onDropDownEndReached = (): any => {
    if (!isDropdownPageLoading && dropdownHasMore) {
      getVendersList('footer');
    }
  };
  const addExpenseTransaction = async (formData: any) => {
    if (!newValue) {
      Toast?.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select vendor',
      });
      return;
    }
    if (selectedItem?.expense?.length <= 0) {
      Toast?.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please add expenses',
      });
      return;
    }
    if (selectedItem?.payment?.length <= 0) {
      Toast?.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please add payments',
      });
      return;
    }
    try {
      setIsSaving(true);
      const payload = {
        BusinessID: newValue,
        isCredit: methodSelected === 'Credit' ? 1 : 0,
      };
      const expensesArrayPayload = selectedItem?.expense?.map(data => {
        return {
          VehicleExpenseTypeID: data?.VehicleExpenseTypeID,
          Description: data?.ExpenseDescription,
          VehicleID: params?.item?.vehicleInfo?.VehicleID,
          Cost: data?.ExpenseAmount,
          RefNO: data?.ReferenceNo,
        };
      });
      const paymentsArrayPayload = selectedItem?.payment?.map(data => {
        const result = {
          VehicleID: params?.item?.vehicleInfo?.VehicleID,
          PayerID: user?.id,
          DealershipID: params?.DealershipID,
          RefNo: formData?.referenceNo,
          ...data,
        };
        return result;
      });
      payload['expense'] = expensesArrayPayload;
      payload['payment'] = paymentsArrayPayload;
      const response = await expenseTransaction(payload);
      onDiscardPress();
      refreshExpenseList();
      // console.log('Resp: ', response?.data);
    } catch (error: any) {
      // console.log(error?.response);
      Toast?.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setIsSaving(false);
    }
  };
  const editExpenseTransaction = async (formData: any) => {
    if (!newValue) {
      Toast?.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select vendor',
      });
      return;
    }
    // if (selectedItem?.expense?.length <= 0) {
    //   Toast?.show({
    //     type: 'error',
    //     text1: 'Error',
    //     text2: 'Please add expenses',
    //   });
    //   return;
    // }
    // if (selectedItem?.payment?.length <= 0) {
    //   Toast?.show({
    //     type: 'error',
    //     text1: 'Error',
    //     text2: 'Please add payments',
    //   });
    //   return;
    // }
    try {
      setIsSaving(true);
      const payload = {
        BusinessID: newValue,
        isCredit: methodSelected === 'Credit' ? 1 : 0,
        TransactionID: selectedItem?.transactionID,
      };
      const expensesArrayPayload = selectedItem?.expense?.map(data => {
        return {
          VehicleExpenseTypeID: data?.VehicleExpenseTypeID,
          Description: data?.ExpenseDescription,
          VehicleID: params?.item?.vehicleInfo?.VehicleID,
          Cost: parseInt(data?.ExpenseAmount),
          RefNO: data?.ReferenceNo,
          ...(data?.VehicleExpenseID && {
            VehicleExpenseID: data?.VehicleExpenseID,
          }),
        };
      });
      const paymentsArrayPayload = selectedItem?.payment?.map(data => {
        const result = {
          VehicleID: params?.item?.vehicleInfo?.VehicleID,
          PayerID: user?.id,
          DealershipID: params?.DealershipID,
          RefNo: formData?.referenceNo,
          ...data,
        };
        return result;
      });
      payload['expense'] = expensesArrayPayload;
      payload['payment'] = paymentsArrayPayload;
      const keyArray = deletedKeys?.current;
      Object.keys(keyArray).forEach(key => {
        if (Array.isArray(keyArray[key]) && keyArray[key].length === 0) {
          delete keyArray[key];
        }
      });
      payload['deleted'] = keyArray;
      // console.log('Payload: ', JSON.stringify(payload));
      const response = await updateExpenseTransaction(payload);
      console.log( "this is response==============================> " ,response?.data);
      onDiscardPress();
      refreshExpenseList();
    } catch (error: any) { 
      console.log( "this is error" ,error);
      Toast?.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.message || 'Something went wrong!',
      });
    } finally {
      setIsSaving(false);
    }
  };
  const onSave = (formData: any) => {
    if (selectedItem?.hasOwnProperty('transactionID')) {
      editExpenseTransaction(formData);
    } else {
      addExpenseTransaction(formData);
    }
  };
  const getVendersList = async (from = '': any) => {
    if (!dropdownHasMore) return;
    try {
      if (from === 'footer') {
        setIsDropdownPageLoading(true);
      }
      const payload = {
        page: dropdownPage,
        pageSize: 50,
      };
      const response = await getVendors(payload);
      if (response?.data?.data?.length < 50) {
        setDropdownHasMore(false);
      }
      setVendersData(prevData => [...prevData, ...response?.data?.data]);
      setDropdownPage(pre => pre + 1);
    } catch (error: any) {
      Toast?.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setIsDropdownPageLoading(false);
    }
  };
  const getExpenseList = async (from = '': any) => {
    if (!hasMore) return;
    try {
      if (from === 'footer') {
        setIsNewPageLoading(true);
      }
      const payload = {
        page: page,
        limit: 15,
        vehicleID: item?.vehicleInfo?.VehicleID,
      };
      const response = await expense(payload);
      console.log('Resp: ', JSON.stringify(response?.data?.data));
      if (response?.data?.data?.length < 15) {
        setHasMore(false);
      }
      const flattenedExpenses = response?.data?.data?.flatMap(({BusinessID: any, expense}: any) =>
          expense?.map(exp => ({
            ...exp,
            BusinessID,
          })),
      );
      setExpenses(prevData => [...prevData, ...(response?.data?.data || [])]);
      setFlattenedExpenses(prevData => [
        ...prevData,
        ...(flattenedExpenses || []),
      ]);
      setPage(pre => pre + 1);
    } catch (error: any) {
      Toast?.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setIsNewPageLoading(false);
    }
  };
  const refreshExpenseList = async () => {
    try {
      setIsLoading(true);
      const payload = {
        page: 1,
        limit: 15,
        vehicleID: item?.vehicleInfo?.VehicleID,
      };
      const response = await expense(payload);
      console.log('Refresh resp: ', JSON.stringify(response?.data?.data));
      if (response?.data?.data?.length < 15) {
        setHasMore(false);
      }
      const flattenedExpenses = response?.data?.data?.flatMap(({BusinessID: any, expense}: any) =>
          expense?.map(exp => ({
            ...exp,
            BusinessID,
          })),
      );
      setExpenses(response?.data?.data || []);
      setFlattenedExpenses(flattenedExpenses || []);
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
  const fetchData = async () => {
    try {
      setIsLoading(true);
      await Promise?.all([getVendersList(), getExpenseList()]);
      
      // Fetch vehicle images if vehicle ID exists
      if (item?.vehicleInfo?.VehicleID) {
        getVehicleImages(item?.vehicleInfo?.VehicleID);
      }
    } finally {
      setIsLoading(false);
    }
  };
  const shouldShowButtons = (): any => {
    // Only show buttons when user is actively editing (isPlusClicked is true)
    if (!isPlusClicked) {
      return false;
    }
    
    // Check if there are expenses or payments added
    const hasExpenses = selectedItem?.expense && selectedItem?.expense?.length > 0;
    const hasPayments = selectedItem?.payment && selectedItem?.payment?.length > 0;
    
    // Check if there are deleted items
    const hasDeletedItems =
      deletedKeys?.current?.expense?.length > 0 ||
      deletedKeys?.current?.payment?.length > 0;

    return (hasExpenses || hasPayments || hasDeletedItems);
  };
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let totalSum;
    totalSum = selectedItem?.expense?.reduce((sum: any, obj: any) => sum + Number(obj?.ExpenseAmount || 0),
      0,
    );
    setTotalExpense(totalSum);
    setCurrentFlatListData(
      selectedTab == 'Expenses'
        ? isPlusClicked
          ? selectedItem?.expense
          : flattenedExpenses
        : selectedItem?.payment,
    );
  }, [isPlusClicked, selectedTab, selectedItem, flattenedExpenses]);

  useEffect(() => {
    const referenceNo = getValues('referenceNo');
    if (!referenceNo || referenceNo?.trim() === '')
      setValue('referenceNo', selectedItem?.payment?.[0]?.RefNo);
    if (!newValue) setNewValue(selectedItem?.BusinessID);
    setMethodSelected(selectedItem?.isCredit ? 'Credit' : 'Expense');
  }, [selectedItem]);
  const renderItem = ({item: any, index}: any) => {

    return (
      <ScrollView>
      <View style={[styles?.itemContainer, isTablet && styles?.tabletItemContainer]}>
        <View style={styles?.itemOptionSpaceContainer}>
          <View>
            <Text style={styles?.carName}>
              {params?.item?.vehicleInfo?.ModelYear}{' '}
              {params?.item?.vehicleInfo?.Make}{' '}
              {params?.item?.vehicleInfo?.Model}
            </Text>
            <Text style={styles?.date}>{formatDate(item?.TransactionDate)}</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setOptionsVisibleIndex(optionsVisibleIndex == index ? -1 : index);
              if (!isPlusClicked) {
                const selectedObj = expenses?.find(exp => {
                  return exp?.transactionID === item?.TransactionID;
                });
                setSelectedItem(selectedObj);
              }
            }}>
            <Image
              source={icn?.largeOption}
              style={styles?.optionIcn}
              resizeMode="contain"
            />
          </TouchableOpacity>
          {optionsVisibleIndex == index && (<View style={[styles?.optionContainer]}>
              <TouchableOpacity
                onPress={() => handleExpenseEdit(item, index)}
                style={styles?.optionSpaceContainer}>
                <Text style={styles?.itemOptionName}>Edit</Text>
                <Image
                  source={icn?.singlePen}
                  style={styles?.forwardIcn}
                  tintColor={Colors?.greyIcn}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              {isPlusClicked && (<TouchableOpacity
                  onPress={() => handleExpenseDelete(item, index)}
                  style={styles?.optionSpaceContainer}>
                  <Text style={styles?.itemOptionName}>Delete</Text>
                  <Image
                    source={icn?.delete}
                    style={styles?.forwardIcn}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              )}
              {!isPlusClicked && (<TouchableOpacity
                  onPress={() => {
                    setOptionsVisible(false);
                    setOptionsVisibleIndex(-1);
                    navigation?.navigate('TransactionLog', {
                      payments: selectedItem?.payment,
                      vehicleItem: params?.item,
                    });
                  }}
                  style={styles?.optionSpaceContainer}>
                  <Text style={styles?.itemOptionName}>Log</Text>
                  <Image
                    source={icn?.chain}
                    style={styles?.chainIcn}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        <View style={styles?.vehicleRefContainer}>
          <Text style={styles?.optionText}>
            Reference No:
            <Text style={styles?.valueText}> {item?.ReferenceNo}</Text>
          </Text>
          <Text style={[styles?.optionText, {maxWidth: wp(55)}]}>
            Description:
            <Text style={styles?.descriptionText}>
              {' '}
              {item?.ExpenseDescription}
            </Text>
          </Text>
        </View>
        <View
          style={[
            styles?.searchContainer,
            {marginTop: hp(1?.4)},
            styles?.negativeIndex,
          ]}>
          <TouchableOpacity style={styles?.repairContainer}>
            <Text style={styles?.repairText}>{item?.ExpenseType || 'Repair'}</Text>
          </TouchableOpacity>
          <View style={styles?.primaryPriceContainer}>
            <Text style={styles?.priceTxt}>${item?.ExpenseAmount}</Text>
          </View>
        </View>
      </View>
      </ScrollView>
    );
  };
  const renderPaymentItem = ({item: any, index}: any) => {
    return (
      <View style={[styles?.itemContainer]}>
        <View style={styles?.rowSpaceContainer}>
          <View>
            <Text style={styles?.carName}>
              {params?.item?.vehicleInfo?.ModelYear}{' '}
              {params?.item?.vehicleInfo?.Make}{' '}
              {params?.item?.vehicleInfo?.Model}
            </Text>
            <Text style={styles?.date}>{formatDate(item?.TransactionDate)}</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setPaymentOptionIndex(paymentOptionIndex == index ? -1 : index);
            }}>
            <Image
              source={icn?.largeOption}
              style={styles?.optionIcn}
              resizeMode="contain"
            />
          </TouchableOpacity>
          {paymentOptionIndex == index && (<View style={[styles?.optionContainer]}>
              <TouchableOpacity
                onPress={() => handlePaymentEdit(item, index)}
                style={styles?.optionSpaceContainer}>
                <Text style={styles?.itemOptionName}>Edit</Text>
                <Image
                  source={icn?.singlePen}
                  style={styles?.forwardIcn}
                  tintColor={Colors?.greyIcn}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handlePaymentDelete(item, index)}
                style={styles?.optionSpaceContainer}>
                <Text style={styles?.itemOptionName}>Delete</Text>
                <Image
                  source={icn?.delete}
                  style={styles?.forwardIcn}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View
          style={[
            styles?.rowContainer,
            {marginTop: hp(1), position: 'relative', zIndex: -1},
          ]}>
          {(item?.PaymentModeID == 3 ||
            item?.PaymentModeID == 11 ||
            item?.PaymentModeID == 4) && (
            <Text style={styles?.optionText}>
              {item?.PaymentModeID == 3 ? 'Cheque No: ' : 'Card No: '}
              <Text style={styles?.valueText}>
                {item?.PaymentModeID == 3 ? item?.CheckNo : item?.CardNumber}
              </Text>
            </Text>
          )}
          {item?.Bank_Name && (
            <Text style={styles?.optionText}>
              Bank:
              <Text style={styles?.valueText}> {item?.Bank_Name}</Text>
            </Text>
          )}
        </View>
        <Text style={styles?.optionText}>
          Memo:
          <Text style={styles?.descriptionText}> {item?.Memo}</Text>
        </Text>
        <View style={[styles?.searchContainer, {marginTop: hp(1?.4)}]}>
          <TouchableOpacity style={styles?.repairContainer}>
            <Text style={styles?.repairText}>
              {item?.PaymentModeID == 3
                ? 'Cheque'
                : item?.PaymentModeID == 11
                ? 'Credit Card'
                : item?.PaymentModeID == 5
                ? 'EFT'
                : item?.PaymentModeID == 6
                ? 'Cash'
                : 'Pay Letter'}
            </Text>
          </TouchableOpacity>
          <View style={styles?.primaryPriceContainer}>
            <Text style={styles?.priceTxt}>${item?.Amount}</Text>
          </View>
        </View>
      </View>
    );
  };
  const renderFooter = (): any => {
    return (
      isNewPageLoading &&
      !isLoading && (
        <ActivityIndicator
          size={Platform?.OS == 'android' ? wp(11) : 'large'}
          style={{marginBottom: hp(3)}}
          color="#0000ff"
        />
      )
    );
  };


  console.log('this is item ===============>: ', item);


  return (
    <KeyboardAvoidingView 
      style={styles?.mainView}
      behavior={Platform?.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform?.OS === 'ios' ? 0 : 0}
    >
      <Pressable
        disabled={
          !showPlusOptions &&
          optionsVisibleIndex === -1 &&
          paymentOptionIndex === -1
        }
        onPress={() => {
          setShowPlusOptions(false);
          setOptionsVisibleIndex(-1);
          setPaymentOptionIndex(-1);
        }}
        style={{flex: 1}}>
      <View style={[styles?.header, {height: isTablet ? hp(45) : hp(33)},{paddingHorizontal:isTablet?wp(3?.5):wp(1)}]}>
        <View style={styles?.subHeader}>
          <Header
            title="Expenses"
            leftIcn={icn?.back}
            leftIcnStyle={styles?.backIcn}
            blueBackground
            onRightFirstIconPress={() => setIsBarVisible(true)}
            onRightSecondIconPress={() => setIsQrVisible(true)}
            rightFirstIcn={icn?.barCode}
            rightSecondIcn={icn?.qrCode}
            onLeftIconPress={() => navigation?.goBack()}
          />
          <View style={[styles?.subHeaderContainer,{marginTop:isTablet?hp(-2?.5):hp(2)}]}>
            <View style={styles?.rowContainer}>
              <Image
                // source={{uri: item?.vehicleInfo?.imagePath}}

                source={
                  vehicleImagesData[item?.vehicleInfo?.VehicleID]?.[0]?.imagePath
                    ? { uri: vehicleImagesData[item?.vehicleInfo?.VehicleID][0].imagePath }
                    : item?.vehicleInfo?.imageLink 
                      ? { uri: item?.vehicleInfo?.imageLink }
                      : icn?.car // Fallback to local image
                }
                style={[styles?.carImg,{width:isTablet?wp(19):wp(18),height:isTablet?hp(17):hp(9)}]}
                resizeMode="cover"
                onError={(error: any) => {
                  console.log('Image load error for vehicle:', item?.vehicleInfo?.VehicleID);
                  console.log('Error details:', error);
                }}
                onLoad={() => {
                  console.log('Image loaded successfully for vehicle:', item?.vehicleInfo?.VehicleID);
                }}
              />
              <View style={styles?.carInfoContainer}>
                <Text style={[styles?.whiteCarName,{fontSize:isTablet?rfs(22):rfs(14),paddingHorizontal:isTablet?wp(1):wp(-1)}]}>
                  {item?.vehicleInfo?.ModelYear} {item?.vehicleInfo?.Make}{' '}
                  {item?.vehicleInfo?.Model}{' '}
                </Text>
                <Text
                  style={[styles?.whiteDescription, {fontSize: isTablet ? rfs(20) : rfs(15)}]}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {item?.vehicleInfo?.TechnologyPackage
                    ?.split('/')
                    .map((part:any) => part?.trim())
                    .filter(Boolean)
                    .join(' / ')}
                </Text>
                <Text style={[styles?.carOptionText,{fontSize:isTablet?rfs(22):rfs(15)}]}>
                  VIN:
                  <Text style={[styles?.carValueText,{fontSize:isTablet?rfs(20):rfs(17)}]}>
                    {' '}
                    {item?.vehicleInfo?.VIN}{' '}
                  </Text>
                </Text>
              </View>
            </View>
            <View style={[styles?.priceContainer,{marginLeft:isTablet?wp(1):wp(-14)}]}>
              <Text style={styles?.priceTxt}>${item?.DisplayPrice?.toFixed(2)} </Text>
            </View>
          </View>
          <View style={[styles?.carPropsContainer,{marginTop:isTablet?hp(1):hp(-1?.5)},{flexDirection:isTablet?'row':'row'},{justifyContent:isTablet?'space-between':'flex-start'},{flexWrap:isTablet?'nowrap':'wrap'}]}>
            <View style={[styles?.carPropContainer,{columnGap:isTablet?wp(10):wp(0?.1)}]}>
              <Text style={[styles?.carOptionText,{fontSize:isTablet?rfs(22):rfs(16)}] }>
                Mileage:
                <Text style={[styles?.carValueText,{fontSize:isTablet?rfs(20):rfs(16)}]}>
                  {' '}
                  {item?.vehicleInfo?.Mileage}{' '}
                </Text>
              </Text>
             {
              item?.canChangePrice &&
              <Text style={[styles?.carOptionText,{fontSize:isTablet?rfs(22):rfs(16)}] }>
                Cost:
                <Text style={[styles?.carValueText,{fontSize:isTablet?rfs(20):rfs(16)}]}> ${item?.Total} </Text>
              </Text>
             }
              <Text style={[styles?.carOptionText,{fontSize:isTablet?rfs(22):rfs(16)}] }>
                Age :
                <Text style={[styles?.carValueText,{fontSize:isTablet?rfs(20):rfs(16)}]  }>
                  {' '}
                  {getDayDifference(item?.costInfo?.PurchaseDate)}
                  
                </Text>
              </Text>
              <Text style={[styles?.carOptionText,{fontSize:isTablet?rfs(22):rfs(16)}] }>
                Color:
                <Text style={[styles?.carValueText,{fontSize:isTablet?rfs(20):rfs(16)}]}>
                  {' '}
                  {item?.vehicleInfo?.Color}{' '}
                </Text>
              </Text>
              <Text style={[styles?.carOptionText,{fontSize:isTablet?rfs(22):rfs(16)}] }>
                Stk#:
                <Text style={[styles?.carValueText,{fontSize:isTablet?rfs(20):rfs(16)}]}>
                  {' '}
                  {item?.vehicleInfo?.StockNumber}{' '}
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </View>
      {!isLoading && isPlusClicked && (
        isTablet ? (
          <ScrollView
            style={styles?.subHeader}
            contentContainerStyle={{paddingBottom: hp(20), paddingHorizontal: wp(4)}}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles?.greyContainer,{flexDirection:'row',justifyContent:'space-between',width:wp(93),marginLeft:wp(-5)}]}>
            <View
              style={[
                styles?.centerSpaceContainer,
                {
                  alignItems: formState?.errors?.referenceNo
                    ? undefined
                    : 'center',
                },
              ]}>
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ width: wp(49) }}>
                    <Text style={[styles?.placeholderText, { fontSize: rfs(24),marginLeft:isTablet?wp(1):wp(0) }]}>New</Text>
                <Dropdown
                      style={[styles?.dropdown, { width: wp(24) }]}
                  containerStyle={styles?.dropdownContainer}
                  placeholderStyle={styles?.placeholderStyle}
                  itemTextStyle={styles?.itemTextStyle}
                  selectedTextStyle={styles?.selectedTextStyle}
                  activeColor={Colors?.dullWhite}
                  flatListProps={{
                    onEndReached: onDropDownEndReached,
                    onEndReachedThreshold: 0?.7,
                  }}
                  showsVerticalScrollIndicator={false}
                  data={vendersData}
                  maxHeight={hp(20)}
                  labelField="BusinessName"
                  valueField="BusinessID"
                  placeholder={'Select'}
                  value={newValue}
                  onChange={item => {
                    setNewValue(item?.BusinessID);
                  }}
                  renderRightIcon={() => (
                    <Image
                      source={icn?.downArrow}
                      style={styles?.arrow}
                      resizeMode="contain"
                    />
                  )}
                />
              </View>
                  <View style={{ width: wp(24),marginLeft:wp(-24) }}>
                    <Text style={[styles?.placeholderText,{fontSize:rfs(24),marginLeft:wp(1)}]}>Reference No</Text>
                <Controller
                  control={control}
                      rules={{ required: 'Reference No is required' }}
                      render={({ field: { onChange, value } }: any) => (
                    <InputBox
                      placeholder="123456"
                          placeholderTextColor={'grey'}
                      numberOfCharacter={20}
                      value={value}
                      blueBorder
                          style={{ height: hp(12?.5) }}
                          inputStyle={{ padding: 0, fontSize: wp(2?.8) }}
                      onChangeText={onChange}
                          onFocus={() => setIsReferenceFocused(true)}
                          onBlur={() => setIsReferenceFocused(false)}
                          width={wp(22)}
                        />
                      )}
                      name="referenceNo"
                    />
                    {formState?.errors?.referenceNo && (
                      <Text style={styles?.error}>Reference No is required</Text>
                    )}
                  </View>
                </View>
              </View>
              <View style={styles?.searchContainer}>
                <View style={styles?.rowContainer}>
                  <View style={styles?.rowContainer}>
                    <TouchableOpacity
                      style={styles?.rowContainer}
                      onPress={() => setMethodSelected('Expense')}>
                      <View style={styles?.outerCircle}>
                        {methodSelected == 'Expense' && (
                          <View style={styles?.blueDot}></View>
                        )}
                      </View>
                      <Text style={[styles?.blackPlaceholderText,{fontSize:rfs(26)}]}>Expense</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles?.rowContainer}>
                    <TouchableOpacity
                      style={styles?.rowContainer}
                      onPress={() => setMethodSelected('Credit')}>
                      <View style={styles?.outerCircle}>
                        {methodSelected == 'Credit' && (
                          <View style={styles?.blueDot}></View>
                        )}
                      </View>
                      <Text style={[styles?.blackPlaceholderText,{fontSize:rfs(26)}]}>Credit</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles?.primaryPriceContainer}>
                  <Text style={[styles?.priceTxt,{marginBottom:hp(-1)}]}>${totalExpense}</Text>
                </View>
              </View>
            </View>
            <View style={styles?.tabContainer}>
              <TouchableOpacity
                onPress={() => setSelectedTab('Expenses')}
                style={
                  selectedTab == 'Expenses'
                    ? styles?.blueTabContainer
                    : styles?.tabSubContainer
                }>
                <View style={styles?.rowContainer}>
                  <Image
                    source={icn?.dollar}
                    style={styles?.crossIcn}
                    resizeMode="contain"
                    tintColor={
                      selectedTab == 'Expenses' ? Colors?.white : Colors?.greyIcn
                    }
                  />
                  <Text
                    style={[
                      styles?.tabText,
                      {
                        color:
                          selectedTab == 'Expenses'
                            ? Colors?.white
                            : Colors?.greyIcn,
                      },
                    ]}>
                    Expenses
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSelectedTab('Payment')}
                style={
                  selectedTab == 'Payment'
                    ? styles?.blueTabContainer
                    : styles?.tabSubContainer
                }>
                <View style={styles?.rowContainer}>
                  <Image
                    source={icn?.payment}
                    style={styles?.crossIcn}
                    resizeMode="contain"
                    tintColor={
                      selectedTab == 'Payment'
                        ? Colors?.white
                        : Colors?.greyIcn
                    }
                  />
                  <Text
                    style={[
                      styles?.tabText,
                      {
                        color:
                          selectedTab == 'Payment'
                            ? Colors?.white
                            : Colors?.greyIcn,
                      },
                    ]}>
                    Payment
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles?.searchContainer}>
              <Text style={styles?.titleText}>Memo</Text>
              <View>
                {showPlusOptions && (
                  <View style={styles?.flexEnd}>
                    <View style={styles?.plusOptionsContainer}>
                      <TouchableOpacity style={styles?.option}>
                        <Text style={styles?.optionName}>Add Payment</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleChequePress}
                        style={styles?.whiteOption}>
                        <Text style={styles?.optionName}>Cheque</Text>
                        <Image
                          source={icn?.forward}
                          style={styles?.forwardIcn}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleCardPress}
                        style={styles?.whiteOption}>
                        <Text style={styles?.optionName}>Card</Text>
                        <Image
                          source={icn?.forward}
                          style={styles?.forwardIcn}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleEftPress}
                        style={styles?.whiteOption}>
                        <Text style={styles?.optionName}>EFT</Text>
                        <Image
                          source={icn?.forward}
                          style={styles?.forwardIcn}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleCashPress}
                        style={styles?.whiteOption}>
                        <Text style={styles?.optionName}>Cash</Text>
                        <Image
                          source={icn?.forward}
                          style={styles?.forwardIcn}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handlePayLetterPress}
                        style={styles?.whiteOption}>
                        <Text style={styles?.optionName}>Pay Letter</Text>
                        <Image
                          source={icn?.forward}
                          style={styles?.forwardIcn}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                <TouchableOpacity
                  onPress={handleMemoPlus}
                  style={styles?.rowContainer}>
                  <Image
                    resizeMode="contain"
                    source={icn?.squarePlus}
                    style={styles?.squarePlus}
                  />
                </TouchableOpacity>
              </View>
            </View>
            {selectedTab === 'Expenses' ? (selectedItem?.expense?.length > 0 ? (
                selectedItem?.expense?.map((item: any, idx: any) => renderItem({ item, index: idx }))
              ) : (
                <View style={styles?.emptyGreyContainer}>
                  <Text style={styles?.noRecordText}>No Expense Recorded</Text>
                  <Text style={styles?.noRecordInfoText}>
                    Click at <Text style={styles?.noRecordInfoBoldText}>+</Text> to record your expenses
                  </Text>
                </View>
              )
            ) : (selectedItem?.payment?.length > 0 ? (
                selectedItem?.payment?.map((item: any, idx: any) => renderPaymentItem({ item, index: idx }))
              ) : (
                <View style={styles?.emptyGreyContainer}>
                  <Text style={styles?.noRecordText}>No Payment Recorded</Text>
                  <Text style={styles?.noRecordInfoText}>
                    Click at <Text style={styles?.noRecordInfoBoldText}>+</Text> to record your payments
                  </Text>
                </View>
              )
            )}
          </ScrollView>
        ) : (
          <View style={styles?.subHeader}>
            <View style={styles?.greyContainer}>
              <View
                style={[
                  styles?.centerSpaceContainer,
                  {
                    alignItems: formState?.errors?.referenceNo
                      ? undefined
                      : 'center',
                  },{width:isTablet?wp(20):wp(43)},{padding:isTablet?wp(2):wp(0?.5)}
                ]}>
{/* mobile */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', columnGap: wp(2) }}>
                  <View style={{ width: wp(43) }}>
                    <Text style={[styles?.placeholderText, { fontSize: rfs(17) }]}>New</Text>
                    <Dropdown
                      style={[styles?.dropdown, { width: '100%' }]}
                      containerStyle={styles?.dropdownContainer}
                      placeholderStyle={styles?.placeholderStyle}
                      itemTextStyle={styles?.itemTextStyle}
                      selectedTextStyle={styles?.selectedTextStyle}
                      activeColor={Colors?.dullWhite}
                      flatListProps={{
                        onEndReached: onDropDownEndReached,
                        onEndReachedThreshold: 0?.7,
                      }}
                      showsVerticalScrollIndicator={false}
                      data={vendersData}
                      maxHeight={hp(20)}
                      labelField="BusinessName"
                      valueField="BusinessID"
                      placeholder={'Select'}
                      value={newValue}
                      onChange={item => {
                        setNewValue(item?.BusinessID);
                      }}
                      renderRightIcon={() => (
                        <Image
                          source={icn?.downArrow}
                          style={styles?.arrow}
                          resizeMode="contain"
                        />
                      )}
                    />
                  </View>
                  <View style={{ width: wp(43) }}>
                    <Text style={[styles?.placeholderText,{ fontSize: rfs(17) }]}>Reference No</Text>
                    <Controller
                      control={control}
                      rules={{ required: 'Reference No is required' }}
                      render={({ field: { onChange, value } }: any) => (
                        <InputBox
                          placeholder="123456"
                          numberOfCharacter={20}
                          value={value}
                          blueBorder
                          style={{ height: hp(4?.5) }}
                          inputStyle={{ padding: 0, fontSize: wp(3?.1) }}
                          onChangeText={onChange}
                          onFocus={() => setIsReferenceFocused(true)}
                          onBlur={() => setIsReferenceFocused(false)}
                      width={wp(43)}
                    />
                  )}
                  name="referenceNo"
                />
                {formState?.errors?.referenceNo && (
                  <Text style={styles?.error}>Reference No is required</Text>
                )}
                  </View>
              </View>
            </View>
            <View style={styles?.searchContainer}>
              <View style={styles?.rowContainer}>
                <View style={styles?.rowContainer}>
                  <TouchableOpacity
                    style={styles?.rowContainer}
                    onPress={() => setMethodSelected('Expense')}>
                    <View style={styles?.outerCircle}>
                      {methodSelected == 'Expense' && (
                        <View style={styles?.blueDot}></View>
                      )}
                    </View>
                    <Text style={styles?.blackPlaceholderText}>Expense</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles?.rowContainer}>
                  <TouchableOpacity
                    style={styles?.rowContainer}
                    onPress={() => setMethodSelected('Credit')}>
                    <View style={styles?.outerCircle}>
                      {methodSelected == 'Credit' && (
                        <View style={styles?.blueDot}></View>
                      )}
                    </View>
                    <Text style={styles?.blackPlaceholderText}>Credit</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles?.primaryPriceContainer}>
                <Text style={styles?.priceTxt}>${totalExpense}</Text>
              </View>
            </View>
          </View>
          <View style={styles?.tabContainer}>
            <TouchableOpacity
              onPress={() => setSelectedTab('Expenses')}
              style={
                selectedTab == 'Expenses'
                  ? styles?.blueTabContainer
                  : styles?.tabSubContainer
              }>
              <View style={styles?.rowContainer}>
                <Image
                  source={icn?.dollar}
                  style={styles?.crossIcn}
                  resizeMode="contain"
                  tintColor={
                    selectedTab == 'Expenses' ? Colors?.white : Colors?.greyIcn
                  }
                />
                <Text
                  style={[
                    styles?.tabText,
                    {
                      color:
                        selectedTab == 'Expenses'
                          ? Colors?.white
                          : Colors?.greyIcn,
                    },
                  ]}>
                  Expenses
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedTab('Payment')}
              style={
                selectedTab == 'Payment'
                  ? styles?.blueTabContainer
                  : styles?.tabSubContainer
              }>
              <View style={styles?.rowContainer}>
                <Image
                  source={icn?.payment}
                  style={styles?.crossIcn}
                  resizeMode="contain"
                  tintColor={
                      selectedTab == 'Payment'
                        ? Colors?.white
                        : Colors?.greyIcn
                  }
                />
                <Text
                  style={[
                    styles?.tabText,
                    {
                      color:
                        selectedTab == 'Payment'
                          ? Colors?.white
                          : Colors?.greyIcn,
                    },
                  ]}>
                  Payment
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles?.searchContainer}>
            <Text style={styles?.titleText}>Memo</Text>
            <View>
              {showPlusOptions && (
                <View style={styles?.flexEnd}>
                  <View style={styles?.plusOptionsContainer}>
                    <TouchableOpacity style={styles?.option}>
                      <Text style={styles?.optionName}>Add Payment</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleChequePress}
                      style={styles?.whiteOption}>
                      <Text style={styles?.optionName}>Cheque</Text>
                      <Image
                        source={icn?.forward}
                        style={styles?.forwardIcn}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleCardPress}
                      style={styles?.whiteOption}>
                      <Text style={styles?.optionName}>Card</Text>
                      <Image
                        source={icn?.forward}
                        style={styles?.forwardIcn}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleEftPress}
                      style={styles?.whiteOption}>
                      <Text style={styles?.optionName}>EFT</Text>
                      <Image
                        source={icn?.forward}
                        style={styles?.forwardIcn}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleCashPress}
                      style={styles?.whiteOption}>
                      <Text style={styles?.optionName}>Cash</Text>
                      <Image
                        source={icn?.forward}
                        style={styles?.forwardIcn}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handlePayLetterPress}
                      style={styles?.whiteOption}>
                      <Text style={styles?.optionName}>Pay Letter</Text>
                      <Image
                        source={icn?.forward}
                        style={styles?.forwardIcn}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              <TouchableOpacity
                onPress={handleMemoPlus}
                style={styles?.rowContainer}>
                <Image
                  resizeMode="contain"
                  source={icn?.squarePlus}
                  style={styles?.squarePlus}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        )
      )}
      {isLoading ? (
        <ActivityIndicator
          color={Colors?.primary}
          style={styles?.activityIndicator}
          size={Platform?.OS == 'android' ? wp(11) : 'large'}
        />
      ) : flattenedExpenses?.length > 0 ||
        selectedItem?.expense?.length > 0 ||
        selectedItem?.payment?.length > 0 ? (<View
          style={[
            currentFlatListData?.length > 0
              ? styles?.subContainer
              : styles?.subHeader, {
              position: 'relative', zIndex: -1, }: any, ]}>
          {currentFlatListData?.length > 0 ? (
            <FlatList
              ref={flatListRef}
              contentContainerStyle={styles?.content}
              style={styles?.list}
              data={currentFlatListData}
              showsVerticalScrollIndicator={false}
              renderItem={
                selectedTab == 'Expenses' ? renderItem : renderPaymentItem
              }
              keyExtractor={(item, index: any) => index?.toString()}
              ListFooterComponent={!isPlusClicked ? renderFooter : undefined}
              onEndReached={!isPlusClicked ? onEndReached : undefined}
              onEndReachedThreshold={!isPlusClicked ? 0?.6 : undefined}
            />
          ) : (
            isTablet ? (
              <ScrollView
                contentContainerStyle={{flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}
                showsVerticalScrollIndicator={false}
              >
            <View style={styles?.emptyGreyContainer}>
              <Text style={styles?.noRecordText}>
                {selectedTab == 'Expenses' ? 'Expenses' : 'Payment'} Recorded
              </Text>
              <Text style={styles?.noRecordInfoText}>
                Click at <Text style={styles?.noRecordInfoBoldText}>+</Text> to
                record your expenses
              </Text>
            </View>
              </ScrollView>
            ) : (
              <View style={styles?.emptyGreyContainer}>
                <Text style={styles?.noRecordText}>
                   {selectedTab == 'Expenses' ? 'Expense' : 'Payment'} Recorded
                </Text>
                <Text style={styles?.noRecordInfoText}>
                  Click at <Text style={styles?.noRecordInfoBoldText}>+</Text> to
                  record your expenses
                </Text>
              </View>
            )
          )}
        </View>
      ) : (
        <View style={styles?.placeholderContainer}>
          <View style={styles?.placeholderGreyContainer}>
            <Text style={styles?.noRecordText}>No Expense Recorded</Text>
            <Text style={styles?.noRecordInfoText}>
              Click at <Text style={styles?.noRecordInfoBoldText}>+</Text> to
              record your expenses
            </Text>
          </View>
        </View>
      )}
      {shouldShowButtons() && (
        
        <View style={styles?.bottomContainer}>
          <View style={styles?.bottomButtonContainer}>
            <TouchableOpacity
              onPress={onDiscardPress}
              style={styles?.bottomButton}>
              <Text style={styles?.buttonText}>Discard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit(onSave)}
              style={styles?.bottomPrimaryButton}>
              <Text style={styles?.buttonPrimaryText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {!isPlusClicked && (<View style={styles?.plusIcn}>
          <TouchableOpacity
            onPress={() => {
              setSelectedItem({});
              setIsPlusClicked(true);
              setValue('referenceNo', '');
              setNewValue(undefined);
              setMethodSelected('Expense');
            }}>
            <Image
              source={icn?.addPlus}
              style={styles?.plus}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      )}
      <Modal backdropOpacity={0?.5} isVisible={isBarVisible}>
        <View style={styles?.modalView}>
          <View style={styles?.modalContainer}>
            <View>
              <View style={styles?.rowSpaceContainer}>
                <Text style={styles?.modelText}>Bar Code</Text>
                <TouchableOpacity onPress={() => setIsBarVisible(false)}>
                  <Image
                    source={icn?.cross}
                    style={styles?.crossIcn}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
              <ViewShot
                ref={barCodeRef}
                options={{format: 'png', quality: 1?.0}}
                style={{alignSelf: 'center', marginVertical: hp(2)}}>
                <Barcode
                  value={item?.vehicleInfo?.VIN}
                  format="CODE128"
                  maxWidth={wp(80)}
                  height={hp(6)}
                />
              </ViewShot>
              <PrimaryButton
                style={styles?.button}
                onPress={captureAndSaveBarCode}
                title="Save to Gallery"
              />
            </View>
          </View>
        </View>
      </Modal>
      <Modal backdropOpacity={0?.5} isVisible={isQrVisible}>
        <View style={styles?.modalView}>
          <View style={styles?.modalContainer}>
            <View>
              <View style={styles?.rowSpaceContainer}>
                <Text style={styles?.modelText}>QR Code</Text>
                <TouchableOpacity onPress={() => setIsQrVisible(false)}>
                  <Image
                    source={icn?.cross}
                    style={styles?.crossIcn}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
              <ViewShot
                ref={viewShotRef}
                options={{format: 'png', quality: 1?.0}}
                style={{alignSelf: 'center', marginVertical: hp(2)}}>
                <QRCode
                  value={item?.vehicleInfo?.VIN}
                  size={wp(40)}
                  color="black"
                  backgroundColor="white"
                />
              </ViewShot>
              <PrimaryButton
                style={styles?.button}
                onPress={captureAndSaveQRCode}
                title="Save to Gallery"
              />
            </View>
          </View>
        </View>
      </Modal>
      <Modal backdropOpacity={0?.5} isVisible={isMemoVisible}>
        <View style={styles?.modalView}>
          <View style={styles?.modalContainer}>
            <View>
              <View style={styles?.rowSpaceContainer}>
                <Text style={styles?.modelText}>Memo</Text>
                <TouchableOpacity onPress={() => setIsMemoVisible(false)}>
                  <Image
                    source={icn?.cross}
                    style={styles?.crossIcn}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles?.memoText}>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
      <LoadingModal visible={isSaving} />
      </Pressable>
    </KeyboardAvoidingView>
  );
};

export default CarExpenses;
