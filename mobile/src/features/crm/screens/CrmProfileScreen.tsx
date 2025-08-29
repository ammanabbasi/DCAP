import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Colors } from '../../../Theme/Colors';
import { hp, wp } from '../../../Theme/Responsiveness';
import { icn } from '../../../Assets/icn';
import Header from '../../../Components/Header';
import LoadingModal from '../../../Components/LoadingModal';
import { BasicInfoSection } from '../components/profile/BasicInfoSection';
import { TimelineSection } from '../components/profile/TimelineSection';
import { TasksSection } from '../components/profile/TasksSection';
import { NotesSection } from '../components/profile/NotesSection';
import { DocumentsSection } from '../components/profile/DocumentsSection';
import { VehicleInterestSection } from '../components/profile/VehicleInterestSection';
import {
  useGetCrmProfileQuery,
  useUpdateCrmProfileMutation,
  useGetCrmTasksQuery,
  useGetCrmNotesQuery,
  useGetCrmTimelineQuery,
  useGetCrmDocumentsQuery,
  useGetVehiclesOfInterestQuery,
  useGetCrmDropdownsQuery,
} from '../../../store/api/crmApi';

// Tab configuration
const TABS = [
  { name: 'Lead Details', icon: icn.crmProfile, key: 'details' },
  { name: 'Timeline', icon: icn.timeline, key: 'timeline' },
  { name: 'Tasks', icon: icn.task, key: 'tasks' },
  { name: 'Notes', icon: icn.notes, key: 'notes' },
  { name: 'Documents', icon: icn.documents, key: 'documents' },
  { name: 'Vehicle', icon: icn.vehicleCar, key: 'vehicle' },
];

type RouteParams = {
  customerId: number;
  customerData?: any;
  onProfileUpdated?: () => void;
};

