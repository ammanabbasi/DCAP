import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList } from 'react-native';
import { styles } from './style';
import { icn } from '../../Assets/icn';
import Header from '../../Components/Header';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

interface PaymentItem {
  isPreviousPayment?: boolean;
  paymentModeName: string;
  transactionDate: string | Date;
  paymentModeID: number;
  cardHolderName?: string;
  cardNumber?: string;
  floorplanName?: string;
  appliedDate?: string | Date;
  consignmentName?: string;
  suggestedSalePrice?: number;
  checkNo?: string;
  isPrint?: boolean;
  bankName?: string;
  expiryMonth?: string;
  expiryYear?: string;
  memo?: string;
  amount: number;
  vehicleId?: string;
  userName?: string;
  logDate?: string;
  Description?: string;
  priceText?: string;
  EntryDate?: string;
}

interface LogScreenProps {
  data: PaymentItem[];
  onPaymentEdit: (item: PaymentItem, index: number) => void;
  onPaymentDelete: (item: PaymentItem, index: number) => void;
}

const LogScreen: React.FC<LogScreenProps> = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as { vehicleId: string; data: PaymentItem[]; title: string };
  const [data, setData] = useState<PaymentItem[]>(params?.data || []);

  console.log('Navigation Params:========---------==========', params?.data);

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const renderItem = ({ item, index }: { item: PaymentItem; index: number }) => {

    console.log('This is item ================================> =======> ', item);
    return (
      <>
        <View style={styles.itemView}>
          <View style={styles.infoContainer}>
            <View>
              <Text style={[styles.name, { fontWeight: 'bold' }]}>
                {item?.userName}
              </Text>
              <Text style={styles.description}>{formatDate(item?.logDate || item.EntryDate)}</Text>
            </View>
          </View>

          <View style={styles.userContainer}>
            
                {/* <Text style={styles.date}>Memo:</Text> */}
                <Text style={styles.userName}>{item?.priceText || item.Description}</Text>
           
          
          </View>
        </View>
      </>
    );
  };

  return (
    <View style={styles.mainView}>
         <View style={styles.headerContainer}>
              <Header
                title={params?.title}
                leftIcn={icn.back}
                // blueBackground={imagesData?.length > 0 ? true : false}
                leftIcnStyle={styles.backIcn}
                rightFirstIcn={icn.optionDots}
                onLeftIconPress={() => navigation.goBack()}
                // onRightFirstIconPress={openMenu}
              />
            </View>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item: any, index: any) => index.toString()}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default LogScreen;