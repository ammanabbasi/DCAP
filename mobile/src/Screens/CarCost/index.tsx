import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { styles } from './style';
import { icn } from '../../Assets/icn';
import Header from '../../Components/Header';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { hp, wp } from '../../Theme/Responsiveness';
import { Colors } from '../../Theme/Colors';
import { useSelector } from 'react-redux';

const CarCost = (): any => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as { item: any; DealershipID: string };
  const car = params?.item || {};
  const employee = useSelector((state: any) => state?.employeeRoleReducer?.data);

  console.log('employee ======= >', employee?.HidePackFee);


  const formatCurrency = (value: number | undefined) =>
    `$${(value ?? 0).toFixed(2)}`;

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };




  const renderItem = ({ item, index }: { item: any, index: number }) => {

    return (
      <ScrollView style={{ marginHorizontal: wp(3) }}>
        <View style={[styles.itemContainer, { padding: hp(1), marginBottom: hp(1) }]}>
          <View style={styles.itemOptionSpaceContainer}>
            <View>
              <Text style={styles.carName}>
                {params?.item?.vehicleInfo?.ModelYear}{' '}
                {params?.item?.vehicleInfo?.Make}{' '}
                {params?.item?.vehicleInfo?.Model}
              </Text>
            </View>
          </View>
          <View style={styles.vehicleRefContainer}>
            <Text style={[styles.optionText, { maxWidth: wp(55) }]}>
              Description:
              <Text style={styles.descriptionText}>
                {' '}
                {item?.ExpenseDescription}
              </Text>
            </Text>
          </View>
          <View
            style={[
              styles.searchContainer,
              { marginTop: hp(1.4) },
              styles.negativeIndex,
            ]}>
            <TouchableOpacity style={styles.repairContainer}>
              <Text style={styles.repairText}>{item?.ExpenseType || 'Repair'}</Text>
            </TouchableOpacity>
            <View style={styles.primaryPriceContainer}>
              <Text style={styles.priceTxt}>${item?.ExpenseAmount}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };



  return (
    <View style={styles.mainView}>
      <View style={styles.headerContainer}>
        <Header
          title={`${car?.vehicleInfo?.ModelYear ?? ''} ${car?.vehicleInfo?.Make ?? ''} ${car?.vehicleInfo?.Model ?? ''}`}
          leftIcn={icn.back}
          leftIcnStyle={styles.backIcn}
          rightFirstIcn={icn.optionDots}
          onLeftIconPress={() => navigation.goBack()}
        />
      </View>
      <View style={styles.detailsRow}>
        <View style={[styles.detailsCol]}>
          <Text style={styles.optionText}>Purchase: <Text style={styles.valueText}>{formatCurrency(car?.costInfo?.PurchasePrice)}</Text></Text>
          {
            employee?.HidePackFee === false &&
            <Text style={styles.optionText}>Pack Fee: <Text style={styles.valueText}>{formatCurrency(car?.costInfo?.PackFee)}</Text></Text>
          }
          <Text style={styles.optionText}>APR Expense: <Text style={styles.valueText}>{formatCurrency(car?.costInfo?.APRExpense)}</Text></Text>
          <Text style={styles.optionText}>Expenses: <Text style={styles.valueText}>{formatCurrency(car?.expense?.totalExpenseAmount)}</Text></Text>
          <Text style={styles.optionText}>Credits: <Text style={styles.valueText}>{formatCurrency(0)}</Text></Text>
          <Text style={styles.optionText}>Total: <Text style={styles.valueText}>{formatCurrency(car?.Total)}</Text></Text>
          <Text style={styles.optionText}>Total-DP: <Text style={styles.valueText}>{formatCurrency(car?.TotalDP)}</Text></Text>
          <Text style={styles.optionText}>Source: <Text style={styles.valueText}>{car?.costInfo?.PurchaseSourceName ?? ''}</Text></Text>
          <Text style={styles.optionText}>From: <Text style={styles.valueText}></Text></Text>
        </View>
        <View style={[styles.detailsCol]}>
          <Text style={styles.optionText}>Buyer: <Text style={styles.valueText}>{car?.costInfo?.BuyerName ?? ''}</Text></Text>
          <Text style={styles.optionText}>Pur.Date: <Text style={styles.valueText}>{formatDate(car?.costInfo?.PurchaseDate)}</Text></Text>
          <Text style={styles.optionText}>Age: <Text style={styles.valueText}></Text></Text>
          <Text style={styles.optionText}>Mode: <Text style={styles.valueText}>{car?.costInfo?.PaymentModeID === 1 ? 'Cash' : ''}</Text></Text>
          <Text style={styles.optionText}>Stock: <Text style={styles.valueText}>{car?.vehicleInfo?.StockNumber ?? ''}</Text></Text>
          <Text style={styles.optionText}>VIN: <Text style={styles.valueText}>{car?.vehicleInfo?.VIN ?? ''}</Text></Text>
          <Text style={styles.optionText}>Mileage: <Text style={styles.valueText}>{car?.vehicleInfo?.Mileage ?? ''}</Text></Text>
          <Text style={styles.optionText}>Color: <Text style={styles.valueText}>{car?.vehicleInfo?.Color ?? ''}</Text></Text>
        </View>
      </View>

      <View style={styles.expenseHeaderContainer}>
        <Text style={styles.expenseHeaderText}>Expenses</Text>
        <Text style={styles.expenseTotalText}>{formatCurrency(car?.expense?.totalExpenseAmount)}</Text>
      </View>

      <FlatList
        data={car?.expense?.expenses}
        renderItem={renderItem}
        keyExtractor={(item: any, index: any) => index.toString()}
      />
    </View>
  );
};

export default CarCost;