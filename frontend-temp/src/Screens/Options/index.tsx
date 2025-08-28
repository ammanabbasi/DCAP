import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Platform,
  SectionList,
  Text,
  View,
} from 'react-native';
import SwitchToggle from 'react-native-switch-toggle';
import Toast from 'react-native-toast-message';
import {useDispatch} from 'react-redux';
import {icn} from '../../Assets/icn';
import Header from '../../Components/Header';
import PrimaryButton from '../../Components/PrimaryButton';
import {updateVehicleOptions, vehicleOptions} from '../../Services/apis/APIs';
import {Colors} from '../../Theme/Colors';
import {hp, wp} from '../../Theme/Responsiveness';
import {styles} from './style';
import LoadingModal from '../../Components/LoadingModal';
const Options = ({route}: any): any => {
  const params = route?.params;
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [sections, setSections] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<any>(true);
  const [isModal, setIsModal] = useState<any>(false);
  const initialSections = useRef([]);
  const processBackendData = (backendData:any) => {
    const sections = Object.entries(backendData).map(([category, optionsArray]: any) => ({
        title: category, data: optionsArray?.map((option:any) => ({
          optionId: option?.optionId,
          description: option?.description,
          status: option?.status || false,
        })),
      }),
    );

    setSections(sections);
    initialSections?.current = JSON.parse(JSON.stringify(sections)); // Deep copy for immutability

  };
  const flattenSections = (): any => {
    return sections?.flatMap((section: any, sectionIndex: any) =>
      section?.data?.filter((item: any, itemIndex: any) => {
        const initialItem = initialSections?.current?.[sectionIndex]?.data?.[itemIndex];
        return initialItem && item?.status !== initialItem?.status;
      }),
    ).map(({optionId: any, status}: any) => ({
      optionId,
      status,
    }));
  };
  const getVehicleOptionsData = async () => {
    try {
      setIsLoading(true);
      const payload = {
        VehicleID: params?.vehicleId,
      };
      const response = await vehicleOptions(payload);
      processBackendData(response?.data?.options);
    } catch (error: any) {
      console.log(error);
      Toast?.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setIsLoading(false);
    }
  };
  const onSave = async () => {
    try {
      setIsModal(true);
      const updated = flattenSections();
      const payload = {
        VehicleID: params?.vehicleId,
        updated: updated,
      };
      console.log('Sending payload:', payload);
      const response = await updateVehicleOptions(payload);
      console.log('API Response:', response);
      console.log('Response data:', response?.data);
      
      // Check if response is successful (even if undefined)
      if (response !== undefined || response?.status === 200) {
        Toast?.show({
          type: 'success',
          text1: 'Success',
          text2: 'Vehicle options updated successfully',
        });
        navigation?.goBack();
      } else {
        Toast?.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to update vehicle options',
        });
      }
    } catch (error: any) {
      console.log('Error occurred:', error);
      console.log('Error response:', error?.response?.data);
      Toast?.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setIsModal(false);
    }
  };
  useEffect(() => {
    getVehicleOptionsData();
  }, []);
  const handleToggle = (sectionIndex: any, itemId: any) => {
    setSections(currentSections => {
      const newSections = [...currentSections];
      const section = newSections[sectionIndex];
      const itemIndex = section?.data?.findIndex(
        item => item?.optionId === itemId,
      );

      if (itemIndex !== -1) {
        section?.data[itemIndex] = {
          ...section?.data[itemIndex],
          status: !section?.data[itemIndex].status,
        };
      }

      return newSections;
    });
  };
  const renderItem = ({item: any, index: any, section}: any) => {
    const sectionIndex = sections?.findIndex(s => s?.title === section?.title);
    return (<View style={styles?.centerSpaceContainer}>
        <Text style={styles?.placeholderText}>{item?.description}</Text>
        <SwitchToggle
          switchOn={item?.status}
          onPress={() => handleToggle(sectionIndex, item?.optionId)}
          backgroundColorOff={'white'}
          circleColorOff={Colors?.lightWhite}
          backgroundColorOn={'white'}
          circleColorOn={Colors?.parrot}
          containerStyle={{
            marginTop: 16,
            width: wp(15),
            height: hp(3.3),
            borderRadius: 25,
            padding: 5,
            borderColor: item?.status ? Colors?.parrot : Colors?.lightWhite,
            borderWidth: wp(0.3),
          }}
          circleStyle={styles?.circleStyle}
        />
      </View>
    );
  };
  const renderSectionHeader = ({section: {title}}) => (
    <Text style={styles?.title}>{title}</Text>
  );
  return (<View style={styles?.mainView}>
      <Header
        title="Options"
        style={styles?.subContainer}
        leftIcn={icn?.back}
        leftIcnStyle={styles?.backIcn}
        onLeftIconPress={() => navigation?.goBack()}
      />
      {isLoading ? (
        <ActivityIndicator
          color={Colors?.primary}
          style={styles?.activityIndicator}
          size={Platform?.OS == 'android' ? wp(11) : 'large'}
        />
      ) : (
        <View style={styles?.flex}>
          <SectionList
            sections={sections}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles?.content}
            renderItem={renderItem}
            keyExtractor={(item: any) => item?.optionId?.toString()}
            stickySectionHeadersEnabled={false}
            renderSectionHeader={renderSectionHeader}
          />
          <PrimaryButton style={styles?.button} title="Save" onPress={onSave} />
        </View>
      )}
      <LoadingModal visible={isModal} />
    </View>
  );
};

export default Options;
