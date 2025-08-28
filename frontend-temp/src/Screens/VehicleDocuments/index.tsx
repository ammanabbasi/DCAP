import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, Platform, Modal, TextInput, Linking, PermissionsAndroid } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import DocumentPicker from 'react-native-document-picker';
import Toast from 'react-native-toast-message';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { icn } from '../../Assets/icn';
import Header from '../../Components/Header';
import PrimaryButton from '../../Components/PrimaryButton';
import LoadingModal from '../../Components/LoadingModal';
import { vehicleDocuments, uploadVehicleDocuments, deleteVehicleDocument, updateVehicleDocument } from '../../Services/apis/APIs';
import { Colors } from '../../Theme/Colors';
import { hp, wp } from '../../Theme/Responsiveness';
import { styles } from './style';
import RNFetchBlob from 'react-native-blob-util';
import RNFS from 'react-native-fs';


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

const VehicleDocuments = ({ route }: { route: RouteProp<any, any> }) => {
  const { vehicleId } = route.params || {};
  console.log('Received vehicleId in VehicleDocuments:', vehicleId);
  
  const navigation = useNavigation();
  const user = useSelector((state: any) => state?.userReducer?.user);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const { control, handleSubmit, reset, setValue } = useForm();
  const [editingDocument, setEditingDocument] = useState<any>(null);

  useEffect(() => {
    if (vehicleId) {
      fetchDocuments();
    }
  }, [vehicleId]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const payload = { objectId: vehicleId };
      const response = await vehicleDocuments(payload);
      console.log('Documents API response:', response?.data);
      setDocuments(Array.isArray(response?.data) ? response.data : []);
    } catch (error: any) {
      console.error('Fetch documents error:', error);
      Toast.show({ 
        type: 'error', 
        text1: 'Error', 
        text2: 'Failed to fetch documents' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pickDocument = async () => {
    try {
      const doc = await DocumentPicker.pickSingle({ 
        type: [DocumentPicker?.types?.allFiles] 
      });
      setSelectedFile(doc);
    } catch (error: any) {
      if (!DocumentPicker.isCancel(error)) {
        Toast.show({ 
          type: 'error', 
          text1: 'Error', 
          text2: 'Failed to pick document' 
        });
      }
    }
  };

  const onEdit = (item: any) => {
    setSelectedFile(null);
    setIsModalVisible(true);
    setEditingDocument(item);
    setValue('description', item.Description || '');
  };


  const onUpload = async (data: any) => {
    if (!editingDocument && !selectedFile) {
      Toast.show({ 
        type: 'error', 
        text1: 'Error', 
        text2: 'Please select a file.' 
      });
      return;
    }
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      
      if (editingDocument) {
        formData.append('DocumentID', String(editingDocument.DocumentID));
        formData.append('Description', data.description || '');
        if (selectedFile) {
          formData.append('files', {
            uri: Platform.OS === 'android' ? selectedFile.uri : selectedFile?.uri?.replace('file://', ''),
            name: selectedFile.name,
            type: selectedFile.type,
          } as any);
        }
        await updateVehicleDocument(formData);
        Toast.show({ 
          type: 'success', 
          text1: 'Success', 
          text2: 'Document updated successfully' 
        });
      } else {
        formData.append('ObjectID', String(vehicleId));
        // formData.append('ObjectTypeID', 'Auction');
        formData.append('ObjectTypeID', '1');
        formData.append('UserID', String(user?.id || '242531'));
        formData.append('Description', data.description || '');
        formData.append('files', {
          uri: Platform.OS === 'android' ? selectedFile.uri : selectedFile?.uri?.replace('file://', ''),
          name: selectedFile.name,
          type: selectedFile.type,
        } as any);
        console.log('Form data in upload document ================================> ', formData);
        const response = await uploadVehicleDocuments(formData);
        console.log('Response in upload document', response?.data);
        
        Toast.show({ 
          type: 'success', 
          text1: 'Success', 
          text2: 'Document uploaded successfully' 
        });
      }
      
      setIsModalVisible(false);
      setSelectedFile(null);
      setEditingDocument(null);
      reset();
      fetchDocuments();
    } catch (error: any) {
      console.log('Error in onUpload ================================> ', error);
      Toast.show({ 
        type: 'error', 
        text1: 'Error', 
        text2: editingDocument ? 'Failed to update document' : 'Failed to upload document' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onDelete = async (DocumentID: number) => {
    setIsLoading(true);
    try {
      await deleteVehicleDocument(DocumentID);
      Toast.show({ 
        type: 'success', 
        text1: 'Success', 
        text2: 'Document deleted successfully' 
      });
      fetchDocuments();
    } catch (error: any) {
      Toast.show({ 
        type: 'error', 
        text1: 'Error', 
        text2: 'Failed to delete document' 
      });
    } finally {
      setIsLoading(false);
    }
  };


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
        // For images, use a different approach
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension)) {
          // For images, we can use Linking to open in browser or image viewer
          await Linking.openURL(url);
        } else {
          // For other files, use the action view intent
          RNFetchBlob?.android?.actionViewIntent(res.path(), `application/${fileExtension}`);
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

      // Get file extension from URL
      const fileExtension = url.split('.').pop()?.toLowerCase() || 'pdf';
      const fileName = `Document_${Date.now()}.${fileExtension}`;
      const downloadDest = `${RNFS.DownloadDirectoryPath}/${fileName}`;
      
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
          mime: `application/${fileExtension}`,
        },
      })
        .fetch('GET', url)
        .progress((received: any, total: any) => {
          const progress = (Number(received) / Number(total)) * 100;
          console.log(`Download progress: ${progress}%`);
        })
        .then(() => {
          Toast.show({
            type: 'success',
            text1: 'Download Successful',
            text2: `${fileName} downloaded successfully`,
          });
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
  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.documentCard}>
      <View style={styles.documentHeader}>
        <Image 
          source={icn.document} 
          style={styles.documentIcon} 
          resizeMode="contain" 
        />
        <View style={styles.documentInfo}>
          <Text style={styles.documentName} numberOfLines={2}>
            {item?.FileName || 'Unknown Document'}
          </Text>
          <Text style={styles.documentDescription} numberOfLines={1}>
            {item?.Description || 'No description'}
          </Text>
        </View>
        <View style={styles.actionIconsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
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
            }}
          >
            <Image 
              source={icn.blueFilledEye} 
              style={styles.actionIcon} 
              resizeMode="contain"
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
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
            }}
          >
            <Image 
              source={icn.download} 
              style={styles.actionIcon} 
              resizeMode="contain"
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onEdit(item)}
          >
            <Image 
              source={icn.singlePen} 
              style={styles.actionIcon} 
              resizeMode="contain"
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onDelete(item?.DocumentID)}
          >
            <Image 
              source={icn.delete} 
              style={[styles.actionIcon, styles.deleteIcon]} 
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.documentFooter}>
        <View style={styles.userInfo}>
          <Image 
            source={user?.Image ? { uri: user.Image } : icn.dummyProfile}
            style={styles.userProfileImage} 
            resizeMode="cover"
          />
          <Text style={styles.userName}>
            {user?.name || item?.UserName || 'Unknown User'}
          </Text>
        </View>
        <Text style={styles.documentMeta}>
          Size: {item?.size || '--'}
        </Text>
        <Text style={styles.documentMeta}>
          Type: {item?.FileName?.split('.').pop()?.toUpperCase() || '--'}
        </Text>
      </View>
    </View>
  );

  const renderEmptyComponent = (): any => (
    <View style={styles.emptyContainer}>
      <Image 
        source={icn.document} 
        style={styles.emptyIcon} 
        resizeMode="contain"
      />
      <Text style={styles.emptyText}>No documents found.</Text>
    </View>
  );

  const closeModal = (): any => {
    setIsModalVisible(false);
    setSelectedFile(null);
    setEditingDocument(null);
    reset();
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Header 
          title="Vehicle Documents" 
          leftIcn={icn.back} 
          onLeftIconPress={() => navigation.goBack()} 
        />
        
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Documents</Text>
          <TouchableOpacity 
            style={styles.addButtonContainer}
            onPress={() => setIsModalVisible(true)}
          >
            <Text style={styles.addText}>Add</Text>
            <View style={styles.circularPlusButton}>
              <Image 
                source={icn.plus}
                style={styles.plusIcon}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        </View>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator 
              color={Colors.primary} 
              size={Platform.OS === 'android' ? wp(8) : 'large'} 
            />
          </View>
        ) : (<FlatList
            data={documents}
            renderItem={renderItem}
            keyExtractor={(item: any, index: any) => item?.DocumentID?.toString() || index.toString()}
            ListEmptyComponent={renderEmptyComponent}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
        
        <Modal 
          visible={isModalVisible} 
          transparent 
          animationType="fade"
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>
                {editingDocument ? 'Edit Document' : 'Add Document'}
              </Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Description</Text>
                <Controller
                  control={control}
                  name="description"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter document description"
                      value={value}
                      onChangeText={onChange}
                      multiline
                      numberOfLines={3}
                      placeholderTextColor={Colors.greyIcn}
                    />
                  )}
                />
              </View>
              
              <View style={styles.filePickerContainer}>
                <TouchableOpacity 
                  onPress={pickDocument} 
                  style={styles.filePickerButton}
                >
                  <Text style={styles.filePickerText}>Choose File</Text>
                </TouchableOpacity>
                {selectedFile && (
                  <Text style={styles.selectedFileName} numberOfLines={2}>
                    {selectedFile.name}
                  </Text>
                )}
              </View>
              
              <View style={styles.modalButtonContainer}>
                <PrimaryButton 
                  title="Cancel" 
                  style={styles.cancelButton}
                  textStyle={styles.cancelButtonText}
                  onPress={closeModal}
                />
                <PrimaryButton 
                  title={editingDocument ? "Update" : "Upload"} 
                  style={styles.uploadButton}
                  textStyle={styles.uploadButtonText}
                  onPress={handleSubmit(onUpload)} 
                //   loading={isUploading}
                />
              </View>
            </View>
          </View>
        </Modal>
        <LoadingModal visible={isUploading} message="Uploading document..." />
      </View>
    </View>
  );
};

export default VehicleDocuments; 
