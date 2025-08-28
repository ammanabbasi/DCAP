import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {useForm} from 'react-hook-form';
import {FlatList, Image, Platform, Text, TouchableOpacity, View} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {MD3Colors, ProgressBar} from 'react-native-paper';
import {useDispatch} from 'react-redux';
import {icn} from '../../Assets/icn';
import Header from '../../Components/Header';
import {styles} from './style';
import {Colors} from '../../Theme/Colors';
import {hp, wp} from '../../Theme/Responsiveness';
import PrimaryButton from '../../Components/PrimaryButton';
const data = [
  {name: 'car_photo.jpg', size: '1.2 MB', img: icn.dummyCar, progress: 50},
  {name: 'car_photo.jpg', size: '1.2 MB', img: icn.dummyCar},
  {name: 'car_photo.jpg', size: '1.2 MB', img: icn.dummyCar},
];
const UploadImages = (): any => {
  const dispatch = useDispatch();
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const navigation = useNavigation();
  const {control, handleSubmit, trigger, formState, resetField} = useForm();
  const [photoUri, setPhotoUri] = useState<any>(undefined);
  const openGallery = (): any => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        setPhotoUri(response.assets?.[0].uri);
        if (response?.data) {
          setImagesData(prevImages => [
            ...(Array.isArray(prevImages) ? prevImages : []),
            ...(Array.isArray(response.data) ? response.data : [response.data])
          ]);
        }
      }
    });
  };
  const renderItem = ({item: any, index}: any) => {
    return (
      <View>
        <View style={styles.centerSpaceContainer}>
          <View style={styles.rowContainer}>
            <Image
              resizeMode="contain"
              source={icn.dummyCar}
              style={styles.car}
            />
            <View style={styles.imageDetailContainer}>
              <Text style={styles.imgName}>car_photo.jpg</Text>
              <Text style={styles.imgSize}>File Size: 1.2 MB</Text>
            </View>
          </View>
          {item?.progress && (
            <View style={styles.rowContainer}>
              <ProgressBar
                style={styles.progressBar}
                progress={0.8}
                color={Colors.primary}
              />
              <Text style={styles.progressText}>50%</Text>
            </View>
          )}
          <Image
            resizeMode="contain"
            source={item?.progress ? icn.cross : icn.imageDelete}
            style={styles.delete}
          />
        </View>
        {index != data?.length - 1 && <View style={styles.line}></View>}
      </View>
    );
  };
  return (
    <View style={styles.mainView}>
      <View style={styles.subContainer}>
        <Header
          title="Images"
          leftIcn={icn.back}
          leftIcnStyle={styles.backIcn}
          onLeftIconPress={() => navigation.goBack()}
        />
        <Text style={styles.heading}>Upload Images</Text>
        <View style={styles.dottedView}>
          <TouchableOpacity style={styles.verticalAlign} onPress={openGallery}>
            <Image
              resizeMode="contain"
              source={icn.imageSelect}
              style={styles.imgPicker}
            />
            <Text style={styles.dropText}>
              Drop your image here, or <Text style={styles.browse}>Browse</Text>
            </Text>
            <Text style={styles.dropSubText}>Maximum file size 50mb</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.bottomHeading}>Upload Images</Text>
        <FlatList
          renderItem={renderItem}
          data={data}
          showsVerticalScrollIndicator={false}
          style={{height:hp(35)}}
        />
        <PrimaryButton
          onPress={() => {}}
          style={styles.button}
          title="Submit"
        />
      </View>
    </View>
  );
};

export default UploadImages;
