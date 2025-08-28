import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import Modal from 'react-native-modal';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { icn } from '../../Assets/icn';
import { deletePurchasePayment } from '../../Services/apis/APIs';
import Header from '../../Components/Header';
import { hp, wp } from '../../Theme/Responsiveness';
import { styles } from './style';
import Toast from 'react-native-toast-message';
import LoadingModal from '../../Components/LoadingModal';


// const data = [
//   // {
//   //   name: 'TOWING',
//   //   date: '10/11/2023',
//   //   time: '03:17 pm',
//   //   vend: 'Jose B',
//   //   or: 'Garcia',
//   //   price: '0.00',
//   // },
//   // {
//   //   name: 'TOWING',
//   //   date: '10/11/2023',
//   //   time: '03:17 pm',
//   //   vend: 'Jose B',
//   //   or: 'Garcia',
//   //   price: '0.00',
//   // },
//   // {
//   //   name: 'TOWING',
//   //   date: '10/11/2023',
//   //   time: '03:17 pm',
//   //   vend: 'Jose B',
//   //   or: 'Garcia',
//   //   price: '0.00',
//   // },
//   // {
//   //   name: 'TOWING',
//   //   date: '10/11/2023',
//   //   time: '03:17 pm',
//   //   vend: 'Jose B',
//   //   or: 'Garcia',
//   //   price: '0.00',
//   // },
//   // {
//   //   name: 'TOWING',
//   //   date: '10/11/2023',
//   //   time: '03:17 pm',
//   //   vend: 'Jose B',
//   //   or: 'Garcia',
//   //   price: '0.00',
//   // },
//   // {
//   //   name: 'TOWING',
//   //   date: '10/11/2023',
//   //   time: '03:17 pm',
//   //   vend: 'Jose B',
//   //   or: 'Garcia',
//   //   price: '0.00',
//   // },
//   // {
//   //   name: 'TOWING',
//   //   date: '10/11/2023',
//   //   time: '03:17 pm',
//   //   vend: 'Jose B',
//   //   or: 'Garcia',
//   //   price: '0.00',
//   // },
//   // {
//   //   name: 'TOWING',
//   //   date: '10/11/2023',
//   //   time: '03:17 pm',
//   //   vend: 'Jose B',
//   //   or: 'Garcia',
//   //   price: '0.00',
//   // },
//   {
//     name: 'TOWING',
//     date: '10/11/2023',
//     time: '03:17 pm',
//     vend: 'Jose B',
//     or: 'Garcia',
//     price: '0.00',
//   },
//   {
//     name: 'TOWING',
//     date: '10/11/2023',
//     time: '03:17 pm',
//     vend: 'Jose B',
//     or: 'Garcia',
//     price: '0.00',
//   },
//   {
//     name: 'TOWING',
//     date: '10/11/2023',
//     time: '03:17 pm',
//     vend: 'Jose B',
//     or: 'Garcia',
//     price: '0.00',
//   },
//   {
//     name: 'TOWING',
//     date: '10/11/2023',
//     time: '03:17 pm',
//     vend: 'Jose B',
//     or: 'Garcia',
//     price: '0.00',
//   },
// ];

