import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useIsFocused, useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import Modal from 'react-native-modal';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import { RootStackScreenProps } from '../../Navigation/type';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { icn } from '../../Assets/icn';
import DropDown from '../../Components/DropDown';
import Header from '../../Components/Header';
import InputBox from '../../Components/InputBox';
import PrimaryButton from '../../Components/PrimaryButton';
import Searchbar from '../../Components/Searchbar';
import {
  appointments,
  cities,
  crmDropdowns,
  crmLeads,
  emailReplies,
  overdueTasks,
  reminders,
  showroomLeads,
} from '../../Services/apis/APIs';
import { Colors } from '../../Theme/Colors';
import { hp, wp } from '../../Theme/Responsiveness';
import { styles } from './style';
import { debounce } from 'lodash';
import { ScrollView as GestureScrollView } from 'react-native-gesture-handler';
import BottomSheetInput from '../../Components/BottomSheetInput';
import {
  saveCrmDropDown,
  setCrmDropdownError,
  setCrmDropdownLoading,
} from '../../redux/slices/crmDropdownSlice';

const replyByIdDropdownData = [
  {
    label: 'All',
    value: 0,
  },
  {
    label: 'Email',
    value: 1,
  },
  {
    label: 'SMS',
    value: 2,
  },
];

type Props = RootStackScreenProps<'Crm'>;

