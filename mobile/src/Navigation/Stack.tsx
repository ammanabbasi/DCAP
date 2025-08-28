import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import AddExpense from '../Screens/AddExpense';
import AddNewLeads from '../Screens/AddNewLeads';
import AddCrmProfileTabBoilerPlate from '../Screens/AddCrmProfileTabBoilerPlate';
import LogIn from '../Screens/AuthFlow/LogIn';
import Splash from '../Screens/AuthFlow/Splash';
import Basics from '../Screens/Basics';
import { ChatWrapper, VehicleDetailsWrapper, ExpensesWrapper, LogWrapper } from './ScreenWrappers';
import Carfax from '../Screens/Carfax';
import CarExpenses from '../Screens/CarExpenses';
import CarModelList from '../Screens/CarModelList';
import ChangePassword from '../Screens/ChangePassword';
import Chat from '../Screens/Chat';
import ChatDetails from '../Screens/ChatDetails';
import Floorplan from '../Screens/Floorplan';
import Consignment from '../Screens/Consignment';
import Cheque from '../Screens/Cheque';
import CreditCard from '../Screens/CreditCard';
import CrmProfile from '../Screens/CrmProfile';
import Documents from '../Screens/Documents';
import EditProfile from '../Screens/EditProfile';
import Expenses from '../Screens/PurchasePayment';
import Images from '../Screens/Images';
import Marketing from '../Screens/Marketing';
import Options from '../Screens/Options';
import PaymentMethodBoilerPlate from '../Screens/PaymentMethodBoilerPlate';
import Purchase from '../Screens/Purchase';
import TransactionLog from '../Screens/TransactionLog';
import UploadImages from '../Screens/UploadImages';
import VehicleDetails from '../Screens/VehicleDetails';
import BottomTabNavigation from './BottomTabNavigation';
import CrmProfileVehicleBoilerPlate from '../Screens/CrmProfileVehicleBoilerPlate';
import TradeIn from '../Screens/TradeIn';
import CreditApplication from '../Screens/CreditApplication';
import PullCreditReport from '../Screens/PullCreditReport';
import AddEmail from '../Screens/AddEmail';
import ScanDocument from '../Screens/ScanDocument';
import VehicleRelated from '../Screens/VehicleRelated/VehicleRelated';
import VehicleDocuments from '../Screens/VehicleDocuments';
import Notes from '../Screens/Notes';
import Task from '../Screens/Task';
import Appointment from '../Screens/Appointment';
import Sms from '../Screens/Sms';
import CarCost from '../Screens/CarCost';
import decode from '../Screens/decode'; 
const stack = createNativeStackNavigator();
const Stack = (): any => {
  return (
    <stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShadowVisible: false,
        headerShown: false,
      }}>
      <stack.Screen name="Splash" component={Splash} />
      <stack.Screen name="Login" component={LogIn} />
      <stack.Screen name="BottomTab" component={BottomTabNavigation} />
      <stack.Screen name="Chat" component={ChatWrapper} />
      <stack.Screen name="ChatDetails" component={ChatDetails} />
      <stack.Screen name="EditProfile" component={EditProfile} />
      <stack.Screen name="ChangePassword" component={ChangePassword} />
      <stack.Screen name="CarModelList" component={CarModelList} />
      <stack.Screen name="VehicleDetails" component={VehicleDetailsWrapper} />
      <stack.Screen name="Images" component={Images} />
      <stack.Screen name="Documents" component={Documents} />
      <stack.Screen name="Basics" component={Basics} />
      <stack.Screen name="Marketing" component={Marketing} />
      <stack.Screen name="Options" component={Options} />
      <stack.Screen name="Purchase" component={Purchase} />
      <stack.Screen name="PurchasePayment" component={ExpensesWrapper} />
      <stack.Screen name="CarExpenses" component={CarExpenses} />
      <stack.Screen name="TransactionLog" component={TransactionLog} />
      <stack.Screen name="AddExpense" component={AddExpense} />
      <stack.Screen name="Cheque" component={Cheque} />
      <stack.Screen name="CreditCard" component={CreditCard} />
      <stack.Screen name="PaymentMethodBoilerPlate" component={PaymentMethodBoilerPlate} />
      <stack.Screen name="AddNewLeads" component={AddNewLeads} />
      <stack.Screen name="UploadImages" component={UploadImages} />
      <stack.Screen name="CrmProfile" component={CrmProfile} />
      <stack.Screen name="Floorplan" component={Floorplan} />
      <stack.Screen name="Consignment" component={Consignment} />
      <stack.Screen name="AddCrmProfileTabBoilerPlate" component={AddCrmProfileTabBoilerPlate} />
      <stack.Screen name="CrmProfileVehicleBoilerPlate" component={CrmProfileVehicleBoilerPlate} />
      <stack.Screen name="TradeIn" component={TradeIn} />
      <stack.Screen name="CreditApplication" component={CreditApplication} />
      <stack.Screen name="PullCreditReport" component={PullCreditReport} />
      <stack.Screen name="AddEmail" component={AddEmail} />
      <stack.Screen name="ScanDocument" component={ScanDocument} />
      <stack.Screen name="decode" component={decode} />
      <stack.Screen name="VehicleRelated" component={VehicleRelated} />
      <stack.Screen name="VehicleDocuments" component={VehicleDocuments} />
      <stack.Screen name="Notes" component={Notes}/>
      <stack.Screen name="Task" component={Task}/>
      <stack.Screen name="Appointment" component={Appointment}/>
      <stack.Screen name="Sms" component={Sms}/>
      <stack.Screen name="Carfax" component={Carfax}/>
      <stack.Screen name="Log" component={LogWrapper}/>
      <stack.Screen name="CarCost" component={CarCost}/>

    </stack.Navigator>
  );
};

export default Stack;
