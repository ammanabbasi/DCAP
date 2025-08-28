
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  PermissionsAndroid,
  Linking,
  
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Modal from 'react-native-modal';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import { icn } from '../../Assets/icn';
import DropDown from '../../Components/DropDown';
import Header from '../../Components/Header';
import InputBox from '../../Components/InputBox';
import LoadingModal from '../../Components/LoadingModal';
import PrimaryButton from '../../Components/PrimaryButton';
import {
  crmAppointments,
  crmDropdowns,
  crmEmail,
  crmNotes,
  crmSms,
  crmTasks,
  selectVehicle,
  crmTimeline,
  crmVehicleOfInterest,
  crmVehicleWishlist,
  deleteAppointment,
  deleteNote,
  deleteSms,
  deleteTask,
  deleteVehicleDocument,
  deleteVehicleOfInterest,
  deleteWishlist,
  updateCrmProfile,
  uploadVehicleImages,
  vehicleDocuments,
  getSetVehicle,
  updateCrmAppointment,
  addAppointment,
} from '../../Services/apis/APIs';
import { Colors } from '../../Theme/Colors';
import { hp, wp } from '../../Theme/Responsiveness';
import { styles } from './style';
import type { RouteProp } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import RNFetchBlob from 'react-native-blob-util';
import { CONFIG } from '../../config/buildConfig';
import FileViewer from 'react-native-file-viewer';

type CrmItem = {
  category: string;
  subCategory?: string;
  [key: string]: any;
};

const tabsData = [
  { name: 'Lead Details', icn: icn.crmProfile },
  { name: 'Timeline', icn: icn.timeline },
  { name: 'Tasks', icn: icn.task },
  { name: 'Notes', icn: icn.notes },
  { name: 'Documents', icn: icn.documents },
  { name: 'Sms', icn: icn.sms },
  { name: 'Appointments', icn: icn.appointment },
  { name: 'Email', icn: icn.email },
  { name: 'Vehicle', icn: icn.vehicleCar },
];
// Function to pre-load dropdown data - can be called before navigation
export const preloadCrmDropdownData = async (dispatch: any) => {
  try {
  
    const response = await crmDropdowns();
    return response?.data;
  } catch (error: any) {
    console.error('Error pre-loading CRM dropdown data:', error);
    return null;
  }
};

