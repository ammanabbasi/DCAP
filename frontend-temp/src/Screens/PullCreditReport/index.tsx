import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {Dropdown} from 'react-native-element-dropdown';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useDispatch} from 'react-redux';
import {icn} from '../../Assets/icn';
import Header from '../../Components/Header';
import InputBox from '../../Components/InputBox';
import PrimaryButton from '../../Components/PrimaryButton';
import {Colors} from '../../Theme/Colors';
import {hp, wp} from '../../Theme/Responsiveness';
import {styles} from './style';
import DropDown from '../../Components/DropDown';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import Typography from '../../Theme/Typography';

const dropdownData = [
  {label: 'Option', value: 'Value'},
  {label: 'Option', value: 'Value'},
  {label: 'Option', value: 'Value'},
  {label: 'Option', value: 'Value'},
  {label: 'Option', value: 'Value'},
  {label: 'Option', value: 'Value'},
];
const PullCreditReport = (): any => {
  const dispatch = useDispatch();
  const navigation: any = useNavigation();
  const [yearValue, setYearValue] = useState<any>(null);
  const [isEQUIFAX, setIsEQUIFAX] = useState<boolean>(false);
  const [isEXPERIAN, setIsEXPERIAN] = useState<boolean>(false);
  const [isTRANSUNION, setIsTRANSUNION] = useState<boolean>(false);
  const [isPREQUALIFY, setIsPREQUALIFY] = useState<boolean>(false);
  const {control, handleSubmit, trigger, formState, resetField} = useForm();
  return (
    <View style={styles.mainView}>
      <Header
        title="Pull Credit Report"
        leftIcn={icn.back}
        style={styles.subContainer}
        leftIcnStyle={styles.backIcn}
        onLeftIconPress={() => navigation.goBack()}
      />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <Text style={styles.blackPlaceholderText}>
          Please mark checkbox and pull report.
        </Text>
        <View style={styles.checkboxTabContainer}>
          <View style={styles.centerSpaceContainer}>
            <BouncyCheckbox
              size={wp(5)}
              style={{width: wp(44)}}
              isChecked={isEQUIFAX}
              onPress={() => setIsEQUIFAX(!isEQUIFAX)}
              text="EQUIFAX"
              textStyle={{
                textDecorationLine: 'none',
                color: '#15161F',
              }}
              textContainerStyle={{marginLeft: wp(2)}}
              innerIconStyle={{
                borderRadius: wp(1),
                borderWidth: wp(0.4),
                borderColor: Colors.primary,
                backgroundColor: isEQUIFAX ? Colors.primary : 'transparent',
              }}
              iconImageStyle={{width: wp(3), height: hp(1), marginRight: 0}}
            />
            <BouncyCheckbox
              size={wp(5)}
              isChecked={isEXPERIAN}
              onPress={() => setIsEXPERIAN(!isEXPERIAN)}
              text="EXPERIAN"
              textStyle={{
                textDecorationLine: 'none',
                color: '#15161F',
              }}
              textContainerStyle={{marginLeft: wp(2)}}
              innerIconStyle={{
                borderRadius: wp(1),
                borderWidth: wp(0.4),
                borderColor: Colors.primary,
                backgroundColor: isEXPERIAN ? Colors.primary : 'transparent',
              }}
              iconImageStyle={{width: wp(3), height: hp(1), marginRight: 0}}
            />
          </View>
          <View style={styles.checkboxRow}>
            <BouncyCheckbox
              size={wp(5)}
              style={{width: wp(44)}}
              isChecked={isTRANSUNION}
              onPress={() => setIsTRANSUNION(!isTRANSUNION)}
              text="TRANSUNION"
              textStyle={{
                textDecorationLine: 'none',
                color: '#15161F',
              }}
              textContainerStyle={{marginLeft: wp(2)}}
              innerIconStyle={{
                borderRadius: wp(1),
                borderWidth: wp(0.4),
                borderColor: Colors.primary,
                backgroundColor: isTRANSUNION ? Colors.primary : 'transparent',
              }}
              iconImageStyle={{width: wp(3), height: hp(1), marginRight: 0}}
            />
            <BouncyCheckbox
              size={wp(5)}
              isChecked={isPREQUALIFY}
              onPress={() => setIsPREQUALIFY(!isPREQUALIFY)}
              text="PRE - QUALIFY"
              textStyle={{
                textDecorationLine: 'none',
                color: '#15161F',
              }}
              textContainerStyle={{marginLeft: wp(2)}}
              innerIconStyle={{
                borderRadius: wp(1),
                borderWidth: wp(0.4),
                borderColor: Colors.primary,
                backgroundColor: isPREQUALIFY ? Colors.primary : 'transparent',
              }}
              iconImageStyle={{width: wp(3), height: hp(1), marginRight: 0}}
            />
          </View>
        </View>
        <Text style={styles.placeholderText}>Comment</Text>
        <Controller
          control={control}
          rules={{
            required: 'Comment is required',
          }}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="Type here..."
              numberOfCharacter={300}
              value={value}
              onChangeText={onChange}
              style={{height: hp(16), alignItems: 'flex-start'}}
              inputStyle={{
                height: hp(16),
                textAlignVertical: 'top',
                width: wp(90),
              }}
              multiline
            />
          )}
          name="comment"
        />
        {formState?.errors?.comment && (
          <Text style={styles.error}>Comment is required</Text>
        )}
        <PrimaryButton
          style={{marginTop: hp(45)}}
          title="Save"
          onPress={() => {}}
        />
      </KeyboardAwareScrollView>
    </View>
  );
};

export default PullCreditReport;
