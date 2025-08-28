import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { img } from '../../Assets/img';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Model from '../Model';
import TryAgain from '../../Components/TryAgain';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
  FlatList as RnFlatList,
  RefreshControl,
  Linking,
  ScrollView,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { Dropdown } from 'react-native-element-dropdown';
import { FlatList } from 'react-native-gesture-handler';
import Modal from 'react-native-modal';
import { Menu } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import { icn } from '../../Assets/icn';
import BottomSheetInput from '../../Components/BottomSheetInput';
import Header from '../../Components/Header';
import InputBox from '../../Components/InputBox';
import LoadingModal from '../../Components/LoadingModal';
import PrimaryButton from '../../Components/PrimaryButton';
import Searchbar from '../../Components/Searchbar';
import {
  getVehiclesByMake,
  searchVehicles,
  toggleVehicleFeature,
  toggleVehicleIsPublished,
  toggleVehicleSpotLight,
  vehicleFilter,
  deleteVehicle,
  returnVehicle,
  vehicleZipImages,
  vehicleImages,
} from '../../Services/apis/APIs';
import { Colors } from '../../Theme/Colors';
import { hp, wp } from '../../Theme/Responsiveness';
import { styles } from './style';
import { debounce } from 'lodash';
import DropDown from '../../Components/DropDown';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { storage } from '../../redux/mmkv/storage';
import { CONFIG } from '../../config/buildConfig';
const dropdownData = [
  { label: 'Option', value: 'Value' },
  { label: 'Option', value: 'Value' },
  { label: 'Option', value: 'Value' },
  { label: 'Option', value: 'Value' },
  { label: 'Option', value: 'Value' },
  { label: 'Option', value: 'Value' },
];
const filtersData = [
  {
    name: 'Stock In',
  },
  {
    name: 'Purchase',
  },
  {
    name: 'Sort',
  },
  {
    name: 'Vehicle',
  },
  {
    name: 'Vehicle Other',
  },
  {
    name: 'Marketing',
  },
];
const CarModelList = ({ route }: { route: any }) => {
  const params = route?.params;
  const dispatch = useDispatch();
  const [buyerGuideFormatValue, setBuyerGuideFormatValue] = useState<any>(null);
  const [buyersGuideValue, setBuyersGuideValue] = useState<any>(null);
  const [windowStickerValue, setWindowStickerValue] = useState<any>(null);
  const navigation: any = useNavigation();
  const [isPrintModalVisible, setIsPrintModalVisible] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const { data, loading, error } = useSelector((state: any) => state?.dropdownReducer);
  const [date, setDate] = useState<any>(new Date());
  const [open, setOpen] = useState<boolean>(false);
  const snapPoints = useMemo(() => ['49%', '75%'], []);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState<boolean>(false);
  const [isNoImages, setIsNoImages] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('Stock In');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [vehicleData, setVehicleData] = useState<any[]>([]);
  const isFocused = useIsFocused();
  const [pressedItem, setPressedItem] = useState<any>();
  const { control, handleSubmit, trigger, formState, resetField } = useForm();
  const [selectedId, setSelectedId] = useState<any>(null);
  const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [hasFilterMore, setHasFilterMore] = useState<boolean>(true);
  const filterPage = useRef(1);
  const [isNewPageLoading, setIsNewPageLoading] = useState<boolean>(false);
  const [searchedData, setSearchedData] = useState<any[] | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [filterData, setFilterData] = useState<any>({});
  const [isFilterApplied, setIsFilterApplied] = useState<boolean>(false);
  const [selectedPurchaseDate, setSelectedPurchaseDate] = useState<Date | undefined>();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false);
  const [isReturnModalVisible, setIsReturnModalVisible] = useState<boolean>(false);
  const [allVehicleCount, setAllVehicleCount] = useState<number>(0);
  const [liveVehicleCount, setLiveVehicleCount] = useState<number>(0);
  const [inprogressVehicleCount, setInprogressVehicleCount] = useState<number>(0);
  const [selectedTab, setSelectedTab] = useState<string>('ALL');
  const [inProgressPage, setInProgressPage] = useState<number>(1);
  const [livePage, setLivePage] = useState<number>(1);
  const [liveVehicles, setLiveVehicles] = useState<any[]>([]);
  const [inProgressVehicles, setInProgressVehicles] = useState<any[]>([]);
  const [hasMoreLive, setHasMoreLive] = useState<boolean>(true);
  const [hasMoreInProgress, setHasMoreInProgress] = useState<boolean>(true);
  const [showTryAgain, setShowTryAgain] = useState<boolean>(false);
  const openMenu = (): any => setIsMenuVisible(true);
  const closeMenu = (): any => {
    setIsMenuVisible(false);
  };
  const bottomSheetRef = useRef<any>(null);
  const handleExpandPress = (): any => {
    setIsBottomSheetVisible(true);
    bottomSheetRef.current?.expand();
  };
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1 && isBottomSheetVisible) {
        setIsBottomSheetVisible(false);
      } else if (index !== -1 && !isBottomSheetVisible) {
        setIsBottomSheetVisible(true);
      }
    },
    [isBottomSheetVisible],
  );


  const getVehiclesData = async (from = '') => {
    // setRefreshing(false);
    console.log("this is refreshing", refreshing)
    if (!hasMore && !refreshing) return;
    console.log("================== after 2 ====================")
    if (selectedTab !== 'ALL' && !refreshing) return;
    // Setup for aborting the request after 20s
    const controller = new AbortController();
    let timeoutId: NodeJS.Timeout | null = null;
    let didTimeout = false;

    try {
      if (from === 'footer') {
        setIsNewPageLoading(true);
      }
      if (!refreshing && from !== 'footer') setIsLoading(true);
      
      // Start 20s timeout
      timeoutId = setTimeout(() => {
       if(isLoading || isNewPageLoading || refreshing) {
        setIsLoading(false);
        setIsNewPageLoading(false);
        setRefreshing(false);
        didTimeout = true;
        controller.abort();
        setShowTryAgain(true);
       }
      }, 20000);

      const payload = {
        makeID: params?.makeId,
        page: page,
        pageSize: 15,
        signal: controller.signal, // Pass abort signal if supported
      };

      // getVehiclesByMake may not support signal, so we need to patch it in the service if needed
      // If not, you can add it to the axios config in the service
      const response = await getVehiclesByMake(payload);

      // If the request completed before timeout, clear the timeout
      if (timeoutId) clearTimeout(timeoutId);

      if (didTimeout) return; // If already timed out, don't process further

      if (!response?.data?.totalRecords || response?.data?.totalRecords < 15) {
        setHasMore(false);
      }
      const newVehicles = response?.data?.vehicles || [];
      console.log("this is new vehicles by make ====>  for selected tab", selectedTab, " =====>", newVehicles);

      setAllVehicleCount(response?.data?.totalRecords);
      setLiveVehicleCount(response?.data?.liveCount);
      setInprogressVehicleCount(response?.data?.inProgressCount);
      setVehicleData(prevData =>
        page === 1
          ? newVehicles
          : [...prevData, ...newVehicles],
      );
      setPage(pre => pre + 1);
    } catch (error: any) {
      if (timeoutId) clearTimeout(timeoutId);
      if (didTimeout) {
        // Already handled by setShowTryAgain above
        return;
      }
      setShowTryAgain(true);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
      setIsNewPageLoading(false);
      setShowTryAgain(false);
    }
  };


  const getInprogressVehicles = async (from = '') => {
    // setIsLoading(true);
    if (!hasMoreInProgress) return;
    if (from === 'footer') { setIsNewPageLoading(true) } else { setIsLoading(true) };
    const response = await vehicleFilter({
      page: inProgressPage,
      isPublished: false,
      makeID: params?.makeId
    });
    // console.log('Response is', response?.data);
    const newVehicles = response?.data?.vehicles || [];
    console.log("this is in progress vehicles  ====> ", newVehicles)
    console.log("this is new vehicle length  ====> ", newVehicles.length)
    console.log("this is in progress vehicles length  ====> ", inProgressVehicles.length)
    setInProgressVehicles((prevData: any) => [...prevData, ...newVehicles]);
    setInProgressPage(pre => pre + 1);


    if (newVehicles.length < 10) setHasMoreInProgress(false);

    // Use optimized batch loading for better performance


    if (from === 'footer') { setIsNewPageLoading(false) } else { setIsLoading(false) };
  };


  const getLiveVehicles = async (from = '') => {
    if (!hasMoreLive) return;
    if (from === 'footer') { setIsNewPageLoading(true) } else { setIsLoading(true) };
    const response = await vehicleFilter({
      page: livePage,
      isPublished: true,
      makeID: params?.makeId
    });
    // console.log('Response is', response?.data);
    const newVehicles = response?.data?.vehicles || [];
    console.log("this is live vehicles  ====> ", newVehicles)
    console.log("this is live vehicles length  ====> ", liveVehicles.length)
    setLiveVehicles((prevData: any) => [...prevData, ...newVehicles]);
    setLivePage(pre => pre + 1);
    if (newVehicles.length < 10) setHasMoreLive(false);


    if (from === 'footer') { setIsNewPageLoading(false) } else { setIsLoading(false) };
  };

  useEffect(() => {

    if ((refreshing || isFocused)) getVehiclesData();

  }, [refreshing, isFocused]);


  const handleTabClick = async (tab: string) => {

    console.log('selectedTab', tab);
    if (tab === 'ALL') {
      // Only load data if not already on ALL tab or if it's the first time
      if (selectedTab !== 'ALL') {
        setIsLoading(true);
        const response = await getVehiclesByMake({
          makeID: params?.makeId,
          page: 1,
          pageSize: 15,
        });
        if (!response?.data?.totalRecords || response?.data?.totalRecords < 15) {
          setHasMore(false);
        }
        const newVehicles = response?.data?.vehicles || [];
        setVehicleData(newVehicles);

        // Use optimized batch loading for better performance


        setIsLoading(false);
      }
    }
    if (tab === 'LIVE') {
      if (selectedTab !== 'LIVE') { getLiveVehicles(); }
    }
    if (tab === 'INPROGRESS') {
      if (selectedTab !== 'INPROGRESS') { getInprogressVehicles(); }

    }
  }

  const onRefresh = async () => {
    setIsFilterApplied(false);
    setRefreshing(true);
    setPage(1);
    filterPage.current = 1;
  };

  useEffect(() => {
    if (!isFocused) {
      setPage(1);
      setIsFilterApplied(false);
      filterPage.current = 1;
    }
  }, [isFocused]);

  const getDayDifference = (startDateString: any) => {
    const startDate = new Date(startDateString);
    const currentDate = new Date();

    // Calculate time difference in milliseconds
    const timeDiff = currentDate.getTime() - startDate.getTime();

    // Convert milliseconds to days
    const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    return dayDiff;
  };




  const handleToggleVehicleFeature = async (vehicleId: any) => {
    try {
      const payload = {
        vehicleId: vehicleId,
      };
      const currentData = isFilterApplied
        ? filteredData
        : searchQuery?.length > 0 && searchedData
          ? searchedData
          : selectedTab === 'ALL' ? vehicleData : selectedTab === 'LIVE' ? liveVehicles : inProgressVehicles;
      const updatedData = currentData.map((item: any) => {
        if (item?.vehicleInfo?.VehicleID === vehicleId) {
          return {
            ...item,
            vehicleInfo: {
              ...item.vehicleInfo,
              featured: !item?.vehicleInfo?.featured,
            },
          };
        }
        return item;
      });
      const response = await toggleVehicleFeature(payload);
      if (isFilterApplied) {
        setFilteredData(updatedData);
      } else if (searchQuery?.length > 0 && searchedData) {
        setSearchedData(updatedData);
      } else {
        if(selectedTab === 'ALL') setVehicleData(updatedData);
        if(selectedTab === 'LIVE') setLiveVehicles(updatedData);
        if(selectedTab === 'INPROGRESS') setInProgressVehicles(updatedData);
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
    }
  };
  const handleToggleVehicleSpotLight = async (vehicleId: any) => {
    try {
      const payload = {
        vehicleId: vehicleId,
      };
      const currentData = isFilterApplied
        ? filteredData
        : searchQuery?.length > 0 && searchedData
          ? searchedData
          : selectedTab === 'ALL' ? vehicleData : selectedTab === 'LIVE' ? liveVehicles : inProgressVehicles;
      const updatedData = currentData.map((item: any) => {
        if (item?.vehicleInfo?.VehicleID === vehicleId) {
          return {
            ...item,
            vehicleInfo: {
              ...item.vehicleInfo,
              spotLight: !item?.vehicleInfo?.spotLight,
            },
          };
        }
        return item;
      });
      const response = await toggleVehicleSpotLight(payload);
      if (isFilterApplied) {
        setFilteredData(updatedData);
      } else if (searchQuery?.length > 0 && searchedData) {
        setSearchedData(updatedData);
      } else {
        if(selectedTab === 'ALL') setVehicleData(updatedData);
        if(selectedTab === 'LIVE') setLiveVehicles(updatedData);
        if(selectedTab === 'INPROGRESS') setInProgressVehicles(updatedData);
      }
    } catch (erro: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
    }
  };



  const handleToggleVehicleIsPublished = async (vehicleId: any) => {
    try {
      const payload = { vehicleId };
       // Perform API call last
       await toggleVehicleIsPublished(payload);
  
      // Find current item
      const currentData = isFilterApplied
        ? filteredData
        : searchQuery?.length > 0 && searchedData
        ? searchedData
        : selectedTab === 'ALL'
        ? vehicleData
        : selectedTab === 'LIVE'
        ? liveVehicles
        : inProgressVehicles;
  
      const toggledVehicle = currentData.find(
        (item: any) => item?.vehicleInfo?.VehicleID === vehicleId
      );
  
      if (!toggledVehicle) return;
  
      const wasPublished = toggledVehicle?.vehicleInfo?.isPublished;
      const updatedVehicle = {
        ...toggledVehicle,
        vehicleInfo: {
          ...toggledVehicle.vehicleInfo,
          isPublished: !wasPublished,
        },
      };
  
      // Update counts
      if (wasPublished) {
        setLiveVehicleCount((prev: any) => prev - 1);
        setInprogressVehicleCount((prev: any) => prev + 1);
      } else {
        setLiveVehicleCount((prev: any) => prev + 1);
        setInprogressVehicleCount((prev: any) => prev - 1);
      }
  
      // Update list views
      if (isFilterApplied) {
        const updated = filteredData.map((item: any) =>
          item?.vehicleInfo?.VehicleID === vehicleId ? updatedVehicle : item
        );
        setFilteredData(updated);
      } else if (searchQuery?.length > 0 && searchedData) {
        const updated = searchedData.map((item: any) =>
          item?.vehicleInfo?.VehicleID === vehicleId ? updatedVehicle : item
        );
        setSearchedData(updated);
      } else {
        if (selectedTab === 'LIVE') {
          // Remove from live, add to inprogress
          setLiveVehicles((prev: any) =>
            prev.filter((item: any) => item?.vehicleInfo?.VehicleID !== vehicleId)
          );
          setInProgressVehicles((prev: any) => [updatedVehicle, ...prev]);
        } else if (selectedTab === 'INPROGRESS') {
          // Remove from inprogress, add to live
          setInProgressVehicles((prev: any) =>
            prev.filter((item: any) => item?.vehicleInfo?.VehicleID !== vehicleId)
          );
          setLiveVehicles((prev: any) => [updatedVehicle, ...prev]);
        } else if (selectedTab === 'ALL') {
          // Only update the flag inside ALL data
          const updated = vehicleData.map((item: any) =>
            item?.vehicleInfo?.VehicleID === vehicleId ? updatedVehicle : item
          );
          setVehicleData(updated);
        }
      }
  
     
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    }
  };
  



  // const handleToggleVehicleIsPublished = async (vehicleId: any) => {
  //   try {
  //     const payload = {
  //       vehicleId: vehicleId,
  //     };
  //     const currentData = isFilterApplied
  //       ? filteredData
  //       : searchQuery?.length > 0 && searchedData
  //         ? searchedData
  //         : selectedTab === 'ALL' ? vehicleData : selectedTab === 'LIVE' ? liveVehicles : inProgressVehicles;
  //     const updatedData = currentData.map((item: any) => {
  //       if (item?.vehicleInfo?.VehicleID === vehicleId) {

  //         console.log("this is item  ====> ", !item?.vehicleInfo?.isPublished)

  //         if(!item?.vehicleInfo?.isPublished === true) {
  //           setLiveVehicleCount(pre => pre + 1);
  //           setInprogressVehicleCount(pre => pre - 1);
  //         }
  //         else{
  //           setLiveVehicleCount(pre => pre - 1);
  //           setInprogressVehicleCount(pre => pre + 1);
  //         }

  //         return {
  //           ...item,
  //           vehicleInfo: {
  //             ...item.vehicleInfo,
  //             isPublished: !item?.vehicleInfo?.isPublished,
  //           },
  //         };
  //       }
  //       return item;
  //     });
  //     const response = await toggleVehicleIsPublished(payload);
  //     if (isFilterApplied) {
  //       setFilteredData(updatedData);
  //     } else if (searchQuery?.length > 0 && searchedData) {
  //       setSearchedData(updatedData);
  //     } else {
  //       if(selectedTab === 'ALL') setVehicleData(updatedData);
  //       if(selectedTab === 'LIVE') setLiveVehicles(updatedData);
  //       if(selectedTab === 'INPROGRESS') setInProgressVehicles(updatedData);
  //     }
  //   } catch (error: any) {
  //     Toast.show({
  //       type: 'error',
  //       text1: 'Error',
  //       text2: error?.response?.data?.message || 'Something went wrong!',
  //     });
  //   } finally {
  //   }
  // };
  
  
  
  
  const cleanObject = (obj: any) => {
    return Object.entries(obj).reduce((acc: any, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] =
          typeof value === 'object' && !Array.isArray(value)
            ? cleanObject(value)
            : value;
      }
      return acc;
    }, {});
  };
  const applyVehicleFilter = async (from = '') => {
    try {
      bottomSheetRef?.current?.close();
      const cleanData = cleanObject(filterData);
      if (selectedPurchaseDate) {
        cleanData['purchaseDate'] = selectedPurchaseDate;
      }
      cleanData['makeID'] = params?.makeId;
      cleanData['showWithNoImages'] = isNoImages;
      cleanData['page'] = filterPage.current;
      setIsFilterApplied(true);
      if (from === 'footer') {
        setIsNewPageLoading(true);
      }
      if (from !== 'footer') {
        setIsLoading(true);
      }
      const response = await vehicleFilter(cleanData);
      const selectedPageSize = filterData?.pageSize || 10;
      if (
        !response?.data?.totalRecords ||
        response?.data?.totalRecords < selectedPageSize
      ) {
        setHasFilterMore(false);
      }
      setFilteredData(prevData =>
        filterPage.current === 1
          ? response?.data?.vehicles || []
          : [...(prevData || []), ...(response?.data?.vehicles || [])],
      );
      filterPage.current = filterPage.current + 1;
    } catch (error: any) {
      console.error(error);
      setHasFilterMore(false);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setIsLoading(false);
      setIsNewPageLoading(false);
    }
  };
  const clearFilter = (): any => {
    setIsFilterApplied(false);
    setFilterData({});
    setIsNoImages(false);
    setSelectedPurchaseDate(undefined);
    filterPage.current = 1;
  };
  const handleVehicleRemove = async () => {
    setIsMenuVisible(false);
    setIsDeleteModalVisible(false);
    setIsLoading(true);
    const response = await deleteVehicle({
      vehicleId: pressedItem?.vehicleInfo?.VehicleID,
    });
    // console.log('THIS IS RESPONSE', response?.data);
    if (response?.data?.success) {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: response?.data?.message || 'Vehicle removed successfully',
      });
    }
    setIsLoading(false);
    navigation.goBack();
  };

  const handleDeletePress = (): any => {
    setIsMenuVisible(false);
    setIsDeleteModalVisible(true);
  };

  const handleReturnPress = (): any => {
    setIsMenuVisible(false);
    setIsReturnModalVisible(true);
  };

  const handleReturnVehicle = async () => {
    try {
      setIsLoading(true);
      setIsReturnModalVisible(false);
      const response = await returnVehicle({
        vehicleId: pressedItem?.vehicleInfo?.VehicleID,
        returnPrice: filterData?.returnPrice,
        arbitratedDate: selectedPurchaseDate?.toISOString()
      });
      if (response?.data?.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response?.data?.message || 'Vehicle returned successfully',
        });

        navigation.goBack();
      }
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
  const renderItem = ({ item: any, index: any, isTablet = false }: any) => {

    return (
      <View style={[styles.itemContainer]}>

        <View style={styles.rowSpaceContainer}>
          <View style={styles.rowContainer}>
            <TouchableOpacity
              onPress={() => {
                setPressedItem(item);
                setIsModalVisible(true);
              }}>
              <Image
                source={item?.vehicleInfo?.imageLink ? { uri: item?.vehicleInfo?.imageLink } : img.placeholder}
                style={styles.carImg}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <View style={styles.carInfoContainer}>
              <Text style={styles.carName}>
                {item?.vehicleInfo?.ModelYear} {item?.vehicleInfo?.Make}{' '}
                {item?.vehicleInfo?.Model}
              </Text>
              <Text style={styles.description}>
                {item?.vehicleInfo?.TechnologyPackage}

              </Text>
              {/* <TouchableOpacity
                onPress={() => {
                  setPressedItem(item);
                  setIsModalVisible(true);
                }}
                style={styles.detailContainer}>
                <Text style={styles.detailText}>View Detail</Text>
                <Image
                  source={icn.next}
                  style={styles.listForwardIcn}
                  resizeMode="contain"
                />
              </TouchableOpacity> */}
            </View>
          </View>
          {item?.canChangePrice && <View style={styles.priceContainer}>
            <Text style={styles.priceTxt}>${item?.DisplayPrice?.toFixed(2)}</Text>
          </View>}
        </View>
        <View>
          <View style={[styles.carPropContainer, { justifyContent: 'flex-start', gap: wp(1) }]}>
            <Text style={styles.optionText}>
              Stk#:
              <Text style={styles.valueText}>
                {' '}
                {item?.vehicleInfo?.StockNumber}
              </Text>
            </Text>
            <Text style={styles.optionText}>
              VIN:
              <Text style={styles.valueText}>
                {' '}
                {item?.vehicleInfo?.VIN}
              </Text>
            </Text>
            {(item?.canChangePrice && item?.vehicleCostLevel === false) &&
              <Text style={styles.optionText}>
                Cost:
                <Text style={styles.valueText}>
                  {' '}
                  ${item?.Total?.toFixed(2)}
                </Text>
              </Text>
            }
            {(item?.canChangePrice && item?.vehicleCostLevel) &&
              <TouchableOpacity
                onPress={() => {
                  // console.log('item =====================>', item);
                  navigation.navigate('CarCost', {
                    item: item,
                    DealershipID: item?.vehicleInfo?.DealershipID,
                  });
                }}>
                <Text style={[styles.optionText, { textDecorationLine: 'underline' }]}>
                  Cost:
                  <Text style={styles.valueText}>
                    {' '}
                    ${item?.Total?.toFixed(2)}
                  </Text>
                </Text>
              </TouchableOpacity>
            }
            <Text style={styles.optionText}>
              Color:
              <Text style={styles.valueText}>
                {' '}
                {item?.vehicleInfo?.Color}
              </Text>
            </Text>
            <Text style={styles.optionText}>
              Drive Type:
              <Text style={styles.valueText}>
                {' '}
                {item?.vehicleInfo?.DriveType}
              </Text>
            </Text>
            <Text style={styles.optionText}>
              Mileage:
              <Text style={styles.valueText}>
                {' '}
                {item?.vehicleInfo?.Mileage}
              </Text>
            </Text>
            {/* <Text style={styles.optionText}>
                    Cost:
                    <Text style={styles.valueText}>
                      {' '}
                      €{item?.Total?.toFixed(2)}
                    </Text>
                  </Text> */}
            <Text style={styles.optionText}>
              Age:
              <Text style={styles.valueText}>
                {' '}
                {getDayDifference(item?.costInfo?.PurchaseDate)} days
              </Text>
            </Text>
            <Text style={styles.optionText}>
              Live Status:
              <Text style={styles.valueText}>
                {' '}
                {item?.vehicleInfo?.isPublished ? 'Publish' : 'Inactive'}
              </Text>
            </Text>
          </View>


        </View>
        <View>
          <View style={styles.rowIcnContainer}>
            <TouchableOpacity
              onPress={() => {
                handleToggleVehicleIsPublished(item?.vehicleInfo?.VehicleID);
              }}>
              <Image
                source={
                  item?.vehicleInfo?.isPublished
                    ? icn.focussedUpperArrow
                    : icn.upperArrow
                }
                style={styles.bottomIcn}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                handleToggleVehicleFeature(item?.vehicleInfo?.VehicleID);
              }}>
              <Image
                source={
                  item?.vehicleInfo?.featured ? icn.focussedTick : icn.tick
                }
                style={styles.bottomIcn}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                handleToggleVehicleSpotLight(item?.vehicleInfo?.VehicleID);
              }}>
              <Image
                source={
                  item?.vehicleInfo?.spotLight ? icn.focussedStar : icn.star
                }
                style={styles.bottomIcn}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image
                source={icn.share}
                style={styles.bottomIcn}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <View style={styles.verticalCenter}>
              <Image
                source={icn.carEye}
                style={styles.bottomIcn}
                resizeMode="contain"
              />
              <Text style={styles.countText}>
                {item?.vehicleInfo?.detailViewCount}
              </Text>
            </View>
            <View style={styles.verticalCenter}>
              <Image
                source={icn.carCheck}
                style={styles.bottomIcn}
                resizeMode="contain"
              />
              <Text style={styles.countText}>
                {item?.vehicleInfo?.creditApplicationCount}
              </Text>
            </View>
            <View style={styles.verticalCenter}>
              <Image
                source={icn.man}
                style={styles.bottomIcn}
                resizeMode="contain"
              />
              <Text style={styles.countText}>
                {item?.vehicleInfo?.vehicleLeadCount}
              </Text>
            </View>
            <View>
              <Menu
                visible={
                  isMenuVisible && selectedId == item?.vehicleInfo?.VehicleID
                }
                onDismiss={closeMenu}
                contentStyle={styles.optionContainer}
                anchor={
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedId(item?.vehicleInfo?.VehicleID);
                      openMenu();
                      setPressedItem(item);
                    }}>
                    <Image
                      source={icn.optionDots}
                      style={styles.optionIcn}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                }>
                <View>
                  <TouchableOpacity
                    onPress={() => {
                      // console.log('Navigating to VehicleDetails with:', pressedItem);
                      storage.set("vehicleId", pressedItem?.vehicleInfo?.VehicleID);
                      navigation.navigate('VehicleDetails', {
                        item: pressedItem,
                        DealershipID: item?.vehicleInfo?.DealershipID,
                        from: 'CarModelList',
                      });
                      setIsMenuVisible(false);
                    }}
                    style={styles.optionSpaceContainer}>
                    <Text style={styles.optionName}>Vehicle</Text>
                    <Image
                      source={icn.forward}
                      style={styles.forwardIcn}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('CarExpenses', {
                        item: pressedItem,
                        DealershipID: item?.vehicleInfo?.DealershipID,
                      });
                      setIsMenuVisible(false);
                    }}
                    style={styles.optionSpaceContainer}>
                    <Text style={styles.optionName}>Expense</Text>
                    <Image
                      source={icn.forward}
                      style={styles.forwardIcn}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setIsMenuVisible(false);
                      Linking.openURL(
                        `${CONFIG.API_BASE_URL}download-vehicle-images/${item?.vehicleInfo?.VehicleID}`,
                      );
                    }}
                    style={styles.optionSpaceContainer}>
                    <Text style={styles.optionName}>Download Images</Text>
                    <Image
                      source={icn.forward}
                      style={styles.forwardIcn}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      // console.log('item  vehicle id ===================r==>', item?.vehicleInfo?.VehicleID);
                      setIsMenuVisible(false);
                      Linking.openURL(
                        `${CONFIG.API_BASE_URL}vehicle-recon/${item?.vehicleInfo?.VehicleID}`,
                      );
                      // setIsPrintModalVisible(true);
                    }}
                    style={styles.optionSpaceContainer}>
                    <Text style={styles.optionName}>Print</Text>
                    <Image
                      source={icn.forward}
                      style={styles.forwardIcn}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleDeletePress}
                    style={styles.optionSpaceContainer}>
                    <Text style={styles.optionName}>Remove</Text>
                    <Image
                      source={icn.forward}
                      style={styles.forwardIcn}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleReturnPress}
                    style={styles.optionSpaceContainer}>
                    <Text style={styles.optionName}>Return/Arbitrate</Text>
                    <Image
                      source={icn.forward}
                      style={styles.forwardIcn}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
              </Menu>
            </View>
          </View>
        </View>
      </View>
    );
  };
  const renderFilters = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedFilter(item?.name);
      }}
      style={[
        styles.filterContainer,
        {
          backgroundColor:
            item?.name == selectedFilter ? Colors.primary : Colors.dullWhite,
        },
      ]}>
      <Text
        style={[
          styles.filterText,
          {
            color: item?.name == selectedFilter ? Colors.white : Colors.black,
          },
        ]}>
        {item?.name}
      </Text>
    </TouchableOpacity>
  );
  const emptyComponent = (): any => {
    return <Text style={styles.noDataAvailable}>No data available</Text>;
  };
  const renderFooter = (): any => {
    return (
      isNewPageLoading && (
        <ActivityIndicator
          size={Platform.OS == 'android' ? wp(11) : 'large'}
          style={{ marginBottom: hp(3) }}
          color="#0000ff"
        />
      )
    );
  };
  const onEndReached = (): any => {
    if (isFilterApplied && hasFilterMore && !isNewPageLoading) {
      applyVehicleFilter('footer');
    } else if (
      !isNewPageLoading &&
      hasMore &&
      searchQuery?.length <= 0 &&
      !isFilterApplied
    ) {

      if (selectedTab === 'ALL') {
        getVehiclesData('footer');
      } else if (selectedTab === 'LIVE') {
        getLiveVehicles('footer');
      } else if (selectedTab === 'INPROGRESS') {
        getInprogressVehicles('footer');
      }
    }
  };
  const debouncedSearch = useCallback(
    debounce(async searchQuery => {
      if (!searchQuery) {
        setSearchedData(undefined);
        return;
      }
      try {
        setIsFilterApplied(false);
        const payload = {
          makeID: params?.makeId,
          vin: searchQuery,
        };
        const response = await searchVehicles(payload);
        setSearchedData(response?.data?.vehicles);
      } catch (error: any) {
        setSearchedData([]);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error?.response?.data?.message || 'Something went wrong!',
        });
      }
    }, 250),
    [],
  );
  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);
  // console.log('pressedItem?.vehicleInfo?.VehicleID popuuppp==========', pressedItem?.vehicleInfo?.VehicleID);
  // console.log('vehicleImagesData for popup:', vehicleImagesData[pressedItem?.vehicleInfo?.VehicleID]);

  return (
    <View style={styles.mainView}>
      <View style={styles.subContainer}>
        <Header
          title={params?.name}
          leftIcn={icn.back}
          leftIcnStyle={styles.backIcn}
          onLeftIconPress={() => navigation.goBack()}
        />
        {isLoading ? (
          <ActivityIndicator
            color={Colors.primary}
            style={styles.activityIndicator}
            size={Platform.OS == 'android' ? wp(11) : 'large'}
          />
        ) : (
          <>
            <View style={styles.searchContainer}>
              <Searchbar
                styles={styles.searchBar}
                placeholder="Search"
                inputStyle={{ width: wp(66) }}
                onChangeText={txt => {
                  setSearchQuery(txt);
                  debouncedSearch(txt);
                }}
              />
              <TouchableOpacity onPress={handleExpandPress}>
                <Image
                  source={icn.filter}
                  style={styles.iconStyle}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            {/* Tab group with dummy stats */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: hp(2) }}>
              {[
                { label: 'ALL', stat: allVehicleCount },
                { label: 'LIVE', stat: liveVehicleCount },
                { label: 'INPROGRESS', stat: inprogressVehicleCount },
              ].map(tab => (
                <TouchableOpacity
                  key={tab.label}
                  onPress={async () => {
                    setSelectedTab(tab.label);
                    handleTabClick(tab.label);
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: selectedTab === tab.label ? Colors.primary : '#f5f5f5',
                    paddingVertical: hp(1),
                    marginHorizontal: wp(1),
                    borderRadius: wp(2),
                    display: 'flex',
                    flexDirection: 'column',
                    gap: hp(0.2),
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: wp(2),
                  }}
                >
                  <Text style={{
                    color: selectedTab === tab.label ? '#fff' : Colors.primary,
                    fontWeight: '600',
                    fontSize: wp(3.8),
                  }}>{tab.label}</Text>
                  <Text style={{
                    color: selectedTab === tab.label ? '#fff' : Colors.primary,
                    fontSize: wp(3.4),
                    // marginTop: hp(0.5),
                  }}>{tab.stat}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <RnFlatList
              contentContainerStyle={{ paddingBottom: hp(30) }}
              style={{ marginTop: hp(3) }}
              data={
                isFilterApplied
                  ? filteredData
                  : searchQuery?.length > 0 && searchedData
                    ? searchedData
                    : selectedTab === 'ALL' ? vehicleData : selectedTab === 'LIVE' ? liveVehicles : inProgressVehicles
              }
              showsVerticalScrollIndicator={false}
              renderItem={renderItem}
              ListEmptyComponent={emptyComponent}
              initialNumToRender={10}
              onEndReached={onEndReached}
              ListFooterComponent={renderFooter}
              onEndReachedThreshold={0.7}
              keyExtractor={(item: any, index: any) => index.toString()}
              refreshControl={
                <RefreshControl
                  tintColor={Colors.primary}
                  colors={[Colors.primary]}
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                />
              }
            />
          </>
        )}
      </View>

      <Modal backdropOpacity={0.5} isVisible={isModalVisible}>
        <View style={styles.modalView}>
          <View style={styles.modalContainer}>
            {/* <Text>pressedItem?.vehicleInfo?.imagePath</Text> */}
            <View>
              <Image
                source={pressedItem?.vehicleInfo?.imageLink ? { uri: pressedItem?.vehicleInfo?.imageLink } : img.placeholder}
                style={styles.img}
                resizeMode="cover"
                onError={(error: any) => {
                  //  console.log('Popup image load error for vehicle:', pressedItem?.vehicleInfo?.VehicleID);
                  //  console.log('Error details:', error);
                }}
              // onLoad={() => {
              //   console.log('Popup image loaded successfully for vehicle:', pressedItem?.vehicleInfo?.VehicleID);
              // }}
              />
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.crossContainer}>
                <Image
                  source={icn.cross}
                  style={styles.crossIcn}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.searchContainer}>
              <View>
                <Text style={styles.carName}>
                  {pressedItem?.vehicleInfo?.ModelYear}{' '}
                  {pressedItem?.vehicleInfo?.Make}{' '}
                  {pressedItem?.vehicleInfo?.Model}{' '}
                </Text>
                <Text style={styles.description}>
                  {pressedItem?.vehicleInfo?.TechnologyPackage}
                </Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.priceTxt}>
                  ${pressedItem?.Total?.toFixed(2)}
                </Text>
              </View>
            </View>
            <View style={styles.carPropContainer}>
              <Text style={styles.optionText}>
                Stk#:
                <Text style={styles.valueText}>
                  {' '}
                  {pressedItem?.vehicleInfo?.StockNumber}
                </Text>
              </Text>
              <Text style={styles.optionText}>
                VIN:
                <Text style={styles.valueText}>
                  {' '}
                  {pressedItem?.vehicleInfo?.VIN}
                </Text>
              </Text>
              <Text style={styles.optionText}>
                Color:
                <Text style={styles.valueText}>
                  {' '}
                  {pressedItem?.vehicleInfo?.Color}
                </Text>
              </Text>
              <Text style={styles.optionText}>
                Drive Type:
                <Text style={styles.valueText}>
                  {' '}
                  {pressedItem?.vehicleInfo?.DriveType}
                </Text>
              </Text>
            </View>
            <View style={styles.carPropContainer}>
              <Text style={styles.optionText}>
                Mileage:
                <Text style={styles.valueText}>
                  {' '}
                  {pressedItem?.vehicleInfo?.Mileage}
                </Text>
              </Text>
              <Text style={styles.optionText}>
                Cost:
                <Text style={styles.valueText}>
                  {' '}
                  €{pressedItem?.Total?.toFixed(2)}
                </Text>
              </Text>
              <Text style={styles.optionText}>
                Age:
                <Text style={styles.valueText}>
                  {' '}
                  {getDayDifference(pressedItem?.costInfo?.PurchaseDate)} days
                </Text>
              </Text>
            </View>
            <View style={styles.carPropContainer}>
              <Text style={styles.optionText}>
                Live Status:
                <Text style={styles.valueText}>
                  {' '}
                  {pressedItem?.vehicleInfo?.isPublished ? 'Active' : 'Inactive'}
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </Modal>
      <Modal backdropOpacity={0.5} isVisible={isPrintModalVisible}>
        <View style={styles.modalView}>
          <View style={styles.modalContainer}>
            <View style={styles.rowSpaceContainer}>
              <Text style={styles.modelText}>Print</Text>
              <TouchableOpacity onPress={() => setIsPrintModalVisible(false)}>
                <Image
                  source={icn.cross}
                  style={styles.crossIcn}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.printTop}>
              <Text style={styles.placeholderText}>Buyers Guide Format</Text>
              <Dropdown
                style={[styles.dropdown]}
                containerStyle={styles.dropdownContainer}
                placeholderStyle={styles.placeholderStyle}
                itemTextStyle={styles.itemTextStyle}
                selectedTextStyle={styles.selectedTextStyle}
                activeColor={Colors.dullWhite}
                showsVerticalScrollIndicator={false}
                data={dropdownData}
                maxHeight={hp(20)}
                labelField="label"
                valueField="value"
                placeholder={'Select'}
                value={buyerGuideFormatValue}
                onChange={item => {
                  setBuyerGuideFormatValue(item.value);
                }}
                renderRightIcon={() => (
                  <Image
                    source={icn.downArrow}
                    style={styles.arrow}
                    resizeMode="contain"
                  />
                )}
              />
            </View>
            <View>
              <View style={styles.placeholderContainer}>
                <Text style={styles.blackPlaceholderText}>Buyers Guide</Text>
                <Image
                  source={icn.printer}
                  style={styles.printerIcn}
                  resizeMode="contain"
                />
              </View>
              <Dropdown
                style={[styles.simpleDropdown]}
                containerStyle={styles.dropdownContainer}
                placeholderStyle={styles.placeholderStyle}
                itemTextStyle={styles.itemTextStyle}
                selectedTextStyle={styles.selectedTextStyle}
                activeColor={Colors.dullWhite}
                showsVerticalScrollIndicator={false}
                data={dropdownData}
                maxHeight={hp(19)}
                labelField="label"
                valueField="value"
                placeholder={'Select'}
                value={buyersGuideValue}
                onChange={item => {
                  setBuyersGuideValue(item.value);
                }}
                renderRightIcon={() => (
                  <Image
                    source={icn.downArrow}
                    style={styles.arrow}
                    resizeMode="contain"
                  />
                )}
              />
            </View>
            <View>
              <View style={styles.placeholderContainer}>
                <Text style={styles.blackPlaceholderText}>Window Sticker</Text>
                <Image
                  source={icn.printer}
                  style={styles.printerIcn}
                  resizeMode="contain"
                />
              </View>
              <Dropdown
                style={[styles.simpleDropdown]}
                containerStyle={styles.dropdownContainer}
                placeholderStyle={styles.placeholderStyle}
                itemTextStyle={styles.itemTextStyle}
                selectedTextStyle={styles.selectedTextStyle}
                activeColor={Colors.dullWhite}
                showsVerticalScrollIndicator={false}
                dropdownPosition="top"
                data={dropdownData}
                maxHeight={hp(20)}
                labelField="label"
                valueField="value"
                placeholder={'Select'}
                value={windowStickerValue}
                onChange={item => {
                  setWindowStickerValue(item.value);
                }}
                renderRightIcon={() => (
                  <Image
                    source={icn.downArrow}
                    style={styles.arrow}
                    resizeMode="contain"
                  />
                )}
              />
            </View>
            <PrimaryButton
              style={styles.button}
              onPress={() => { }}
              title="Print Vehicle Recon Sheet"
            />
          </View>
        </View>
      </Modal>
      {isReturnModalVisible && (
        <View style={[styles.modalView, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContainer]}>
            <View style={styles.rowSpaceContainer}>
              <Text style={styles.modelText}>Return Vehicle</Text>
              <TouchableOpacity onPress={() => setIsReturnModalVisible(false)}>
                <Image
                  source={icn.cross}
                  style={styles.crossIcn}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            <View style={{}}>
              <View style={{ width: '100%' }}>
                <Text style={styles.filterPlaceholderText}>Return Price <Text style={{ color: 'red' }}>*</Text></Text>
                <InputBox
                  placeholder="Enter return price"
                  style={{ width: '100%' }}
                  onChangeText={txt = numberOfCharacter={50}> {
                    setFilterData(pre => ({
                      ...pre,
                      returnPrice: txt,
                    }));
                  }}
                  keyboardType="number-pad"
                  value={filterData?.returnPrice}
                  numberOfCharacter={10}
                />
                {!filterData?.returnPrice && (
                  <Text style={styles.error}>Return price is required</Text>
                )}
              </View>
              <View>
                <Text style={styles.filterBlackPlaceholderText}>Arbitrated Date <Text style={{ color: 'red' }}>*</Text></Text>
                <TouchableOpacity onPress={() => setOpen(true)}>
                  <InputBox
                    value={
                      selectedPurchaseDate
                        ? selectedPurchaseDate?.toDateString()
                        : 'Select date'
                    }
                    style={{ paddingVertical: hp(0.3), width: '100%' }}
                    onChangeText={() = numberOfCharacter={50}> { }}
                    disabled
                    numberOfCharacter={20}
                  />
                </TouchableOpacity>
                {!selectedPurchaseDate && (
                  <Text style={styles.error}>Arbitrated date is required</Text>
                )}
              </View>
              <View style={[styles.filterButtonsContainer, { width: '100%', justifyContent: 'center', gap: wp(2) }]}>
                <TouchableOpacity
                  onPress={() => setIsReturnModalVisible(false)}
                  style={[styles.submitContainer]}>
                  <Text style={styles.submitText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    if (!filterData?.returnPrice || !selectedPurchaseDate) {
                      Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Please fill all required fields',
                      });
                      return;
                    }
                    handleReturnVehicle();
                  }}
                  style={[styles.submitContainer, { paddingHorizontal: wp(6), backgroundColor: Colors.primary }]}>
                  <Text style={[styles.submitText, { color: Colors.white }]}>Return Vehicle</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}

      <BottomSheet
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
        index={-1}
        android_keyboardInputMode="adjustResize"
        handleIndicatorStyle={{ height: 0 }}
        backdropComponent={props => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            opacity={0.3}
          />
        )}
        snapPoints={snapPoints}
        backgroundStyle={{
          borderTopLeftRadius: wp(7),
          borderTopRightRadius: wp(7),
        }}
        enablePanDownToClose={true}>
        <View style={styles.indicatorContainer}>
          <View style={styles.upperIndicator}></View>
          <View style={styles.lowerIndicator}></View>
        </View>
        <View
          style={{ height: hp(8), marginTop: hp(4), paddingHorizontal: wp(3) }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between', alignItems: 'center' }}
          >
            {filtersData.map((item: any, index: any) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setSelectedFilter(item?.name);
                }}
                style={[
                  styles.filterContainer,
                  {
                    backgroundColor:
                      item?.name == selectedFilter ? Colors.primary : Colors.dullWhite,
                  },
                ]}>
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: item?.name == selectedFilter ? Colors.white : Colors.black,
                    },
                  ]}>
                  {item?.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          style={styles.bottomView}
          showsVerticalScrollIndicator={false}>
          {selectedFilter == 'Stock In' && (
            <>
              <View>
                <Text style={styles.filterPlaceholderText}>Stoke Number</Text>
                <BottomSheetInput
                  placeholder="123456"
                  onChangeText={txt => {
                    setFilterData(pre => {
                      return {
                        ...pre,
                        stockNumber: txt,
                      };
                    });
                  }}
                  value={filterData?.stockNumber}
                  onSubmitEditing={() =>
                    bottomSheetRef?.current?.snapToIndex(0)
                  }
                />
              </View>
              <View>
                <Text style={styles.filterBlackPlaceholderText}>VIN</Text>
                <BottomSheetInput
                  placeholder="123456"
                  onChangeText={txt => {
                    setFilterData(pre => {
                      return {
                        ...pre,
                        vin: txt,
                      };
                    });
                  }}
                  value={filterData?.vin}
                  onSubmitEditing={() =>
                    bottomSheetRef?.current?.snapToIndex(0)
                  }
                />
              </View>
            </>
          )}
          {selectedFilter == 'Purchase' && (
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
              <>
                <View>
                  <Text style={styles.filterPlaceholderText}>Date</Text>
                  <TouchableOpacity onPress={() => setOpen(true)}>
                    <InputBox
                      value={
                        selectedPurchaseDate
                          ? selectedPurchaseDate?.toDateString()
                          : 'Select date'
                      }
                      numberOfCharacter={20}
                      style={{ paddingVertical: hp(0.3) }}
                      onChangeText={() => { }}
                      disabled
                    />
                  </TouchableOpacity>
                </View>
                <View>
                  <Text style={styles.filterBlackPlaceholderText}>Age Above</Text>
                  <BottomSheetInput
                    placeholder="ABC"
                    onChangeText={txt => {
                      setFilterData(pre => {
                        return {
                          ...pre,
                          aboveAge: txt,
                        };
                      });
                    }}
                    keyboardType="number-pad"
                    value={filterData?.aboveAge}
                    onSubmitEditing={() =>
                      bottomSheetRef?.current?.snapToIndex(0)
                    }
                  />
                </View>
                <View>
                  <Text style={styles.filterBlackPlaceholderText}>Age</Text>
                  <DropDown
                    data={data?.ageFilterGroup}
                    placeholder={'Select'}
                    value={''}
                    labelField="description"
                    valueField="ageRangeEnd"
                    setValue={() => { }}
                    onChange={item => {
                      setFilterData(pre => {
                        return {
                          ...pre,
                          ageRange: {
                            ageRangeStart: item?.ageRangeStart,
                            ageRangeEnd: item?.ageRangeEnd,
                          },
                        };
                      });
                    }}
                    rightIcon
                  />
                </View>
                <View>
                  <Text style={styles.filterBlackPlaceholderText}>
                    Payment Type
                  </Text>
                  <DropDown
                    data={data?.paymentTypes}
                    placeholder={'Select'}
                    value={filterData?.PaymentModeID}
                    labelField="Description"
                    valueField="PaymentModeID"
                    setValue={() => { }}
                    onChange={item => {
                      setFilterData(pre => {
                        return {
                          ...pre,
                          PaymentModeID: item?.PaymentModeID,
                        };
                      });
                    }}
                    rightIcon
                  />
                </View>
                <View>
                  <Text style={styles.filterBlackPlaceholderText}>
                    Floor Plan
                  </Text>
                  <DropDown
                    data={data?.floorPlans}
                    placeholder={'Select'}
                    value={filterData?.floorPlanID}
                    labelField="description"
                    valueField="value"
                    setValue={() => { }}
                    onChange={item => {
                      setFilterData(pre => {
                        return {
                          ...pre,
                          floorPlanID: item?.floorPlanID,
                        };
                      });
                    }}
                    rightIcon
                  />
                </View>
                <View>
                  <Text style={styles.filterBlackPlaceholderText}>Buyer</Text>
                  <DropDown
                    data={data?.buyer}
                    placeholder={'Select'}
                    value={filterData?.buyerID}
                    labelField="description"
                    valueField="BuyerID"
                    setValue={() => { }}
                    onChange={item => {
                      setFilterData(pre => {
                        return {
                          ...pre,
                          buyerID: item?.BuyerID,
                        };
                      });
                    }}
                    rightIcon
                  />
                </View>
                <View>
                  <Text style={styles.filterBlackPlaceholderText}>
                    Bought From
                  </Text>
                  <DropDown
                    data={data?.boughtFrom}
                    placeholder={'Select'}
                    value={filterData?.boughtFromID}
                    labelField="description"
                    valueField="value"
                    setValue={() => { }}
                    onChange={item => {
                      setFilterData(pre => {
                        return {
                          ...pre,
                          boughtFromID: item?.buyerID,
                        };
                      });
                    }}
                    rightIcon
                  />
                </View>
                <View>
                  <Text style={styles.filterBlackPlaceholderText}>
                    Wholesale Price
                  </Text>
                  <BottomSheetInput
                    placeholder="ABC"
                    onChangeText={txt => {
                      setFilterData(pre => {
                        return {
                          ...pre,
                          wholesalePrice: txt,
                        };
                      });
                    }}
                    keyboardType="number-pad"
                    value={filterData?.wholesalePrice}
                    onSubmitEditing={() =>
                      bottomSheetRef?.current?.snapToIndex(0)
                    }
                  />
                </View>

              </>
            </ScrollView>
          )}
          {selectedFilter == 'Sort' && (
            <>
              <View>
                <Text style={styles.filterPlaceholderText}>Sort By</Text>
                <DropDown
                  data={data?.sortBy}
                  placeholder={'Select'}
                  value={filterData?.sortBy}
                  labelField="label"
                  valueField="value"
                  setValue={() => { }}
                  onChange={item => {
                    setFilterData(pre => {
                      return {
                        ...pre,
                        sortBy: item?.value,
                      };
                    });
                  }}
                  rightIcon
                />
              </View>
              <View>
                <Text style={styles.filterBlackPlaceholderText}>
                  Sort Order
                </Text>
                <DropDown
                  data={data?.sortOrder}
                  placeholder={'Select'}
                  value={filterData?.sortOrder}
                  labelField="label"
                  valueField="value"
                  setValue={() => { }}
                  onChange={item => {
                    setFilterData(pre => {
                      return {
                        ...pre,
                        sortOrder: item?.value,
                      };
                    });
                  }}
                  rightIcon
                />
              </View>
              <View>
                <Text style={styles.filterBlackPlaceholderText}>Page Size</Text>
                <DropDown
                  data={data?.pageSize}
                  placeholder={'Select'}
                  value={filterData?.pageSize}
                  labelField="label"
                  valueField="value"
                  setValue={() => { }}
                  onChange={item => {
                    setFilterData(pre => {
                      return {
                        ...pre,
                        pageSize: item?.value,
                      };
                    });
                  }}
                  rightIcon
                />
              </View>
            </>
          )}
          {selectedFilter == 'Vehicle' && (
            <>
              <View>
                <Text style={styles.filterPlaceholderText}>Model Year</Text>
                <BottomSheetInput
                  placeholder="12345"
                  onChangeText={txt => {
                    setFilterData(pre => {
                      return {
                        ...pre,
                        modelYear: txt,
                      };
                    });
                  }}
                  keyboardType="number-pad"
                  value={filterData?.modelYear}
                  onSubmitEditing={() =>
                    bottomSheetRef?.current?.snapToIndex(0)
                  }
                />
              </View>
              {/* <View>
                <Text style={styles.filterBlackPlaceholderText}>Make</Text>
                <DropDown
                  data={data?.vehicleMake}
                  placeholder={'Select'}
                  value={filterData?.makeID}
                  labelField="description"
                  valueField="makeID"
                  setValue={() => {}}
                  onChange={item => {
                    setFilterData(pre => {
                      return {
                        ...pre,
                        makeID: item?.makeID,
                      };
                    });
                  }}
                  rightIcon
                />
              </View> */}
              <View>
                <Text style={styles.filterBlackPlaceholderText}>Modal</Text>
                <DropDown
                  data={data?.vehicleModel}
                  placeholder={'Select'}
                  value={filterData?.modelID}
                  labelField="description"
                  valueField="modelID"
                  setValue={() => { }}
                  onChange={item => {
                    setFilterData(pre => {
                      return {
                        ...pre,
                        modelID: item?.modelID,
                      };
                    });
                  }}
                  rightIcon
                />
              </View>
            </>
          )}
          {selectedFilter == 'Vehicle Other' && (
            <>
              <View>
                <Text style={styles.filterPlaceholderText}>Title</Text>
                <DropDown
                  data={data?.title}
                  placeholder={'Select'}
                  value={filterData?.title}
                  labelField="label"
                  valueField="value"
                  setValue={() => { }}
                  onChange={item => {
                    setFilterData(pre => {
                      return {
                        ...pre,
                        title: item?.value,
                      };
                    });
                  }}
                  rightIcon
                />
              </View>
              <View>
                <Text style={styles.filterBlackPlaceholderText}>
                  Title Status
                </Text>
                <DropDown
                  data={data?.titleStatusEnum}
                  placeholder={'Select'}
                  value={filterData?.titleStatusID}
                  labelField="description"
                  valueField="titleStatusID"
                  setValue={() => { }}
                  onChange={item => {
                    setFilterData(pre => {
                      return {
                        ...pre,
                        titleStatusID: item?.titleStatusID,
                      };
                    });
                  }}
                  rightIcon
                />
              </View>
              <View>
                <Text style={styles.filterBlackPlaceholderText}>
                  Feed Providers
                </Text>
                <DropDown
                  data={data?.feedProvider}
                  placeholder={'Select'}
                  value={filterData?.feedNameID}
                  labelField="description"
                  valueField="feedNameID"
                  setValue={() => { }}
                  onChange={item => {
                    setFilterData(pre => {
                      return {
                        ...pre,
                        feedNameID: item?.feedNameID,
                      };
                    });
                  }}
                  rightIcon
                />
              </View>
              <View>
                <Text style={styles.filterBlackPlaceholderText}>
                  Price Not Updated Days
                </Text>
                <BottomSheetInput
                  placeholder="12345"
                  onChangeText={txt => {
                    setFilterData(pre => {
                      return {
                        ...pre,
                        priceNotUpdatedDays: txt,
                      };
                    });
                  }}
                  keyboardType="number-pad"
                  value={filterData?.priceNotUpdatedDays}
                  onSubmitEditing={() =>
                    bottomSheetRef?.current?.snapToIndex(0)
                  }
                />
              </View>
              <View>
                <Text style={styles.filterBlackPlaceholderText}>
                  Images Count
                </Text>
                <BottomSheetInput
                  placeholder="12345"
                  onChangeText={txt => {
                    setFilterData(pre => {
                      return {
                        ...pre,
                        imageCount: txt,
                      };
                    });
                  }}
                  keyboardType="number-pad"
                  value={filterData?.imageCount}
                  onSubmitEditing={() =>
                    bottomSheetRef?.current?.snapToIndex(0)
                  }
                />
              </View>
              <BouncyCheckbox
                isChecked={isNoImages}
                onPress={() => setIsNoImages(!isNoImages)}
                text="Show with no images"
                textStyle={{
                  textDecorationLine: 'none',
                  color: '#000',
                }}
                innerIconStyle={{
                  borderRadius: wp(1),
                  borderWidth: wp(0.4),
                  borderColor: Colors.primary,
                  backgroundColor: isNoImages ? Colors.primary : 'transparent',
                }}
                style={{ marginTop: hp(2) }}
                iconImageStyle={{ width: wp(3), height: hp(1) }}
              />
            </>
          )}
          {selectedFilter == 'Marketing' && (
            <>
              <View>
                <Text style={styles.filterPlaceholderText}>Location</Text>
                <DropDown
                  data={data?.vehicleLocations}
                  placeholder={'Select'}
                  value={filterData?.vehicleLocationID}
                  labelField="description"
                  valueField="vehicleLocationID"
                  setValue={() => { }}
                  onChange={item => {
                    setFilterData(pre => {
                      return {
                        ...pre,
                        vehicleLocationID: item?.vehicleLocationID,
                      };
                    });
                  }}
                  rightIcon
                />
              </View>
              <View>
                <Text style={styles.filterBlackPlaceholderText}>
                  Web Publish
                </Text>
                <DropDown
                  data={data?.webPublish}
                  placeholder={'Select'}
                  value={filterData?.isPublished}
                  labelField="label"
                  valueField="value"
                  setValue={() => { }}
                  onChange={item => {
                    setFilterData(pre => {
                      return {
                        ...pre,
                        isPublished: item?.value,
                      };
                    });
                  }}
                  rightIcon
                />
              </View>
              <View>
                <Text style={styles.filterBlackPlaceholderText}>Flag</Text>
                <DropDown
                  data={data?.flag}
                  placeholder={'Select'}
                  value={filterData?.flag}
                  labelField="label"
                  valueField="value"
                  setValue={() => { }}
                  onChange={item => {
                    setFilterData(pre => {
                      return {
                        ...pre,
                        flag: item?.value,
                      };
                    });
                  }}
                  rightIcon
                />
              </View>
              <View>
                <Text style={styles.filterBlackPlaceholderText}>
                  Drive Type
                </Text>
                <DropDown
                  data={data?.vehicleDriveType}
                  placeholder={'Select'}
                  value={filterData?.driveTypeID}
                  labelField="description"
                  valueField="value"
                  setValue={() => { }}
                  onChange={item => {
                    setFilterData(pre => {
                      return {
                        ...pre,
                        driveTypeID: item?.driveTypeID,
                      };
                    });
                  }}
                  rightIcon
                />
              </View>
              <View>
                <Text style={styles.filterBlackPlaceholderText}>
                  Body Style
                </Text>
                <DropDown
                  data={data?.vehicleBodyStyle}
                  placeholder={'Select'}
                  value={filterData?.bodyStyleID}
                  labelField="Description"
                  dropdownPosition="top"
                  valueField="bodyStyleID"
                  setValue={() => { }}
                  onChange={item => {
                    setFilterData(pre => {
                      return {
                        ...pre,
                        bodyStyleID: item?.bodyStyleID,
                      };
                    });
                  }}
                  rightIcon
                />
              </View>
            </>
          )}
          <View style={styles.filterButtonsContainer}>
            <TouchableOpacity
              onPress={() => {
                filterPage.current = 1;
                applyVehicleFilter();
              }}
              style={styles.submitContainer}>
              <Text style={styles.submitText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={clearFilter}
              style={styles.clearContainer}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </BottomSheet>
      <DatePicker
        modal
        open={open}
        date={date}
        mode="date"
        theme="light"
        onConfirm={selectedDate => {
          setOpen(false);
          setDate(selectedDate);
          setSelectedPurchaseDate(selectedDate);
        }}
        onCancel={() => {
          setOpen(false);
        }}
      />
      <Model
        isVisible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        onConfirm={handleVehicleRemove}
        title="Delete Vehicle"
        message="Are you sure you want to delete this vehicle?"
        confirmText="Delete"
        cancelText="Cancel"
      />

      {
        showTryAgain && (
          <TryAgain message="Something went wrong" onRetry={() => {
            setShowTryAgain(false);
            getVehiclesData();
          }} />
        )
      }

    </View>
  );
};

export default CarModelList;
