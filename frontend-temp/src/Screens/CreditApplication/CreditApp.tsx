import {useNavigation} from '@react-navigation/native';
import {useState} from 'react';
import {Controller, useFormContext} from 'react-hook-form';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import DatePicker from 'react-native-date-picker';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {icn} from '../../Assets/icn';
import InputBox from '../../Components/InputBox';
import PrimaryButton from '../../Components/PrimaryButton';
import {Colors} from '../../Theme/Colors';
import {hp, wp} from '../../Theme/Responsiveness';
import {getName} from '../../Utils/helperFunctions';
import {styles} from './style';
export const CreditApp = (props: any) => {
  const {data, userType} = props || {};
  const [isCoBuyer, setIsCoBuyer] = useState<any>(null);
  const {control, handleSubmit, setValue, watch} = useFormContext();
  const navigation: any = useNavigation();
  const [open, setOpen] = useState<boolean>(false);
  const getCreditAppName = (name: string) => {
    return getName(name, userType);
  };
  const date = watch(getCreditAppName('creditAppDate'));
  const dateValue = date instanceof Date ? date : new Date();
  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}>
      <View style={styles.dateContainer}>
        <Text style={styles.datePlaceholderText}>Date</Text>
        <View style={styles.centerRowContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('PullCreditReport')}>
            <Image
              source={icn.creditReport}
              style={styles.reportIcn}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={props?.onPrintPress}>
            <Image
              source={icn.printer}
              style={styles.printerIcn}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => {
          setOpen(true);
        }}>
        <InputBox
          borderLess
          value={dateValue.toDateString()}
          style={{paddingVertical: hp(0.4)}}
          onChangeText={() => {}}
          disabled
        />
      </TouchableOpacity>
      <Text style={styles.placeholderText}>Down Payment</Text>
      <Controller
        control={control}
        key={getCreditAppName('downPayment')}
        render={({field: {onChange, value}}) => (
          <InputBox
            placeholder="Enter down payment"
            numberOfCharacter={80}
            value={value}
            keyboardType="dialpad"
            onChangeText={onChange}
            borderLess
          />
        )}
        name={getCreditAppName('downPayment')}
      />
      <View>
        <Text style={styles.placeholderText}>Loan Term</Text>
        <Controller
          control={control}
          key={getCreditAppName('loanTerm')}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="Enter loan term"
              numberOfCharacter={80}
              value={value}
              keyboardType="dialpad"
              onChangeText={onChange}
              borderLess
            />
          )}
          name={getCreditAppName('loanTerm')}
        />
      </View>
      <BouncyCheckbox
        size={wp(5)}
        isChecked={isCoBuyer}
        onPress={() => setIsCoBuyer(!isCoBuyer)}
        text="Co-Buyer"
        textStyle={{
          textDecorationLine: 'none',
          color: '#15161F',
        }}
        textContainerStyle={{marginLeft: wp(2)}}
        style={{marginTop: hp(2)}}
        innerIconStyle={{
          borderRadius: wp(1),
          borderWidth: wp(0.4),
          borderColor: Colors.primary,
          backgroundColor: isCoBuyer ? Colors.primary : 'transparent',
        }}
        iconImageStyle={{width: wp(3), height: hp(1), marginRight: 0}}
      />
      <Text style={styles.placeholderText}>Comment</Text>
      <Controller
        control={control}
        key={getCreditAppName('comments')}
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
        name={getCreditAppName('comments')}
      />
      <Text style={styles.ipText}>
        Request IP
        <Text style={styles.ipValueText}> {data?.requestIP}</Text>
      </Text>
      <PrimaryButton
        style={{marginTop: hp(5)}}
        title="Save"
        onPress={handleSubmit(props?.onSave)}
      />
      <DatePicker
        modal
        open={open}
        date={dateValue}
        mode={'date'}
        theme="light"
        onConfirm={selectedDate => {
          setOpen(false);
          setValue(getCreditAppName('creditAppDate'), selectedDate);
        }}
        onCancel={() => {
          setOpen(false);
        }}
      />
    </KeyboardAwareScrollView>
  );
};