export const CrmProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const customerId = route.params?.customerId;

  // State
  const [selectedTab, setSelectedTab] = useState('details');
  const [profileData, setProfileData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  // RTK Query hooks
  const {
    data: profile,
    isLoading: isProfileLoading,
    refetch: refetchProfile,
  } = useGetCrmProfileQuery(customerId, { skip: !customerId });

  const {
    data: dropdowns,
    isLoading: isDropdownsLoading,
  } = useGetCrmDropdownsQuery();

  const {
    data: tasks,
    isLoading: isTasksLoading,
    refetch: refetchTasks,
  } = useGetCrmTasksQuery(customerId, {
    skip: !customerId || selectedTab !== 'tasks',
  });

  const {
    data: notes,
    isLoading: isNotesLoading,
    refetch: refetchNotes,
  } = useGetCrmNotesQuery(customerId, {
    skip: !customerId || selectedTab !== 'notes',
  });

  const {
    data: timeline,
    isLoading: isTimelineLoading,
    refetch: refetchTimeline,
  } = useGetCrmTimelineQuery(customerId, {
    skip: !customerId || selectedTab !== 'timeline',
  });

  const {
    data: documents,
    isLoading: isDocumentsLoading,
    refetch: refetchDocuments,
  } = useGetCrmDocumentsQuery(customerId, {
    skip: !customerId || selectedTab !== 'documents',
  });

  const {
    data: vehiclesOfInterest,
    isLoading: isVehiclesLoading,
    refetch: refetchVehicles,
  } = useGetVehiclesOfInterestQuery(customerId, {
    skip: !customerId || selectedTab !== 'vehicle',
  });

  const [updateProfile] = useUpdateCrmProfileMutation();

  // Initialize profile data from fetched profile
  useEffect(() => {
    if (profile) {
      setProfileData({
        LeadSourceID: profile.leadSourceId,
        AssignedToID: profile.assignedToId,
        statusId: profile.statusId,
        TemperatureID: profile.temperatureId,
        LastLookedByID: profile.lastLookedById,
      });
    }
  }, [profile]);

  // Handle profile field changes
  const handleFieldChange = useCallback((field: string, value: any) => {
    setProfileData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      await updateProfile({
        id: customerId,
        data: profileData,
      }).unwrap();

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Profile updated successfully',
      });

      // Call parent callback if provided
      route.params?.onProfileUpdated?.();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update profile',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle refresh based on active tab
  const handleRefresh = useCallback(() => {
    switch (selectedTab) {
      case 'details':
        refetchProfile();
        break;
      case 'timeline':
        refetchTimeline();
        break;
      case 'tasks':
        refetchTasks();
        break;
      case 'notes':
        refetchNotes();
        break;
      case 'documents':
        refetchDocuments();
        break;
      case 'vehicle':
        refetchVehicles();
        break;
    }
  }, [selectedTab]);

  // Navigation handlers
  const handleAddTask = () => {
    navigation.navigate('AddTask' as never, { customerId } as never);
  };

  const handleEditTask = (task: any) => {
    navigation.navigate('EditTask' as never, { customerId, task } as never);
  };

  const handleAddNote = () => {
    navigation.navigate('AddNote' as never, { customerId } as never);
  };

  const handleAddDocument = () => {
    navigation.navigate('UploadDocument' as never, { customerId } as never);
  };

  const handleAddVehicle = () => {
    navigation.navigate('AddVehicleOfInterest' as never, { customerId } as never);
  };

  // Render tab content
  const renderTabContent = () => {
    switch (selectedTab) {
      case 'details':
        return (
          <BasicInfoSection
            profileData={profileData}
            dropdownData={dropdowns}
            isLoading={isDropdownsLoading}
            onFieldChange={handleFieldChange}
          />
        );
      case 'timeline':
        return (
          <TimelineSection
            data={timeline || []}
            isLoading={isTimelineLoading}
            onRefresh={refetchTimeline}
            refreshing={false}
          />
        );
      case 'tasks':
        return (
          <TasksSection
            tasks={tasks || []}
            isLoading={isTasksLoading}
            onRefresh={refetchTasks}
            refreshing={false}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
          />
        );
      case 'notes':
        return (
          <NotesSection
            notes={notes || []}
            isLoading={isNotesLoading}
            onRefresh={refetchNotes}
            refreshing={false}
            onAddNote={handleAddNote}
          />
        );
      case 'documents':
        return (
          <DocumentsSection
            documents={documents || []}
            isLoading={isDocumentsLoading}
            onRefresh={refetchDocuments}
            refreshing={false}
            onAddDocument={handleAddDocument}
          />
        );
      case 'vehicle':
        return (
          <VehicleInterestSection
            vehicles={vehiclesOfInterest || []}
            isLoading={isVehiclesLoading}
            onRefresh={refetchVehicles}
            refreshing={false}
            onAddVehicle={handleAddVehicle}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={`${profile?.firstName || ''} ${profile?.lastName || 'CRM Profile'}`}
        showBack
        onBackPress={() => navigation.goBack()}
        rightIcon={selectedTab === 'details' ? icn.save : undefined}
        onRightPress={selectedTab === 'details' ? handleSaveProfile : undefined}
      />

      {/* Customer Info Bar */}
      {profile && (
        <View style={styles.customerInfo}>
          <Image
            source={{ uri: profile.avatar || icn.dummyProfile }}
            style={styles.avatar}
          />
          <View style={styles.customerDetails}>
            <Text style={styles.customerName}>
              {profile.firstName} {profile.lastName}
            </Text>
            <Text style={styles.customerContact}>{profile.email}</Text>
            <Text style={styles.customerContact}>{profile.phone}</Text>
          </View>
        </View>
      )}

      {/* Tab Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              selectedTab === tab.key && styles.activeTab,
            ]}
            onPress={() => setSelectedTab(tab.key)}
          >
            <Image
              source={tab.icon}
              style={[
                styles.tabIcon,
                selectedTab === tab.key && styles.activeTabIcon,
              ]}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tab Content */}
      <View style={styles.content}>
        {isProfileLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : (
          renderTabContent()
        )}
      </View>

      {/* Loading Modal */}
      <LoadingModal visible={isSaving} message="Saving profile..." />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  customerInfo: {
    flexDirection: 'row',
    padding: wp(4),
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  avatar: {
    width: wp(15),
    height: wp(15),
    borderRadius: wp(7.5),
    marginRight: wp(3),
  },
  customerDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  customerName: {
    fontSize: wp(4),
    fontWeight: '600',
    color: Colors.black,
    marginBottom: hp(0.5),
  },
  customerContact: {
    fontSize: wp(3.2),
    color: Colors.gray,
    marginBottom: hp(0.25),
  },
  tabBar: {
    backgroundColor: Colors.white,
    maxHeight: hp(8),
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  tabBarContent: {
    paddingHorizontal: wp(2),
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(3),
    paddingVertical: hp(1.5),
    marginHorizontal: wp(1),
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabIcon: {
    width: wp(5),
    height: wp(5),
    marginRight: wp(2),
    tintColor: Colors.gray,
  },
  activeTabIcon: {
    tintColor: Colors.primary,
  },
  tabText: {
    fontSize: wp(3.5),
    color: Colors.gray,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: hp(2),
    fontSize: wp(3.5),
    color: Colors.gray,
  },
});

export default CrmProfileScreen;