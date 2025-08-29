import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Colors } from '../../../../Theme/Colors';
import { hp, wp } from '../../../../Theme/Responsiveness';
import { icn } from '../../../../Assets/icn';
import { useDeleteVehicleOfInterestMutation } from '../../../../store/api/crmApi';

interface VehicleOfInterest {
  vehicleInterestId: number;
  modelYear: string;
  makeId: number;
  modelId: number;
  makeName?: string;
  modelName?: string;
  trimId?: number;
  trimName?: string;
  exteriorColorId?: number;
  exteriorColorName?: string;
  interiorColorId?: number;
  interiorColorName?: string;
  mileage?: number;
  memo?: string;
  imageUrl?: string;
}

interface VehicleInterestSectionProps {
  vehicles: VehicleOfInterest[];
  isLoading: boolean;
  onRefresh: () => void;
  refreshing: boolean;
  onAddVehicle: () => void;
}

export const VehicleInterestSection: React.FC<VehicleInterestSectionProps> = ({
  vehicles,
  isLoading,
  onRefresh,
  refreshing,
  onAddVehicle,
}) => {
  const [deleteVehicle] = useDeleteVehicleOfInterestMutation();

  const handleDeleteVehicle = (vehicle: VehicleOfInterest) => {
    const vehicleName = `${vehicle.modelYear} ${vehicle.makeName} ${vehicle.modelName}`;
    Alert.alert(
      'Remove Vehicle',
      `Are you sure you want to remove "${vehicleName}" from vehicles of interest?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVehicle(vehicle.vehicleInterestId).unwrap();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove vehicle');
            }
          },
        },
      ]
    );
  };

  const renderVehicle = ({ item }: { item: VehicleOfInterest }) => {
    const vehicleName = `${item.modelYear} ${item.makeName || 'Unknown Make'} ${item.modelName || 'Unknown Model'}`;
    
    return (
      <TouchableOpacity
        style={styles.vehicleCard}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: item.imageUrl || icn.dummyCar }}
          style={styles.vehicleImage}
          resizeMode="cover"
        />
        
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleName} numberOfLines={1}>
            {vehicleName}
          </Text>
          
          {item.trimName && (
            <Text style={styles.vehicleDetail}>
              Trim: {item.trimName}
            </Text>
          )}
          
          <View style={styles.vehicleSpecs}>
            {item.exteriorColorName && (
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Exterior:</Text>
                <Text style={styles.specValue}>{item.exteriorColorName}</Text>
              </View>
            )}
            
            {item.interiorColorName && (
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Interior:</Text>
                <Text style={styles.specValue}>{item.interiorColorName}</Text>
              </View>
            )}
            
            {item.mileage !== undefined && item.mileage !== null && (
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Mileage:</Text>
                <Text style={styles.specValue}>
                  {item.mileage.toLocaleString()} mi
                </Text>
              </View>
            )}
          </View>
          
          {item.memo && (
            <Text style={styles.memo} numberOfLines={2}>
              Note: {item.memo}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteVehicle(item)}
        >
          <Text style={styles.deleteIcon}>❌</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading vehicles...</Text>
      </View>
    );
  }

  const ListHeaderComponent = () => (
    <TouchableOpacity style={styles.addButton} onPress={onAddVehicle}>
      <Text style={styles.addButtonIcon}>🚗</Text>
      <Text style={styles.addButtonText}>Add Vehicle of Interest</Text>
    </TouchableOpacity>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🚙</Text>
      <Text style={styles.emptyTitle}>No Vehicles of Interest</Text>
      <Text style={styles.emptyDescription}>
        Add vehicles the customer is interested in
      </Text>
    </View>
  );

  return (
    <FlatList
      data={vehicles}
      renderItem={renderVehicle}
      keyExtractor={(item) => item.vehicleInterestId.toString()}
      contentContainerStyle={styles.container}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.primary]}
        />
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(10),
  },
  loadingText: {
    marginTop: hp(2),
    fontSize: wp(3.5),
    color: Colors.gray,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.success,
    padding: wp(3),
    borderRadius: wp(2),
    marginBottom: hp(2),
  },
  addButtonIcon: {
    fontSize: wp(5),
    marginRight: wp(2),
  },
  addButtonText: {
    fontSize: wp(3.8),
    color: Colors.white,
    fontWeight: '600',
  },
  vehicleCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: wp(2),
    marginBottom: hp(2),
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
    overflow: 'hidden',
  },
  vehicleImage: {
    width: wp(30),
    height: wp(25),
    backgroundColor: Colors.lightGray,
  },
  vehicleInfo: {
    flex: 1,
    padding: wp(3),
  },
  vehicleName: {
    fontSize: wp(4),
    color: Colors.black,
    fontWeight: '600',
    marginBottom: hp(0.5),
  },
  vehicleDetail: {
    fontSize: wp(3.2),
    color: Colors.darkGray,
    marginBottom: hp(0.5),
  },
  vehicleSpecs: {
    marginTop: hp(0.5),
  },
  specItem: {
    flexDirection: 'row',
    marginBottom: hp(0.3),
  },
  specLabel: {
    fontSize: wp(3),
    color: Colors.gray,
    marginRight: wp(1),
  },
  specValue: {
    fontSize: wp(3),
    color: Colors.black,
    fontWeight: '500',
  },
  memo: {
    fontSize: wp(3),
    color: Colors.gray,
    fontStyle: 'italic',
    marginTop: hp(1),
  },
  deleteButton: {
    position: 'absolute',
    top: wp(2),
    right: wp(2),
    padding: wp(1),
  },
  deleteIcon: {
    fontSize: wp(4),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(10),
  },
  emptyIcon: {
    fontSize: wp(15),
    marginBottom: hp(2),
  },
  emptyTitle: {
    fontSize: wp(4),
    color: Colors.black,
    fontWeight: '600',
    marginBottom: hp(1),
  },
  emptyDescription: {
    fontSize: wp(3.5),
    color: Colors.gray,
    textAlign: 'center',
  },
});