const CrmProfile = ({ route }: { route: RouteProp<any, any> }) => {
  console.log('CrmProfile rendered');
  const params = route?.params;
  const dispatch = useDispatch();
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const { data, loading, error } = useSelector(
    (state: any) => state?.crmDropdownReducer,
  );
  const employee = useSelector((state: any) => state?.employeeRoleReducer?.data);
  const navigation = useNavigation();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<string>('Lead Details');
  const [vehicleSelectedTab, setVehicleSelectedTab] = useState<any>(
    'Set Vehicle',
  );
  const [dataStorage, setDataStorage] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isDropdownLoading, setIsDropdownLoading] = useState<boolean>(true);
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<any>({
    customerID: params?.item?.customerID,
    AssignedToID: params?.item?.assignedToID,
    LeadSourceID: params?.item?.leadSourceID || data?.leadSources?.[0]?.leadSourceId || null,
    TemperatureID: params?.item?.temperatureID,
    mSoldAtID: params?.item?.mSoldAtID,
    statusId: params?.item?.statusID || 1,
    LastLookedByID: params?.item?.LastLookedByID,
    WebURL: params?.item?.WebURL,

  });
  const [selectedItem, setSelectedItem] = useState<CrmItem | null>(null);
  const [searchVehicleData, setSearchVehicleData] = useState<any>([
  ]);
  const { control, handleSubmit, trigger, formState, resetField } = useForm();
  // console.log('PARAMS IS : ===> ', params?.item);
  const [focusedDropdown, setFocusedDropdown] = useState<string | null>(null);
  const [isSelectingVehicle, setIsSelectingVehicle] = useState<boolean>(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const updateProfileData = (key: string, value: any) => {
    // console.log('Key is : ===>', key);
    // console.log('Value is : ===>', value);

    setProfileData(prev => ({
      ...prev,
      [key]: value // Accept null values, just don't accept undefined
    }));
  };

  const onSaveProfilePress = async (data: any) => {
    try {
      setIsModalLoading(true);
      // Clean payload - remove null/undefined values
      const cleanPayload: any = {
        customerID: params?.item?.customerID,
        AssignedToID: profileData?.AssignedToID,
        LeadSourceID: profileData?.LeadSourceID,
        TemperatureID: profileData?.TemperatureID,
        statusId: profileData?.statusId,
        mSoldAtID: profileData?.mSoldAtID,
      };

      // Only add LastLookedByID and WebURL if they have values
      if (profileData?.LastLookedByID) {
        cleanPayload.LastLookedByID = profileData.LastLookedByID;
      }
      if (profileData?.WebURL) {
        cleanPayload.WebURL = profileData.WebURL;
      }

      const payload = cleanPayload;

      // console.log('Final payload:', payload);
      // console.log('LastLookedByID value:', profileData?.LastLookedByID);
      // console.log('WebURL value:', profileData?.WebURL);
      const response = await updateCrmProfile(payload);

      // console.log("response from saveeprofle",response);

      // Show success message
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: response?.data?.message || 'Customer updated successfully',
      });

      // Navigate back with refresh flag
      navigation.goBack();

      // Trigger refresh in parent component if callback exists
      if (params?.onProfileUpdated) {
        params.onProfileUpdated();
      }

    } catch (error: any) {
      // console.log('Save profile error:', error);
      // console.log('Error response data:', error?.response?.data);
      // console.log('Error response status:', error?.response?.status);
      // console.log('Error response headers:', error?.response?.headers);

      // Show error message
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to update profile',
      });
    } finally {
      setIsModalLoading(false);
    }
  };
  const getSetVehicleHandler = async () => {
    const response = await getSetVehicle({ customerId: params?.item?.customerID || params?.item?.customerId });
    console.log('Response in Get Set Vehicle', response?.data);
    setSearchVehicleData(response?.data?.data);
  }


  const onDelete = async () => {
    try {
      setIsDeleteModalVisible(false);
      setIsModalLoading(true);
      if (selectedItem?.category === 'Task') {
        console.log('Existing task object:', selectedItem);
        const payload = {
          taskID: selectedItem?.taskId,
        };
        const response = await deleteTask(payload);
        setDataStorage(prev => {
          if (!prev[selectedTab]) return prev;

          return {
            ...prev,
            [selectedTab]: prev[selectedTab]?.filter((item: any) => item?.taskId !== selectedItem?.taskId),
          };
        });
      } else if (selectedItem?.category === 'Document') {
        const response = await deleteVehicleDocument(selectedItem?.DocumentID);
        setDataStorage(prev => {
          if (!prev[selectedTab]) return prev;

          return {
            ...prev,
            [selectedTab]: prev[selectedTab]?.filter((item: any) => item?.DocumentID !== selectedItem?.DocumentID),
          };
        });
      } else if (selectedItem?.category === 'Note') {
        const notesPayload = {
          noteId: selectedItem?.noteId,
        };
        const response = await deleteNote(notesPayload);
        setDataStorage(prev => {
          if (!prev[selectedTab]) return prev;

          return {
            ...prev,
            [selectedTab]: prev[selectedTab]?.filter((item: any) => item?.noteId !== selectedItem?.noteId),
          };
        });
      } else if (selectedItem?.category === 'Sms') {
        const payload = {
          smsID: selectedItem?.taskId,
        };
        const response = await deleteSms(payload);
        setDataStorage(prev => {
          if (!prev[selectedTab]) return prev;

          return {
            ...prev,
            [selectedTab]: prev[selectedTab]?.filter((item: any) => item?.taskId !== selectedItem?.taskId),
          };
        });
      } else if (selectedItem?.category === 'Appointment') {
        const payload = {
          appointmentID: selectedItem?.appointmentID,
        };
        const response = await deleteAppointment(payload);
        setDataStorage(prev => {
          if (!prev[selectedTab]) return prev;

          return {
            ...prev,
            [selectedTab]: prev[selectedTab]?.filter((item: any) => item?.appointmentID !== selectedItem?.appointmentID),
          };
        });
      } else if (selectedItem?.category === 'Vehicle') {
        if (selectedItem?.subCategory === 'Vehicle Of Interest') {
          const payload = { CustomerID: params?.item?.customerID || params?.item?.customerId };
          console.log('Payload sent to VehicleOfInterest API:', payload);
          const response = await crmVehicleOfInterest(payload);
          console.log('Response in Vehicle Of Interest=======', response);
          if (selectedTab === 'Timeline') {
            setDataStorage(prev => {
              if (!prev[selectedTab]) return prev;
              return {
                ...prev,
                [selectedTab]: prev[selectedTab]?.filter((item: any) => item?.vehicleInterestId !== selectedItem?.vehicleInterestId),
              };
            });
          } else {
            setDataStorage(prev => {
              if (!prev[selectedTab]) return prev;
              const updatedData = prev[selectedTab]?.vehicleSelectedTab?.filter((item: any) => item?.vehicleInterestId !== selectedItem?.vehicleInterestId);
              return {
                ...prev,
                [selectedTab]: { vehicleSelectedTab: updatedData },
              };
            });
          }
        } else if (selectedItem?.subCategory === 'Wishlist') {
          const wishlistPayload = { CustomerID: params?.item?.customerID || params?.item?.customerId, BusinessID: params?.item?.BusinessID };
          if (!wishlistPayload.BusinessID) {
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
          const updatedVehicle = response?.data?.data?.map((vehicle: CrmItem) => ({
            ...vehicle,
            category: 'Vehicle',
            subCategory: 'Wishlist',
          }));
          const dataToSave = { vehicleSelectedTab: updatedVehicle };
          setDataStorage(prev => ({
            ...prev,
            [selectedTab]: dataToSave,
          }));
        }
      }
    } catch (error: any) {
      console.log('Full error:', error);
      if (error?.response) {
        console.log('Error response:', error.response);
        console.log('Error response data:', error?.response?.data);
      }
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setIsModalLoading(false);
    }
  };


  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        // For Android 11+ (API 30+), we don't need WRITE_EXTERNAL_STORAGE for Downloads
        if (Platform.Version >= 30) {
          return true;
        }

        // For older Android versions, request WRITE_EXTERNAL_STORAGE
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid?.PERMISSIONS?.WRITE_EXTERNAL_STORAGE
        );
        return granted === PermissionsAndroid?.RESULTS?.GRANTED;
      } catch (err: any) {
        console.error('Permission request error:', err);
        return false;
      }
    }
    return true;
  };

  // start download
  const startDownload = async (url: string) => {
    try {
      // Validate URL
      if (!url || url.trim() === '') {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Invalid document URL',
        });
        return;
      }

      console.log('Url in start download ================================> ', url);

      // Get file extension from URL
      const fileExtension = url.split('.').pop()?.toLowerCase() || 'pdf';
      const fileName = `Document_${Date.now()}.${fileExtension}`;
      const downloadDest = `${RNFS.DownloadDirectoryPath}/${fileName}`;

      // Get proper MIME type
      const getMimeType = (ext: string) => {
        const mimeTypes: { [key: string]: string } = {
          'pdf': 'application/pdf',
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'gif': 'image/gif',
          'doc': 'application/msword',
          'docx': 'application/vnd.openxmlformats-officedocument?.wordprocessingml?.document',
          'xls': 'application/vnd.ms-excel',
          'xlsx': 'application/vnd.openxmlformats-officedocument?.spreadsheetml?.sheet',
          'txt': 'text/plain',
          'rtf': 'application/rtf',
        };
        return mimeTypes[ext] || 'application/octet-stream';
      };

      if (Platform.OS === 'android') {
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Storage permission is required to download files',
          });
          return;
        }
      }
      RNFetchBlob.config({
        fileCache: true,
        path: downloadDest,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          title: fileName,
          description: 'Document Download',
          mediaScannable: true,
          mime: getMimeType(fileExtension),
        },
      })
        .fetch('GET', url)
        .progress((received: any, total: any) => {
          const progress = (Number(received) / Number(total)) * 100;
          console.log(`Download progress: ${progress}%`);
        })
        .then(async (res: any) => {
          console.log('Download completed, file path:', res.path());

          // Verify file exists
          const fileExists = await RNFS.exists(res.path());
          console.log('Downloaded file exists:', fileExists);

          if (fileExists) {
            Toast.show({
              type: 'success',
              text1: 'Download Successful',
              text2: `${fileName} downloaded successfully to Downloads folder`,
            });

            // Try to open the file after successful download
            try {
              const getMimeType = (ext: string) => {
                const mimeTypes: { [key: string]: string } = {
                  'pdf': 'application/pdf',
                  'jpg': 'image/jpeg',
                  'jpeg': 'image/jpeg',
                  'png': 'image/png',
                  'gif': 'image/gif',
                  'doc': 'application/msword',
                  'docx': 'application/vnd.openxmlformats-officedocument?.wordprocessingml?.document',
                  'xls': 'application/vnd.ms-excel',
                  'xlsx': 'application/vnd.openxmlformats-officedocument?.spreadsheetml?.sheet',
                  'txt': 'text/plain',
                  'rtf': 'application/rtf',
                };
                return mimeTypes[ext] || 'application/octet-stream';
              };

              RNFetchBlob?.android?.actionViewIntent(res.path(), getMimeType(fileExtension));
            } catch (openError: any) {
              console.error('Error opening downloaded file:', openError);
              // Don't show error toast here as download was successful
            }
          } else {
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'File downloaded but not found in storage',
            });
          }
        })
        .catch(error => {
          console.error('Download error:', error);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to download file',
          });
        });
    } catch (error: any) {
      console.error('Download error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to download file',
      });
    }
  };
  // end download
  const viewDocument = async (url: string) => {
    try {
      console.log('Url in view document ================================> ', url);

      // Validate URL
      if (!url || url.trim() === '') {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Invalid document URL',
        });
        return;
      }
      // Check permissions for Android
      if (Platform.OS === 'android') {
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Storage permission is required to view files',
          });
          return;
        }
      }
      // 1. Get file extension and name
      const fileExtension = url.split('.').pop()?.toLowerCase() || 'pdf';
      const fileName = `Document_${Date.now()}.${fileExtension}`;
      const localPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
      console.log('Local path for viewing:', localPath);
      console.log('File extension:', fileExtension);
      // 2. Download the file to local storage with proper configuration
      const res = await RNFetchBlob.config({
        fileCache: true,
        path: localPath,
        appendExt: fileExtension,
      }).fetch('GET', url);

      console.log('Download response path:', res.path());
      // 3. Check if file exists
      const fileExists = await RNFS.exists(res.path());
      console.log('File exists:', fileExists);

      if (!fileExists) {
        throw new Error('Downloaded file not found');
      }
      // 4. Open the file with the system viewer
      if (Platform.OS === 'android') {
        // Get proper MIME type for viewing
        const getMimeType = (ext: string) => {
          const mimeTypes: { [key: string]: string } = {
            'pdf': 'application/pdf',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument?.wordprocessingml?.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument?.spreadsheetml?.sheet',
            'txt': 'text/plain',
            'rtf': 'application/rtf',
          };
          return mimeTypes[ext] || 'application/octet-stream';
        };

        // For images, use a different approach
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension)) {
          // For images, we can use Linking to open in browser or image viewer
          await Linking.openURL(url);
        } else {
          // For other files, use the action view intent with proper MIME type
          RNFetchBlob?.android?.actionViewIntent(res.path(), getMimeType(fileExtension));
        }
      } else {
        RNFetchBlob?.ios?.previewDocument(res.path());
      }
    } catch (error: any) {
      console.error('View document error:', error);

      // Fallback: try to open URL directly in browser
      try {
        console.log('Attempting fallback: opening URL in browser');
        await Linking.openURL(url);
      } catch (fallbackError: any) {
        console.error('Fallback error:', fallbackError);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to open document. Please try downloading it instead.',
        });
      }
    }
  };

  const getCrmProfileData = async (from = '') => {
    try {
      if (from !== 'refreshing') setIsLoading(true);
      let payload = {
        customerID: params?.item?.customerID || params?.item?.customerId,
      };
      let response: any;

      if (selectedTab === 'Tasks') {
        console.log('Payload sent to Tasks API:', payload);
        response = await crmTasks(payload);
        console.log('Response in Tasks', response?.data);
        const updatedTasks = response?.data?.tasks?.map((task: any) => ({
          ...task,
          category: 'Task',
        }));
        setDataStorage(prev => ({
          ...prev,
          [selectedTab]: updatedTasks,
        }));
      } else if (selectedTab === 'Timeline') {
        response = await crmTimeline(params?.item?.customerID);
        setDataStorage(prev => ({
          ...prev,
          [selectedTab]: response?.data?.timeline,
        }));
      } else if (selectedTab === 'Notes') {
        const notesPayload:any = {
          customerId: params?.item?.customerID,
        };
        response = await crmNotes(notesPayload);
        console.log('Response From Notes', response?.data?.data);

        const updatedNotes = response?.data?.data?.map((note: any) => ({
          ...note,
          category: 'Note',
        }));
        setDataStorage(prev => ({
          ...prev,
          [selectedTab]: updatedNotes,
        }));
      } else if (selectedTab === 'Documents') {
        console.log("params?.item ====>", params?.item);
        const objectId = params?.item?.customerID;
        console.log("objectId of documents", objectId);
        if (!objectId) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'No ObjectID found for this profile.',
          });
          return;
        }
        const docPayload = { objectId };
        console.log("docPayload", docPayload);
        setIsLoading(true);
        try {
          response = await vehicleDocuments(docPayload);
          if (Array.isArray(response?.data)) {
            const updatedDocuments = response?.data?.map((doc: any) => ({
              ...doc,
              category: 'Document',
            }));
            setDataStorage(prev => ({
              ...prev,
              [selectedTab]: updatedDocuments,
            }));
          }
        } catch (error: any) {
          console.log('Documents API error:', error);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: error?.response?.data?.message || 'Failed to load documents',
          });
        } finally {
          setIsLoading(false);
        }
      } else if (selectedTab === 'Sms') {
        response = await crmSms(payload);
        const updatedSms = response?.data?.tasks?.map((task: any) => ({
          ...task,
          category: 'Sms',
        }));
        setDataStorage(prev => ({
          ...prev,
          [selectedTab]: updatedSms,
        }));
      } else if (selectedTab === 'Appointments') {
        response = await crmAppointments(payload);
        console.log('Response in Appointment', response?.data);

        const updatedApp = response?.data?.appointments?.map((app: any) => ({
          ...app,
          category: 'Appointment',
        }));
        setDataStorage(prev => ({
          ...prev,
          [selectedTab]: updatedApp,
        }));
      } else if (selectedTab === 'Email') {
        response = await crmEmail(params?.item?.customerID);
        const updatedEmails = response?.data?.map((email: any) => ({
          ...email,
          category: 'Email',
        }));
        setDataStorage(prev => ({
          ...prev,
          [selectedTab]: updatedEmails,
        }));
      } else if (selectedTab === 'Vehicle') {
        setIsLoading(true)
        await getSetVehicleHandler()
        setIsLoading(false)


      }
    } catch (error: any) {
      console.log('Full error: =====>', error);
      if (error?.response) {
        console.log('Error response:', error.response);
        console.log('Error response data:', error?.response?.data);
      }
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  // Load dropdown data immediately when component mounts
  const loadDropdownData = async () => {
    try {
      setIsDropdownLoading(true);
      const response = await crmDropdowns();
      console.log('Dropdown data loaded:', response?.data);
      setIsDropdownLoading(false);
    } catch (error: any) {
      console.error('Error loading dropdown data:', error);
      setIsDropdownLoading(false);
    }
  };

  // Pre-load dropdown data immediately when screen opens
  useEffect(() => {
    console.log('Received params:', params);
    console.log('DealershipID:', params?.item?.DealershipID);
    if (!params?.item?.DealershipID) {
      console.error('DealershipID is missing');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'DealershipID is required.',
      });
      return;
    }
    console.log('Received dueDate:', params?.item?.addedOn);
    
    // Load dropdown data immediately if not already loaded
    if (!data || Object.keys(data).length === 0) {
      loadDropdownData();
    } else {
      setIsDropdownLoading(false);
    }
    
    let toCheck;
    if (selectedTab === 'Vehicle')
      toCheck = dataStorage[selectedTab]?.[vehicleSelectedTab];
    else toCheck = dataStorage[selectedTab];
    if (!toCheck) {
      getCrmProfileData();
    } else {
      setIsLoading(false);
    }
  }, [selectedTab, vehicleSelectedTab, data]);
  useEffect(() => {
    if (selectedTab === 'Vehicle') {

      setVehicleSelectedTab('Set Vehicle');
    }
  }, [selectedTab]);

  // Load dropdown data immediately when component mounts
  useEffect(() => {
    // Start loading dropdown data immediately when component mounts
    if (!data || Object.keys(data).length === 0) {
      loadDropdownData();
    }
  }, []); // Empty dependency array - runs only once when component mounts

  // Load dropdown data immediately when screen opens
  useFocusEffect(
    React.useCallback(() => {
      // Pre-load dropdown data for Lead Details tab
      if (!data || Object.keys(data).length === 0) {
        loadDropdownData();
      }
      
      // Refresh notes when returning from Notes screen
      if (selectedTab === 'Notes') {
        getCrmProfileData('Notes');
      }
    }, [selectedTab, data])
  );
  const renderTabs = ({ item, index }: { item: any; index: number }) => {
    return (
      <TouchableOpacity
        onPress={() => setSelectedTab(item?.name)}
        style={[
          styles.screenTabContainer,
          {
            backgroundColor:
              selectedTab == item?.name ? Colors.primary : Colors.dullWhite,
          },
        ]}>
        <View style={styles.rowContainer}>
          <Image
            source={item?.icn}
            style={styles.tabIcn}
            resizeMode="contain"
            tintColor={
              selectedTab == item?.name ? Colors.white : Colors.greyIcn
            }
          />
          <Text
            style={[
              styles.tabText,
              {
                color:
                  selectedTab == item?.name ? Colors.white : Colors.greyIcn,
              },
            ]}>
            {item?.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  const renderItem = ({ item, index }: { item: any; index: number }) => {
    if (item?.category === 'Task') {
      console.log('Existing task object:', item);
    }
    // console.log('Item is : ===> ', item);
    return (
      <View style={styles.itemView}>
        {
          isLoading && (
            <ActivityIndicator
              color={Colors.primary}
              style={styles.activityIndicator}
              size={Platform.OS == 'android' ? wp(11) : 'large'}
            />
          )
        }
        <View style={styles.infoContainer}>
          <View style={styles.dataContainer}>
            {item?.category == 'Document' && (
              <Image
                source={icn.document}
                style={styles.itemImg}
                resizeMode="contain"
              />
            )}
            <View>
              <View style={styles.rowContainer}>
                <Text style={styles.name}>
                  {item?.category === 'Task' ||
                    item?.category === 'Sms' ||
                    item?.category === 'Email'
                    ? item?.taskTitle || item?.taskName
                    : item?.category === 'Document'
                      ? item?.FileName
                      : item?.category === 'Note'
                        ? `Note-${index + 1}`
                        : item?.taskTitle || item?.taskName}
                </Text>
                {item?.category == 'Email' && (
                  <Text style={styles.subName}> ({item?.emailNumber})</Text>
                )}
              </View>
              {item?.category === 'Document' && (
                <Text style={styles.subTitle}>{item?.subTitle}</Text>
              )}
            </View>
          </View>
          <View style={styles.rowContainer}>
            {item?.category === 'Document' && (
              <View style={styles.rowContainer}>
                <TouchableOpacity onPress={() => {
                  const documentUrl = item?.documentPath || item?.DocumentPath || item?.url || item?.Url;
                  console.log('Document URL for view:', documentUrl);
                  if (!documentUrl) {
                    Toast.show({
                      type: 'error',
                      text1: 'Error',
                      text2: 'Document URL not available',
                    });
                    return;
                  }
                  viewDocument(documentUrl);
                }}>
                  <Image
                    source={icn.blueFilledEye}
                    style={styles.blueEye}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                  const documentUrl = item?.documentPath || item?.DocumentPath || item?.url || item?.Url;
                  console.log('Document URL for download:', documentUrl);
                  if (!documentUrl) {
                    Toast.show({
                      type: 'error',
                      text1: 'Error',
                      text2: 'Document URL not available',
                    });
                    return;
                  }
                  startDownload(documentUrl);
                }}>
                  <Image
                    source={icn.crmProfileDocument}
                    style={styles.shortIcn}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            )}
            {/* {item?.category === 'Email' && (
              <View style={styles.rowContainer}>
                <Image
                  source={icn.emailDocument}
                  style={styles.blueEye}
                  resizeMode="contain"
                />
              </View>
            )} */}
            {item?.category !== 'Email' && (
              <TouchableOpacity
                onPress={() => {
                  if (item?.category === 'Document') {
                    (navigation as any).navigate('Documents', {
                      item: params?.item,
                      documentToEdit: item,
                      onDocumentEdited: async () => {
                        await getCrmProfileData('Documents');
                      },
                    });
                  } else if (item?.category == 'Note') {
                    (navigation as any).navigate('Notes', {
                      item: params?.item,
                      noteToEdit: item,
                      onNoteEdited: async () => {
                        await getCrmProfileData('Notes');
                      },
                    });
                  } else if (item?.category == 'Task') {
                    console.log("this is disablecrmchange ===> " , employee?.DisableCRMChangeTasks);
                    
                    if (employee?.DisableCRMChangeTasks) {
                      Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'This page requires high security.',
                      });
                    } else {
                      (navigation as any).navigate('Task', {
                        item: params?.item,
                        taskToEdit: item,
                        onTaskEdited: async () => {
                          await getCrmProfileData('Tasks');
                        },
                      });

                    }
                  } else if (item?.category == 'Appointment') {
                    (navigation as any).navigate('Appointment', {
                      item: params?.item,
                      appointmentToEdit: item,
                      onAppointmentEdited: async () => {
                        await getCrmProfileData('Appointments');
                      },
                    });
                  } else if (item?.category == 'Sms') {
                    (navigation as any).navigate('Sms', {
                      item: params?.item,
                      smsToEdit: item,
                      onSmsEdited: async () => {
                        await getCrmProfileData('Sms');
                      },
                    });
                  }
                }}>
                <Image
                  source={icn.singlePen}
                  style={styles.shortIcn}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
            {item?.category !== 'Email' && (
              <TouchableOpacity
                onPress={() => {
                  if ((item?.category == 'Task' && employee?.DisableCRMChangeTasks)) {
                    Toast.show({
                      type: 'error',
                      text1: 'Error',
                      text2: 'This page requires high security.',
                    });
                    return;
                  }
                  setSelectedItem(item);
                  setIsDeleteModalVisible(true);
                }}>
                <Image
                  source={icn.delete}
                  style={styles.shortIcn}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Text style={styles.descriptionPlaceholder}>
          Description:{' '}
          <Text style={styles.description}>
            {item?.description || item?.Description}
          </Text>
        </Text>
        {item?.category == 'Task' && (
          <View style={styles.pointMainContainer}>
            <View style={styles.pointContainer}>
              <Text style={styles.pointText}>{item?.taskType}</Text>
            </View>
          </View>
        )}
        {item?.category == 'Email' && (
          <View style={styles.pointMainContainer}>
            <View style={styles.pointContainer}>
              <Text style={styles.pointText}>{item?.taskCategoryName}</Text>
            </View>
          </View>
        )}
        <View style={styles.separator}></View>
        <View style={styles.userContainer}>
          <View style={styles.rowContainer}>
            <Image
              source={icn.sampleUser}
              style={styles.userImg}
              resizeMode="contain"
            />
            <View style={styles.userDetailContainer}>
              <Text style={styles.userName}>
                {item?.userName || item?.UserName}
              </Text>
              <View style={styles.rowContainer}>
                <Text style={styles.date}>{item?.date || item?.Date}</Text>
                <View style={styles.blueDot}></View>
                <Text style={styles.date}>{item?.time || item?.Time}</Text>
              </View>
            </View>
          </View>
          {item?.category === 'Sms' ? (
            <View style={styles.rowContainer}>
              <View style={styles.docInfoContainer}>
                <Text style={styles.userName}>Due Date:</Text>
                <Text style={styles.date}>{item?.dueDate.split('T')[0]}</Text>
              </View>
              <View style={styles.docInfoContainer}>
                <Text style={styles.userName}>Time:</Text>
                <Text style={styles.date}>{item?.time}</Text>
              </View>
            </View>
          ) : item?.category === 'Appointment' ? (
            <View style={styles.rowContainer}>
              <View style={styles.docInfoContainer}>
                <Text style={styles.userName}>Attende</Text>
                <Text style={styles.date}>{item?.attendee}</Text>
              </View>
              <View style={styles.docInfoContainer}>
                <Text style={styles.userName}>Due Date:</Text>
                <Text style={styles.date}>
                  {item?.dueDate?.split('T')?.[0]}
                </Text>
              </View>
              <View style={styles.docInfoContainer}>
                <Text style={styles.userName}>Time:</Text>
                <Text style={styles.date}>{item?.dueTime}</Text>
              </View>
            </View>
          ) : (
            item?.category === 'Document' && (
              <View style={styles.rowContainer}>
                <View style={styles.docInfoContainer}>
                  <Text style={styles.userName}>Size:</Text>
                  <Text style={styles.date}>{item?.size}</Text>
                </View>
                <View style={styles.docInfoContainer}>
                  <Text style={styles.userName}>Type:</Text>
                  <Text style={styles.date}>
                    {item?.FileName?.split('.')[1]}
                  </Text>
                </View>
              </View>
            )
          )}
        </View>
      </View>
    );
  };
  const renderTimeline = ({ item }: { item: any }) => {
    return (
      <View>
        <View style={styles.headingContainer}>
          <View
            style={
              item?.category === 'Task'
                ? styles.taskContainer
                : item?.category === 'Note'
                  ? styles.noteContainer
                  : item?.category === 'Document'
                    ? styles.documentContainer
                    : item?.category === 'Appointment'
                      ? styles.appointmentContainer
                      : item?.category === 'Email'
                        ? styles.emailContainer
                        : item?.category === 'Vehicle' && styles.vehicleContainer
            }>
            <Text
              style={
                item?.category === 'Task'
                  ? styles.task
                  : item?.category === 'Note'
                    ? styles.note
                    : item?.category === 'Document'
                      ? styles.document
                      : item?.category === 'Appointment'
                        ? styles.appointment
                        : item?.category === 'Email'
                          ? styles.email
                          : item?.category === 'Vehicle' && styles.vehicle
              }>
              {item?.category}
            </Text>
          </View>
        </View>
        {item?.category === 'Vehicle'
          ? renderVehicle({ item, index: 0 })
          : renderItem({ item, index: 0 })}
      </View>
    );
  };

  const renderVehicle = ({ item, index }: { item: any; index: number }) => {
    console.log('Search Vehicle Data is : ===> ', searchVehicleData);
    console.log('Vehicle Selected Tab is : ===> ', vehicleSelectedTab);

    return (
      <View style={styles.itemView}>
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{item?.subCategory}</Text>
          <TouchableOpacity
            onPress={async () => {
              // setIsSelectingVehicle(true);
              try {
                console.log('Touched Item: ', item);
                const payload = {
                  customerId: params?.item?.customerID || params?.item?.customerId,
                  vehicleId: item?.vehicleId,
                  modelYear: item?.year,
                  modelId: item?.modelId
                };
                console.log('Payload', payload);
                setIsLoading(true)
                const response = await selectVehicle(payload);
                console.log('This is response: ', response?.data);
                await getSetVehicleHandler()
                setIsLoading(false)
                Toast.show({
                  type: 'success',
                  text1: 'Vehicle Selected',
                  text2: 'The vehicle was selected successfully.',
                });
                // Optionally update state/UI here
              } catch (error: any) {
                console.log('Error selecting vehicle:', error);
                Toast.show({
                  type: 'error',
                  text1: 'Error',
                  text2: error?.message || 'Failed to select vehicle.',
                });
              } finally {
                // setIsSelectingVehicle(false);
              }
            }}
          >
            <Image
              source={icn.share}
              style={styles.bottomIcn}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.vehicleUpperRowContainer}>
          <View style={styles.center}>
            <Text style={styles.label}>Stock Number:</Text>
            <Text style={styles.value}>{item?.stockNumber}</Text>
          </View>
          <View style={styles.center}>
            <Text style={styles.label}>VIN:</Text>
            <Text style={styles.value}>{item?.vin}</Text>
          </View>
          <View style={styles.center}>
            <Text style={styles.label}>Year:</Text>
            <Text style={styles.value}>{item?.year}</Text>
          </View>
          <View style={styles.center}>
            <Text style={styles.label}>Make:</Text>
            <Text style={styles.value}>{item?.make}</Text>
          </View>
        </View>
        <View style={styles.vehicleUpperRowContainer}>
          <View style={styles.center}>
            <Text style={styles.label}>Model:</Text>
            <Text style={styles.value}>{item?.model}</Text>
          </View>
          <View style={styles.vehicleInfoContainer}>
            <Text style={styles.label}>Mileage:</Text>
            <Text style={styles.value}>{item?.year}</Text>
          </View>
          <View style={styles.vehicleInfoContainer}>
            <Text style={styles.label}>Color (Ext):</Text>
            <Text style={styles.value}>{item?.make}</Text>
          </View>
          <View style={styles.vehicleInfoContainer}>
            <Text style={styles.label}>Color (Int):</Text>
            <Text style={styles.value}>{item?.model}</Text>
          </View>
        </View>

        <View style={styles.separator}></View>
        {vehicleSelectedTab !== 'Set Vehicle' && (
          <View style={styles.userContainer}>
            <View style={styles.rowContainer}>
              <Image
                source={icn.sampleUser}
                style={styles.userImg}
                resizeMode="contain"
              />
              <View style={styles.userDetailContainer}>
                <Text style={styles.userName}>{item?.userName}</Text>
                <View style={styles.rowContainer}>
                  <Text style={styles.date}>{item?.date}</Text>
                  <View style={styles.blueDot}></View>
                  <Text style={styles.date}>{item?.time}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };
  const getYearDifference = (startDateString: string) => {
    const startDate = new Date(startDateString);
    const currentDate = new Date();
    let differenceInYears = currentDate.getFullYear() - startDate.getFullYear();
    const isBeforeAnniversary =
      currentDate.getMonth() < startDate.getMonth() ||
      (currentDate.getMonth() === startDate.getMonth() &&
        currentDate.getDate() < startDate.getDate());
    if (isBeforeAnniversary) {
      differenceInYears -= 1;
    }

    return differenceInYears;
  };

  const renderSetVehicle = ({ item, index }: { item: any; index: number }) => {
    console.log('Item: ', item);
    console.log('This is url: ', item?.vehicleInfo?.imageLink);

    return (
      <View style={[styles.itemContainer]}>

        <View style={styles.rowSpaceContainer}>
          <View style={styles.rowContainer}>
            <TouchableOpacity
              onPress={() => {
                // setPressedItem(item);
                // setIsModalVisible(true);
              }}>
              <Image
                source={{ uri: item?.vehicleInfo?.imageLink }}
                style={styles.carImg}
                resizeMode="stretch"
              />
            </TouchableOpacity>
            <View style={styles.carInfoContainer}>
              <Text style={styles.carName}>
                {item?.vehicleInfo?.ModelYear} {item?.vehicleInfo?.Make}{' '}
                {item?.vehicleInfo?.Model}
              </Text>
              <Text style={styles.description}>
                {item?.vehicleInfo?.TechnologyPackage}
              </Text>
              {/* <TouchableOpacity
                  onPress={() => {
                    setPressedItem(item);
                    setIsModalVisible(true);
                  }}
                  style={styles.detailContainer}>
                  <Text style={styles.detailText}>View Detail</Text>
                  <Image
                    source={icn.next}
                    style={styles.listForwardIcn}
                    resizeMode="contain"
                  />
                </TouchableOpacity> */}
            </View>
          </View>
          {/* {item?.canChangePrice && <View style={styles.priceContainer}>
            <Text style={styles.priceTxt}>${item?.Total?.toFixed(2)}</Text>
          </View>} */}
        </View>
        <View>
          <View style={[styles.carPropContainer, { justifyContent: 'flex-start', gap: wp(1) }]}>
            <Text style={styles.optionText}>
              Stk#:
              <Text style={styles.valueText}>
                {' '}
                {item?.vehicleInfo?.StockNumber}
              </Text>
            </Text>
            {
              item?.canChangePrice && <Text style={styles.optionText}>
                Price:
                <Text style={styles.valueText}>
                  {' '}
                  ${item?.Total?.toFixed(2)}
                </Text>
              </Text>
            }

            <Text style={styles.optionText}>
              VIN:
              <Text style={styles.valueText}>
                {' '}
                {item?.vehicleInfo?.VIN}
              </Text>
            </Text>
            <Text style={styles.optionText}>
              Color:
              <Text style={styles.valueText}>
                {' '}
                {item?.vehicleInfo?.Color}
              </Text>
            </Text>
            <Text style={styles.optionText}>
              Drive Type:
              <Text style={styles.valueText}>
                {' '}
                {item?.vehicleInfo?.DriveType}
              </Text>
            </Text>
            <Text style={styles.optionText}>
              Mileage:
              <Text style={styles.valueText}>
                {' '}
                {item?.vehicleInfo?.Mileage}
              </Text>
            </Text>
            {/* <Text style={styles.optionText}>
                      Cost:
                      <Text style={styles.valueText}>
                        {' '}
                        €{item?.Total?.toFixed(2)}
                      </Text>
                    </Text> */}
            <Text style={styles.optionText}>
              Age:
              <Text style={styles.valueText}>
                {' '}
                {getYearDifference(item?.costInfo?.PurchaseDate)}
              </Text>
            </Text>
            <Text style={styles.optionText}>
              Live Status:
              <Text style={styles.valueText}>
                {' '}
                {item?.vehicleInfo?.isPurchased ? 'Publish' : 'Inactive'}
              </Text>
            </Text>
          </View>


        </View>
        {/* <View>
            <View style={styles.rowIcnContainer}>
              <TouchableOpacity
                onPress={() => {
                  // handleToggleVehicleIsPublished(item?.vehicleInfo?.VehicleID);
                }}>
                <Image
                  source={
                    item?.vehicleInfo?.isPublished
                      ? icn.focussedUpperArrow
                      : icn.upperArrow
                  }
                  style={styles.bottomIcn}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  handleToggleVehicleFeature(item?.vehicleInfo?.VehicleID);
                }}>
                <Image
                  source={
                    item?.vehicleInfo?.featured ? icn.focussedTick : icn.tick
                  }
                  style={styles.bottomIcn}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  handleToggleVehicleSpotLight(item?.vehicleInfo?.VehicleID);
                }}>
                <Image
                  source={
                    item?.vehicleInfo?.spotLight ? icn.focussedStar : icn.star
                  }
                  style={styles.bottomIcn}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity>
                <Image
                  source={icn.share}
                  style={styles.bottomIcn}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <View style={styles.verticalCenter}>
                <Image
                  source={icn.carEye}
                  style={styles.bottomIcn}
                  resizeMode="contain"
                />
                <Text style={styles.countText}>
                  {item?.vehicleInfo?.detailViewCount}
                </Text>
              </View>
              <View style={styles.verticalCenter}>
                <Image
                  source={icn.carCheck}
                  style={styles.bottomIcn}
                  resizeMode="contain"
                />
                <Text style={styles.countText}>
                  {item?.vehicleInfo?.creditApplicationCount}
                </Text>
              </View>
              <View style={styles.verticalCenter}>
                <Image
                  source={icn.man}
                  style={styles.bottomIcn}
                  resizeMode="contain"
                />
                <Text style={styles.countText}>
                  {item?.vehicleInfo?.vehicleLeadCount}
                </Text>
              </View>
              <View>
                <Menu
                  visible={
                    isMenuVisible && selectedId == item?.vehicleInfo?.VehicleID
                  }
                  onDismiss={closeMenu}
                  contentStyle={styles.optionContainer}
                  anchor={
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedId(item?.vehicleInfo?.VehicleID);
                        openMenu();
                        setPressedItem(item);
                      }}>
                      <Image
                        source={icn.optionDots}
                        style={styles.optionIcn}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  }>
                  <View>
                    <TouchableOpacity
                      onPress={() => {
                        storage.set("vehicleId", pressedItem?.vehicleInfo?.VehicleID);
                        navigation.navigate('VehicleDetails', {
                          item: pressedItem,
                          DealershipID: item?.vehicleInfo?.DealershipID,
                        });
                        setIsMenuVisible(false);
                      }}
                      style={styles.optionSpaceContainer}>
                      <Text style={styles.optionName}>Vehicle</Text>
                      <Image
                        source={icn.forward}
                        style={styles.forwardIcn}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        navigation.navigate('CarExpenses', {
                          item: pressedItem,
                          DealershipID: item?.vehicleInfo?.DealershipID,
                        });
                        setIsMenuVisible(false);
                      }}
                      style={styles.optionSpaceContainer}>
                      <Text style={styles.optionName}>Expense</Text>
                      <Image
                        source={icn.forward}
                        style={styles.forwardIcn}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setIsMenuVisible(false);
                        Linking.openURL(
                          `${CONFIG.API_BASE_URL}download-vehicle-images/${item?.vehicleInfo?.VehicleID}`,
                        );
                      }}
                      style={styles.optionSpaceContainer}>
                      <Text style={styles.optionName}>Download Images</Text>
                      <Image
                        source={icn.forward}
                        style={styles.forwardIcn}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setIsMenuVisible(false);
                        Linking.openURL(
                          `${CONFIG.API_BASE_URL}vehicle-recon/${item?.vehicleInfo?.VehicleID}`,
                        );
                        // setIsPrintModalVisible(true);
                      }}
                      style={styles.optionSpaceContainer}>
                      <Text style={styles.optionName}>Print</Text>
                      <Image
                        source={icn.forward}
                        style={styles.forwardIcn}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleDeletePress}
                      style={styles.optionSpaceContainer}>
                      <Text style={styles.optionName}>Remove</Text>
                      <Image
                        source={icn.forward}
                        style={styles.forwardIcn}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleReturnPress}
                      style={styles.optionSpaceContainer}>
                      <Text style={styles.optionName}>Return/Arbitrate</Text>
                      <Image
                        source={icn.forward}
                        style={styles.forwardIcn}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                </Menu>
              </View>
            </View>
          </View> */}
      </View>
    );
  };


  const emptyComponent = (): any => {
    return <Text style={styles.noDataAvailable}>No data available</Text>;
  };



  useEffect(() => {
    console.log('Search Vehicle is : ===> ', searchVehicleData);
  }, [searchVehicleData]);

  useFocusEffect(
    React.useCallback(() => {
      getCrmProfileData();
    }, [selectedTab])
  );

  useEffect(() => {
    if (data?.leadSources) {
      console.log('Available leadSources:', data.leadSources);
      const currentLeadSource = data?.leadSources?.find(
        (source: any) => source.leadSourceId === profileData?.LeadSourceID
      );
      console.log('Current leadSource match:', currentLeadSource);
    }
  }, [data?.leadSources, profileData?.LeadSourceID]);

  return (
    <View style={styles.mainView}>
      {/* <Text style={{ color: 'red', fontSize: 20 }}>DEBUG: MainView is rendering</Text> */}
      <View style={styles.header}>
        <View style={styles.subContainer}>
          <Header
            title="Profile"
            leftIcn={icn.back}
            leftIcnStyle={styles.backIcn}
            blueBackground
            onRightFirstIconPress={() =>
              (navigation as any).navigate('Chat', { fromCrm: true })
            }
            onRightSecondIconPress={() => {
              setShowOptions(!showOptions);
            }}
            rightFirstIcn={icn.message}
            rightSecondIcn={icn.diagonalDots}
            onLeftIconPress={() => navigation.goBack()}
          />
          {showOptions && (
            <View style={styles.optionMainContainer}>
              <View style={styles.plusOptionsContainer}>
                <TouchableOpacity
                  onPress={() => {
                    setShowOptions(false);
                    (navigation as any).navigate('TradeIn', { ...params });
                  }}
                  style={styles.optionBackground}>
                  <Text style={styles.optionMenuName}>Trade In</Text>
                  <Image
                    source={icn.forward}
                    style={styles.forwardIcn}
                    tintColor={Colors.greyIcn}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {

                    if (employee?.DisableCreditApp) {
                      Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'This page requires high security.',
                      });
                    } else {
                      setShowOptions(false);
                      (navigation as any).navigate('CreditApplication', { ...params });

                    }

                  }}
                  style={styles.optionBackground}>
                  <Text style={styles.optionMenuName}>Credit Application</Text>
                  <Image
                    source={icn.forward}
                    style={styles.forwardIcn}
                    tintColor={Colors.greyIcn}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
          <View style={styles.subHeaderContainer}>
            <View style={styles.row}>
              <Image
                source={icn.dummyProfile}
                style={styles.profileImg}
                resizeMode="contain"
              />
              <View style={styles.profileContainer}>
                <Text style={styles.whiteProfileName}>
                  {params?.item?.customerName}{' '}
                </Text>
                <Text style={styles.whiteDescription}>
                  {params?.item?.emailAddress} | {params?.item?.phoneNumber}
                </Text>
                <Dropdown
                  style={styles.dropdown}
                  containerStyle={styles.dropdownContainer}
                  placeholderStyle={styles.placeholderStyle}
                  itemTextStyle={styles.itemTextStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  activeColor={Colors.dullWhite}
                  showsVerticalScrollIndicator={false}
                  data={data?.leadStatus || []}
                  maxHeight={hp(20)}
                  labelField="description"
                  valueField="statusId"
                  placeholder={'Select'}
                  value={profileData?.statusId}
                  onChange={item => {
                    // console.log('Item is : ===> ', item);
                    updateProfileData('statusId', item.statusId);
                  }}
                  renderRightIcon={() => (
                    <Image
                      source={icn.downWhiteArrow}
                      style={styles.arrow}
                      resizeMode="contain"
                    />
                  )}
                />
                <View style={styles.profileIconsContainer}>
                  <TouchableOpacity
                    onPress={() => (navigation as any).navigate('Sms', {
                      item: params?.item,
                    })}
                    style={styles.icnContainer}>
                    <Image
                      source={icn.message}
                      style={styles.profileInfoIcn}
                      resizeMode="contain"
                      tintColor={Colors.white}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => (navigation as any).navigate('AddEmail', { item: params?.item })}
                    style={styles.icnContainer}>
                    <Image
                      source={icn.crmProfileMessage}
                      style={styles.profileInfoIcn}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => (navigation as any).navigate('Task', {
                      item: params?.item,
                      title: 'Call',
                    })}
                    style={styles.icnContainer}>
                    <Image
                      source={icn.phone}
                      style={styles.phoneIcn}
                      resizeMode="contain"
                      tintColor={Colors.white}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => (navigation as any).navigate('Task', {
                      item: params?.item,
                    })}
                    style={styles.icnContainer}>
                    <Image
                      source={icn.interShare}
                      style={styles.profileInfoIcn}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => (navigation as any).navigate('Appointment', {
                      item: params?.item,
                    })}
                    style={styles.icnContainer}>
                    <Image
                      source={icn.card}
                      style={styles.profileInfoIcn}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.subContainer}>
        <FlatList
          style={{ marginVertical: hp(2) }}
          data={tabsData}
          renderItem={renderTabs}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
      <View style={{ flex: 1 }}>
        {/* Lead Details */}
        {selectedTab === 'Lead Details' ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.content]}>
            <Text style={styles.blackPlaceholderText}>Assigned to</Text>
            {isDropdownLoading ? (
              <View style={styles.headingContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={{ marginLeft: 10 }}>Loading...</Text>
              </View>
            ) : (
              <DropDown
                data={data?.assignedTo}
                placeholder={'Select'}
                labelField="description"
                valueField="assignedToId"
                value={profileData?.AssignedToID}
                setValue={(value: any) => updateProfileData('AssignedToID', value)}
                rightIcon
              />
            )}
            {isDropdownLoading ? (
              <>
                <Text style={styles.blackPlaceholderText}>Source</Text>
                <View style={styles.headingContainer}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={{ marginLeft: 10 }}>Loading sources...</Text>
                </View>
              </>
            ) : data?.leadSources ? (
              <>
                <Text style={styles.blackPlaceholderText}>Source</Text>
                <DropDown
                  data={data?.leadSources}
                  placeholder={'Select'}
                  labelField="description"
                  valueField="leadSourceId"
                  value={profileData?.LeadSourceID}
                  setValue={(value: any) => {
                    if (value !== undefined) {
                      updateProfileData('LeadSourceID', value);
                    }
                  }}
                  rightIcon
                />
              </>
            ) : (
              <View style={styles.headingContainer}>
                <Text>No sources available</Text>
              </View>
            )}
            <Text style={styles.blackPlaceholderText}>Temperature</Text>
            <DropDown
              data={data?.temperatures}
              placeholder={'Select'}
              labelField="description"
              valueField="temperatureId"
              value={profileData?.TemperatureID}
              setValue={(value: any) => updateProfileData('TemperatureID', value)}
              rightIcon
            />
            <Text style={styles.blackPlaceholderText}>Sold At</Text>
            <DropDown
              data={data?.soldAt}
              placeholder={'Select'}
              labelField="description"
              valueField="soldAtId"
              value={profileData?.mSoldAtID}
              setValue={(value: any) => updateProfileData('mSoldAtID', value)}
              rightIcon
            />
            <Text style={styles.blackPlaceholderText}>Last Viewed</Text>
            <DropDown
              data={data?.assignedTo}
              placeholder={'Select'}
              labelField="description"
              valueField="assignedToId"
              value={profileData?.LastLookedByID}
              setValue={(value: any) => updateProfileData('LastLookedByID', value)}
              rightIcon
            />
            <Text style={styles.blackPlaceholderText}>URL</Text>
            <Controller
              control={control}
              defaultValue={params?.item?.WebURL?.toString()}
              render={({ field: { onChange, value } }) => (
                <InputBox
                  placeholder="Url"
                  numberOfCharacter={80}
                  value={profileData?.WebURL?.toString() || ''}
                  onChangeText={(text: any) => {
                    onChange(text);
                    updateProfileData('WebURL', text);
                  }}
                  borderLess
                />
              )}
              name="url"
            />
            <PrimaryButton
              style={styles.button}
              title="Save"
              onPress={handleSubmit(onSaveProfilePress)}
            />
          </ScrollView>
        ) : (
          selectedTab === 'Vehicle' ? (
            <View style={styles.vehicleTabContainer}>
              <View style={styles.vehicleHeadingContainer}>
                <Text style={[styles.heading, { marginTop: hp(2) }]}>Lead Vehicle</Text>
                <TouchableOpacity
                  onPress={() =>
                    (navigation as any).navigate('CrmProfileVehicleBoilerPlate',
                      {
                        from: 'Set Vehicle',
                        setResponce: setSearchVehicleData
                      })
                  }
                  style={styles.setVehicleContainer}
                >
                  <Text style={styles.setText}>Set Vehicle</Text>
                </TouchableOpacity>
              </View>
              {isLoading ? (
                <ActivityIndicator
                  color={Colors.primary}
                  style={styles.activityIndicator}
                  size={Platform.OS == 'android' ? wp(11) : 'large'}
                />
              ) : (
                <>
                  <FlatList
                    data={searchVehicleData}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.flatlistContent}
                    renderItem={({ item, index }: { item: any, index: number }) => {
                      return item?.setVehicle ? renderSetVehicle({ item, index } as any) : renderVehicle({ item, index } as any);
                    }}
                    keyExtractor={(item: any, index: any) => index.toString()}
                    ListEmptyComponent={emptyComponent}
                  />
                  <TouchableOpacity
                    style={styles.fab}
                    onPress={() => {
                      const customerID = params?.item?.customerID || params?.item?.customerId;
                      const item = { ...params?.item, customerID };
                      // console.log('Item is : ===> ', item);
                      (navigation as any).navigate('VehicleRelated', {
                        from: 'Vehicle Tab',
                        item: item,
                      });
                    }}
                  >
                    <Image source={icn.heart} style={[styles.fabIconss, { objectFit: 'contain' }]} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          ) : (
            <FlatList
              data={dataStorage[selectedTab]}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.content]}
              renderItem={selectedTab === 'Timeline' ? renderTimeline : renderItem}
              keyExtractor={(item, index) => index.toString()}
              ListEmptyComponent={emptyComponent}
            />
          )
        )}
        {selectedTab === 'Tasks' && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => (navigation as any).navigate('Task', {
              item: params?.item,
              onTaskEdited: async () => {
                await getCrmProfileData('Tasks');
              },
            })}
            activeOpacity={0.7}
          >
            <Image source={icn.plus} style={styles.fabIcon} />
          </TouchableOpacity>
        )}
        {selectedTab === 'Notes' && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => (navigation as any).navigate('Notes', {
              item: params?.item,
              onNoteEdited: async () => {
                await getCrmProfileData('Notes');
              },
            })}
            activeOpacity={0.7}
          >
            <Image source={icn.plus} style={styles.fabIcon} />
          </TouchableOpacity>
        )}
        {selectedTab === 'Sms' && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => (navigation as any).navigate('Sms', {
              item: params?.item,
              onSmsEdited: async () => {
                await getCrmProfileData('Sms');
              },
            })}
            activeOpacity={0.7}
          >
            <Image source={icn.plus} style={styles.fabIcon} />
          </TouchableOpacity>
        )}
        {selectedTab === 'Appointments' && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => (navigation as any).navigate('Appointment', {
              item: params?.item,
              onAppointmentEdited: async () => {
                await getCrmProfileData('Appointments');
              },
            })}
            activeOpacity={0.7}
          >
            <Image source={icn.plus} style={styles.fabIcon} />
          </TouchableOpacity>
        )}
        {selectedTab === 'Email' && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => (navigation as any).navigate('AddEmail', { item: params?.item })}
            activeOpacity={0.7}
          >
            <Image source={icn.plus} style={styles.fabIcon} />
          </TouchableOpacity>
        )}
        {selectedTab === 'Documents' && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => (navigation as any).navigate('Documents', {
              item: params?.item,
              onDocumentEdited: async () => {
                await getCrmProfileData('Documents');
              },
            })}
            activeOpacity={0.7}
          >
            <Image source={icn.plus} style={styles.fabIcon} />
          </TouchableOpacity>
        )}
        {selectedTab === 'Vehicle Of Interest' && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => (navigation as any).navigate('AddCrmProfileTabBoilerPlate', {
              from: 'Vehicle Of Interest',
              customerID: params?.item?.customerID,
            })}
            activeOpacity={0.7}
          >
            <Image source={icn.plus} style={styles.fabIcon} />
          </TouchableOpacity>
        )}
      </View>
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
      <LoadingModal visible={isModalLoading} message="Saving..." />
    </View>
  );
};

export default CrmProfile;


