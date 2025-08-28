import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
// import { addWatermark } from '../../Services/apis/APIs';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
  Switch,
  ScrollView,
  TextInput,
  ViewToken,
  Linking,
  Alert,

} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import Toast from 'react-native-toast-message';
import { useDispatch } from 'react-redux';
import { icn } from '../../Assets/icn';
import Header from '../../Components/Header';
import {
  deleteVehicleImages,
  uploadVehicleImages,
  vehicleImages,
  uploadVideoFile,
  uploadVideoUrl,
  applyWatermark,
  deleteVideoUrl,
  getVideoUrl,
  removeWatermark,
} from '../../Services/apis/APIs';
import { Colors } from '../../Theme/Colors';
import { hp, wp } from '../../Theme/Responsiveness';
import { styles } from './style';
import LoadingModal from '../../Components/LoadingModal';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DocumentPicker from 'react-native-document-picker';
import { BASE_URL, ROOT_URL } from '../../Services/config';
import Video from 'react-native-video';

import { RootStackParamList } from '../../Navigation/type';

type ImagesScreenRouteProp = RouteProp<RootStackParamList, 'Images'>;
const Images = (): any => {
  const route = useRoute<ImagesScreenRouteProp>();
  const { vehicleId, watermarkId, imagesData: initialImagesData } = route.params;

  console.log("vehicleId:", vehicleId, "watermarkId:", watermarkId);
  console.log("imagesData:", initialImagesData);

  // const vehicleId = routeParams.vehicleId;
  // const watermarkId = routeParams.watermarkId || '';  
  console.log("the data", vehicleId, watermarkId);


  // const params: ImagesScreenParams = {
  //   vehicleId,
  //   watermarkId,
  // };
  const dispatch = useDispatch();
  const navigation: any = useNavigation();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedImg, setSelectedImg] = useState<any>(null);
  const [imagesData, setImagesData] = useState<Array<any>>([]);
  const [photoUri, setPhotoUri] = useState<any>(undefined);
  const [images, setImages] = useState<string[]>([]);
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [mediaType, setMediaType] = useState<string>('image');
  const [isWatermarkChecked, setIsWatermarkChecked] = useState<boolean>(false);
  const [isWatermarkApplied, setIsWatermarkApplied] = useState<boolean>(false);
  const [isWatermarking, setIsWatermarking] = useState<boolean>(false);
  const [isSelectAll, setIsSelectAll] = useState<boolean>(false);
  const [isSelectAllModalVisible, setIsSelectAllModalVisible] = useState<boolean>(false);
  const [selectAllTab, setSelectAllTab] = useState<string>('watermark'); // 'watermark' or 'delete'
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [imageName, setImageName] = useState<string[]>([]);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [menuPosition, setMenuPosition] = useState<any>({ x: 0, y: 0 });
  const [isDeleteAllConfirmVisible, setIsDeleteAllConfirmVisible] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoUrlFromBackend, setVideoUrlFromBackend] = useState<string>('');
  const [video360Url, setVideo360Url] = useState<string>('');

  const [addedVideoUrl, setAddedVideoUrl] = useState<string>('');
  const [added360VideoUrl, setAdded360VideoUrl] = useState<string>('');

  const [video360UrlFromBackend, setVideo360UrlFromBackend] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [threeSixtyVideoUpload, setThreeSixtyVideoUpload] = useState<boolean>(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('');
  const [videoPreviewUrl360, setVideoPreviewUrl360] = useState<string>('');
  const [imageUpdateCounter, setImageUpdateCounter] = useState<number>(0);

  const handleAddLink = async () => {
    if (!videoUrl.trim()) return;
    let formattedUrl = videoUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    console.log('About to save to AsyncStorage:', formattedUrl);
    setAddedVideoUrl(formattedUrl);

    try {
      await AsyncStorage.setItem('addedVideoUrl', formattedUrl);
      console.log('✅ Successfully saved to AsyncStorage:', formattedUrl);

      // Verify it was saved by reading it back immediately
      const verifySave = await AsyncStorage.getItem('addedVideoUrl');
      console.log('✅ Verification - Read back from AsyncStorage:', verifySave);
    } catch (error: any) {
      console.log('❌ Error saving to AsyncStorage:', error);
    }
  };



  const handlePress = useCallback(async () => {
    if (addedVideoUrl) {
      try {
        await Linking.openURL(addedVideoUrl);
      } catch (e: any) {
        Alert.alert("Invalid URL", "Cannot open the provided link.");
      }
    }
  }, [addedVideoUrl]);

  const handlePress360Link = useCallback(async () => {
    if (added360VideoUrl) {
      try {
        await Linking.openURL(added360VideoUrl);
      } catch (e: any) {
        Alert.alert("Error", "Cannot open this URL.");
      }
    }
  }, [added360VideoUrl]);


  const handleAdd360Link = async () => {
    if (!video360Url.trim()) return;
    let formattedUrl = video360Url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      // If it's a YouTube video ID (11 chars, possibly with params)
      if (/^[a-zA-Z0-9_-]{11}($|[?&])/.test(formattedUrl)) {
        formattedUrl = `https://www?.youtube?.com/watch?v=${formattedUrl}`;
      } else {
        formattedUrl = 'https://' + formattedUrl;
      }
    }

    console.log('About to save 360 video to AsyncStorage:', formattedUrl);
    setAdded360VideoUrl(formattedUrl);

    try {
      await AsyncStorage.setItem('added360VideoUrl', formattedUrl);
      console.log('✅ Successfully saved 360 video to AsyncStorage:', formattedUrl);

      // Verify it was saved by reading it back immediately
      const verifySave = await AsyncStorage.getItem('added360VideoUrl');
      console.log('✅ Verification - Read back 360 video from AsyncStorage:', verifySave);
    } catch (error: any) {
      console.log('❌ Error saving 360 video to AsyncStorage:', error);
    }
  };

  const getVehicleImages = async () => {
    try {
      if (!refreshing) setIsLoading(true);
      const payload = {
        VehicleID: vehicleId,
      };
      const response = await vehicleImages(payload);
      console.log('Fetched images: ==============>', response?.data);
      setImagesData(Array.isArray(response?.data?.data) ? response?.data?.data : []);
    } catch (error: any) {
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



  useEffect(() => {
    console.log("selectedImages", selectedImages);
    console.log("imageName", imageName);
  }, [selectedImages]);

  const handleApplyWatermark = async () => {

    console.log('Applying watermark with:', {
      vehicleId: vehicleId,
      watermarkId: watermarkId,
    });
    if (!vehicleId || !watermarkId) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Missing vehicleId or watermarkId' });
      return;
    }


    try {
      setIsModalLoading(true);

      const payload = {
        vehicleId: vehicleId,
        watermarkId: watermarkId,
        imageNames: imageName,
      };

      const response = await applyWatermark(payload);
      console.log('Watermark response:', response?.data);
      console.log('Response structure:', {
        success: response?.data?.success,
        imagePath: response?.data?.imagePath,
        imagePaths: response?.data?.imagePaths,
        message: response?.data?.message
      });

      if (response?.data?.success) {
        // Clear selections
        setSelectedImages([]);
        setImageName([]);
        setIsSelectAll(false);

        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response?.data?.message || 'Watermark applied successfully!',
        });

        // Update the images with the new watermarked URLs
        if (response?.data?.imagePaths && Array.isArray(response?.data?.imagePaths)) {
          console.log('Updating multiple images with paths:', response?.data?.imagePaths);
          // Update images with the new watermarked URLs
          setImagesData(prevImages =>
            prevImages.map(img => {
              const updatedImage = response?.data?.imagePaths.find((updatedImg: any) =>
                updatedImg.originalName === img.ImageName ||
                updatedImg.name === img.ImageName ||
                updatedImg.imageName === img.ImageName
              );
              if (updatedImage) {
                console.log('Updating image:', img.ImageName, 'with new path:', updatedImage.path || updatedImage.imagePath);
                return {
                  ...img,
                  imagePath: updatedImage.path || updatedImage.imagePath || updatedImage.url
                };
              }
              return img;
            })
          );
        } else if (response?.data?.imagePath) {
          console.log('Updating single image with path:', response?.data?.imagePath);
          // Single image update
          setImagesData(prevImages =>
            prevImages.map(img => {
              if (imageName.includes(img.ImageName)) {
                console.log('Updating single image:', img.ImageName, 'with new path:', response?.data?.imagePath);
                return {
                  ...img,
                  imagePath: response?.data?.imagePath
                };
              }
              return img;
            })
          );
        } else {
          console.log('No image paths found in response, will refresh from server');
        }

        // Increment the update counter to force re-render
        setImageUpdateCounter(prev => prev + 1);

        // Also refresh from server as fallback
        setTimeout(() => {
          getVehicleImages();
        }, 1000);
      }
      else {
        throw new Error('API did not return success');
      }
    } catch (error: any) {
      console.log("error in apply watermark", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to apply watermark',
      });
      console.log("error in apply watermark", error);
      console.log("error in apply watermark", error?.response?.data);
    } finally {
      setIsModalLoading(false);
    }
  };
  const handleRemoveWaterMark = async () => {

    console.log('Applying watermark with:', {
      vehicleId: vehicleId,
      watermarkId: watermarkId,
    });
    if (!vehicleId || !watermarkId) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Missing vehicleId or watermarkId' });
      return;
    }


    try {
      setIsModalLoading(true);

      const payload = {
        vehicleId: vehicleId,
        watermarkId: watermarkId,
        imageNames: imageName,
      };

      const response = await removeWatermark(payload);

      console.log("response in remove watermark =======", response?.data);

      if (response?.data?.success) {
        await getVehicleImages();
        setSelectedImages([]);
        setImageName([]);
        setIsSelectAll(false);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response?.data?.message || 'Watermark applied successfully!',
        });
        // Update the images with the original URLs
        if (response?.data?.imagePath) {
          // If a single imagePath is returned, update the corresponding image
          setImagesData(prevImages =>
            prevImages.map(img => {
              if (imageName.includes(img.ImageName)) {
                return {
                  ...img,
                  imagePath: response?.data?.imagePath
                };
              }
              return img;
            })
          );
          setImageUpdateCounter(prev => prev + 1);
        } else if (response?.data?.imagePaths && Array.isArray(response?.data?.imagePaths)) {
          // If multiple imagePaths are returned, update each corresponding image
          setImagesData(prevImages =>
            prevImages.map(img => {
              const updatedImage = response?.data?.imagePaths.find((updatedImg: any) =>
                updatedImg.originalName === img.ImageName || updatedImg.name === img.ImageName
              );
              if (updatedImage) {
                return {
                  ...img,
                  imagePath: updatedImage.path || updatedImage.imagePath
                };
              }
              return img;
            })
          );
          setImageUpdateCounter(prev => prev + 1);
        } else {
          // Fallback: refresh all images from server
          await getVehicleImages();
        }
      }
      else {
        throw new Error('API did not return success');
      }
    } catch (error: any) {
      console.log("error in apply watermark", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to apply watermark',
      });
      console.log("error in apply watermark", error);
      console.log("error in apply watermark", error?.response?.data);
    } finally {
      setIsModalLoading(false);
    }
  };




  const toggleModal = (): any => {
    setModalVisible(!isModalVisible);
  };
  const viewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems?.[0].index !== null) {
      setCurrentIndex(viewableItems?.[0].index);
    }
  }, []);
  const pickMultipleImages = async () => {
    try {
      const selectedImages = await ImagePicker.openPicker({
        multiple: true,
        mediaType: 'photo',
      });

      const imagePaths = selectedImages.map(image => image.path);
      setImages(imagePaths);
      uploadImages(imagePaths);
    } catch (error: any) {
      console.log('Error selecting images:', error);
    }
  };
  const uploadImages = async (images: string[]) => {
    try {
      setIsModalLoading(true);
      const payload = new FormData();
      payload.append('VehicleID', vehicleId);
      images.forEach((path: string, index: number) => {
        payload.append('files', {
          uri: path,
          type: 'image/jpeg',
          name: `image_${index}.jpg`,
        });
      });
      const response = await uploadVehicleImages(payload);
      console.log('Fetched added Image  ==========================================>:', response?.data);
      await getVehicleImages();
      // setImagesData(Array.isArray(response?.data?.data) ? response?.data?.data : []);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setIsModalLoading(false);
    }
  };
  const deleteImage = async (id: string) => {
    try {
      setIsModalLoading(true);
      const payload = { ImageID: id };
      const response = await deleteVehicleImages(payload);
      if ((response?.data && response?.data?.success) || response?.status === 200) {
        setImagesData(prevImages => prevImages.filter(img => img.ImageID !== id));
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Image deleted successfully',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to delete image from backend.',
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setIsModalLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
  };
  const renderItem = ({ item, index }: { item: any, index: number }) => {
    if (!item?.imagePath && !item?.videoPath) return null;
    const isSelected = selectedImages.includes(item?.ImageID);
    const isVideo = item?.mediaType === 'video';
    const mediaPath = isVideo ? item?.videoPath : item?.imagePath;
    console.log("mediaPath", mediaPath);

    // Add cache-busting parameter using the image ID, name, and update counter to force refresh when image changes
    const imageSource = isVideo ? { uri: mediaPath } : { uri: `${mediaPath}?v=${item?.ImageID || item?.ImageName || '1'}&update=${imageUpdateCounter}` };

    return (
      <View style={styles.gridItem}>
        <View style={styles.imageBox}>
          {isVideo ? (
            <View style={styles.videoContainer}>
              <Image
                source={imageSource}
                style={styles.gridImage}
              />
              <View style={styles.playButtonOverlay}>
                <Image
                  source={icn.man}
                  style={styles.playIcon}
                  resizeMode="contain"
                />
              </View>
            </View>
          ) : (
            <Image
              source={imageSource}
              style={styles.gridImage}
            />
          )}
        </View>
        <View style={styles.iconRow}>
          <TouchableOpacity
            onPress={() => {
              if (isSelected) {
                setSelectedImages(prev => prev.filter(id => id !== item?.ImageID));
                setImageName(prev => prev.filter(name => name !== item?.ImageName));
              } else {
                setSelectedImages(prev => [...prev, item?.ImageID]);
                setImageName(prev => [...prev, item?.ImageName]);
              }
            }}
            style={styles.iconButton}>
            <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
              {isSelected && <View style={styles.checkboxInner} />}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setSelectedImg(mediaPath);
              toggleModal();
            }}
            style={styles.iconButton}>
            <Image
              source={icn.expand}
              style={styles.actionIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => deleteImage(item?.ImageID)}
            style={styles.iconButton}>
            <Image
              source={icn.delete}
              style={styles.actionIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  const emptyComponent = (): any => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.noDataAvailable}>No data available</Text>
      </View>
    );
  };

  useEffect(() => {
    getVehicleImages();
  }, []);

  useEffect(() => {
    if (imagesData.length > 0) {
      AsyncStorage.setItem('vehicleImages', JSON.stringify(imagesData));
    }
  }, [imagesData]);

  const loadImagesFromStorage = async () => {
    try {
      const storedImages = await AsyncStorage.getItem('vehicleImages');
      if (storedImages) {
        setImagesData(JSON.parse(storedImages));
      }
    } catch (error: any) {
      console.log('Error loading images from storage:', error);
    }
  };

  useEffect(() => {
    loadImagesFromStorage();
  }, []);

  const handleMenuPress = (event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    setMenuPosition({ x: pageX, y: pageY });
    setShowMenu(true);
  };

  const handleMenuClose = (): any => {
    setShowMenu(false);
  };
  const handleBackdropPress = (): any => {
    setShowMenu(false);
  };
  const handleSelectAll = (): any => {
    if (isSelectAll) {
      setSelectedImages([]);
      setImageName([]);
    } else {
      const allImageIds = imagesData.map(img => img.ImageID);
      const allImageNames = imagesData.map(img => img.ImageName);
      setSelectedImages(allImageIds);
      setImageName(allImageNames);
    }
    setIsSelectAll(!isSelectAll);
  };
  const getFilteredMedia = (): any => {
    if (!Array.isArray(imagesData)) return [];
    if (mediaType === 'image') {
      return imagesData.filter((item: any) => item.mediaType === 'image' || !item.mediaType);
    } else {
      return imagesData.filter((item: any) => item.mediaType === 'video');
    }
  };

  // const handleUpload360 = async () => {
  //   if (!video360Url) {
  //     Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter a 360 video URL' });
  //     return;
  //   }
  //   // Call your API to upload the 360 video URL here
  //   await upload360Url({ VehicleID:vehicleId, url: video360Url });
  //   setVideo360Url('');
  //   Toast.show({ type: 'success', text1: 'Success', text2: '360 Video URL uploaded!' });
  //   await getVehicleImages();
  // };

  const pickAndUploadVideoForVideoSection = async () => {
    try {
      setIsUploading(true);
      const res = await DocumentPicker.pickSingle({ type: [DocumentPicker?.types?.video] });
      console.log('Picked video file:', res);

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Toast.show({ type: 'error', text1: 'Error', text2: 'You must log in first.' });
        return;
      }
      const response = await uploadVideoFile({
        file: {
          uri: res.uri,
          type: res.type,
          name: res.name,
        }
      });
      console.log('Upload Video File response:', response.data);

      if (response.data?.videoUrl) {
        
        await uploadVideoUrl({
          vehicleId: vehicleId,
          videoLink: response?.data?.videoUrl
        });
    
        setVideoUrl(response?.data?.videoUrl);
        setVideoPreviewUrl(response?.data?.videoUrl);
        await AsyncStorage.setItem('videoPreviewUrl', response?.data?.videoUrl);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Video uploaded successfully!'
        });
      } else {
        throw new Error('No video URL received from server');
      }
    } catch (err: any) {
      console.log('Upload Video File error:', err);
      if (!DocumentPicker.isCancel(err)) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: err?.message || 'Upload failed.'
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const pickAndUploadVideoFor360Section = async () => {
    try {
      setThreeSixtyVideoUpload(true);
      const res = await DocumentPicker.pickSingle({ type: [DocumentPicker?.types?.video] });
      console.log('Picked video file:', res);

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Toast.show({ type: 'error', text1: 'Error', text2: 'You must log in first.' });
        return;
      }
      const response = await uploadVideoFile({
        file: {
          uri: res.uri,
          type: res.type,
          name: res.name,
        }
      });
      console.log('Upload Video File response:', response.data);

      if (response.data?.videoUrl) {
        await uploadVideoUrl({
          vehicleId: vehicleId,
          threeSixtyVideoLink: response?.data?.videoUrl,
        });

        setVideo360Url(response?.data?.videoUrl);
        setVideoPreviewUrl360(response?.data?.videoUrl);
        await AsyncStorage.setItem('videoPreviewUrl360', response?.data?.videoUrl);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Video uploaded successfully!'
        });

      } else {
        throw new Error('No video URL received from server');
      }
    } catch (err: any) {
      console.log('Upload Video File error:', err);
      if (!DocumentPicker.isCancel(err)) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: err?.message || 'Upload failed.'
        });
      }
    } finally {
      setThreeSixtyVideoUpload(false);
    }
  };

  // const handleUploadVideoUrl = async () => {
  //   if (!videoUrl) {
  //     Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter a video URL' });
  //     return;
  //   }
  //   const token = await AsyncStorage.getItem('token');
  //   const payload = { token: token || '', VehicleID: vehicleId, url: videoUrl };
  //   console.log('Uploading video URL to backend:', BASE_URL + 'vehicle-video-link', payload);
  //   console.log("the video vehicle",vehicleId);
  //   try {
  //     const response = await uploadVideoUrl(payload);
  //     console.log('Upload Video URL response:', response.data);
  //     if (response.data && response?.data?.videoUrl) {
  //       setVideoUrlFromBackend(response?.data?.videoUrl);
  //       Toast.show({ type: 'success', text1: 'Success', text2: 'Video processed! Now click Save.' });
  //     } else {
  //       Toast.show({ type: 'error', text1: 'Error', text2: 'No videoUrl returned from backend.' });
  //     }
  //   } catch (error: any) {
  //     console.log('Upload Video URL error:', error, (error as any)?.response?.data);
  //     Toast.show({ type: 'error', text1: 'Error', text2: (error as any)?.message || 'Upload failed.' });
  //   }
  // };

  // const handleSaveVideoUrl = async () => {
  //   if (!videoUrlFromBackend) {
  //     Toast.show({ type: 'error', text1: 'Error', text2: 'No processed video URL to save.' });
  //     return;
  //   }
  //   const token = await AsyncStorage.getItem('token');
  //   await uploadVideoUrl({ token: token || '', VehicleID:vehicleId, url: videoUrlFromBackend });
  //   Toast.show({ type: 'success', text1: 'Success', text2: 'Video saved!' });
  //   setVideoUrl('');
  //   setVideoUrlFromBackend('');
  //   await getVehicleImages();
  // };

  // const handleUpload360Url = async () => {
  //   if (!video360Url) {
  //     Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter a 360 video URL' });
  //     return;
  //   }
  //   const token = await AsyncStorage.getItem('token');
  //   const response = await uploadVideoUrl({ token: token || '', VehicleID:vehicleId, url: video360Url });
  //   console.log('Upload 360 Video URL response:', response.data);
  //   if (response.data && response?.data?.videoUrl) {
  //     setVideo360UrlFromBackend(response?.data?.videoUrl);
  //     Toast.show({ type: 'success', text1: 'Success', text2: '360 Video processed! Now click Save.' });
  //   } else {
  //     Toast.show({ type: 'error', text1: 'Error', text2: 'No videoUrl returned from backend.' });
  //   }
  // };

  // const handleSave360Url = async () => {
  //   if (!video360UrlFromBackend) {
  //     Toast.show({ type: 'error', text1: 'Error', text2: 'No processed 360 video URL to save.' });
  //     return;
  //   }
  //   const token = await AsyncStorage.getItem('token');
  //   await uploadVideoUrl({ token: token || '', VehicleID:vehicleId, url: video360UrlFromBackend });
  //   Toast.show({ type: 'success', text1: 'Success', text2: '360 Video saved!' });
  //   setVideo360Url('');
  //   setVideo360UrlFromBackend('');
  //   await getVehicleImages();
  // };
  console.log('videoPreviewUrl', videoPreviewUrl);

  useEffect(() => {
    const loadLinks = async () => {
      try {
        const getVideoUrlResponse = await getVideoUrl(Number(vehicleId));
        console.log('getVideoUrlResponse====================================>', getVideoUrlResponse.data);

        // Use videos from backend if available
        const backendData = getVideoUrlResponse?.data?.data;
        if (backendData) {
          if (backendData.MarketingVideoLink) {
            setAddedVideoUrl(backendData.MarketingVideoLink);
            setVideoPreviewUrl(backendData.MarketingVideoLink);
          }
          if (backendData.ThreeSixtyVideoLink) {
            setAdded360VideoUrl(backendData.ThreeSixtyVideoLink);
            setVideoPreviewUrl360(backendData.ThreeSixtyVideoLink);
          }
        } else {
          // Fallback to AsyncStorage if backend data is not available
          const savedVideoUrl = await AsyncStorage.getItem('addedVideoUrl');
          if (savedVideoUrl) setAddedVideoUrl(savedVideoUrl);

          const saved360VideoUrl = await AsyncStorage.getItem('added360VideoUrl');
          if (saved360VideoUrl) setAdded360VideoUrl(saved360VideoUrl);

          const savedVideoPreviewUrl = await AsyncStorage.getItem('videoPreviewUrl');
          if (savedVideoPreviewUrl) setVideoPreviewUrl(savedVideoPreviewUrl);

          const savedVideoPreviewUrl360 = await AsyncStorage.getItem('videoPreviewUrl360');
          if (savedVideoPreviewUrl360) setVideoPreviewUrl360(savedVideoPreviewUrl360);
        }
      } catch (error: any) {
        console.log('Error loading video links:', error);
      }
    };
    loadLinks();
  }, [vehicleId]);

  return (
    <View style={styles.mainView}>
      {showMenu && (
        <TouchableOpacity
          style={styles.menuBackdrop}
          activeOpacity={1}
          onPress={handleBackdropPress}
        />
      )}
      <View style={styles.subContainer}>
        <FlatList
          data={getFilteredMedia()}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          renderItem={renderItem}
          style={{ marginTop: hp(2) }}
          keyExtractor={(item: any, index: any) => index.toString()}
          contentContainerStyle={[
            styles.listContainer,
            getFilteredMedia().length === 0 && styles.emptyListContainer
          ]}
          // ListEmptyComponent={emptyComponent}
          refreshControl={
            <RefreshControl
              tintColor={Colors.primary}
              colors={[Colors.primary]}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          ListHeaderComponent={
            <>
              <Header
                title="Gallery"
                leftIcn={icn.back}
                leftIcnStyle={styles.backIcn}
                onLeftIconPress={() => navigation.goBack()}
              />
              <View style={[styles.togglecontainer, { marginTop: hp(2) }]}>
                <View style={{ flexDirection: 'row', width: '100%' }}>
                  <TouchableOpacity
                    onPress={() => setMediaType('image')}
                    style={{
                      flex: 1,
                      paddingVertical: hp(1.5),
                      alignItems: 'center',
                      borderBottomWidth: 2,
                      borderBottomColor: mediaType === 'image' ? Colors.primary : 'transparent',
                    }}>
                    <Text style={{
                      color: mediaType === 'image' ? Colors.primary : Colors.grey,
                      fontSize: 14,
                      fontWeight: mediaType === 'image' ? '600' : '400',
                    }}>
                      Image
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setMediaType('video')}
                    style={{
                      flex: 1,
                      paddingVertical: hp(1.5),
                      alignItems: 'center',
                      borderBottomWidth: 2,
                      borderBottomColor: mediaType === 'video' ? Colors.primary : 'transparent',
                    }}>
                    <Text style={{
                      color: mediaType === 'video' ? Colors.primary : Colors.grey,
                      fontSize: 14,
                      fontWeight: mediaType === 'video' ? '600' : '400',
                    }}>
                      Video
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              {mediaType === 'image' && (
                <View style={styles.uploadSection}>
                  <View style={styles.uploadRow}>
                    <TouchableOpacity
                      style={styles.simpleCheckboxContainer}
                      onPress={handleSelectAll}
                      activeOpacity={1}
                    >
                      <View style={[styles.simpleCheckbox, isSelectAll && styles.simpleCheckboxChecked]}>
                        {isSelectAll && <View style={styles.simpleCheckboxInner} />}
                      </View>
                      <Text style={styles.checkboxLabel}>Select All</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleMenuPress}
                      style={styles.menuButton}
                    >
                      <Image
                        source={icn.optionDots}
                        style={styles.menuIcon}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              {mediaType === 'video' && (
                <View style={{ marginVertical: 16, flexDirection: 'column' }}>
                  <View style={{ flexDirection: 'column' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontWeight: 'bold' }}>Video</Text>
                      <TouchableOpacity
                        style={[styles.uploadButton, isUploading && { opacity: 0.7 }]}
                        onPress={pickAndUploadVideoForVideoSection}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Text style={styles.uploadButtonText}>Upload </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: 'column', alignItems: 'center', marginBottom: 12 }}>

                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: '100%', justifyContent: 'space-between' }}>
                        <TextInput
                          style={[styles.input, { flex: 1 }]}
                          placeholder="Enter video URL"
                          value={videoUrl}
                          onChangeText={setVideoUrl}
                          editable={!isUploading}
                        />
                        <View style={{ marginTop: 8 }}>
                          <TouchableOpacity
                            style={[styles.uploadButton, isUploading && { opacity: 0.3 }]}
                            onPress={handleAddLink}
                            disabled={isUploading}
                          >
                            {isUploading ? (
                              <ActivityIndicator color="#fff" size="small" />
                            ) : (
                              //  <Image source={icn.videocamera} style={{width:20,height:20}}></Image>
                              <Text style={styles.uploadButtonText}>Add Link</Text>
                            )}
                          </TouchableOpacity>
                        </View>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: '100%', justifyContent: 'space-between' }}>
                          {addedVideoUrl ? (
                            <View style={{ marginTop: 16 }}>
                              <Text style={{ fontWeight: 'bold', color: 'green' }}>Added Link:</Text>
                              <Text
                                selectable
                                style={{ color: 'blue', fontSize: 14, textDecorationLine: 'underline' }}
                                onPress={handlePress}
                              >
                                {addedVideoUrl}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                        {videoPreviewUrl && (
                          <View style={styles.videoPreviewContainer}>
                            <Text style={styles.previewTitle}>Video Preview:</Text>
                            
                            <View style={{ position: 'relative' }}>
                              <Video
                                source={{ uri: videoPreviewUrl }}
                                onError={e => console.log('Video error:', e)}
                                style={styles.videoPreview}
                                controls
                                resizeMode="cover"
                                paused={false}
                              />
                              <TouchableOpacity
                                style={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  zIndex: 2,
                                  backgroundColor: 'rgba(0,0,0,0.5)',
                                  borderRadius: 16,
                                  padding: 4,
                                }}
                                onPress={async () => {
                                  try {
                                    setIsLoading(true);
                                    const response = await deleteVideoUrl({
                                      VehicleID: vehicleId,
                                      deleteVideoLink: true
                                    });

                                    if(response?.status === 200){
                                      Toast.show({ type: 'success', text1: 'Video deleted successfully.' });
                                      setVideoPreviewUrl(null);
                                      setAddedVideoUrl(null);
                                      setVideoUrl(null);
                                      AsyncStorage.removeItem('videoPreviewUrl');
                                      AsyncStorage.removeItem('addedVideoUrl');
                                    }
                                    // Optionally, refresh the video preview or update state here
                                  } catch (error: any) {
                                    Toast.show({ type: 'error', text1: 'Failed to delete video.' });
                                    console.error('Delete video error:', error);
                                  } finally {
                                    setIsLoading(false);
                                  }
                                }}
                              >
                                <Image
                                  source={icn.delete}
                                  style={{ width: 16, height: 16, tintColor: 'red' }}
                                />
                              </TouchableOpacity>
                            </View>
                          </View>
                        )}
                        
                      </View>
                    </View>

                  </View>
                  <View style={{ borderWidth: 0.2, borderColor: "gray", marginBottom: 20, marginTop: 10 }}></View>
                  <View style={{ flexDirection: 'column' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontWeight: 'bold' }}> 360 Video</Text>
                      <TouchableOpacity
                        style={[styles.uploadButton, threeSixtyVideoUpload && { opacity: 0.7 }]}
                        onPress={pickAndUploadVideoFor360Section}
                        disabled={threeSixtyVideoUpload}
                      >
                        {threeSixtyVideoUpload ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Text style={styles.uploadButtonText}>Upload </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                      <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="Enter 360 video URL"
                        value={video360Url}
                        onChangeText={setVideo360Url}
                      />
                      <View style={{ flexDirection: 'row', marginTop: 8, gap: 8 }}>
                        <TouchableOpacity
                          style={[styles.uploadButton, threeSixtyVideoUpload && { opacity: 0.7 }]}
                          onPress={handleAdd360Link}
                          disabled={threeSixtyVideoUpload}
                        >
                          {threeSixtyVideoUpload ? (
                            <ActivityIndicator color="#fff" size="small" />
                          ) : (
                            //  <Image source={icn.videocamera} style={{width:20,height:20}}></Image>
                            <Text style={styles.uploadButtonText}>Add Link</Text>
                          )}
                        </TouchableOpacity>

                      </View>
                    </View>

                    {/* ✅ Display the added link below */}
                    {added360VideoUrl ? (
                      <View style={{ marginTop: 16 }}>
                        <Text style={{ fontWeight: 'bold', color: 'green' }}>Added Link:</Text>
                        <Text
                          selectable
                          onPress={handlePress360Link}
                          style={{ color: 'blue', fontSize: 14, textDecorationLine: 'underline' }}
                        >
                          {added360VideoUrl}
                        </Text>
                      </View>
                    ) : null}
                    {/* <TouchableOpacity 
                    style={[styles.uploadButton, isUploading && {opacity: 0.7}]} 
                    onPress={pickAndUploadVideo}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.uploadButtonText}>Pick & Upload Video</Text>
                    )}
                  </TouchableOpacity> */}
                    {videoPreviewUrl360 && (
                      <View style={styles.videoPreviewContainer}>
                        <Text style={styles.previewTitle}>Video Preview:</Text>
                        <View>
                          <Video
                            source={{ uri: videoPreviewUrl360 }}
                            onError={e => console.log('Video error:', e)}
                            style={styles.videoPreview}
                            controls
                            resizeMode="cover"
                            paused={false}
                          />
                          {/* Delete icon in top right corner of video */}
                          <TouchableOpacity
                            style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              zIndex: 2,
                              backgroundColor: 'rgba(0,0,0,0.5)',
                              borderRadius: 16,
                              padding: 4,
                            }}
                            onPress={async () => {
                              try {
                                setIsLoading(true);
                                  const response = await deleteVideoUrl({
                                  VehicleID: vehicleId,
                                  deleteThreeSixtyVideo: true
                                });

                                if(response?.status === 200){
                                  Toast.show({ type: 'success', text1: 'Video deleted successfully.' });
                                  setVideoPreviewUrl360(null);
                                  setAdded360VideoUrl(null);
                                  setVideo360Url(null);
                                  AsyncStorage.removeItem('videoPreviewUrl360');
                                  AsyncStorage.removeItem('added360VideoUrl');
                                }
                                // Optionally, refresh the video preview or update state here
                              } catch (error: any) {
                                Toast.show({ type: 'error', text1: 'Failed to delete video.' });
                                console.error('Delete 360 video error:', error);
                              } finally {
                                setIsLoading(false);
                              }
                            }}
                          >
                            <Image
                              source={icn.delete}
                              style={{ width: 16, height: 16, tintColor: 'red' }}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                    
                  </View>
                </View>

              )}
              {isLoading && (
                <ActivityIndicator
                  color={Colors.primary}
                  style={styles.activityIndicator}
                  size={Platform.OS == 'android' ? wp(11) : 'large'}
                />
              )}
            </>
          }
        />
      </View>
      {showMenu && (
        <View style={[styles.menuContainer, { top: menuPosition.y + hp(2), right: wp(4) }]}>


          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              handleMenuClose();
              // Select all images before applying watermark
              const allImageIds = imagesData.map(img => img.ImageID);
              const allImageNames = imagesData.map(img => img.ImageName);
              setSelectedImages(allImageIds);
              setImageName(allImageNames);
              setIsSelectAll(true);
              Toast.show({ type: 'success', text1: 'Watermark applied to all!' });
              handleApplyWatermark();
            }}
          >
            {/* <Image source={icn.watermark} style={styles.menuItemIcon} /> */}
            <Text style={styles.menuText}>Apply Watermark</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              handleMenuClose();
              handleRemoveWaterMark()
              Toast.show({ text1: 'Watermark removed from all!' });
              // Call remove watermark API
            }}
          >
            {/* <Image source={icn.removeWatermark} style={styles.menuItemIcon} /> */}
            <Text style={styles.menuText}>Remove Watermark</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              handleMenuClose();
              setIsDeleteAllConfirmVisible(true);
            }}
          >

            <Text style={[styles.menuText, { color: Colors.red }]}>Delete All</Text>
          </TouchableOpacity>
        </View>
      )}
      <Modal
        isVisible={isModalVisible}
        style={styles.modal}
        onBackdropPress={toggleModal}>
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={toggleModal} style={styles.closeButton}>
            <Image
              source={icn.redCross}
              style={styles.crossIcn}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Image
            source={{ uri: selectedImg ? `${selectedImg}?v=${imageUpdateCounter}` : selectedImg }}
            style={styles.fullImage}
          />
        </View>
      </Modal>
      <LoadingModal visible={isModalLoading} message="Loading..." />
      {
        mediaType === 'image' &&
        <TouchableOpacity
          style={[styles.fab, { flexDirection: 'row', width: wp(25), height: hp(5.5), borderRadius: 26 }]}
          onPress={pickMultipleImages}
          activeOpacity={0.7}
        >
          <Image
            source={icn.upload}
            style={[styles.fabIcon, { width: 20, height: 20, marginLeft: 23 }]}
            resizeMode="contain"
          />
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'white', marginRight: 26 }}>Upload</Text>
        </TouchableOpacity>
      }
      <Modal
        isVisible={isSelectAllModalVisible}
        onBackdropPress={() => setIsSelectAllModalVisible(false)}
        style={styles.bottomModal}
        swipeDirection="down"
        onSwipeComplete={() => setIsSelectAllModalVisible(false)}
        backdropOpacity={0.3}
      >
        <View style={styles.selectAllModalContent}>
          <View style={styles.selectAllButtonsRow}>
            <TouchableOpacity
              style={[styles.selectAllActionButton, { backgroundColor: Colors.primary }]}
              onPress={() => {
                setIsSelectAllModalVisible(false);
                // Select all images before applying watermark
                const allImageIds = imagesData.map(img => img.ImageID);
                const allImageNames = imagesData.map(img => img.ImageName);
                setSelectedImages(allImageIds);
                setImageName(allImageNames);
                setIsSelectAll(true);
                Toast.show({ type: 'success', text1: 'Watermark applied to all!' });
                handleApplyWatermark();
              }}
            >
              <Text style={[styles.selectAllActionText, { color: '#fff' }]}>Watermark</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.selectAllActionButton, { backgroundColor: Colors.dullWhite, borderWidth: 1, borderColor: Colors.primary }]}
              onPress={() => {
                setIsSelectAllModalVisible(false);
                setIsDeleteAllConfirmVisible(true);
              }}
            >
              <Text style={[styles.selectAllActionText, { color: Colors.primary }]}>Delete All</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        isVisible={isDeleteAllConfirmVisible}
        onBackdropPress={() => setIsDeleteAllConfirmVisible(false)}
        style={styles.bottomModal}
        backdropOpacity={0.3}
      >
        <View style={styles.selectAllModalContent}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>
            Are you sure you want to delete all images?
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
            <TouchableOpacity
              style={[styles.selectAllActionButton, { backgroundColor: Colors.primary }]}
              onPress={async () => {
                setIsDeleteAllConfirmVisible(false);
                setIsModalLoading(true);
                try {
                  for (const img of imagesData) {
                    await deleteVehicleImages({ ImageID: img.ImageID });
                  }
                  await getVehicleImages();
                  setSelectedImages([]);
                  setIsSelectAll(false);
                  Toast.show({ type: 'success', text1: 'All images deleted!' });
                } catch (error: any) {
                  Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to delete all images.' });
                } finally {
                  setIsModalLoading(false);
                }
              }}
            >
              <Text style={[styles.selectAllActionText, { color: '#fff' }]}>Yes, Delete All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.selectAllActionButton, { backgroundColor: Colors.dullWhite, borderWidth: 1, borderColor: Colors.primary }]}
              onPress={() => setIsDeleteAllConfirmVisible(false)}
            >
              <Text style={[styles.selectAllActionText, { color: Colors.primary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Images;
