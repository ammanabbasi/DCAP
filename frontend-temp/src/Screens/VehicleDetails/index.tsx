import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  Platform,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { icn } from '../../Assets/icn';
import Header from '../../Components/Header';
import { hp, wp } from '../../Theme/Responsiveness';
import { styles } from './style';
import { enableSnackbar } from '../../redux/slices/snackbarSlice';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';
import { vehicleBasicData, vehicleImages, applyWatermark, getCarfax, updateCarfax, pricingLog, getLog } from '../../Services/apis/APIs';
import { Colors } from '../../Theme/Colors';
import { storage } from '../../redux/mmkv/storage';
import { Menu } from 'react-native-paper';
import { img } from '../../Assets/img';
import { CONFIG } from '../../config/buildConfig';

interface RouteParams {
  params: any;
}

interface ViewableItems {
  viewableItems: any[];
}

interface Item {
  imagePath?: string;
  name?: string;
  img?: any;
}
// const navigation = useNavigation<GalleryScreenNavigationProp>();
const VehicleDetails = ({ route }: { route: RouteParams }) => {
  const params = route?.params;
  console.log('This is params: ', params);
  const vehicleId = storage.getNumber('vehicleId');
  const employee = useSelector((state: any) => state?.employeeRoleReducer?.data);

  console.log('employee ======= >', employee?.DisableVehiclePurchase);
  // const wdid = storage.getString('watermarkId');
  // console.log('watermarkId',wdid);
  const detailsData = [
    {
      img: icn.images,
      name: 'Gallary',
    },
    {
      img: icn.doc,
      name: 'Document',
    },
    {
      img: icn.optionsCar,
      name: 'Basic',
    },
    {
      img: icn.marketing,
      name: 'Marketing',
    },
    {
      img: icn.options,
      name: 'Options',
    },
    // Only add the "Purchase" object if employee.DisableVehiclePurchase is false
    ...(employee?.DisableVehiclePurchase === false
      ? [{
        img: icn.purchase,
        name: 'Purchase',
      }]
      : []),
  ];
  const basicItem = detailsData.splice(2, 1)[0];
  detailsData.splice(!vehicleId ? 0 : 2, 0, basicItem);
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imagesData, setImagesData] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [vehicleBasicsData, setVehicleBasicsData] = useState<any>(params?.item?.vehicleInfo);
  const [placeholderUrl, setPlaceholderUrl] = useState<any>(null);
  const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [vehicleCost, setVehicleCost] = useState<any>(params?.item?.Total);
  const [displayPrice, setDisplayPrice] = useState<any>(params?.item?.DisplayPrice);


  console.log("this is placeholderUrl ===>", vehicleBasicsData);


  useEffect(() => {
    console.log('This is vehicleBasicsData: ', vehicleBasicsData);

  }, [vehicleBasicsData]);

  const openMenu = (): any => {
    setIsMenuVisible(prevState => {
      console.log('Previous state:', prevState);
      const newState = !prevState;
      console.log('New state:', newState);
      return newState;
    });
  };
  const closeMenu = (): any => {
    setIsMenuVisible(false);
  };
  const handleReturnPress = (): any => {
    closeMenu();
  };
  const viewableItemsChanged = useCallback(({ viewableItems }: ViewableItems) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems?.[0].index);
    }
  }, []);
  const copyToClipboard = (): any => {
    Clipboard.setString(vehicleBasicsData?.VIN);
    dispatch(enableSnackbar('Copied to Clipboard'));
  };
  const getVehicleImages = async () => {
    try {
      const payload = {
        VehicleID: vehicleId,
      };
      if (vehicleId) {
        const response = await vehicleImages(payload);
        const data = response?.data;
        console.log("=== VEHICLE IMAGES DEBUG ===");
        console.log("Full response:", response);
        console.log("Response data:", data);
        console.log("Data type:", typeof data);
        console.log("Is array:", Array.isArray(data));
        console.log("Data keys:", data ? Object.keys(data) : 'No data');
        console.log("Data.images:", data?.images);
        console.log("Data.imagePath:", data?.imagePath);
        console.log("Data length if array:", Array.isArray(data) ? data.length : 'Not an array');
        if (Array.isArray(data) && data.length > 0) {
          console.log("First image in array:", data?.[0]);
          console.log("First image path:", data?.[0]?.imagePath);
        }
        console.log("data vehicleImages watermark", data?.watermarkId);

        // Check if data is an array of images or a single image object
        if (Array.isArray(data)) {
          console.log("Setting imagesData as array:", data);
          // If it's an array, use it directly
          setImagesData(data);
          if (data.length > 0) {
            console.log("Setting placeholder from first image:", data?.[0]?.imagePath);
            setPlaceholderUrl(data?.[0]?.imagePath);
          }
        } else if (data?.data && Array.isArray(data.data)) {
          console.log("Setting imagesData from data.data:", data.data);
          // If it's an object with data array (API response structure)
          setImagesData(data.data);
          if (data?.data?.length > 0) {
            console.log("Setting placeholder from first image in data.data:", data.data?.[0]?.imagePath);
            setPlaceholderUrl(data.data?.[0]?.imagePath);
          }
        } else if (data?.images && Array.isArray(data.images)) {
          console.log("Setting imagesData from data.images:", data.images);
          // If it's an object with images array
          setImagesData(data.images);
          if (data?.images?.length > 0) {
            console.log("Setting placeholder from first image in data.images:", data.images?.[0]?.imagePath);
            setPlaceholderUrl(data.images?.[0]?.imagePath);
          }
        } else if (data?.imagePath) {
          console.log("Setting imagesData as single image:", [data]);
          // If it's a single image object
          setImagesData([data]);
          setPlaceholderUrl(data.imagePath);
        } else {
          console.log("No images found, setting empty array");
          // No images found
          setImagesData([]);
          setPlaceholderUrl(data?.imagePath);
        }

        // Get and store watermarkId
        if (data?.watermarkId) {
          console.log("main andar hun", data?.watermarkId);

          try {
            // Ensure watermarkId is stored as a number
            await storage.set('watermarkId', data?.watermarkId);
            console.log("watermarkId set ho gaya", data?.watermarkId);

            // Retrieve watermarkId as a number
            const wid = await storage.getNumber('watermarkId');
            console.log('watermarkId mil gaya', wid);

            // Apply watermark here if needed
            // Example: await applyWatermark(wid);
          } catch (error: any) {
            console.error('Error setting or getting watermarkId:', error);
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'Failed to set or get watermarkId in storage',
            });
          }
        }
      }
    } catch (error: any) {
      console.error('Error in getVehicleImages:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Error in applying watermark',
      });
    }
  };

  const getVehicleBasicData = async () => {
    try {
      if (vehicleId) {
        setIsLoading(true);
        const payload = {
          VehicleID: vehicleId,
        };
        const response = await vehicleBasicData(payload);
        console.log('This is vehicle basic data: ', response?.data?.data);
        setVehicleBasicsData({
          ...response?.data?.data,
          Total: response?.data?.data?.Total ?? params?.item?.Total,
        });
      }
    } catch (error: any) {
      console.log('Error: ', error?.response?.data);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    }
  };
  const getData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([getVehicleBasicData(), getVehicleImages()]);
    } catch (err: any) {
      console.log('Err: ', err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (params?.from !== 'CarModelList') {
      if (isFocused) getData();
    }

  }, [isFocused]);

  // Refresh images when returning from gallery
  useEffect(() => {
    if (isFocused) {
      getVehicleImages();
      // Reset to first image when screen is focused
      setCurrentIndex(0);
    }
  }, [isFocused]);

  // Reset to first image whenever imagesData changes
  useEffect(() => {
    if (imagesData.length > 0) {
      setCurrentIndex(0);
    }
  }, [imagesData]);

  const renderItem = ({ item, index }: { item: Item; index: number }) => {
    console.log("this is item===> fixed", item);
    return (
      <View style={{ marginTop: hp(4) }}>
        <Image
          source={vehicleBasicsData?.imageLink ? { uri: vehicleBasicsData?.imageLink } : img.placeholder}
          style={styles.vehicleImg} />
      </View>
    );
  };


  const pendingModal = (): any => {
    return (
      <View style={styles.pendingContainer}>
        <View style={styles.card}>
          <TouchableOpacity onPress={() => setIsPending(false)} style={styles.crossIcn}>
            <Image
              source={icn.cross}
              style={styles.crossIcn}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.warningSymbol}>⚠️</Text>
          {/* <ActivityIndicator size="large" color="#F59E0B" style={styles.spinner} /> */}
          <Text style={styles.text}>This feature is pending...</Text>
        </View>
      </View>
    );
  };



  const menuOptions = (): any => {
    return (
      <View style={styles.menuContainer}>
        <TouchableOpacity
          onPress={() => {
            closeMenu();
            setIsPending(true);
          }}
          style={styles.optionSpaceContainer}>
          <Text style={styles.optionName}>Auto Check Report</Text>
          <Image
            source={icn.forward}
            style={styles.forwardIcn}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            const payload = {
              vehicleId: vehicleId,
              vin: vehicleBasicsData?.VIN,
            };
            setIsLoading(true);
            const response = await getCarfax({ CustomerID: Number(payload?.vehicleId) });
            const carfaxData = response?.data?.data;
            console.log('This is carfax data: ', carfaxData);
            setIsLoading(false);
            closeMenu();
            // if(carfaxData?.carFax){
            navigation.navigate('Carfax', {
              vehicleId: vehicleId,
              carfaxData: carfaxData?.carFax,
            });
            // }else{
            // Toast.show({
            //   type: 'error',
            //   text1: 'Error',
            //   text2: 'No Carfax Report Found',
            // });
            // }
          }}
          style={styles.optionSpaceContainer}>
          <Text style={styles.optionName}>Carfax Report</Text>
          <Image
            source={icn.forward}
            style={styles.forwardIcn}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            if (!vehicleId) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Vehicle ID not found',
              });
              return;
            }
            setIsLoading(true);
            const response = await getLog({ objectId: vehicleId, objectTypeId: 6 });
            console.log('This is data', response?.data);
            setIsLoading(false);
            navigation.navigate('Log' as never, {
              vehicleId: vehicleId,
              title: 'Log',
              data: response?.data,
            } as never);
            closeMenu();
          }}
          style={styles.optionSpaceContainer}>
          <Text style={styles.optionName}>Log</Text>
          <Image
            source={icn.forward}
            style={styles.forwardIcn}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            if (!vehicleId) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Vehicle ID not found',
              });
              return;
            }
            setIsLoading(true);
            const response = await pricingLog({ vehicleId: vehicleId });
            console.log('This is data', response?.data);
            setIsLoading(false);
            navigation.navigate('Log' as never, {
              vehicleId: vehicleId,
              title: 'Pricing Log',
              data: response?.data?.data,
            } as never);
            closeMenu();
          }}
          style={styles.optionSpaceContainer}>
          <Text style={styles.optionName}>Pricing Log</Text>
          <Image
            source={icn.forward}
            style={styles.forwardIcn}
            resizeMode="contain"
          />
        </TouchableOpacity>
        {/* <TouchableOpacity
          onPress={() => {
            handleReturnPress();
            closeMenu();
          }}
          style={styles.optionSpaceContainer}>
          <Text style={styles.optionName}>Apply Pre-Configure Expense</Text>
          <Image
            source={icn.forward}
            style={styles.forwardIcn}
            resizeMode="contain"
          />
        </TouchableOpacity> */}
        <TouchableOpacity
          onPress={() => {
            Linking.openURL(
              `${CONFIG.API_BASE_URL}vehicle-recon/${params?.item?.vehicleInfo?.VehicleID}`,
            );
            closeMenu();
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
          onPress={() => {
            navigation.navigate('CarExpenses' as never, {
              item: params?.item,
              DealershipID: params?.DealershipID,
            } as never);
            closeMenu();
          }}
          style={styles.optionSpaceContainer}>
          <Text style={styles.optionName}>View Expense</Text>
          <Image
            source={icn.forward}
            style={styles.forwardIcn}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            closeMenu();
            setIsPending(true);
          }}
          style={styles.optionSpaceContainer}>
          <Text style={styles.optionName}>Push Vehicle</Text>
          <Image
            source={icn.forward}
            style={styles.forwardIcn}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    );
  };


  const changeHandler = (payload: any) => {
    console.log("================== B A S I C D A T A===================> ", vehicleBasicsData);
    console.log("================== U P D A T E D B A S I C D A T A===================> ", payload);
    setVehicleBasicsData((prev: any) => {
      return {
        ...prev,
        ...payload
      }
    })
  }

  const handleMarketingChange = (payload: any) => {
    console.log("==================----------M  -  A R K  - --------===================> ", payload);
    setVehicleBasicsData((prev: any) => {
    return {
      ...prev,
      ReducedAmount: Number(payload?.ReducedAmount),
      ReducedPrice: payload?.ReducedPrice,
    }
    });
  }




  const renderOptions = ({ item, index }: { item: Item; index: number }) => {

    // console.log('item' , item);


    const isDisabled =
      item?.name !== 'Basic' &&
      (params?.from === 'scanInventory' || params?.from === 'addInventory') &&
      !!!vehicleId;
    const isExist =
      params?.from === 'scanInventory' || params?.from === 'addInventory'
        ? !!vehicleId
        : true;
    return (
      <TouchableOpacity
        disabled={isDisabled}
        onPress={() => {
          if (item?.name == 'Gallary') {
            const vehicleId = storage.getNumber('vehicleId')?.toString() || '';
            const watermarkId = storage.getNumber('watermarkId')?.toString() || '';
            navigation.navigate('Images', {
              vehicleId,
              imagesData,
              watermarkId,
            });
          } else if (item?.name == 'Document') {
            // const vehicleId = storage.getNumber('vehicleId')?.toString() || '';
            navigation.navigate('VehicleDocuments', {
              vehicleId: params?.item?.vehicleInfo?.VehicleID,
            });
          } else if (item?.name == 'Basic') {

            console.log('This is params: ', params);

            navigation.navigate('Basics', {
              vehicleId: vehicleId,
              params: params,
              isExist: isExist,
              item: params?.item,
              changeHandler: changeHandler,
            });
          } else if (item?.name == 'Marketing') {
            navigation.navigate('Marketing', {
              vehicleId: vehicleId,
              changeHandler: handleMarketingChange,
            });
          } else if (item?.name == 'Options') {
            navigation.navigate('Options', {
              vehicleId: vehicleId,
            });
          } else if (item?.name == 'Purchase') {
            navigation.navigate('Purchase', {
              vehicleId: vehicleId,
            });
          }
        }}
        style={styles.optionContainer}>
        <Image
          resizeMode="contain"
          source={item?.img}
          style={styles.optionImg}
        />
        <Text style={styles.optionText}>{item?.name}</Text>
      </TouchableOpacity>
    );
  };

  // console.log('VehicleDetails Total:', vehicleBasicsData?.Total);
  const { item } = route.params;
  // console.log('VehicleDetails received item:', item);
  // console.log('vehicleBasicsData to view =================>' , vehicleBasicsData);
  return (
    <ScrollView >
      <View style={styles.mainView}>
        {isLoading ? (
          <ActivityIndicator
            color={Colors.primary}
            style={styles.activityIndicator}
            size={Platform.OS == 'android' ? wp(11) : 'large'}
          />
        ) : (
          <>
            <View >
              <FlatList
                data={
                  imagesData?.length > 0
                    ? [imagesData?.[0]] // Only show the first image
                    : [{ imagePath: placeholderUrl }]
                }
                horizontal={false}
                pagingEnabled={false}
                bounces={false}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                onLayout={() => {
                  console.log("=== FLATLIST DEBUG ===");
                  console.log("imagesData length:", imagesData?.length);
                  console.log("imagesData:", imagesData);
                  console.log("placeholderUrl:", placeholderUrl);
                  console.log("FlatList data:", imagesData?.length > 0 ? [imagesData?.[0]] : [{ imagePath: placeholderUrl }]);
                }}
              />
              <View style={styles.headerContainer}>
                <Header
                  title="Vehicle"
                  leftIcn={icn.back}
                  blueBackground={imagesData?.length > 0 ? true : false}
                  leftIcnStyle={styles.backIcn}
                  rightFirstIcn={icn.optionDots}
                  onLeftIconPress={() => navigation.goBack()}
                  onRightFirstIconPress={openMenu}
                />
              </View>
              {/* Removed dots container since only first image is shown */}
            </View>
            <View style={styles.subContainer}>
              <View style={styles.centerSpaceContainer}>
                <Text style={styles.carName}>
                  {`${(vehicleBasicsData?.ModelYear || vehicleBasicsData?.modelYear
                    ? `${vehicleBasicsData?.ModelYear ||
                    vehicleBasicsData?.modelYear
                    } `
                    : '') +
                    (vehicleBasicsData?.Make
                      ? vehicleBasicsData?.Make + ' '
                      : '') +
                    (vehicleBasicsData?.Model || '')
                    }`.trim() || 'Vehicle Name'}
                </Text>
                {/* {console.log('VehicleDetails Total:', vehicleBasicsData?.Total)} */}
                <Text style={styles.price}>
                  <Text style={{ textDecorationLine: vehicleBasicsData?.ReducedPrice ? 'line-through' : 'none' }}>  ${displayPrice?.toFixed(0) || '0.00'} </Text>
                  {
                    vehicleBasicsData?.ReducedPrice &&
                    <Text style={{ color: Colors.primary }}>  ${vehicleBasicsData?.ReducedAmount?.toFixed(0) || '0.00'} </Text>
                  }
                </Text>
              </View>
              <View style={styles.centerSpaceContainer}>
                <View style={styles.rowContainer}>
                  <Image
                    resizeMode="contain"
                    source={icn.vehicleCar}
                    style={styles.leftIcn}
                  />
                  <Text style={styles.model}>
                    {vehicleBasicsData?.VIN || 'N/A'}
                  </Text>
                  <TouchableOpacity onPress={copyToClipboard}>
                    <Image
                      resizeMode="contain"
                      source={icn.copy}
                      style={styles.shortIcn}
                    />
                  </TouchableOpacity>
                  {/* <Image
                    resizeMode="contain"
                    source={icn.info}
                    style={styles.shortIcn}
                  /> */}
                </View>
                <Text style={styles.subPrice}>Cost: ${vehicleCost?.toFixed(2)}</Text>
              </View>
              <View style={styles.centerSpaceContainer}>
                <View style={styles.rowContainer}>
                  <Image
                    resizeMode="contain"
                    source={icn.mile}
                    style={styles.leftIcn}
                  />
                  <Text style={styles.model}>Miles</Text>
                </View>
                <Text style={styles.subPrice}>
                  {vehicleBasicsData?.Mileage || 'N/A'} miles
                </Text>
              </View>
              <View style={styles.centerSpaceContainer}>
                <View style={styles.rowContainer}>
                  <Image
                    resizeMode="contain"
                    source={icn.pumpStation}
                    style={styles.leftIcn}
                  />
                  <Text style={styles.model}>MPG</Text>
                </View>
                <Text style={styles.subPrice}>
                  {vehicleBasicsData?.MPGCity || 'N/A'}
                </Text>
              </View>
              <View style={styles.centerSpaceContainer}>
                <View style={styles.rowContainer}>
                  <Image
                    resizeMode="contain"
                    source={icn.loc}
                    style={styles.leftIcn}
                  />
                  <Text style={styles.model}>MPG</Text>
                </View>
                <Text style={styles.subPrice}>
                  {vehicleBasicsData?.MPGHwy || 'N/A'}
                </Text>
              </View>
              <View style={styles.centerSpaceContainer}>
                <View style={styles.rowContainer}>
                  <Image
                    resizeMode="contain"
                    source={icn.carKeta}
                    style={styles.carKetaImg}
                  />
                  <View style={{ marginLeft: wp(2) }}>
                    <Text style={styles.carKetaText}>CarKeta</Text>
                    <View style={styles.rowContainer}>
                      <Text style={styles.manage}>Manage</Text>
                      <Image
                        resizeMode="contain"
                        source={icn.next}
                        style={styles.next}
                      />
                    </View>
                  </View>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.subPrice}>Transit (1,2067)</Text>
                  <Text style={styles.manage}>Current Stop</Text>
                </View>
              </View>
            </View>
            <View>
              <FlatList
                data={detailsData}
                horizontal
                showsVerticalScrollIndicator={false}
                style={{ marginLeft: wp(5), marginTop: hp(3) }}
                showsHorizontalScrollIndicator={false}
                renderItem={renderOptions}
                keyExtractor={(item: any, index: any) => index.toString()}
              />
            </View>

            {isMenuVisible && menuOptions()}
            {isPending && pendingModal()}
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default VehicleDetails;
