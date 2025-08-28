import {useNavigation, useFocusEffect} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import RNFS from 'react-native-fs';
import {
  ActivityIndicator,
  FlatList,
  Image,
  PermissionsAndroid,
  Platform,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import Modal from 'react-native-modal';
import Toast from 'react-native-toast-message';
import {useDispatch, useSelector} from 'react-redux';
import {icn} from '../../Assets/icn';
import Header from '../../Components/Header';
import InputBox from '../../Components/InputBox';
import LoadingModal from '../../Components/LoadingModal';
import PrimaryButton from '../../Components/PrimaryButton';
import {
  deleteVehicleDocument,
  uploadVehicleDocuments,
  vehicleDocuments,
  updateVehicleDocument,
} from '../../Services/apis/APIs';
import {Colors} from '../../Theme/Colors';
import {hp, wp} from '../../Theme/Responsiveness';
import {styles} from './style';
import RNFetchBlob from 'react-native-blob-util';
import type {DocumentPickerResponse} from 'react-native-document-picker';
import type {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AddCrmProfileTabBoilerPlateRouteParams} from '../AddCrmProfileTabBoilerPlate';
import FileViewer from 'react-native-file-viewer';

type RootStackParamList = {
  AddCrmProfileTabBoilerPlate: AddCrmProfileTabBoilerPlateRouteParams;
};
type DocumentsNavigationProp = StackNavigationProp<RootStackParamList, 'AddCrmProfileTabBoilerPlate'>;

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const Documents = ({route}: {route: RouteProp<any, any>}) => {
  const params = route?.params;
  const {control, handleSubmit, trigger, formState, setValue} = useForm();
  const dispatch = useDispatch();
  const navigation = useNavigation<DocumentsNavigationProp>();
  const user = useSelector((state: any) => state?.userReducer?.user);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [documentsData, setDocumentsData] = useState<any[]>([]);
  const [document, setDocument] = useState<DocumentPickerResponse | null>(null);
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
  const [showList, setShowList] = useState<boolean>(false);
  const { documentToEdit, onDocumentEdited } = route?.params || {};
  const isEditMode = !!documentToEdit;

  useFocusEffect(
    React.useCallback(() => {
      if (showList) {
        getDocuments();
      }
    }, [showList, params?.item?.vehicleID]),
  );

  useEffect(() => {
    if (isEditMode && documentToEdit) {
      setValue('description', documentToEdit.Description || '');
      setDocument(null);
    } else {
      setValue('description', '');
      setDocument(null);
    }
  }, [isEditMode, documentToEdit]);

  const pickDocument = async () => {
    try {
      const selectedDocument = await DocumentPicker.pickSingle({
        type: [DocumentPicker?.types?.allFiles],
      });
      setDocument(selectedDocument);
    } catch (error: any) {
      if (!DocumentPicker.isCancel(error)) {
        console.error('Error picking document:', error);
      }
    }
  };

  const getDocuments = async () => {
    if (!params?.item?.vehicleID) {
      setDocumentsData([]);
      return;
    }
    setIsLoading(true);
    try {
      const payload = { objectId: params?.item?.vehicleID };
      const response = await vehicleDocuments(payload);
      console.log('Fetched docs:', response.data);
      if (Array.isArray(response?.data)) {
        setDocumentsData(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching documents:', error?.response?.data || error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch documents',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDocument = async (data: any) => {
    if (!params?.item?.customerID) {
      Toast.show({
        type: 'error',
        text1: 'Action Not Allowed',
        text2: 'A document can only be attached to a customer.',
      });
      return;
    }
    try {
      setIsModalLoading(true);
      const formData = new FormData();
      formData.append('ObjectID', String(params?.item?.customerID));
      // formData.append('ObjectTypeID', 'Customer');
      formData.append('ObjectTypeID', '5');
      formData.append('UserID', String(user?.id));
      formData.append('Description', data.description || '');

      const getCorrectFileType = (doc: DocumentPickerResponse) => {
        let fileType = doc.type;
        const fileExtension = doc.name?.split('.').pop()?.toLowerCase();
        
        if ((fileType === 'application/octet-stream' || !fileType) && fileExtension) {
            const mimeTypes: { [key: string]: string } = {
                'pdf': 'application/pdf',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png',
            };
            fileType = mimeTypes[fileExtension] || fileType;
        }
        return fileType;
      };

      if (isEditMode) {
        formData.append('DocumentID', documentToEdit.DocumentID);
        
        if (document) {
          formData.append('files', {
            uri: Platform.OS === 'android' ? document.uri : document.uri.replace('file://', ''),
            name: document.name,
            type: getCorrectFileType(document),
          } as any);
        }
        console.log('Form data in update document ================================> ', formData); 
        const response = await updateVehicleDocument(formData);
        console.log('Edit response:', response);
      } else {
        if (!document) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Please select a document to upload.',
          });
          return;
        }
        
        formData.append('files', {
          uri: Platform.OS === 'android' ? document.uri : document.uri.replace('file://', ''),
          name: document.name,
          type: getCorrectFileType(document),
        } as any);
        console.log('Form data in upload document ================================> ', formData);
        const response = await uploadVehicleDocuments(formData);
        console.log('Upload response:', response?.data);
      }

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: isEditMode ? 'Document updated successfully' : 'Document uploaded successfully',
      });

      await getDocuments();
      
      if (onDocumentEdited) {
        await onDocumentEdited();
      }
      navigation.goBack();

    } catch (error: any) {
      console.error('Document save error:', error?.response?.data || error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setIsModalLoading(false);
    }
  };
  const deleteDocument = async (DocumentID: number) => {
    try {
      setIsModalLoading(true);
     const response = await deleteVehicleDocument(DocumentID);
     console.log('Response in delete document', response?.data);
      await getDocuments();
      if (params?.refreshDocuments) {
        params.refreshDocuments();
      }
    } catch (error: any) {
      console.log('Error in delete document', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: (error as ApiError)?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setIsModalLoading(false);
    }
  };
  const requestStoragePermission = async () => {
    try {
      if (Platform.OS === 'android') {
        // For Android 13+ (API level 33+), we don't need storage permission for app-specific files
        if (Platform.Version >= 33) {
          return true;
        }
        
        // For older Android versions, request storage permission
        const permission = PermissionsAndroid?.PERMISSIONS?.WRITE_EXTERNAL_STORAGE;
        const hasPermission = await PermissionsAndroid.check(permission);
        
        if (hasPermission) {
          return true;
        }
        
        const status = await PermissionsAndroid.request(permission, {
          title: 'Storage Permission',
          message: 'This app needs access to storage to download files.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        });
        
        return status === 'granted';
      }
      
      // For iOS, no special permission needed for app documents directory
      return true;
    } catch (err: any) {
      console.warn('Permission request error:', err);
      return false;
    }
  };
  const handleEditDocument = (item: any) => {
    setDocument(item);
    setShowList(true);
  };
  
  const handleViewDocument = async (fileUrl: string, fileName: string) => {
    console.log('Attempting to view file:=============================================================>', { fileUrl, fileName });
    
    if (!fileUrl) {
      Alert.alert('Error', 'File URL is not available');
      return;
    }
    
    try {
      // Show loading indicator
      setIsModalLoading(true);
      
      // Try to open the file directly in browser
      await Linking.openURL(fileUrl);
      
    } catch (error: any) {
      console.error('Error viewing file:', error);
      Alert.alert(
        'Error',
        'Unable to open the file. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleDownloadDocument = async (fileUrl: string, fileName: string) => {
    console.log('Attempting to download file:', { fileUrl, fileName });
    
    if (!fileUrl) {
      Alert.alert('Error', 'File URL is not available');
      return;
    }
    
    try {
      // Check for storage permission on Android
      if (Platform.OS === 'android') {
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
          Alert.alert(
            'Permission Required',
            'Storage permission is required to download files. Please grant permission in settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Settings', onPress: () => Linking.openSettings() }
            ]
          );
          return;
        }
      }

      // Show loading indicator
      setIsModalLoading(true);

      // Download the file to a local path
      const localFile = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      const options = {
        fromUrl: fileUrl,
        toFile: localFile,
        background: true,
        discretionary: true,
      };

      const downloadResult = await RNFS.downloadFile(options).promise;
      
      if (downloadResult.statusCode === 200) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: `File "${fileName}" downloaded successfully`,
        });
      } else {
        throw new Error(`Download failed with status: ${downloadResult.statusCode}`);
      }
      
    } catch (error: any) {
      console.error('Download error:', error);
      Alert.alert(
        'Error',
        'Unable to download the file. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsModalLoading(false);
    }
  };

  const renderItem = ({item, index}: {item: any, index: number}) => {
    return (
      <View style={styles.itemView}>
        <View style={styles.infoContainer}>
          <View style={styles.dataContainer}>
            <Image
              source={icn.document}
              style={styles.itemImg}
              resizeMode="contain"
            />
            <View style={styles.detailContainer}>
              <Text style={styles.name}>{item?.FileName}</Text>
              <Text style={styles.description}>{item?.Description}</Text>
            </View>
          </View>
          <View style={styles.rowContainer}>
            <TouchableOpacity onPress={() => {
              console.log('Item in view document ================================> ', item);
                handleViewDocument(item?.documentPath, item?.FileName)
              }}>
              <Image
                source={icn.eye}
                style={styles.shortIcn}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDownloadDocument(item?.documentPath, item?.FileName)}>
              <Image
                source={icn.download}
                style={styles.shortIcn}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteDocument(item?.DocumentID)}>
              <Image
                source={icn.delete}
                style={styles.shortIcn}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.separator}></View>
        <View style={styles.userContainer}>
          <View style={styles.rowContainer}>
            <Image
              source={item?.userImg}
              style={styles.userImg}
              resizeMode="contain"
            />
            <View style={styles.userDetailContainer}>
              <Text style={styles.userName}>{item?.UserName}</Text>
              <View style={styles.rowContainer}>
                <Text style={styles.date}>{item?.Date}</Text>
                <View style={styles.blueDot}></View>
                <Text style={styles.date}>{item?.Time}</Text>
              </View>
            </View>
          </View>
          <View style={styles.rowContainer}>
            <View style={styles.docInfoContainer}>
              <Text style={styles.userName}>Size:</Text>
              <Text style={styles.date}>{item?.size}</Text>
            </View>
            <View style={styles.docInfoContainer}>
              <Text style={styles.userName}>Type:</Text>
              <Text style={styles.date}>{item?.FileName?.split('.').pop()}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };
  return (
    <ScrollView>
    <View style={styles.mainView}>
      {!showList ? (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <Header
            title="Document"
            leftIcn={icn.back}
            onLeftIconPress={() => navigation.goBack()}
          />
          <Text style={styles.placeholderText}>Description</Text>
          <Controller
            control={control}
            rules={{ required: 'Description is required' }}
            render={({ field: { onChange, value } }) => (
              <InputBox
                placeholder="Type here.."
                value={value}
                onChangeText={onChange}
                multiline
                numberOfCharacter={350}
                style={{ height: 100, backgroundColor: '#f5f5f5', marginTop:10 }}
              />
            )}
            name="description"
          />
          <Text style={styles.placeholderText}>Upload Document</Text>
          <TouchableOpacity
            style={styles.dottedView}
            onPress={pickDocument}
          >
            <Image source={icn.documentUpload} style={styles.imgPicker}  />
            <Text style={styles.dropSubText}>Maximum file size 50mb</Text>
          </TouchableOpacity>

          {/* Show the file name */}
          {isEditMode && !document && documentToEdit?.FileName && (
            <Text style={styles.fileNameText}>
              Current file: {documentToEdit.FileName}
            </Text>
          )}
          {document?.name && (
            <Text style={styles.fileNameText}>
              Selected file: {document.name}
            </Text>
          )}

          <PrimaryButton
            title="Send"
            style={styles.uploadButton}
            onPress={handleSubmit(handleSaveDocument)}
          />
          <LoadingModal visible={isModalLoading} message="Uploading..." />
        </View>
      ) : (
        <View style={styles.subContainer}>
          <Header
            title="Document"
            leftIcn={icn.back}
            leftIcnStyle={styles.backIcn}
            onLeftIconPress={() => navigation.goBack()}
          />
          <View style={styles.centerSpaceContainer}>
            <Text style={styles.recent}>Vehicle Documents</Text>
          </View>
          {isLoading ? (
            <ActivityIndicator
              color={Colors.primary}
              style={styles.activityIndicator}
              size={Platform.OS == 'android' ? wp(11) : 'large'}
            />
          ) : (
            <FlatList
              data={documentsData}
              ListEmptyComponent={() => <Text style={styles.noDataAvailable}>No data available</Text>}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              renderItem={renderItem}
              style={{ marginTop: hp(3) }}
              keyExtractor={(item: any, index: any) => index.toString()}
              contentContainerStyle={{ paddingBottom: hp(13) }}
              refreshControl={
                <RefreshControl
                  tintColor={Colors.primary}
                  colors={[Colors.primary]}
                  refreshing={isLoading}
                  onRefresh={getDocuments}
                />
              }
            />
          )}
          <LoadingModal visible={isModalLoading} message="Loading..." />
        </View>
      )}
    </View>
    </ScrollView>
  );
};

export default Documents;
