import React from 'react';
import Chat from '../Screens/Chat';
import VehicleDetails from '../Screens/VehicleDetails';
import CarExpenses from '../Screens/CarExpenses';
import Log from '../Screens/Log';
import { RootStackScreenProps } from './type';

// Wrapper for Chat screen with proper navigation props
export const ChatWrapper: React.FC<RootStackScreenProps<'Chat'>> = ({ navigation: any, route }: any) => {
  return <Chat navigation={navigation} route={route} />;
};

// Wrapper for VehicleDetails screen with proper navigation props
export const VehicleDetailsWrapper: React.FC<RootStackScreenProps<'VehicleDetails'>> = ({ navigation: any, route }: any) => {
  return <VehicleDetails route={route} navigation={navigation} />;
};

// Wrapper for PurchasePayment/CarExpenses screen with proper navigation props
export const ExpensesWrapper: React.FC<RootStackScreenProps<'PurchasePayment'>> = ({ navigation: any, route }: any) => {
  // Extract params safely
  const { 
    isPurchaseAdded = false, 
    initailPaymentData = {}, 
    setInitailPaymentData = () => {}, 
    previourPaymentData = {} 
  } = route.params || {};
  
  return (
    <CarExpenses 
      isPurchaseAdded={isPurchaseAdded}
      initailPaymentData={initailPaymentData}
      setInitailPaymentData={setInitailPaymentData}
      previourPaymentData={previourPaymentData}
      navigation={navigation}
      route={route}
    />
  );
};

// Wrapper for Log screen with proper navigation props
export const LogWrapper: React.FC<RootStackScreenProps<'Log'>> = ({ navigation: any, route }: any) => {
  return <Log navigation={navigation} route={route} />;
};
