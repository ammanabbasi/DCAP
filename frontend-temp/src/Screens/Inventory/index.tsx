import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { icn } from '../../Assets/icn';
import Header from '../../Components/Header';
import Searchbar from '../../Components/Searchbar';
import { Colors } from '../../Theme/Colors';
import { hp, wp } from '../../Theme/Responsiveness';
import { styles } from './style';
import Toast from 'react-native-toast-message';
import { categories, searchCategories } from '../../Services/apis/APIs';
import { debounce } from 'lodash';
import { storage } from '../../redux/mmkv/storage';
const Inventory = (): any => {
  const dispatch = useDispatch();
  const navigation: any = useNavigation();
  const [selectedMonth, setSelectedMonth] = useState<any>('July');
  const [isLoading, setIsLoading] = useState<any>(true);
  const [isSquareSelected, setIsSquareSelected] = useState<any>(true);
  const [categoriesData, setCategoriesData] = useState<any>([]);
  const [searchedData, setSearchedData] = useState<any>(undefined);
  const [searchQuery, setSearchQuery] = useState<any>(null);
  const isFocused = useIsFocused();
  const [refreshing, setRefreshing] = useState<any>(false);
  const [vehicleCount, setVehicleCount] = useState<any>(0);
  const [selectedTab, setSelectedTab] = useState<any>('ALL');
  const renderInSquared = ({ item }: { item: any }) => {
    return (<TouchableOpacity
        onPress={() =>
          navigation?.navigate('CarModelList', {
            makeId: item?.MakeID,
            name: item?.Description,
            DealershipID: item?.DealershipID,
          })
        }
        style={styles?.brandContainer}>
        <Image
          source={icn?.forward}
          style={styles?.forwardIcn}
          resizeMode="contain"
        />
        <Image source={{ uri: item?.imageLink }} style={styles?.img} />
        {
          selectedTab === 'ALL' && (  
            <Text style={styles?.model}>{`${item?.Description}-${item?.vehicleCount}`}</Text>
          )
        }
        {
          selectedTab === 'LIVE' && (  
            <Text style={styles?.model}>{`${item?.Description}-${item?.LiveCount}`}</Text>
          )
        }
        {
          selectedTab === 'INPROGRESS' && (  
            <Text style={styles?.model}>{`${item?.Description}-${item?.InProgressCount}`}</Text>
          )
        }
        
        
      </TouchableOpacity>
    );
  };
  const renderInList = ({ item }: { item: any }) => {
    return (<TouchableOpacity
        onPress={() =>
          navigation?.navigate('CarModelList', {
            makeId: item?.MakeID,
            name: item?.Description,
            DealershipID: item?.DealershipID,
          })
        }
        style={styles?.rowSpaceContainer}>
        <View style={styles?.rowContainer}>
          <View style={styles?.imgContainer}>
            <Image
              source={{ uri: item?.imageLink }}
              style={styles?.listImg}
              resizeMode="contain"
            />
          </View>
          <Text style={styles?.listModel}>{`${item?.Description}-${item?.vehicleCount}`}</Text>
        </View>
        <Image
          source={icn?.forward}
          style={styles?.listForwardIcn}
          resizeMode="contain"
        />
      </TouchableOpacity>
    );
  };
  const emptyComponent = (): any => {
    return <Text style={styles?.noDataAvailable}>No data available</Text>;
  };
  const debouncedSearch = useCallback(
    debounce(async searchQuery => {
      if (!searchQuery) {

        setSearchedData(undefined);
        return;
      }
      try {
        // const response = await searchCategories({ description: searchQuery });
        const filteredData = categoriesData?.filter((item: any) => item?.Description?.toLowerCase().includes(searchQuery?.toLowerCase()));
        setSearchedData(filteredData);
      } catch (error: any) {
        setSearchedData([]);
        Toast?.show({
          type: 'error',
          text1: 'Error',
          text2: error?.response?.data?.message || 'Something went wrong!',
        });
      }
    }, 250),
    [],
  );
  useEffect(() => {
    return () => debouncedSearch?.cancel();
  }, [debouncedSearch]);
  const getCategoriesData = async () => {
    try {
      if (!refreshing) setIsLoading(true);
      const response = await categories();
      setCategoriesData(response?.data?.data);
      setVehicleCount({
        total: response?.data?.totalCount || 0,
        live: response?.data?.liveCount || 0,
        inprogress: response?.data?.inProgressCount || 0,
      });
    } catch (error: any) {
      console.log(error?.response);
      Toast?.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  const onRefresh = async () => {
    setRefreshing(true);
  };

  useEffect(() => {
    if (refreshing || isLoading) getCategoriesData();
  }, [refreshing]);
  return (<View style={styles?.mainView}>
      <View style={styles?.subContainer}>
        <Header
          title="Inventory"
          // leftIcn={icn?.drawer}
          onLeftIconPress={() => { }}
          rightFirstIcn={icn?.message}
          // rightSecondIcn={icn?.setting}
          onRightFirstIconPress={() => navigation?.navigate('Chat')}
        />
        {isLoading ? (
          <ActivityIndicator
            color={Colors?.primary}
            style={styles?.activityIndicator}
            size={Platform?.OS == 'android' ? wp(11) : 'large'}
          />
        ) : (
          <>
            <Searchbar
              placeholder="Search"
              onChangeText={(txt: any) => {
                setSearchQuery(txt);
                debouncedSearch(txt);
              }}
            />
            <View style={styles?.addIconContainer}>
              {/* decode start*/}
              {/* <TouchableOpacity
                onPress={() =>
                  navigation?.navigate('decode', {from: 'addInventory'})
                } style={{marginRight: wp(2)}}>
                <Image
                  resizeMode="contain"
                  source={icn?.squareScan}
                  style={styles?.scanIcn}
                />
              </TouchableOpacity> */}
              {/* decode end */}
              <TouchableOpacity
                onPress={() => {
                  storage?.delete('vehicleId');
                  navigation?.navigate('VehicleDetails', { from: 'addInventory' });
                }}>
                <Image
                  resizeMode="contain"
                  source={icn?.squarePlus}
                  style={styles?.addIcn}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  navigation?.navigate('ScanDocument', { from: 'addInventory' })
                }>
                <Image
                  resizeMode="contain"
                  source={icn?.squareScan}
                  style={styles?.scanIcn}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  navigation?.navigate('ScanDocument', { from: 'addInventory', method: "manual" })
                }>
                <Image
                  resizeMode="contain"
                  source={icn?.edit}
                  style={styles?.scanIcn}
                />
              </TouchableOpacity>
            </View>


            {/* Tab group with dummy stats */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: hp(2) }}>
              {[
                { label: 'ALL', stat: vehicleCount?.total },
                { label: 'LIVE', stat: vehicleCount?.live },
                { label: 'INPROGRESS', stat: vehicleCount?.inprogress },
              ].map(tab => (
                <TouchableOpacity
                  key={tab?.label}
                  onPress={async (: any) => {
                    setSelectedTab(tab?.label);
                    // handleTabClick(tab?.label);
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: selectedTab === tab?.label ? Colors?.primary : '#f5f5f5',
                    paddingVertical: hp(1),
                    marginHorizontal: wp(1),
                    borderRadius: wp(2),
                    display: 'flex',
                    flexDirection: 'column',
                    gap: hp(0?.2),
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: wp(2),
                  }}
                >
                  <Text style={{
                    color: selectedTab === tab?.label ? '#fff' : Colors?.primary,
                    fontWeight: '600',
                    fontSize: wp(3.8),
                  }}>{tab?.label}</Text>
                  <Text style={{
                    color: selectedTab === tab?.label ? '#fff' : Colors?.primary,
                    fontSize: wp(3.4),
                    // marginTop: hp(0?.5),
                  }}>{tab?.stat}</Text>
                </TouchableOpacity>
              ))}
            </View>


              <FlatList
                key={isSquareSelected ? 'square' : 'list'}
                data={
                  searchQuery?.length > 0 && searchedData
                    ? searchedData
                    : categoriesData
                }
                ListEmptyComponent={emptyComponent}
                renderItem={isSquareSelected ? renderInSquared : renderInList}
                numColumns={isSquareSelected ? 2 : 1}
                columnWrapperStyle={
                  isSquareSelected ? styles?.columnWrapper : null
                }
                contentContainerStyle={styles?.content}
                style={{ marginTop: hp(3) , marginBottom: hp(10) }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    tintColor={Colors?.primary}
                    colors={[Colors?.primary]}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }
              />
            </>
        )}
          </View>

      </View>
      );
};

      export default Inventory;
