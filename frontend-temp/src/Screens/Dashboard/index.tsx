import {useIsFocused, useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import {Dropdown} from 'react-native-element-dropdown';
import {BarChart, LineChart, PieChart} from 'react-native-gifted-charts';
import Toast from 'react-native-toast-message';
import {useDispatch, useSelector} from 'react-redux';
import {icn} from '../../Assets/icn';
import Header from '../../Components/Header';
import Searchbar from '../../Components/Searchbar';
import {
  dashboard,
  inventoryDropdown,
  getEmployeeAccess,
  weeklyRevenue,
} from '../../Services/apis/APIs';
import {Colors} from '../../Theme/Colors';
import {hp, wp} from '../../Theme/Responsiveness';
import Typography from '../../Theme/Typography';
import {styles} from './style';
import {
  saveDropDown,
  setDropdownError,
  setDropdownLoading,
} from '../../redux/slices/dropdownSlice';
import {
  saveEmployeeRole, setEmployeeRoleLoading, setEmployeeRoleError
} from '../../redux/slices/employeeRoleSlice';
import DeviceInfo from 'react-native-device-info';
const years = [
  {value: 2008, label: '2008'},
  {value: 2009, label: '2009'},
  {value: 2010, label: '2010'},
  {value: 2011, label: '2011'},
  {value: 2012, label: '2012'},
  {value: 2013, label: '2013'},
  {value: 2014, label: '2014'},
  {value: 2015, label: '2015'},
  {value: 2016, label: '2016'},
  {value: 2017, label: '2017'},
  {value: 2018, label: '2018'},
  {value: 2019, label: '2019'},
  {value: 2020, label: '2020'},
  {value: 2021, label: '2021'},
  {value: 2022, label: '2022'},
  {value: 2023, label: '2023'},
  {value: 2024, label: '2024'},
  {value: 2025, label: '2025'},
];
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const Dashboard = (): any => {
  const dispatch = useDispatch();
  const navigation: any = useNavigation();
  const [lineData, setLineData] = useState<any>(null);
  const isFocused = useIsFocused();
  const [pieData, setPieData] = useState<any>([
    {value: 0, color: 'gray', text: 'Loading...'},
  ]);
  const [selectedMonth, setSelectedMonth] = useState<any>('July');
  const [isLoading, setIsLoading] = useState<any>(true);
  const [refreshing, setRefreshing] = useState<any>(false);
  const [revenueLoading, setRevenueLoading] = useState<any>(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [barChartData, setBarChartData] = useState<any>(null);
  const [yAxisLabel, setYAxisLabel] = useState<any>(null);
  const [weeklyRevenueData, setWeeklyRevenueData] = useState<any>(null);
  const [isModalVisible, setModalVisible] = useState<any>(false);
  const [selectedStackData, setSelectedStackData] = useState<any>([]);

  const [selectedYear, setSelectedYear] = useState<any>(
    new Date().getFullYear()?.toString(),
  );
  const handleBarClick = (stacks: any) => {
    console.log('this is stacks', stacks,'    ');
    setSelectedStackData(stacks);
    setModalVisible(true);
  };
  const transformData = (backendData: any) => {
    const colors = {
      Cash: Colors?.chartPurple,
      Consignment: Colors?.primary,
      FloorPlan: '#000000',
    };
    return backendData?.map((item: any, index: any, arr: any) => {
      const label = `${item?.AgeBucket}`;
      console.log('this is item', item,'    ');
      return {
        stacks: [
          {
            value: item?.Cash,
            color: colors?.Cash,
            label: 'Cash',
            marginBottom: 1,
          },
          {
            value: item?.Consignment,
            color: colors?.Consignment,
            label: 'Consignment',
            marginBottom: 1,
          },
          {
            value: item?.FloorPlan,
            color: colors?.FloorPlan,
            label: 'FP',
            marginBottom: 1,
          },
        ],
        label,

        onPress: () =>
          handleBarClick([
            {
              value: item?.Cash,
              label: 'Cash',
            },
            {
              value: item?.Consignment,
              label: 'Consignment',
            },
            {
              value: item?.FloorPlan,
              label: 'FP',
            },
          ]),
          
      };
    });
  };
  const getDashboard = async () => {
    try {
      const response = await dashboard();
      setDashboardData(response?.data);
      const barChart = transformData(response?.data?.InventoryAge);

      console.log('this is barChart', barChart,'    ');
      setBarChartData(barChart);
      const leadsStatus = response?.data?.LeadsStatus;
      setPieData([
        {
          value: Number(leadsStatus?.AwaitingResponse) || 0,
          color: Colors?.primary,
          text: `${leadsStatus?.AwaitingResponse || 0}%`,
        },
        {
          value: Number(leadsStatus?.Responded) || 0,
          color: Colors?.chartPurple,
          text: `${leadsStatus?.Responded || 0}%`,
        },
        {
          value: Number(leadsStatus?.NotResponded) || 0,
          color: 'black',
          text: `${leadsStatus?.NotResponded || 0}%`,
        },
      ]);
    } catch (error: any) {
      console.log(error);
      Toast?.show({
        type: 'error',
        text1: 'Error',
        text2: (error as any)?.response?.data?.message || 'Something went wrong!',
      });
    }
  };
  const getWeeklyRevenue = async (from: any = 'fetch', userSelectedYear: any = selectedYear) => {
    try {
      if (from === 'selection') setRevenueLoading(true);
      const payload = {
        year: userSelectedYear,
      };
      console.log('this is payload', payload,'    ');
      const response = await weeklyRevenue(payload);
      const dataToLoop =
        response?.data?.data?.length > 0 ? response?.data?.data : months;
      const formattedData = dataToLoop?.map((item: any, index: any) => {
        console.log('this is item of formattted data', item,'    '); 
        return {
          value: item?.Revenue || 0,
          label: item?.Month || months[index],
        };

      });
      const totalRevenue = response?.data?.data?.reduce((sum: any, item: any) => sum + item?.Revenue,
        0,
      );
      const isMillions = totalRevenue >= 1_000_000;
      const scaleFactor = isMillions ? 1_000_000 : 1_000;
      const scaleLabel = isMillions ? 'M' : 'k';
      const maxYAxisValue =
        Math.ceil(totalRevenue / (scaleFactor * 5)) * (scaleFactor * 5);
      const yAxisLabelTexts = Array.from({length: 6}, (_: any, index: any) => {
        const step = maxYAxisValue / 5;
        const value = index * step;
        return value === 0
          ? '0'
          : `${(value / scaleFactor).toFixed(1)}${scaleLabel}`;
      });
      setYAxisLabel(yAxisLabelTexts as any);
      setLineData(formattedData);
    } catch (error: any) {
      console.log(error);
      Toast?.show({
        type: 'error',
        text1: 'Error',
        text2:
          (error as any)?.response?.data?.message ||
          (error as any)?.response?.data?.error ||
          'Something went wrong!',
      });
    } finally {
      setRevenueLoading(false);
    }
  };
  const onRefresh = async () => {
    setRefreshing(true);
  };
  const fetchData = async () => {
    try {
      if (!refreshing) setIsLoading(true);
      await Promise?.all([getDashboard(), getWeeklyRevenue()]);
    } catch (error: any) {
      console.error('Error fetching data', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    if (refreshing || isLoading) fetchData();
  }, [refreshing]);
  const getInventoryDropdownData = async () => {
    try {
      dispatch(setDropdownLoading(true));
      dispatch(saveDropDown(null));
      const response = await inventoryDropdown();
      dispatch(saveDropDown(response?.data));
    } catch (error: any) {
      dispatch(setDropdownError((error as any)?.response?.data));
      console.log(
        'Error on inventory dropdown: ',
        (error as any)?.response?.data || error,
      );
    } finally {
      dispatch(setDropdownLoading(false));
    }
  };
  const getEmployeeRole = async () => {
    try {
      dispatch(setEmployeeRoleLoading(true));
      dispatch(saveEmployeeRole(null));
      console.log('getEmployeeRole =========================================r >');
      const response = await getEmployeeAccess();
      console.log('response for employee role =========================================r >', response?.data);
      dispatch(saveEmployeeRole(response?.data?.data));
    } catch (error: any) {
      dispatch(setEmployeeRoleError((error as any)?.response?.data));
      console.log(
        'Error on inventory dropdown: ',
        (error as any)?.response?.data || error,
      );
    } finally {
      dispatch(setEmployeeRoleLoading(false));
    }
  };
  useEffect(() => {
    getInventoryDropdownData();
    getEmployeeRole();
  }, []);
  useEffect(() => {
    if (isFocused && isModalVisible) {
      setTimeout((: any) => {
        setModalVisible(false);
      }, 2000);
    }
  }, [isModalVisible]);
  const maxRevenue = lineData && lineData?.length > 0
    ? Math.max(...lineData?.map(item => item?.value))
    : 0;

  // Add some headroom (e?.g., 10% more)
  const chartMaxValue = Math.ceil(maxRevenue * 1?.1 / 1000) * 1000;
  return (<View style={styles?.mainView}>
      <Header
        title="Dashboard"
        // leftIcn={icn?.drawer}
        style={styles?.subContainer}
        onLeftIconPress={() => {}}
        rightFirstIcn={icn?.message}
        // rightSecondIcn={icn?.setting}
        onRightFirstIconPress={() => navigation?.navigate('Chat' as never)}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            tintColor={Colors?.primary}
            colors={[Colors?.primary]}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        contentContainerStyle={styles?.contentContainer}>
        {isLoading ? (
          <ActivityIndicator
            color={Colors?.primary}
            style={styles?.activityIndicator}
            size={Platform?.OS == 'android' ? wp(11) : 'large'}
          />
        ) : (<>
            {/* <Searchbar placeholder="Search" onChangeText={(: any) => {}} /> */}
            <View style={styles?.spaceContainer}>
              <View style={styles?.infoContainer}>
                <TouchableOpacity onPress={() => navigation?.navigate('Inventory' as never)}>
                  <Text style={styles?.infoHeadingText}>Inventory</Text>
                  <Text style={styles?.infoSubheadingText}>
                    {(dashboardData as any)?.InventoryAndCRM?.Inventory}
                    <Text style={styles?.infoText}> / Vehicles </Text>
                  </Text>
                </TouchableOpacity>
                <Image
                  source={icn?.infoInventory}
                  resizeMode="contain"
                  style={styles?.infoImg}
                />
              </View>
              <View style={styles?.infoContainer}>
                <TouchableOpacity onPress={() => navigation?.navigate('CRM' as never)}>
                  <Text style={styles?.infoHeadingText}>CRM</Text>
                  <Text style={styles?.infoSubheadingText}>
                    {(dashboardData as any)?.InventoryAndCRM?.CRM}
                    <Text style={styles?.infoText}> / New Leads </Text>
                  </Text>
                </TouchableOpacity>
                <Image
                  source={icn?.infoCrm}
                  resizeMode="contain"
                  style={styles?.infoImg}
                />
              </View>
            </View>
            <Text style={styles?.chartTitle}>Inventory Age</Text>
            <View style={styles?.chartContainer}>
              <View style={[styles?.rowSpaceContainer, {marginBottom: hp(1)}]}>
                <View style={styles?.rowContainer}>
                  <View style={styles?.chartTextContainer}>
                    <View style={styles?.colorPurpleIndicator}></View>
                    <Text
                      style={[
                        styles?.chartIndicatorText,
                        {fontFamily: Typography?.poppins?.Medium},
                      ]}>
                      Cash
                    </Text>
                  </View>
                  <View style={styles?.chartTextContainer}>
                    <View style={styles?.colorBlackIndicator}></View>
                    <Text
                      style={[
                        styles?.chartIndicatorText,
                        {fontFamily: Typography?.poppins?.Medium},
                      ]}>
                      FP
                    </Text>
                  </View>
                  <View style={styles?.chartTextContainer}>
                    <View style={styles?.colorIndicator}></View>
                    <Text
                      style={[
                        styles?.chartIndicatorText,
                        {fontFamily: Typography?.poppins?.Medium},
                      ]}>
                      Consignment
                    </Text>
                  </View>
                </View>
                {/* <View style={styles?.numberContainer}>
                  <Text style={styles?.numberText}>157</Text>
                </View> */}
              </View>
              <BarChart
                noOfSections={4}
                stackData={barChartData}
                yAxisTextStyle={{color: Colors?.greyIcn, fontSize: wp(3)}}
                xAxisLabelTextStyle={{color: Colors?.greyIcn, fontSize: wp(3)}}
                barWidth={wp(5)}
                spacing={wp(10)}
                barBorderRadius={3}
                barMarginBottom={10}
                xAxisThickness={0}
                yAxisThickness={0}
                disableScroll
              />
            </View>
            <View style={styles?.rowSpaceContainer}>
              <Text style={[styles?.chartTitle, {marginTop: hp(3)}]}>
                Revenue
              </Text>
              <Dropdown

                style={[
                  styles?.dropdown,
                  {
                    width: selectedMonth?.length >= 7 ? wp(38) : wp(29),
                  },
                ]}
                placeholderStyle={styles?.placeholderStyle}
                itemTextStyle={styles?.selectedTextStyle}
                selectedTextStyle={styles?.selectedTextStyle}
                inputSearchStyle={styles?.inputSearchStyle}
                iconStyle={styles?.iconStyle}
                data={years}
                containerStyle={styles?.containerStyle}
                maxHeight={hp(20)}
                labelField="label"
                valueField="value"
                placeholder={selectedYear}
                searchPlaceholder="Search..."
                value={selectedYear}
                onChange={item => {
                  setSelectedYear(item?.value);
                  getWeeklyRevenue('selection', item?.value);
                }}
              />
            </View>
            <View style={styles?.chartContainer}>
              <LineChart
                data={lineData}
                curved
                thickness={3}
                color1={Colors?.primary}
                color2={Colors?.chartPurple}
                dataPointsColor1={Colors?.primary}
                dataPointsColor2={Colors?.chartPurple}
                startFillColor1="skyblue"
                startFillColor2={Colors?.chartPurple}
                yAxisLabelPrefix="$"
                adjustToWidth
                noOfSections={4}
                initialSpacing={30}
                spacing={wp(19)}
                scrollAnimation
                xAxisThickness={0}
                yAxisThickness={0}
                yAxisTextStyle={{
                  color: Colors?.greyIcn,
                  fontSize: DeviceInfo?.isTablet() ? wp(2) : wp(3),
                  minWidth: DeviceInfo?.isTablet() ? wp(8) : wp(12),
                }}
                xAxisLabelTextStyle={{color: Colors?.greyIcn}}
                maxValue={chartMaxValue}
              />
              {revenueLoading && (
                <ActivityIndicator
                  color={Colors?.primary}
                  style={styles?.absoluteActivity}
                  size={Platform?.OS == 'android' ? wp(11) : 'large'}
                />
              )}
            </View>
            <Text style={styles?.chartTitle}>Leads</Text>
            <View style={styles?.chartContainer}>
              <View style={styles?.rowSpaceContainer}>
                <Text style={styles?.chartTitle}>Current Status</Text>
                <View style={styles?.activeContainer}>
                  <Text style={styles?.activeText}>Active</Text>
                </View>
              </View>
              <View style={styles?.leadsContainer}>
                <View>
                  <View style={styles?.leadsRowContainer}>
                    <View style={styles?.statusAwaitingColorIndicator}></View>
                    <Text style={styles?.leadsText}>
                      Awaiting Response:
                      <Text style={styles?.leadsValue}>
                        {' '}
                        {(dashboardData as any)?.LeadsStatus?.AwaitingResponse}%
                      </Text>
                    </Text>
                  </View>
                  <View style={styles?.leadsRowContainer}>
                    <View style={styles?.statusRespondedColorIndicator}></View>
                    <Text style={styles?.leadsText}>
                      Responded:
                      <Text style={styles?.leadsValue}>
                        {' '}
                        {(dashboardData as any)?.LeadsStatus?.Responded}%
                      </Text>

                    </Text>
                  </View>
                  <View style={styles?.rowContainer}>
                    <View
                      style={styles?.statusNotRespondedColorIndicator}></View>
                    <Text style={styles?.leadsText}>
                      Not Responded:
                      <Text style={styles?.leadsValue}>
                        {' '}
                        {(dashboardData as any)?.LeadsStatus?.NotResponded}%
                      </Text>
                    </Text>
                  </View>
                </View>
                <PieChart radius={wp(17)} data={pieData} />
              </View>
            </View>
          </>
        )}
      </ScrollView>
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
        onSwipeComplete={() => setModalVisible(false)}
        swipeDirection="down"
        style={styles?.modal}>
        <View style={styles?.modalContent}>
          <Text style={styles?.modalTitle}>Stack Details</Text>
          {selectedStackData?.map((stack: any, index: any) => (
            <View key={index} style={styles?.stackDetail}>
              <Text style={{color: 'black'}}>
                {stack?.label}: {stack?.value}
              </Text>
            </View>
          ))}
        </View>
      </Modal>
    </View>
  );
};

export default Dashboard;