const Crm: React.FC<Props> = ({ navigation: any, route }: any) => {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state: any) => state?.dropdownReducer);
  const [isModalVisible, setIsModalVisible] = useState<any>(false);
  const [screenFilter, setScreenFilter] = useState<any>>([
    {
      name: 'Leads',
      icn: icn?.lead,
    },
    {
      name: 'Overdue Tasks',
      icn: icn?.overdueTask,
    },
    {
      name: 'Appointments',
      icn: icn?.appointment,
    },
    {
      name: 'Reminder',
      icn: icn?.reminder,
    },
    {
      name: 'Showroom Leads',
      icn: icn?.showroomLead,
    },
    {
      name: 'Email & Text Replies',
      icn: icn?.email,
    },
  ]);
  const [date, setDate] = useState<any>(new Date());
  const [open, setOpen] = useState<any>(false);
  const [snapPoints, setSnapPoints] = useState<any>(['60%']);
  const [selectedFilter, setSelectedFilter] = useState<any>('Leads');
  const [showPlusOptions, setShowPlusOptions] = useState<any>(null);
  const [filterBottomSheetNumber, setFilterBottomSheetNumber] = useState<any>(0);
  const { control, handleSubmit, trigger, formState, resetField } = useForm();
  const isFocused = useIsFocused();
  const [dataStorage, setDataStorage] = useState<any>>({});
  const [searchedDataStorage, setSearchedDataStorage] = useState<any>>({});
  const [isLoading, setIsLoading] = useState<any>(true);
  const [refreshing, setRefreshing] = useState<any>(false);
  const [isEndDate, setIsEndDate] = useState<any>(false);
  const secondFilterDropdownData = useRef();
  const [mainFilterData, setMainFilterData] = useState<any>>({});
  const [secondFilterData, setSecondFilterData] = useState<any>>({});
  const pageRef = useRef({});
  const [isDropdownLoading, setIsDropdownLoading] = useState<any>(true);
  const pageStorageRef = useRef({});
  const pageSize = 10;
  const bottomSheetRef = useRef(null);
  const isMainFilterSelected = useRef(false);
  const [isNewPageLoading, setIsNewPageLoading] = useState<any>(false);
  const [citiesData, setCitiesData] = useState<any>([]);
  const [searchQuery, setSearchQuery] = useState<any>('');

  const updateFilterData = (key: any, value: any) => {
    setSecondFilterData(prevData => ({
      ...prevData,
      [selectedFilter]: {
        ...prevData[selectedFilter],
        [key]: value,
      },
    }));
  };
  const updateMainFilterData = (key: any, value: any) => {
    setMainFilterData(prevData => ({
      ...prevData,
      [key]: value,
    }));
  };

  const onApplyPress = (): any => {
    bottomSheetRef?.current?.close();
    isMainFilterSelected?.current = true;
    if (screenFilter?.[0]?.name !== 'Filtered Data')
      setScreenFilter(pre => [
        {
          name: 'Filtered Data',
        },
        ...pre,
      ]);
    pageRef?.current[selectedFilter] = 1;
    pageStorageRef?.current[selectedFilter] = { hasMore: true };
    if (selectedFilter === 'Filtered Data') {
      getCrmData();
    } else {
      setSelectedFilter('Filtered Data');
    }
  };

  const onSecondFilterPress = async () => {
    if (selectedFilter == 'Leads') {
      setSnapPoints(['60%']);
      setFilterBottomSheetNumber(1);
    } else if (selectedFilter == 'Appointments') {
      setSnapPoints(['45%']);
      setFilterBottomSheetNumber(3);
    } else if (selectedFilter == 'Reminder') {
      setSnapPoints(['35%']);
      setFilterBottomSheetNumber(4);
    } else if (selectedFilter == 'Showroom Leads') {
      setSnapPoints(['35%']);
      setFilterBottomSheetNumber(5);
    } else if (selectedFilter == 'Email & Text Replies') {
      setSnapPoints(['35%']);
      setFilterBottomSheetNumber(6);
    }
    bottomSheetRef?.current?.expand();
  };

  const handleApply = (): any => {
    isMainFilterSelected?.current = false;
    bottomSheetRef?.current?.close();
    pageRef?.current[selectedFilter] = 1;
    pageStorageRef?.current[selectedFilter] = { hasMore: true };
    getCrmData();
  };

  const cleanObject = obj =>
    Object.fromEntries(
      Object.entries(obj).filter(([_, value]: any) =>
          value !== undefined && value !== null && value !== false,
      ),
    );

  const getCrmData = async (from: any = '') => {
    try {
      const currentPage = pageRef?.current[selectedFilter] || 1;
      const hasMore = pageStorageRef?.current[selectedFilter]?.hasMore ?? true;
      if (!hasMore) return;
      if (from === 'footer') setIsNewPageLoading(true);
      if (from !== 'refreshing' && from !== 'footer') setIsLoading(true);
      const payload = { page: currentPage, pageSize };
      const mergedPayload = {
        ...payload,
        ...(isMainFilterSelected
          ? mainFilterData
          : secondFilterData?.[selectedFilter] && from !== 'refreshing'
            ? cleanObject(secondFilterData[selectedFilter])
            : {}),
      };

      // Transform payload to match API requirements
      const transformPayload = (data: any) => {
        const transformed = { ...data };

        // Convert string numbers to actual numbers
        if (transformed?.modelYear) {
          transformed?.modelYear = parseInt(transformed?.modelYear) || 0;
        }
        if (transformed?.makeID) {
          transformed?.makeID = transformed?.makeID?.toString();
        }
        if (transformed?.modelID) {
          transformed?.modelID = parseInt(transformed?.modelID) || 0;
        }
        if (transformed?.leadTypeID) {
          transformed?.leadTypeID = parseInt(transformed?.leadTypeID) || 0;
        }
        if (transformed?.statusID) {
          transformed?.statusID = parseInt(transformed?.statusID) || 0;
        }
        if (transformed?.assignedToID) {
          transformed?.assignedToID = parseInt(transformed?.assignedToID) || 0;
        }
        if (transformed?.sourceID) {
          transformed?.sourceID = parseInt(transformed?.sourceID) || 0;
        }
        if (transformed?.sortOrder) {
          transformed?.sortOrder = parseInt(transformed?.sortOrder) || 0;
        }

        // Add missing required fields with default values
        transformed?.temperatureID = 0;
        transformed?.assignedGroupID = 0;
        transformed?.soldAt = null;

        // Fix date format if needed
        if (transformed?.endDate && transformed?.endDate?.includes('2024-11-31')) {
          transformed?.endDate = '2024-12-31';
        }

        return transformed;
      };

      const finalPayload = transformPayload(mergedPayload);
      console.log('Final API payload:', finalPayload);

      let response;

      if (selectedFilter === 'Leads' || selectedFilter === 'Filtered Data') {
        response = await crmLeads(finalPayload);
      } else if (selectedFilter === 'Overdue Tasks') {
        response = await overdueTasks(finalPayload);
      } else if (selectedFilter === 'Appointments') {
        response = await appointments(finalPayload);
      } else if (selectedFilter === 'Reminder') {
        response = await reminders(finalPayload);
      } else if (selectedFilter === 'Showroom Leads') {
        response = await showroomLeads(finalPayload);
      } else if (selectedFilter === 'Email & Text Replies') {
        response = await emailReplies(finalPayload);
      }
      const newData = response?.data?.data || [];
      pageRef?.current[selectedFilter] = currentPage + 1;
      pageStorageRef?.current[selectedFilter] = {
        hasMore: newData?.length >= pageSize,
      };

      setDataStorage(prev => ({
        ...prev,
        [selectedFilter]:
          currentPage === 1
            ? newData
            : [...(prev[selectedFilter] || []), ...newData],
      }));
    } catch (error: any) {
      console.log(error);
      Toast?.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
      setIsNewPageLoading(false);
    }
  };

  const getCrmDropdowns = async () => {
    try {
      setIsDropdownLoading(true);
      dispatch(setCrmDropdownLoading(true));
      const response = await crmDropdowns();
      console.log('Response in Dropdown', response?.data);

      dispatch(saveCrmDropDown(response?.data));
      secondFilterDropdownData?.current = response?.data;
    } catch (error: any) {
      console.log(error?.response);
      dispatch(
        setCrmDropdownError(
          error?.response?.data?.message || 'Something went wrong!',
        ),
      );
      Toast?.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setIsDropdownLoading(false);
      dispatch(setCrmDropdownLoading(false));
    }
  };
  const getCities = async (code: string) => {
    try {
      const payload = {
        state: code,
      };
      const response = await cities(payload);
      setCitiesData(response?.data);
    } catch (error: any) {
      console.log(error?.response);
      Toast?.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setSecondFilterData(prevData => ({
      ...prevData,
      [selectedFilter]: undefined,
    }));
    pageRef?.current[selectedFilter] = 1;
    pageStorageRef?.current[selectedFilter] = { hasMore: true };
    getCrmData('refreshing');
  };

  const performSearch = useCallback(
    debounce(query => {
      if (query?.trim() !== '') {
        const filtered = dataStorage?.[selectedFilter]?.filter(item =>
          item?.customerName?.toLowerCase().includes(query?.toLowerCase()),
        );
        const updatedData = {
          ...dataStorage,
          [selectedFilter]: filtered,
        };
        setSearchedDataStorage(updatedData);
      }
    }, 300),
    [dataStorage?.[selectedFilter]],
  );

  useEffect(() => {
    performSearch(searchQuery);
    return () => performSearch?.cancel();
  }, [searchQuery, performSearch]);

  useEffect(() => {
    setSearchQuery('');
    setIsEndDate(selectedFilter !== 'Showroom Leads');
    if (selectedFilter === 'Filtered Data' || !dataStorage[selectedFilter]) {
      getCrmData();
    } else {
      setIsLoading(false);
    }
  }, [selectedFilter]);

  useEffect(() => {
    getCrmDropdowns();
  }, []);

  // Refresh data when screen comes back into focus
  useFocusEffect(useCallback(() => {
      // Refresh data when returning from other screens
      if (isFocused) {
        onRefresh();
      }
    }, [isFocused])
  );

  const renderItem = ({ item, index }: any) => {
    return (<View style={[styles?.itemContainer]}>
        <View style={styles?.rowSpaceContainer}>
          <TouchableOpacity
            onPress={() => navigation?.navigate('CrmProfile', {
              item: item, onProfileUpdated: () => {
                // Refresh the current data when profile is updated
                onRefresh();
              }
            })}>
            <Text style={styles?.itemName}>{item?.customerName}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation?.navigate('CrmProfile', {
              item: item, onProfileUpdated: () => {
                // Refresh the current data when profile is updated
                onRefresh();
              }
            })}>
            <Image
              resizeMode="contain"
              source={icn?.forward}
              style={styles?.nextImg}
            />
          </TouchableOpacity>
        </View>
        <View style={styles?.carModelContainer}>
          <Image
            resizeMode="contain"
            source={icn?.vehicleCar}
            style={styles?.vehicleIcn}
          />
          <Text style={styles?.carModel}>
            {item?.modelYear} {item?.make} {item?.model}
          </Text>
        </View>
        <View style={styles?.rowContainer}>
          <Image
            resizeMode="contain"
            source={icn?.phone}
            style={styles?.phoneIcn}
          />
          <Text style={styles?.info}>{item?.phoneNumber}</Text>
          <Image
            resizeMode="contain"
            source={icn?.separator}
            style={styles?.separator}
          />
          <Image
            resizeMode="contain"
            source={icn?.gmail}
            style={styles?.gmailIcn}
          />
          <Text style={styles?.info}>{item?.emailAddress}</Text>
        </View>
        <View style={styles?.line}></View>
        {selectedFilter == 'Leads' || selectedFilter == 'Filtered Data' ? (
          <View>
            <View style={styles?.optionValueContainer}>
              <Text style={styles?.option}>Lead Date</Text>
              <Text style={styles?.value}>
                {new Date(item?.addedOn)?.toDateString()}
              </Text>
            </View>
            {item?.lastUpdatedOn && (
              <View style={styles?.optionValueContainer}>
                <Text style={styles?.option}>Last Update</Text>
                <Text style={styles?.value}>
                  {new Date(item?.lastUpdatedOn)?.toDateString()}
                </Text>
              </View>
            )}
            <View style={styles?.optionValueContainer}>
              <Text style={styles?.option}>Assigned</Text>
              <View style={styles?.rowContainer}>
                <Text style={styles?.value}>{item?.assignedToName}</Text>
                <View style={styles?.blackDot}></View>
                <Text style={styles?.subValue}>{item?.status}</Text>
              </View>
            </View>
            <View style={styles?.optionValueContainer}>
              <Text style={styles?.option}>Source</Text>
              <View style={styles?.rowContainer}>
                <Text style={styles?.orangeValue}>{item?.sourceName}</Text>
                <View style={styles?.blackDot}></View>
                <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                  <Text style={styles?.spamValue}>Mark Spam</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : selectedFilter == 'Overdue Tasks' ? (
          <View>
            <View style={styles?.optionValueContainer}>
              <Text style={styles?.option}>Due On</Text>
              <Text style={styles?.value}>
                {new Date(item?.dueOn)?.toDateString()}
              </Text>
            </View>
            <View style={styles?.optionValueContainer}>
              <Text style={styles?.option}>Task Type</Text>
              <View style={styles?.rowContainer}>
                <Text style={styles?.value}>{item?.taskType}</Text>
                <View style={styles?.blackDot}></View>
                <Text style={styles?.subValue}>{item?.status}</Text>
              </View>
            </View>
            <View style={styles?.optionValueContainer}>
              <Text style={styles?.option}>Source</Text>
              <View style={styles?.rowContainer}>
                <Text style={styles?.orangeValue}>{item?.sourceName}</Text>
                <View style={styles?.blackDot}></View>
                <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                  <Text style={styles?.spamValue}>Mark Spam</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : selectedFilter == 'Appointments' ||
          selectedFilter == 'Showroom Leads' ? (
          <View>
            <View style={styles?.optionValueContainer}>
              <Text style={styles?.option}>Date</Text>
              <Text style={styles?.value}>
                {new Date(item?.addedOn)?.toDateString()}
              </Text>
            </View>
            <View style={styles?.optionValueContainer}>
              <Text style={styles?.option}>Last Update</Text>
              <Text style={styles?.value}>
                {new Date(item?.lastUpdatedOn)?.toDateString()}
              </Text>
            </View>
            <View style={styles?.optionValueContainer}>
              <Text style={styles?.option}>Assigned</Text>
              <View style={styles?.rowContainer}>
                <Text style={styles?.value}>{item?.assignedToName}</Text>
                <View style={styles?.blackDot}></View>
                <Text style={styles?.subValue}>{item?.status}</Text>
              </View>
            </View>
            <View style={styles?.optionValueContainer}>
              <Text style={styles?.option}>Source</Text>
              <View style={styles?.rowContainer}>
                <Text style={styles?.orangeValue}>{item?.sourceName}</Text>
                <View style={styles?.blackDot}></View>
                <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                  <Text style={styles?.spamValue}>Mark Spam</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : selectedFilter == 'Reminder' ? (
          <View>
            <View style={styles?.optionValueContainer}>
              <Text style={styles?.option}>Reminder Date</Text>
              <Text style={styles?.value}>
                {new Date(item?.addedOn)?.toDateString()}
              </Text>
            </View>
            <View style={styles?.optionValueContainer}>
              <Text style={styles?.option}>Description</Text>
              <Text style={styles?.value}>{item?.description}</Text>
            </View>
          </View>
        ) : selectedFilter == 'Email & Text Replies' ? (
          <View>
            <View style={styles?.optionValueContainer}>
              <Text style={styles?.option}>Received on</Text>
              <Text style={styles?.value}>
                {new Date(item?.MaxReceiveDate)?.toDateString()}
              </Text>
            </View>
            <View style={styles?.optionValueContainer}>
              <Text style={styles?.option}>Assigned</Text>
              <Text style={styles?.value}>{item?.assignedToName}</Text>
            </View>
            <View style={styles?.optionValueContainer}>
              <Text style={styles?.option}>Source</Text>
              <View style={styles?.rowContainer}>
                <Text style={styles?.value}>{item?.sourceName}</Text>
                <View style={styles?.blackDot}></View>
                <Text style={styles?.subValue}>{item?.status}</Text>
              </View>
            </View>
          </View>
        ) : undefined}
      </View>
    );
  };
  const renderFilters = ({ item }: any): any => (<TouchableOpacity
      onPress={() => {
        if (screenFilter?.[0]?.name === 'Filtered Data')
          setScreenFilter(prevItems => prevItems?.slice(1));
        setSelectedFilter(item?.name);
      }}
      style={[
        styles?.filterContainer,
        {
          backgroundColor:
            item?.name == selectedFilter ? Colors?.primary : Colors?.dullWhite,
        },
      ]}>
      {item?.icn && (
        <Image
          source={item?.icn}
          resizeMode="contain"
          tintColor={item?.name == selectedFilter ? Colors?.white : undefined}
          style={styles?.filterIcn}
        />
      )}
      <Text
        style={[
          styles?.filterText,
          {
            color: item?.name == selectedFilter ? Colors?.white : Colors?.black,
          },
        ]}>
        {item?.name}
      </Text>
    </TouchableOpacity>
  );
  const emptyComponent = (): any => {
    return <Text style={styles?.noDataAvailable}>No data available</Text>;
  };
  const renderFooter = (): any => {
    return (
      isNewPageLoading && (
        <ActivityIndicator
          size={Platform?.OS == 'android' ? wp(11) : 'large'}
          style={{ marginBottom: hp(3) }}
          color="#0000ff"
        />
      )
    );
  };
  const onEndReached = (): any => {
    if (
      !isNewPageLoading &&
      pageStorageRef?.current[selectedFilter]?.hasMore &&
      !searchQuery
    ) {
      getCrmData('footer');
    }
  };
  return (<Pressable
      disabled={!showPlusOptions}
      onPress={() => setShowPlusOptions(false)}
      style={styles?.mainView}>
      <View style={styles?.subContainer}>
        <Header
          title="CRM"
          // leftIcn={icn?.drawer}
          onLeftIconPress={() => { }}
          rightFirstIcn={icn?.message}
          // rightSecondIcn={icn?.setting}
          onRightFirstIconPress={() => navigation?.navigate('Chat')}
        />
        <View style={styles?.searchContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Searchbar
              styles={styles?.searchBar}
              placeholder="Search"
              inputStyle={{ width: wp(66) }}
              onChangeText={query => {
                setSearchQuery(query);
              }}
              value={searchQuery}
            />
            {searchQuery?.length > 0 && (<TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={{
                  marginLeft: wp(1),
                  padding: wp(1),
                  position: 'absolute', 
                  right: wp(2), 
                  top: hp(1)
                }}>
                <Image
                  source={icn?.cross}
                  style={[styles?.crossIcn]}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            onPress={() => {
              setFilterBottomSheetNumber(0);
              setSnapPoints(['100%']);
              bottomSheetRef?.current?.expand();
            }}>
            <Image
              source={icn?.filter}
              style={styles?.iconStyle}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <FlatList
          data={screenFilter}
          renderItem={renderFilters}
          style={{ marginTop: hp(3), maxHeight: hp(4.5) }}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
        <View style={styles?.searchContainer}>
          <Text style={styles?.leadText}>Leads</Text>
          {selectedFilter !== 'Overdue Tasks' && (
            <TouchableOpacity onPress={onSecondFilterPress}>
              <Image
                resizeMode="contain"
                source={icn?.filterLines}
                style={styles?.filterImg}
              />
            </TouchableOpacity>
          )}
        </View>
        {isLoading ? (
          <ActivityIndicator
            color={Colors?.primary}
            style={styles?.activityIndicator}
            size={Platform?.OS == 'android' ? wp(11) : 'large'}
          />
        ) : (
          <View style={{ flex: 1 }}>
            <FlatList
              contentContainerStyle={{ paddingBottom: hp(5) }}
              style={{ marginTop: hp(3) }}
              data={
                searchQuery?.length > 0
                  ? searchedDataStorage?.[selectedFilter]
                  : dataStorage[selectedFilter]
              }
              initialNumToRender={10}
              onEndReached={onEndReached}
              ListFooterComponent={renderFooter}
              onEndReachedThreshold={0.7}
              keyExtractor={(item: any, index: any) => index?.toString()}
              showsVerticalScrollIndicator={false}
              renderItem={renderItem}
              ListEmptyComponent={emptyComponent}
              refreshControl={
                <RefreshControl
                  tintColor={Colors?.primary}
                  colors={[Colors?.primary]}
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                />
              }
              keyExtractor={(item: any, index: any) => index?.toString()}
            />
            <View style={styles?.plusIcn}>
              {showPlusOptions && (<View style={styles?.plusOptionsContainer}>
                  <TouchableOpacity
                    onPress={() => {
                      setShowPlusOptions(false);
                      navigation?.navigate('AddNewLeads', {
                        dropdownData:
                          secondFilterDropdownData?.current?.leadTypesAdding,
                      });
                    }}
                    style={styles?.optionBackground}>
                    <Text style={styles?.optionName}>New Leads</Text>
                    <Image
                      source={icn?.forward}
                      style={styles?.forwardIcn}
                      tintColor={Colors?.greyIcn}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setShowPlusOptions(false);
                      navigation?.navigate('Chat', { fromCrm: true });
                    }}
                    style={styles?.optionBackground}>
                    <Text style={styles?.optionName}>CRM Messenger</Text>
                    <Image
                      source={icn?.forward}
                      style={styles?.forwardIcn}
                      tintColor={Colors?.greyIcn}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity onPress={() => setShowPlusOptions(true)}>
                <Image
                  source={icn?.addPlus}
                  style={styles?.plus}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
      <Modal backdropOpacity={0.5} isVisible={isModalVisible}>
        <View style={styles?.modalView}>
          <View style={styles?.modalContainer}>
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              style={{ alignSelf: 'flex-end' }}>
              <Image source={icn?.cross} style={styles?.crossIcn} />
            </TouchableOpacity>
            {/* <Text style={styles?.modalHeading}>
              Yahauto?.autodealerscloud?.comsays
            </Text> */}
            <Text style={styles?.confirmationText}>
              Are you sure you want to mark this lead as Spam?
            </Text>
            <View style={styles?.filterButtonsContainer}>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles?.submitContainer}>
                <Text style={styles?.submitText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles?.yesContainer}>
                <Text style={styles?.clearButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        style={{ alignItems: 'center' }}
        android_keyboardInputMode="adjustResize"
        handleIndicatorStyle={{ height: 0 }}
        snapPoints={snapPoints}
        backdropComponent={props => (
          <BottomSheetBackdrop
            {...(props || {})}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            opacity={0.3}
          />
        )}
        backgroundStyle={{
          borderTopLeftRadius: wp(5),
          borderTopRightRadius: wp(5),
        }}
        enablePanDownToClose={true}>
        <View style={styles?.indicatorContainer}>
          <View style={styles?.upperIndicator}></View>
          <View style={styles?.lowerIndicator}></View>
        </View>
        {loading || isLoading || isDropdownLoading ? (
          <ActivityIndicator
            color={Colors?.primary}
            style={{ alignSelf: 'center', top: '50%', position: 'absolute' }}
            size={Platform?.OS == 'android' ? wp(11) : 'large'}
          />
        ) : (
          <View style={{ flex: 1 }}>
            {filterBottomSheetNumber !== 0 && (
              <Text style={styles?.filterHeading}>Vehicle</Text>
            )}
            {filterBottomSheetNumber == 0 ? (
              <GestureScrollView
                contentContainerStyle={{
                  paddingBottom: hp(5),
                  paddingHorizontal: wp(3),
                }}
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}>
                <Text style={styles?.filterHeading}>Vehicle</Text>
                <Text style={styles?.bottomSheetPlaceholderText}>
                  Stock Number
                </Text>
                <BottomSheetInput
                  placeholder="Enter Stock Number"
                  onChangeText={txt => {
                    updateMainFilterData('stockNumber', txt);
                  }}
                  value={mainFilterData?.stockNumber}
                />
                <Text style={styles?.bottomSheetPlaceholderText}>VIN</Text>
                <BottomSheetInput
                  placeholder="Enter VIN Number"
                  onChangeText={txt => {
                    updateMainFilterData('vin', txt);
                  }}
                  value={mainFilterData?.vin}
                />
                <Text style={styles?.bottomSheetPlaceholderText}>
                  Model Year
                </Text>
                <BottomSheetInput
                  placeholder="Enter Model Year"
                  onChangeText={txt => {
                    updateMainFilterData('modelYear', txt);
                  }}
                  keyboardType="number-pad"
                  value={mainFilterData?.modelYear}
                />
                <Text style={styles?.bottomSheetPlaceholderText}>Make</Text>
                <DropDown
                  data={data?.vehicleMake}
                  placeholder={'Select'}
                  value={mainFilterData?.makeID}
                  labelField="description"
                  valueField="makeID"
                  setValue={value => updateMainFilterData('makeID', value)}
                  rightIcon
                />
                <Text style={styles?.bottomSheetPlaceholderText}>Model</Text>
                <DropDown
                  data={data?.vehicleModel}
                  placeholder={'Select'}
                  labelField="description"
                  valueField="modelID"
                  value={mainFilterData?.modelID}
                  setValue={value => updateMainFilterData('modelID', value)}
                  rightIcon
                />
                <Text style={styles?.filterHeading}>Customer</Text>
                <Text style={styles?.bottomSheetPlaceholderText}>
                  Start Date
                </Text>
                <BottomSheetInput
                  placeholder="Start Date (YYYY-MM-DD)"
                  onChangeText={txt => {
                    updateMainFilterData('startDate', txt);
                  }}
                  value={mainFilterData?.startDate}
                />
                <Text style={styles?.bottomSheetPlaceholderText}>End Date</Text>
                <BottomSheetInput
                  placeholder="End Date (YYYY-MM-DD)"
                  onChangeText={txt => {
                    updateMainFilterData('endDate', txt);
                  }}
                  value={mainFilterData?.endDate}
                />
                <Text style={styles?.bottomSheetPlaceholderText}>Customer</Text>
                <BottomSheetInput
                  placeholder="Enter Customer Name"
                  onChangeText={txt => {
                    updateMainFilterData('customer', txt);
                  }}
                  value={mainFilterData?.customer}
                />
                <Text style={styles?.bottomSheetPlaceholderText}>Phone</Text>
                <BottomSheetInput
                  placeholder="Enter Customer Phone"
                  onChangeText={txt => {
                    updateMainFilterData('phone', txt);
                  }}
                  value={mainFilterData?.phone}
                />
                <Text style={styles?.bottomSheetPlaceholderText}>Email</Text>
                <BottomSheetInput
                  placeholder="Enter Customer Email"
                  onChangeText={txt => {
                    updateMainFilterData('email', txt);
                  }}
                  value={mainFilterData?.email}
                />
                <Text style={styles?.bottomSheetPlaceholderText}>Sold At</Text>
                <DropDown
                  data={secondFilterDropdownData?.current?.soldAt}
                  placeholder={'Select'}
                  value={mainFilterData?.soldAt}
                  labelField="description"
                  valueField="soldAtId"
                  setValue={() => { }}
                  onChange={item => {
                    updateMainFilterData('soldAt', item?.leadTypeId);
                  }}
                  style={styles?.filterBottomDropDownContainer}
                  rightIcon
                />
                <Text style={styles?.bottomSheetPlaceholderText}>State</Text>
                <DropDown
                  data={secondFilterDropdownData?.current?.states}
                  placeholder={'Select'}
                  value={mainFilterData?.state}
                  labelField="stateName"
                  valueField="code"
                  setValue={() => { }}
                  onChange={item => {
                    getCities(item?.code);
                    updateMainFilterData('state', item?.code);
                  }}
                  style={styles?.filterBottomDropDownContainer}
                  rightIcon
                />
                <Text style={styles?.bottomSheetPlaceholderText}>City</Text>
                <BottomSheetInput
                  placeholder="Enter City"
                  onChangeText={txt => {
                    updateMainFilterData('city', txt);
                  }}
                  value={mainFilterData?.city}
                />
                <Text style={styles?.bottomSheetPlaceholderText}>Zip Code</Text>
                <BottomSheetInput
                  placeholder="Enter Customer Zip Code"
                  onChangeText={txt => {
                    updateMainFilterData('zipCode', txt);
                  }}
                  value={mainFilterData?.zipCode}
                />
                <Text style={styles?.filterHeading}>Sort</Text>
                <Text style={styles?.bottomSheetPlaceholderText}>Lead Type</Text>
                <DropDown
                  data={secondFilterDropdownData?.current?.leadTypesFilter}
                  placeholder={'Select'}
                  style={styles?.filterBottomDropDownContainer}
                  labelField="description"
                  valueField="leadTypeId"
                  value={mainFilterData?.leadTypeID}
                  setValue={value => updateMainFilterData('leadTypeID', value)}
                  rightIcon
                />
                <Text style={styles?.bottomSheetPlaceholderText}>Status</Text>
                <DropDown
                  data={secondFilterDropdownData?.current?.leadStatus}
                  placeholder={'Select'}
                  style={styles?.filterBottomDropDownContainer}
                  labelField="description"
                  valueField="statusId"
                  value={mainFilterData?.statusID}
                  setValue={value => updateMainFilterData('statusID', value)}
                  rightIcon
                />
                <Text style={styles?.bottomSheetPlaceholderText}>
                  Assigned To
                </Text>
                <DropDown
                  data={secondFilterDropdownData?.current?.assignedTo}
                  placeholder={'Select'}
                  style={styles?.filterBottomDropDownContainer}
                  labelField="description"
                  valueField="assignedToId"
                  value={mainFilterData?.assignedToID}
                  setValue={value =>
                    updateMainFilterData('assignedToID', value)
                  }
                  rightIcon
                />
                <Text style={styles?.bottomSheetPlaceholderText}>
                  Assigned Group
                </Text>
                <DropDown
                  data={secondFilterDropdownData?.current?.assignedGroup}
                  placeholder={'Select'}
                  style={styles?.filterBottomDropDownContainer}
                  labelField="GroupName"
                  valueField="GroupID"
                  value={mainFilterData?.assignedGroupID}
                  setValue={value =>
                    updateMainFilterData('assignedGroupID', value)
                  }
                  rightIcon
                />
                <Text style={styles?.bottomSheetPlaceholderText}>Source</Text>
                <DropDown
                  data={secondFilterDropdownData?.current?.leadSources}
                  placeholder={'Select'}
                  style={styles?.filterBottomDropDownContainer}
                  labelField="description"
                  valueField="sourceId"
                  value={mainFilterData?.sourceID}
                  setValue={value => updateMainFilterData('sourceID', value)}
                  rightIcon
                />
                <Text style={styles?.bottomSheetPlaceholderText}>Sort By</Text>
                <DropDown
                  data={secondFilterDropdownData?.current?.sortBy}
                  placeholder={'Select'}
                  style={styles?.filterBottomDropDownContainer}
                  labelField="description"
                  valueField="columnName"
                  value={mainFilterData?.sortBy}
                  setValue={value => updateMainFilterData('sortBy', value)}
                  rightIcon
                />
                <Text style={styles?.bottomSheetPlaceholderText}>
                  Sort Order
                </Text>
                <DropDown
                  data={secondFilterDropdownData?.current?.sortOrder}
                  placeholder={'Select'}
                  style={styles?.filterBottomDropDownContainer}
                  labelField="label"
                  valueField="value"
                  value={mainFilterData?.sortOrder}
                  setValue={value => updateMainFilterData('sortOrder', value)}
                  rightIcon
                />
                <PrimaryButton
                  style={styles?.applyButton}
                  onPress={onApplyPress}
                  title="Apply"
                />
              </GestureScrollView>
            ) : filterBottomSheetNumber == 1 ? (<View>
                <DropDown
                  data={secondFilterDropdownData?.current?.leadTypesFilter}
                  placeholder={'All Types'}
                  value={secondFilterData?.selectedFilter?.leadTypeID}
                  labelField="description"
                  valueField="leadTypeId"
                  style={styles?.filterDropDownContainer}
                  setValue={() => { }}
                  onChange={item => {
                    updateFilterData('leadTypeID', item?.leadTypeId);
                  }}
                  rightIcon
                />
                <DropDown
                  data={secondFilterDropdownData?.current?.assignedTo}
                  placeholder={'All Assigned'}
                  style={styles?.filterDropDownContainer}
                  labelField="description"
                  valueField="assignedToId"
                  value={secondFilterData?.selectedFilter?.assignedToID}
                  setValue={() => { }}
                  onChange={item => {
                    updateFilterData('assignedToID', item?.assignedToId);
                  }}
                  rightIcon
                />
                <DropDown
                  data={secondFilterDropdownData?.current?.leadSources}
                  placeholder={'All Sources'}
                  style={styles?.filterDropDownContainer}
                  labelField="description"
                  valueField="sourceId"
                  value={secondFilterData?.selectedFilter?.sourceID}
                  setValue={() => { }}
                  onChange={item => {
                    updateFilterData('sourceID', item?.sourceId);
                  }}
                  rightIcon
                />
                <DropDown
                  data={secondFilterDropdownData?.current?.leadStatus}
                  placeholder={'All Statuses'}
                  dropdownPosition="top"
                  style={styles?.filterDropDownContainer}
                  labelField="description"
                  valueField="statusId"
                  value={secondFilterData?.selectedFilter?.statusID}
                  setValue={() => { }}
                  onChange={item => {
                    updateFilterData('statusID', item?.statusId);
                  }}
                  rightIcon
                />
              </View>
            ) : filterBottomSheetNumber == 3 ||
              filterBottomSheetNumber == 4 ||
              filterBottomSheetNumber == 5 ? (<View>
                <TouchableOpacity
                  style={styles?.dateContainer}
                  onPress={() => {
                    setOpen(true);
                  }}>
                  <InputBox
                    placeholder="Start Date - End Date"
                    value={
                      isEndDate
                        ? `${secondFilterData?.[selectedFilter]?.startDate ||
                        'Start Date'
                        }-${secondFilterData?.[selectedFilter]?.endDate ||
                        'End Date'
                        }`
                        : `${secondFilterData?.[selectedFilter]?.date || 'Date'
                        }`
                    }
                    style={{ paddingVertical: hp(0.4) }}
                    onChangeText={() => { }}
                    blueBorder
                    numberOfCharacter={150}
                    rightIcon={icn?.calender}
                    disabled
                  />
                </TouchableOpacity>
                {selectedFilter === 'Appointments' && (<DropDown
                    data={secondFilterDropdownData?.current?.assignedTo}
                    placeholder={'All Assigned'}
                    style={styles?.filterDropDownContainer}
                    labelField="description"
                    valueField="assignedToId"
                    value={secondFilterData?.selectedFilter?.assignedToID}
                    setValue={() => { }}
                    onChange={item => {
                      updateFilterData('assignedToID', item?.assignedToId);
                    }}
                    rightIcon
                  />
                )}
              </View>
            ) : (filterBottomSheetNumber == 6 && (
                <View>
                  <DropDown
                    data={replyByIdDropdownData}
                    placeholder={'Reply By'}
                    style={styles?.filterDropDownContainer}
                    labelField="label"
                    valueField="value"
                    value={secondFilterData?.selectedFilter?.replyByID}
                    setValue={() => { }}
                    onChange={item => {
                      updateFilterData('replyByID', item?.value);
                    }}
                    rightIcon
                  />
                </View>
              )
            )}
            {filterBottomSheetNumber != 0 && (
              <PrimaryButton
                style={styles?.applyButton}
                onPress={handleApply}
                title="Apply"
              />
            )}
          </View>
        )}
      </BottomSheet>
      <DatePicker
        modal
        open={open}
        date={date}
        title={
          isEndDate
            ? !secondFilterData?.[selectedFilter]?.startDate ||
              secondFilterData?.[selectedFilter]?.endDate
              ? 'Start Date'
              : 'End Date'
            : 'Select Date'
        }
        mode="date"
        theme="light"
        onConfirm={selectedDate => {
          const dateOnly = selectedDate?.toISOString().split('T')[0];
          if (isEndDate) {
            if (
              !secondFilterData?.[selectedFilter]?.startDate ||
              (secondFilterData?.[selectedFilter]?.startDate &&
                secondFilterData?.[selectedFilter]?.endDate)
            ) {
              updateFilterData('startDate', dateOnly);
              updateFilterData('endDate', undefined);
              setOpen(false);
              setTimeout(() => setOpen(true), 300);
            } else {
              updateFilterData('endDate', dateOnly);
              setOpen(false);
            }
          } else {
            updateFilterData('date', dateOnly);
            setOpen(false);
          }
        }}
        onCancel={() => setOpen(false)}
      />
    </Pressable>
  );
};

export default Crm;
