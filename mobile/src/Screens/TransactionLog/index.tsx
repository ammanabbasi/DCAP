import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {FlatList, Text, View} from 'react-native';
import {useDispatch} from 'react-redux';
import {icn} from '../../Assets/icn';
import Header from '../../Components/Header';
import {hp} from '../../Theme/Responsiveness';
import {styles} from './style';
const TransactionLog = ({route}: any): any => {
  const params = route?.params;
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  function formatDate(isoDate): any {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
  const emptyComponent = (): any => {
    return <Text style={styles.noDataAvailable}>No data available</Text>;
  };

  const renderItem = ({item: any, index}: any) => {
    return (
      <View style={styles.itemView}>
        <View style={styles.infoContainer}>
          <View>
            <Text style={styles.name}>
              {params?.vehicleItem?.vehicleInfo?.ModelYear}{' '}
              {params?.vehicleItem?.vehicleInfo?.Make}{' '}
              {params?.vehicleItem?.vehicleInfo?.Model}
            </Text>
            <Text style={styles.date}>{formatDate(item?.TransactionDate)}</Text>
          </View>
        </View>
        <View style={styles.rowContainer}>
          <View style={styles.docInfoContainer}>
            <Text style={styles.label}>Payee:</Text>
            <Text style={styles.value}>{item?.Payee}</Text>
          </View>
          <View style={styles.docInfoContainer}>
            <Text style={styles.label}>Payer:</Text>
            <Text style={styles.value}>{item?.Payer}</Text>
          </View>
          <View style={styles.docInfoContainer}>
            <Text style={styles.label}>Bank:</Text>
            <Text style={styles.value}>{item?.Bank_Name}</Text>
          </View>
          <View style={styles.lastItemContainer}>
            <Text style={styles.simpleLabel}>Amount:</Text>
            <Text style={styles.simpleValue}>{item?.Amount}</Text>
          </View>
        </View>
        <View style={styles.rowContainer}>
          <View style={styles.docInfoContainer}>
            <Text style={styles.label}>Description:</Text>
            <Text style={styles.value}>{item?.Description}</Text>
          </View>
          <View style={styles.docInfoContainer}>
            <Text style={styles.label}>Payment Mode:</Text>
            <Text style={styles.value}>{item?.PaymentMode}</Text>
          </View>
          <View style={styles.docInfoContainer}>
            <Text style={styles.label}>Memo:</Text>
            <Text style={styles.value}>{item?.Memo}</Text>
          </View>
          <View style={styles.lastItemContainer}>
            <Text style={styles.simpleLabel}>Operator:</Text>
            <Text style={styles.simpleValue}>{item?.Operator}</Text>
          </View>
        </View>
        <View style={styles.docInfoContainer}>
          <Text style={styles.label}>Opt Date:</Text>
          <Text style={styles.value}>{formatDate(item?.OperationDate)}</Text>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.mainView}>
      <View style={styles.subContainer}>
        <Header
          title="Transaction Log"
          leftIcn={icn.back}
          leftIcnStyle={styles.backIcn}
          onLeftIconPress={() => navigation.goBack()}
        />
        <FlatList
          data={params?.payments}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          renderItem={renderItem}
          ListEmptyComponent={emptyComponent}
          style={{marginTop: hp(2)}}
          keyExtractor={(item: any, index: any) => index.toString()}
          contentContainerStyle={{paddingBottom: hp(7)}}
        />
      </View>
    </View>
  );
};

export default TransactionLog;
