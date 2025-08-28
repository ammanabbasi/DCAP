import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useNavigation} from '@react-navigation/native';
import * as React from 'react';
import {Image, Text} from 'react-native';
import {useStyle} from './styles';
import {wp, hp, rfs, WINDOW_WIDTH} from '../../Theme/Responsiveness';
import Typography from '../../Theme/Typography';
import Splash from '../../Screens/AuthFlow/Splash';
import {img} from '../../Assets/img';
import {icn} from '../../Assets/icn';
import LogIn from '../../Screens/AuthFlow/LogIn';
import {Colors} from '../../Theme/Colors';
import Dashboard from '../../Screens/Dashboard';
import Profile from '../../Screens/Profile';
import Inventory from '../../Screens/Inventory';
import Crm from '../../Screens/Crm';
import DeviceInfo from 'react-native-device-info';
const Tab = createBottomTabNavigator();

const isTablet = WINDOW_WIDTH >= 600;

const BottomTabNavigation = (): any => {
  const style = useStyle();
  const navigation = useNavigation();
  const CustomTabLabel = ({focused: any, label: any, color}: any) => (
    <Text
      style={{
        fontFamily: focused
          ? Typography?.poppins?.Medium
          : Typography?.poppins?.Regular,
        color: color,
        fontSize: wp(3),
        marginLeft: DeviceInfo.isTablet() ? wp(3) : undefined,
        marginTop: DeviceInfo.isTablet() ? hp(0.4) : undefined,
      }}>
      {label}
    </Text>
  );

  const screenOptions = {
    tabBarIconStyle: style.tabbarIcon,
    tabBarActiveTintColor: 'white',
    tabBarStyle: style.tabbar,
    tabBarInactiveTintColor: Colors.dashBoardInactive,
    tabBarHideOnKeyboard: true,
  };

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          headerShown: false,
          tabBarLabel: ({focused, color}) => (
            <CustomTabLabel focused={focused} label="Dashboard" color={color} />
          ),
          tabBarIcon: ({color: any, size: any, focused}: any) => (
            <Image
              source={icn.home}
              tintColor={focused ? 'white' : Colors.dashBoardInactive}
              style={{width: size, height: size}}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={Inventory}
        options={{
          headerShown: false,
          tabBarLabel: ({focused: any, color}: any) => (
            <CustomTabLabel focused={focused} label="Inventory" color={color} />
          ),
          tabBarIcon: ({color: any, size: any, focused}: any) => (
            <Image
              source={icn.car}
              tintColor={focused ? 'white' : Colors.dashBoardInactive}
              style={{width: size, height: size}}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="CRM"
        component={Crm}
        options={{
          headerShown: false,
          tabBarLabel: ({focused: any, color}: any) => (
            <CustomTabLabel focused={focused} label="CRM" color={color} />
          ),
          tabBarIcon: ({color: any, size: any, focused}: any) => (
            <Image
              source={icn.crm}
              tintColor={focused ? 'white' : Colors.dashBoardInactive}
              style={{width: size, height: size}}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          headerShown: false,
          tabBarLabel: ({focused: any, color}: any) => (
            <CustomTabLabel focused={focused} label="Profile" color={color} />
          ),
          tabBarIcon: ({color: any, size: any, focused}: any) => (
            <Image
              source={icn.profile}
              tintColor={focused ? 'white' : Colors.dashBoardInactive}
              style={{width: size, height: size}}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigation;
