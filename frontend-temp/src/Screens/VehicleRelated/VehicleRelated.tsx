import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList } from 'react-native';
import { styles } from './styles';
import { wp } from '../../Theme/Responsiveness';
import { icn } from '../../Assets/icn'
import { useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import { crmVehicleOfInterest } from '../../Services/apis/APIs';
import { crmVehicleWishlist,deleteVehicleOfInterest,deleteWishlist } from '../../Services/apis/APIs';
import Modal from 'react-native-modal';
import { useSelector } from 'react-redux';

type RootStackParamList = {
  CrmProfileVehicleBoilerPlate: {
    from: string;
    item?: any;
    customerId?: string | number;
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const emptyComponent = (): any => {
  return <Text style={styles.noDataAvailable}>No data available</Text>;
};

const VehicleRelated = ({ route }: { route: RouteProp<any, any> }) => {
  const [activeTab, setActiveTab] = useState<string>('Vehicle Of Interest');
  const navigation = useNavigation<NavigationProp>();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const user = useSelector((state: any) => state?.userReducer?.user);

  const dummyVehicleOfInterest = [
    {
      year: '2023',
      make: 'Toyota',
      model: 'Camry',
      trim: 'XSE',
      memo: 'Customer interested in test drive',
      mileage: '5000',
      exteriorColor: 'Silver',
      interiorColor: 'Black',
      userName: 'John Smith',
      date: '2024-03-15',
      time: '10:30 AM'
    },
    {
      year: '2024',
      make: 'Honda',
      model: 'CR-V',
      trim: 'EX-L',
      memo: 'Looking for financing options',
      mileage: '2000',
      exteriorColor: 'Blue',
      interiorColor: 'Gray',
      userName: 'Sarah Johnson',
      date: '2024-03-14',
      time: '2:15 PM'
    }
  ];

  const dummyWishlist = [
    {
      year: 2024,
      modelId: 151,
      customerId: 242615,
      userId: 242531,
      expirationDate: '2025-01-31T12:00:00Z',
      memo: 'This is a test wishlist item.'
    },
    {
      year: '2024',
      memo: 'Waiting for price drop',
      expirationDate: '2024-06-15T00:00:00',
      userName: 'Mike Brown',
      date: '2024-03-13',
      time: '9:45 AM'
    },
    {
      year: '2024',
      make: 'BMW',
      model: 'X5',
      memo: 'Interested in hybrid version',
      expirationDate: '2024-05-20T00:00:00',
      userName: 'Emily Davis',
      date: '2024-03-12',
      time: '3:30 PM'
    }
  ];
  const handleDropdownChange = (field: any, value: any) => {
    setVehicleBasicsUpdatedData((prevState: any = {}) => ({
      ...prevState,
      [field]: value,
    }));
  };
  const [vehicleBasicsUpdatedData, setVehicleBasicsUpdatedData] = useState<any>(
 

    route?.params?.item
  );

  const InitializeVehicleData = async () => {
    console.log('Active Tab:', activeTab);
    if (activeTab === 'Vehicle Of Interest') {
      console.log('Route params in VehicleOfInterest', route?.params);
      const vehicleInterestPayload = { CustomerID: route?.params?.item?.customerID || route?.params?.item?.customerId };
      console.log('Payload sent to VehicleOfInterest API:======>', vehicleInterestPayload);
      const response = await crmVehicleOfInterest(vehicleInterestPayload);
      console.log('Response in Vehicle Of Interest', response?.data);
      const updatedVehicle = response?.data?.data?.map((vehicle: any) => ({
        ...vehicle,
        exteriorColorId: vehicle.ExteriorColorID || vehicle.exteriorColorId, // normalize key
        category: 'Vehicle',
        subCategory: 'Vehicle Of Interest',
      }));
      setVehicleOfInterestData(updatedVehicle);
    } else {
      console.log('Route params in Wishlist', route?.params);
      // const wishlistPayload = { CustomerID: route?.params?.item?.customerID || route?.params?.item?.customerId, BusinessID: route?.params?.item?.BusinessID };
      const wishlistPayload = { CustomerID: route?.params?.item?.customerID};
      
      if (!wishlistPayload.CustomerID) {
        console.error('BusinessID is missing');
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'BusinessID is required.',
        });
        return;
      }
      const response = await crmVehicleWishlist(wishlistPayload);
      console.log('Response in Vehicle Wishlist', response?.data);
      const updatedVehicle = response?.data?.data?.map((vehicle: any) => ({
        ...vehicle,
        category: 'Vehicle',
        subCategory: 'Wishlist',
      }));
      setWishlistData(updatedVehicle);
    }
  }

  useEffect(() => {
    // if (activeTab === 'Vehicle Of Interest') {
      InitializeVehicleData();
    // }
  }, [activeTab]);
  const [vehicleOfInterestData, setVehicleOfInterestData] = useState<any>(dummyVehicleOfInterest);
  const [wishlistData, setWishlistData] = useState<any>(dummyWishlist);

  const renderVehicle = ({ item, index }: { item: any, index: number }) => {
    return (
      <View style={styles.itemView}>
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{item?.model} {item?.year} {item?.make} </Text>
          <View style={styles.rowContainer}>
            {/* <Image
              source={icn.emailDocument}
              style={styles.blueEye}
              resizeMode="contain"
            /> */}
            {/* Edit wishlist or Vehicle of interest*/}
            <TouchableOpacity
              onPress={() => {
                onEditOrAdd(item);
              }}>
              <Image
                source={icn.singlePen}
                style={styles.shortIcn}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSelectedItem(item);
                setIsDeleteModalVisible(true);
              }}>
              <Image
                source={icn.delete}
                style={styles.shortIcn}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.vehicleUpperRowContainer}>
          <View style={styles.center}>
            <Text style={styles.label}>Year:</Text>
            <Text style={styles.value}>{item?.year}</Text>
          </View>
          <View style={styles.center}>
            <Text style={styles.label}>Make:</Text>
            <Text style={styles.value}>{item?.make}</Text>
          </View>
          <View style={styles.center}>
            <Text style={styles.label}>Model:</Text>
            <Text style={styles.value}>{item?.model}</Text>
          </View>
          {activeTab == 'Vehicle Of Interest' && (
            <View style={styles.center}>
              <Text style={styles.label}>Trim:</Text>
              <Text style={styles.value}>{item?.trim}</Text>
            </View>
          )}
          <View style={styles.center}>
            <Text style={styles.label}>Memo:</Text>
            <Text style={styles.value}>{item?.memo}</Text>
          </View>
          {activeTab === 'Wishlist' && (
            <View style={styles.center}>
              <Text style={styles.label}>Expires:</Text>
              <Text style={styles.value}>
                {item?.expirationDate?.split('T')?.[0]}
              </Text>
            </View>
          )}
        </View>
        {activeTab !== 'Wishlist' && (
          <View style={styles.rowContainer}>
            <View style={styles.vehicleInfoContainer}>
              <Text style={styles.label}>Mileage:</Text>
              <Text style={styles.value}>{item?.mileage}</Text>
            </View>
            <View style={styles.vehicleInfoContainer}>
              <Text style={styles.label}>Color (Ext):</Text>
              <Text style={styles.value}>{item?.exteriorColor || item?.exteriorColorId}</Text>
            </View>
            <View style={styles.vehicleInfoContainer}>
              <Text style={styles.label}>Color (Int):</Text>
              <Text style={styles.value}>{item?.interiorColor || item?.interiorColorId}</Text>
            </View>
          </View>
        )}
        {/* <View style={styles.separator}></View>
            {activeTab === 'Wishlist' && (
         <View style={styles.userContainer}> 
                 <View style={[styles.rowContainer, { alignItems: 'center', marginTop: 8 }]}>
              <Image
                source={icn.sampleUser}
                style={styles.userImg}
                resizeMode="contain"
              />
              <Text style={[styles.userName, { marginLeft: 8 }]}>
                {item?.userName || 'N/A'}
              </Text>
              <Text style={[styles.date, { marginLeft: 8 }]}>
                {item?.date || '-'}
              </Text>
              {item?.date && item?.time && <View style={[styles.blueDot, { marginHorizontal: 8 }]} />}
              <Text style={[styles.date, { marginLeft: 8 }]}>
                {item?.time || '-'}
              </Text>
            </View>
        </View>
            )} */}
      </View>
    );
  };
  const onDelete = async () => {
    try {
      if (activeTab === 'Vehicle Of Interest') {
        const deletePayload = { vehicleInterestId: selectedItem?.vehicleInterestId };
        const response = await deleteVehicleOfInterest(deletePayload);
        console.log('Response in Vehicle Of Interest', response?.data);
        setVehicleOfInterestData(vehicleOfInterestData.filter((vehicle: any) => vehicle.vehicleInterestId !== selectedItem?.vehicleInterestId));
      } else {
        const deletePayload = { wishListId: selectedItem?.wishListId };
        const response = await deleteWishlist(deletePayload);
        console.log('Response in Vehicle Wishlist', response?.data);
        setWishlistData(wishlistData.filter((vehicle: any) => vehicle.wishListId !== selectedItem?.wishListId));
      }
      setIsDeleteModalVisible(false);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Item deleted successfully',
      });
      InitializeVehicleData();
    } catch (error: any) {
      console.error('Error deleting item:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to delete item',
      });
    }
  };

  const onEditOrAdd = (item: any) => {
    (navigation as any).navigate('CrmProfileVehicleBoilerPlate', {
      from: activeTab,
      item: item,
      refreshList: InitializeVehicleData,
    });
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Tabs */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={icn.back} style={{ width: wp(5), height: wp(5), marginLeft: wp(4) }}></Image>
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold', margin: 15, color: 'black', flexDirection: 'row', marginLeft: wp(28) }}>Vehicle</Text>

      </View>

      <View style={{ flexDirection: 'row', margin: 10 }}>
        <TouchableOpacity
          onPress={() => setActiveTab('Vehicle Of Interest')}
          style={{
            flex: 1,
            padding: 12,
            backgroundColor: activeTab === 'Vehicle Of Interest' ? '#1e3a8a' : '#e5e5e5',
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: activeTab === 'Vehicle Of Interest' ? '#fff' : '#000' }}> Vehicle Of Interest</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            console.log('Wishlist Tab Pressed');
            setActiveTab('Wishlist')
          }}
          style={{
            flex: 1,
            padding: 12,
            backgroundColor: activeTab === 'Wishlist' ? '#1e3a8a' : '#e5e5e5',
            borderRadius: 8,
            alignItems: 'center',
            marginLeft: 8,
          }}
        >
          <Text style={{ color: activeTab === 'Wishlist' ? '#fff' : '#000' }}> Wishlist</Text>
        </TouchableOpacity>
      </View>


      <FlatList
        data={
          activeTab === 'Vehicle Of Interest'
            ? vehicleOfInterestData
            : wishlistData
        }
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatlistContent}
        renderItem={renderVehicle}
        keyExtractor={(item: any, index: any) => index.toString()}
        ListEmptyComponent={emptyComponent}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => onEditOrAdd({
          customerID: route?.params?.item?.customerID || route?.params?.item?.customerId,
          userID: user?.id
        })}
      >
        <Image source={icn.plus} style={[styles.fabIconss, { objectFit: 'contain' }]} />
      </TouchableOpacity>

      <Modal backdropOpacity={0.5} isVisible={isDeleteModalVisible}>
        <View style={styles.modalView}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              onPress={() => setIsDeleteModalVisible(false)}
              style={{ alignSelf: 'flex-end' }}>
              <Image source={icn.cross} style={styles.crossIcn} />
            </TouchableOpacity>
            {/* <Text style={styles.modalHeading}>
              Yahauto?.autodealerscloud?.com Says
            </Text> */}
            <Text style={styles.confirmationText}>
              Are you sure you want to delete this {selectedItem?.category}?
            </Text>
            <View style={styles.filterButtonsContainer}>
              <TouchableOpacity
                onPress={() => setIsDeleteModalVisible(false)}
                style={styles.cancelContainer}>
                <Text style={styles.submitText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onDelete}
                style={styles.deleteContainer}>
                <Text style={styles.clearButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
export default VehicleRelated;
