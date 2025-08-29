import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Colors } from '../../../../Theme/Colors';
import { hp, wp } from '../../../../Theme/Responsiveness';

interface BasicInfoSectionProps {
  profileData: any;
  dropdownData: any;
  isLoading: boolean;
  onFieldChange: (field: string, value: any) => void;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  profileData,
  dropdownData,
  isLoading,
  onFieldChange,
}) => {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Lead Source Dropdown */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Lead Source</Text>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          data={dropdownData?.leadSources || []}
          labelField="leadSourceName"
          valueField="leadSourceId"
          placeholder="Select Lead Source"
          value={profileData?.LeadSourceID}
          onChange={(item) => onFieldChange('LeadSourceID', item.leadSourceId)}
          disable={!dropdownData?.leadSources?.length}
        />
      </View>

      {/* Assigned To Dropdown */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Assigned To</Text>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          data={dropdownData?.users || []}
          labelField="userName"
          valueField="userID"
          placeholder="Select User"
          value={profileData?.AssignedToID}
          onChange={(item) => onFieldChange('AssignedToID', item.userID)}
          disable={!dropdownData?.users?.length}
        />
      </View>

      {/* Lead Status Dropdown */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Lead Status</Text>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          data={dropdownData?.leadStatuses || []}
          labelField="statusName"
          valueField="statusId"
          placeholder="Select Status"
          value={profileData?.statusId}
          onChange={(item) => onFieldChange('statusId', item.statusId)}
          disable={!dropdownData?.leadStatuses?.length}
        />
      </View>

      {/* Temperature Dropdown */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Temperature</Text>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          data={dropdownData?.temperatures || []}
          labelField="temperatureName"
          valueField="temperatureID"
          placeholder="Select Temperature"
          value={profileData?.TemperatureID}
          onChange={(item) => onFieldChange('TemperatureID', item.temperatureID)}
          disable={!dropdownData?.temperatures?.length}
        />
      </View>

      {/* Last Looked By */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Last Looked By</Text>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          data={dropdownData?.users || []}
          labelField="userName"
          valueField="userID"
          placeholder="Select User"
          value={profileData?.LastLookedByID}
          onChange={(item) => onFieldChange('LastLookedByID', item.userID)}
          disable={!dropdownData?.users?.length}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: wp(4),
    backgroundColor: Colors.white,
  },
  loadingContainer: {
    padding: wp(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: wp(3.5),
    color: Colors.gray,
  },
  fieldContainer: {
    marginBottom: hp(2),
  },
  label: {
    fontSize: wp(3.5),
    color: Colors.black,
    marginBottom: hp(0.5),
    fontWeight: '500',
  },
  dropdown: {
    height: hp(6),
    borderColor: Colors.lightGray,
    borderWidth: 1,
    borderRadius: wp(2),
    paddingHorizontal: wp(3),
    backgroundColor: Colors.white,
  },
  placeholderStyle: {
    fontSize: wp(3.5),
    color: Colors.gray,
  },
  selectedTextStyle: {
    fontSize: wp(3.5),
    color: Colors.black,
  },
});