const Expenses = ({ isPurchaseAdded, initailPaymentData, setInitailPaymentData, previourPaymentData }: { isPurchaseAdded: any, initailPaymentData: any, setInitailPaymentData: any, previourPaymentData: any }) => {
  const [selectedItem, setSelectedItem] = useState<any>({});
  const [showPlusOptions, setShowPlusOptions] = useState<boolean>(false);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedEditPaymentData, setSelectedEditPaymentData] = useState<any>([]);




  const addPaymentModeName = (paymentModeID: any) => {
    // Convert to number and handle null/undefined
    const modeId = Number(paymentModeID);

    console.log('modeId ========>', modeId);

    if (isNaN(modeId)) {
      console.log('This is going to be returned ----------------------00-------------', 'Other', modeId);
      return 'Other';
    }

    switch (modeId) {
      case 4:
        return 'Credit Card';
      case 11:
        return 'Debit Card';
      case 3:
        return 'Cheque';
      case 5:
        return 'EFT';
      case 6:
        return 'Cash';
      case 17:
        return 'Pay Letter';
      case 1:
        return 'Floorplan';
      case 2:
        return 'Consignment';
      default:
        return 'Other';
    }
  }


  const arrangePaymentKeys = (paymentData: any) => {



    const basePaymentData = {
      itemIndex: paymentData?.itemIndex,
      paymentModeName: addPaymentModeName(paymentData?.PaymentModeID || paymentData?.paymentModeID),
      transactionID: paymentData?.TransactionID || paymentData?.transactionID,
      paymentModeID: paymentData?.PaymentModeID || paymentData?.paymentModeID,
      amount: Number(paymentData?.Amount || paymentData?.amount),
      transactionDate: paymentData?.TransactionDate || paymentData?.transactionDate,
      memo: paymentData?.Memo || paymentData?.memo,
      bankID: paymentData?.BankID || paymentData?.bankID,
      bankName: paymentData?.Bank_Name || paymentData?.bankName,
    };

    // Only add checkNo and isPrint for PaymentModeID 3 (Cheque)
    if (paymentData?.PaymentModeID === 3 || paymentData?.paymentModeID === 3) {
      return {
        ...basePaymentData,
        checkNo: paymentData?.CheckNo || paymentData?.checkNo,
        isPrint: paymentData?.isPrint
      };
    }
    // Only add card details for PaymentModeID 4 or 11
    if (paymentData?.PaymentModeID === 4 || paymentData?.PaymentModeID === 11 ||
      paymentData?.paymentModeID === 4 || paymentData?.paymentModeID === 11) {
      return {
        ...basePaymentData,
        cardHolderName: paymentData?.CardHolderName || paymentData?.cardHolderName,
        cardNumber: paymentData?.CardNumber || paymentData?.cardNumber,
        expiryMonth: paymentData?.ExpiryMonth || paymentData?.expiryMonth,
        expiryYear: paymentData?.ExpiryYear || paymentData?.expiryYear
      };
    }
    if (paymentData?.PaymentModeID === 1 || paymentData?.paymentModeID === 1) {
      return {
        ...basePaymentData,
        floorplanID: paymentData?.FloorplanID || paymentData?.floorplanID,
        floorplanName: paymentData?.Floorplan_Name || paymentData?.floorplanName,
        appliedDate: paymentData?.AppliedDate || paymentData?.appliedDate,
        bankID: paymentData?.FloorplanID || paymentData?.floorplanID,
      };
    }
    if (paymentData?.PaymentModeID === 2) {
      return {
        ...basePaymentData,
        consignmentID: paymentData?.ConsignmentProviderID || paymentData?.consignmentProviderID,
        consignmentName: paymentData?.ConsignmentProvider_Name || paymentData?.ConsignmentProvider_Name,
        suggestedSalePrice: paymentData?.SuggestedSalePrice || paymentData?.suggestedSalePrice,
        bankID: paymentData?.ConsignmentProviderID || paymentData?.consignmentProviderID,
      };
    }

    return basePaymentData;
  }




  useEffect(() => {

    if (selectedEditPaymentData) {
      const formattedItem = arrangePaymentKeys(selectedEditPaymentData);
      if (formattedItem?.amount == undefined || Number.isNaN(formattedItem?.paymentModeID)) {
        return;
      }
      // console.log('formattedItem', formattedItem);




      // Only proceed if we have valid data
      if (formattedItem && Object.values(formattedItem).some(value => value !== undefined)) {

        setInitailPaymentData((prevState: any) => {
          const currentState = prevState || [];

          // If we're editing an existing item, replace it instead of adding
          if (selectedEditPaymentData?.itemIndex !== undefined) {
            const itemIndex = selectedEditPaymentData.itemIndex;
            if (itemIndex >= 0 && itemIndex < currentState.length) {
              // If item found, update it at the same index
              const updatedState = [...currentState];
              updatedState[itemIndex] = {
                isEdited: true,
                ...updatedState[itemIndex],
                ...formattedItem,
              };
              return updatedState;
            }
          }

          // If it's a new item or item not found, add it to the array
          console.log('iNIATAAL PAYMENT DATA', formattedItem);
          console.log('iNIATAAL PAYMENT DATA', currentState);
          console.log('iNIATAAL PAYMENT DATA !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', [...currentState, formattedItem]);

          return [...currentState];
        });

        // console.log('This is going to be returned ----------------------00-------------' , !isPurchaseAdded);

        // if (!isPurchaseAdded) { return; }


        // setSelectedPaymentDataForUpdate((prevState: any) => {
        //   // Initialize prevState as empty array if undefined
        //   const currentState = prevState || [];

        //   // If we're editing an existing item, replace it instead of adding
        //   if (selectedEditPaymentData?.transactionID) {
        //     const itemIndex = currentState.findIndex((item: any) =>
        //       item.transactionID === selectedEditPaymentData.transactionID
        //     );

        //     if (itemIndex !== -1) {
        //       // If item found, update it at the same index
        //       const updatedState = [...currentState];
        //       updatedState[itemIndex] = formattedItem;
        //       return updatedState;
        //     }
        //   }

        //   // If it's a new item or item not found, add it to the array
        //   return [...currentState, formattedItem];
        // });
      }
    }
  }, [selectedEditPaymentData]);


  useEffect(() => {
    console.log('selectedItem ====> ', selectedItem);

    if (selectedItem?.payment?.length > 0) {
      // console.log('selectedItem?.payment', selectedItem?.payment);
      const formattedPayments = selectedItem?.payment?.map((item: any) => {


        return arrangePaymentKeys({
          ...item,
          paymentModeID: Number(item.PaymentModeID),

        });
      });
      setInitailPaymentData((prevState: any) => {
        const currentState = prevState || [];
        console.log('item 00000000-----00000000000 currentState', currentState);
        console.log('item 00000000-----00000000000 formattedPayments', formattedPayments);
        return [...currentState, ...formattedPayments];
      });

      setSelectedItem({});
      // setSelectedPaymentDataForUpdate(formattedPayments);
    }

  }, [selectedItem]);

  // console.log('This is payment in Purchase Payment Section:', paymentData);


  const handleChequePress = (): any => {
    setShowPlusOptions(false);
    navigation.navigate('Cheque', {
      setSelectedItem: setSelectedItem,
    });
  };
  const handleEftPress = (): any => {
    setShowPlusOptions(false);
    navigation.navigate('PaymentMethodBoilerPlate', {
      from: 'EFT',
      setSelectedItem: setSelectedItem,
    });
  };
  const handleCashPress = (): any => {
    setShowPlusOptions(false);
    navigation.navigate('PaymentMethodBoilerPlate', {
      from: 'Cash',
      setSelectedItem: setSelectedItem,
    });
  };


  const handlePayLetterPress = (): any => {
    setShowPlusOptions(false);

    // console.log('selectedItem', selectedItem);

    navigation.navigate('PaymentMethodBoilerPlate', {
      from: 'Pay Letter',
      setSelectedItem: setSelectedItem,
    });
  };
  const handleFloorplanPress = (): any => {
    setShowPlusOptions(false);

    // console.log('selectedItem', selectedItem);

    navigation.navigate('Floorplan', {
      from: 'Floorplan',
      setSelectedItem: setSelectedItem,
    });
  };
  const handleConsignmentPress = (): any => {
    setShowPlusOptions(false);

    // console.log('selectedItem', selectedItem);

    navigation.navigate('Consignment', {
      from: 'Consignment',
      setSelectedItem: setSelectedItem,
    });
  };
  const handleCardPress = (): any => {
    setShowPlusOptions(false);
    navigation.navigate('CreditCard', { setSelectedItem: setSelectedItem });
  };



  const handleDelete = (item:any, index:any) => {
    // console.log('item', item);
    setSelectedItem({ ...item, itemIndex: index });
    setIsModalVisible(true);
  }

  const handleDeleteConfirmation = async () => {
    try {
      setIsLoading(true);
      if (selectedItem?.transactionID) {
        console.log('Attempting to delete payment with transactionID:', selectedItem?.transactionID);
        console.log('Full selectedItem:', selectedItem);
        const response = await deletePurchasePayment({ transactionID: selectedItem?.transactionID });
        console.log('Delete response:', response?.data);
        if (response?.data) {
          // Also remove the deleted item from local state
          setInitailPaymentData((prevState: any) => {
            const currentState = prevState || [];
            return currentState.filter((_: any, i: any) => i !== selectedItem?.itemIndex);
          });
          
          setIsLoading(false);
          setIsModalVisible(false);
          setSelectedItem({});
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Payment deleted successfully',
          });
        } else {
          setIsLoading(false);
          setIsModalVisible(false);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to delete payment from server',
          });
        }
      } else {
        // This is a local payment that hasn't been saved yet
        setInitailPaymentData((prevState: any) => {
          const currentState = prevState || [];
          return currentState.filter((_: any, i: any) => i !== selectedItem?.itemIndex);
        });
        setIsLoading(false);
        setIsModalVisible(false);
        setSelectedItem({});
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Payment removed successfully',
        });
      }
    } catch (error: any) {
      console.log('Delete payment error:', error);
      console.log('Error response:', error?.response);
      console.log('Error response data:', error?.response?.data);
      console.log('Error status:', error?.response?.status);
      setIsLoading(false);
      setIsModalVisible(false);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || error?.message || 'Failed to delete payment',
      });
    }
  }

  const handlePaymentEdit = (item:any, index:any) => {
    console.log('item IN INDEX', item);
    // console.log('index', index);

    const formattedItem = {

      Amount: item?.amount,
      BankID: item?.bankID,
      TransactionDate: item?.transactionDate,
      Memo: item?.memo,
      PaymentModeID: item?.paymentModeID,
      Bank_Name: item?.bankName,
      transactionID: item?.transactionID
    };

    if (item?.paymentModeID == 3) {
      navigation.navigate('Cheque', {
        item: {
          ...formattedItem,
          CheckNo: item?.checkNo,
          isPrint: item?.isPrint,
        },
        itemIndex: index,
        isEditingPayment: true,
        setSelectedItem: (updatedData: any) => {
          setSelectedEditPaymentData(updatedData);
          // setPaymentUpdatedData(updatedData);
        },
      });
    }else if (item?.paymentModeID == 1) {
      navigation.navigate('Floorplan', {
        item: {
          ...formattedItem,
          FloorplanID: item?.floorplanID,
          FloorplanName: item?.floorplanName,
          AppliedDate: item?.appliedDate,
        },
        itemIndex: index,
        isEditingPayment: true,
        setSelectedItem: (updatedData: any) => {
          setSelectedEditPaymentData(updatedData);
          // setPaymentUpdatedData(updatedData); // Update parent component
        },
      });
    } else if (item?.paymentModeID == 2) {
      navigation.navigate('Consignment', {
        item: {
          ...formattedItem,
          ConsignmentProviderID: item?.consignmentID,
          ConsignmentProviderName: item?.consignmentName,
          suggestedPrice: item?.suggestedSalePrice,
        },
        itemIndex: index,
        isEditingPayment: true,
        setSelectedItem: (updatedData: any) => {
          setSelectedEditPaymentData(updatedData);
          // setPaymentUpdatedData(updatedData); // Update parent component
        },
      });
    } 
     else if (item?.paymentModeID == 11 || item?.paymentModeID == 4) {
      navigation.navigate('CreditCard', {
        item: {
          ...formattedItem,
          ExpiryMonth: item?.expiryMonth,
          ExpiryYear: item?.expiryYear,
          CardHolderName: item?.cardHolderName,
          CardNumber: item?.cardNumber,
        },
        itemIndex: index,
        isEditingPayment: true,
        setSelectedItem: (updatedData: any) => {
          setSelectedEditPaymentData(updatedData);
          // setPaymentUpdatedData(updatedData); // Update parent component
        },
      });
    } else if (
      item?.paymentModeID == 5 ||
      item?.paymentModeID == 6 ||
      item?.paymentModeID == 17
    ) {
      navigation.navigate('PaymentMethodBoilerPlate', {
        from:
          item?.paymentModeID == 5
            ? 'EFT'
            : item?.paymentModeID == 6
              ? 'Cash'
              : 'Pay Letter',
        item: formattedItem,
        itemIndex: index,
        isEditingPayment: true,
        setSelectedItem: (updatedData: any) => {
          setSelectedEditPaymentData(updatedData);
          // setPaymentUpdatedData(updatedData); // Update parent component
        },
      });
    }
  };



  const renderItem = ({ item, index }: { item: any; index: any }) => {
    console.log('tHIS IS ITEM TO BE RENDERED: ', item);

    const formatDate = (date: any) => {
      if (!date) return '';
      if (typeof date === 'string') {
        return date.split('T')[0];
      }
      // If it's a Date object
      return new Date(date).toISOString().split('T')[0];
    };

    return (
      <>
        {
          item?.isPreviousPayment && <Text style={styles.recent}>Previous Payment</Text>
        }
        <View style={styles.itemView}>
          <View style={styles.infoContainer}>
            <View>
              <Text style={[styles.name, item?.isPreviousPayment && { color: '#FF9999' }]}>{item?.paymentModeName}</Text>
              <Text style={styles.description}>{formatDate(item?.transactionDate)}</Text>
            </View>
            <View style={styles.iconContainer}>

              <TouchableOpacity onPress={() => handlePaymentEdit(item, index)}>
                <Image
                  source={icn.singlePen}
                  style={styles.shortIcn}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item, index)}>
                <Image
                  source={icn.delete}
                  style={styles.shortIcn}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>
          {item?.paymentModeID === 4 ||
            item?.paymentModeID === 11 &&
            <View style={styles.userContainer}>
              <View style={styles.rowContainer}>
                <View style={styles.docInfoContainer}>
                  <Text style={styles.date}>Card Holder Name:</Text>
                  <Text style={styles.userName}>{item?.cardHolderName}</Text>
                </View>
                <View style={styles.orContainer}>
                  <Text style={styles.date}>Card Number:</Text>
                  <Text style={styles.userName}>{item?.cardNumber}</Text>
                </View>
              </View>
              {/* <View style={styles.priceContainer}>
            <Text style={styles.priceText}>${item?.amount}</Text>
          </View> */}
            </View>
          }
          {item?.paymentModeID === 1 &&
            <View style={styles.userContainer}>
              <View style={styles.rowContainer}>
                <View style={styles.docInfoContainer}>
                  <Text style={styles.date}>Floorplan:</Text>
                  <Text style={styles.userName}>{item?.floorplanName}</Text>
                </View>
                <View style={styles.orContainer}>
                  <Text style={styles.date}>Applied Date:</Text>
                  <Text style={styles.userName}>{formatDate(item?.appliedDate)}</Text>
                </View>
              </View>
            </View>
          }
          {item?.paymentModeID === 2 &&
            <View style={styles.userContainer}>
              <View style={styles.rowContainer}>
                <View style={styles.docInfoContainer}>
                  <Text style={styles.date}>Consignment:</Text>
                  <Text style={styles.userName}>{item?.consignmentName}</Text>
                </View>
                <View style={styles.orContainer}>
                  <Text style={styles.date}>Suggested Sale Price:</Text>
                  <Text style={styles.userName}>${item?.suggestedSalePrice}</Text>
                </View>
              </View>
            </View>
          }
          {item?.paymentModeID === 3 &&
            <View style={styles.userContainer}>
              <View style={styles.rowContainer}>
                <View style={styles.docInfoContainer}>
                  <Text style={styles.date}>Cheque Number:</Text>
                  <Text style={styles.userName}>{item?.checkNo}</Text>
                </View>
                <View style={styles.orContainer}>
                  <Text style={styles.date}>Cheque Type:</Text>
                  <Text style={styles.userName}>{item?.isPrint ? 'Printed' : 'Written'}</Text>
                </View>
              </View>
            </View>
          }
          <View style={styles.userContainer}>
            <View style={styles.rowContainer}>
              {item?.paymentModeID != 17 && item?.paymentModeID != 1 && item?.paymentModeID != 2 && (

                <View style={styles.docInfoContainer}>
                  <Text style={styles.date}>Bank Name:</Text>
                  <Text style={styles.userName}>{item?.bankName}</Text>
                </View>
              )}
              {(item?.paymentModeID === 11 ||
                item?.paymentModeID === 4) && (
                  <View style={styles.orContainer}>
                    <Text style={styles.date}>Expiry Date:</Text>
                    <Text style={styles.userName}>{`${item?.expiryMonth}/${item?.expiryYear}`}</Text>
                  </View>
                )}
            </View>
            {/* <View style={styles.priceContainer}>
             <Text style={styles.priceText}>${item?.amount}</Text>
           </View> */}
          </View>


          <View style={styles.userContainer}>
            <View style={styles.rowContainer}>
              <View style={styles.docInfoContainer}>
                <Text style={styles.date}>Memo:</Text>
                <Text style={styles.userName}>{item?.memo}</Text>
              </View>
              {/* <View style={styles.orContainer}>
              <Text style={styles.date}>Buyer:</Text>
              <Text style={styles.userName}>{item?.buyerName}</Text>
            </View> */}
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>${item?.amount}</Text>
            </View>
          </View>

        </View>
      </>
    );
  };

  return (
    <View style={styles.mainView}>
      <View style={[styles.subContainer, { flex: 1 }]}>
        {showPlusOptions && (
          <View style={styles.flexEnd}>
            <View style={styles.plusOptionsContainer}>
              <TouchableOpacity style={styles.option}>
                <Text style={styles.optionName}>Add Payment</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleChequePress}
                style={styles.whiteOption}>
                <Text style={styles.optionName}>Cheque</Text>
                <Image
                  source={icn.forward}
                  style={styles.forwardIcn}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCardPress}
                style={styles.whiteOption}>
                <Text style={styles.optionName}>Card</Text>
                <Image
                  source={icn.forward}
                  style={styles.forwardIcn}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleEftPress}
                style={styles.whiteOption}>
                <Text style={styles.optionName}>EFT</Text>
                <Image
                  source={icn.forward}
                  style={styles.forwardIcn}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCashPress}
                style={styles.whiteOption}>
                <Text style={styles.optionName}>Cash</Text>
                <Image
                  source={icn.forward}
                  style={styles.forwardIcn}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePayLetterPress}
                style={styles.whiteOption}>
                <Text style={styles.optionName}>Pay Letter</Text>
                <Image
                  source={icn.forward}
                  style={styles.forwardIcn}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleFloorplanPress}
                style={styles.whiteOption}>
                <Text style={styles.optionName}>Floorplan</Text>
                <Image
                  source={icn.forward}
                  style={styles.forwardIcn}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConsignmentPress}
                style={styles.whiteOption}>
                <Text style={styles.optionName}>Consignment</Text>
                <Image
                  source={icn.forward}
                  style={styles.forwardIcn}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
        <View style={styles.centerSpaceContainer}>
          <Text style={styles.recent}>Payment</Text>
          <View style={styles.greyContainer}>
            <TouchableOpacity
              style={styles.rowContainer}
              onPress={() => setShowPlusOptions(!showPlusOptions)}>
              <Text style={styles.uplaod}>Add</Text>
              <View style={styles.blueContainer}>
                <Image
                  source={icn.plus}
                  style={styles.uploadIcn}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
          data={[...(initailPaymentData || []), ...(previourPaymentData || [])]}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          renderItem={renderItem}
          style={{ marginTop: hp(3) }}
          keyExtractor={(item: any, index: any) => index.toString()}
          contentContainerStyle={{ paddingBottom: hp(13) }}
        />
      </View>
      {/* {
        previourPaymentData?.length > 0 &&
        <View style={{ flex: 1, paddingHorizontal: wp(3), marginTop: hp(-22) }}>
          <FlatList
            data={previourPaymentData}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            renderItem={renderItem}
            // style={}
            keyExtractor={(item: any, index: any) => index.toString()}
            contentContainerStyle={{ paddingBottom: hp(13) }}
          />
        </View>

      } */}


      {/* Modal for Delete */}
      <Modal backdropOpacity={0.5} isVisible={isModalVisible}>
        <View style={styles.modalView}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              style={{ alignSelf: 'flex-end' }}>
              <Image source={icn.cross} style={styles.crossIcn} />
            </TouchableOpacity>
            <Text style={styles.modalHeading}>
              Delete Payment
            </Text>
            <Text style={styles.confirmationText}>
              Are you sure you want to delete this payment?
            </Text>
            <View style={styles.filterButtonsContainer}>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.submitContainer}>
                <Text style={styles.submitText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDeleteConfirmation}
                style={styles.yesContainer}>
                <Text style={styles.clearButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <LoadingModal visible={isLoading} />
    </View >
  );
};
export default Expenses;
