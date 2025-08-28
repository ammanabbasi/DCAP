import textRecognition from '@react-native-ml-kit/text-recognition';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {useForm} from 'react-hook-form';
import {Image, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import {useDispatch} from 'react-redux';
import {icn} from '../../Assets/icn';
import Header from '../../Components/Header';
import PrimaryButton from '../../Components/PrimaryButton';
import {styles} from './style';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {decode} from '../../Services/apis/APIs';
import Toast from 'react-native-toast-message';
import LoadingModal from '../../Components/LoadingModal';
import { storage } from '../../redux/mmkv/storage';
import { hp } from '../../Theme/Responsiveness';
const ScanDocument = ({route}: any): any => {
  const params = route?.params;
  const dispatch = useDispatch();
  const {hasPermission, requestPermission} = useCameraPermission();
  const navigation = useNavigation();
  const [capturedImage, setCapturedImage] = useState<any>(null);
  const [recognizedText, setRecognizedText] = useState<any>(null);
  const [isScanCompleted, setIsScanCompleted] = useState<boolean>(false);
  const isFocused = useIsFocused();
  const device = useCameraDevice('back');
  const isScanned = useRef(false);
  const cameraRef = useRef();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [vin, setVin] = useState<string>('');
  
  // Check if manual mode is enabled
  const isManualMode = params?.from === 'addInventory' && params?.method === 'manual';
  
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: codes => {
      if (!isScanned.current && params?.from === 'addInventory' && !isManualMode) {
        isScanned.current = false;
        setVin(codes?.[0]?.value || '');
        setIsScanCompleted(true);
      }
    },
  });
  const captureDocument = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef?.current?.takePhoto();
    setCapturedImage(photo.path);
    // performOCR(photo.path);
  };
  const performOCR = async imagePath => {
    try {
      const result = await textRecognition.recognize(imagePath);
      console.log(result);
    
    } catch (error: any) {
      console.error('Error performing OCR:', error);
    }
  };
  useEffect(() => {
    (async () => {
      if (!hasPermission && !isManualMode) {
        await requestPermission();
      }
    })();
  }, [hasPermission, requestPermission, isManualMode]);
  
  const onPress = (): any => {
    if (capturedImage) {
      setIsScanCompleted(true);
      setCapturedImage(null);
    } else if (isScanCompleted) {
      navigation.goBack();
    } else {
      captureDocument();
    }
  };
  
  const handleReset = (): any => {
    setCapturedImage(null);
    setIsScanCompleted(false);
  };
  
  const onDecode = async () => {
    try {
      if (!vin) {
        Toast.show({
          type: 'error',
          text1: 'Please enter vin',
        });
        return;
      }
      setIsLoading(true);
      const payload = {
        vin: vin,
      };
      const response = await decode(payload);
      console.log("Resp from vin decode: ",response?.data)
      storage.set('vehicleId',response?.data?.data?.VehicleID||"");
      navigation.navigate('VehicleDetails', {
        item: response?.data?.data,
        from:"scanInventory"
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Manual VIN input handler
  const handleManualVinSubmit = (): any => {
    if (!vin || vin.trim() === '') {
      Toast.show({
        type: 'error',
        text1: 'Please enter VIN',
      });
      return;
    }
    setIsScanCompleted(true);
  };
  
  return (
    <KeyboardAwareScrollView
      style={styles.mainView}
      contentContainerStyle={styles.subContainer}>
      <Header
        title={
          isScanCompleted
            ? 'Successfully Scanned'
            : params?.from === 'addInventory'
            ? isManualMode ? 'Enter VIN Manually' : 'Scan VIN'
            : 'Scan'
        }
        leftIcn={icn.back}
        blueBackground
        leftIcnStyle={styles.backIcn}
        onLeftIconPress={() => navigation.goBack()}
      />
      {isScanCompleted ? (
        <>
          <Image
            style={styles.successImg}
            source={icn.success}
            resizeMode="contain"
          />
          {params?.from === 'addInventory' ? (
            <>
              <Text style={styles.successText}>VIN successfully scanned!</Text>
              <TextInput
                value={vin}
                onChangeText={txt => setVin(txt)}
                style={styles.vinInput}
              />
              <PrimaryButton
                title={'Decode'}
                whiteBackground
                onPress={onDecode}
                style={styles.decodeButton}
              />
              <TouchableOpacity onPress={handleReset}>
                <Image
                  style={styles.sync}
                  source={icn.sync}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Text style={styles.scanText}>Scan Again</Text>
            </>
          ) : (
            <>
              <Text style={styles.successText}>
                Document successfully scanned!
              </Text>
              <Text style={styles.description}>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry.
              </Text>
            </>
          )}
        </>
      ) : isManualMode ? (
        // Manual VIN input mode
        <View style={[styles.manualInputContainer , {marginTop: hp(10)}]}>
          <Text style={styles.manualInputTitle}>Enter VIN Number</Text>
          <Text style={styles.manualInputDescription}>
            Please enter the 17-digit VIN number manually
          </Text>
          <TextInput
            value={vin}
            onChangeText={txt => setVin(txt)}
            style={styles.manualVinInput}
            placeholder="Enter VIN number..."
            placeholderTextColor="#999"
            maxLength={17}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <PrimaryButton
            title={'Scan'}
            whiteBackground
            onPress={handleManualVinSubmit}
            style={styles.manualScanButton}
          />
        </View>
      ) : (
        hasPermission &&
        device && (
          <>
            <View style={styles.camContainer}>
              {capturedImage ? (
                <Image
                  style={styles.cam}
                  source={{uri: `file://${capturedImage}`}}
                  resizeMode="cover"
                />
              ) : (
                <Camera
                  ref={cameraRef}
                  style={styles.cam}
                  device={device}
                  isActive={isFocused}
                  codeScanner={codeScanner}
                  photo={true}
                />
              )}
            </View>
            <Text style={styles.alignText}>
              {params?.from === 'addInventory'
                ? 'Align VIN QR/Barcode in center with camera and  stay until it complete scan'
                : 'Align Document in center with camera\nand stay until it complete scan'}
            </Text>
            {params?.from !== 'addInventory' && (
              <TouchableOpacity onPress={handleReset}>
                <Image
                  style={styles.sync}
                  source={icn.sync}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
          </>
        )
      )}
      {hasPermission && device && params?.from !== 'addInventory' && !isManualMode && (
        <PrimaryButton
          title={
            capturedImage ? 'Proceed' : isScanCompleted ? 'Continue' : 'Scan'
          }
          whiteBackground
          onPress={onPress}
          style={styles.button}
        />
      )}
      <LoadingModal visible={isLoading} />
    </KeyboardAwareScrollView>
  );
};

export default ScanDocument;
