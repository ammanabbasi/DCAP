import {Controller, useFormContext} from 'react-hook-form';
import {Text, TouchableOpacity} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useSelector} from 'react-redux';
import DropDown from '../../Components/DropDown';
import InputBox from '../../Components/InputBox';
import PrimaryButton from '../../Components/PrimaryButton';
import {hp} from '../../Theme/Responsiveness';
import {getName} from '../../Utils/helperFunctions';
import {styles} from './style';
import DatePicker from 'react-native-date-picker';
import { useState } from 'react';

export const BasicInfo = (props:any) => {
  const {data, userType} = props || {};
  const {data: dropdownData} = useSelector((state: any) => state?.crmDropdownReducer);
  const {control, handleSubmit, formState, setValue, getValues} =
    useFormContext();
  const allValues = getValues();
  const getBasicInfoName = (name: string) => {
    return getName(name, userType);
  };
  const [open, setOpen] = useState<boolean>(false);
  const [dateValue, setDateValue] = useState<any>(new Date());
  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}>
      <Text style={styles.placeholderText}>First Name</Text>
      <Controller
        control={control}
        key={getBasicInfoName('firstName')}
        render={({field: {onChange, value}}) => (
          <InputBox
            placeholder="Enter first name"
            numberOfCharacter={80}
            value={value}
            onChangeText={onChange}
            borderLess
          />
        )}
        name={getBasicInfoName('firstName')}
      />
      {formState.errors[getBasicInfoName('firstName')] && (
        <Text style={styles.error}>First Name is required</Text>
      )}
      <Text style={styles.placeholderText}>Middle Name</Text>
      <Controller
        control={control}
        key={getBasicInfoName('middleName')}
        render={({field: {onChange, value}}) => (
          <InputBox
            placeholder="Enter middle name"
            numberOfCharacter={80}
            value={value}
            onChangeText={onChange}
            borderLess
          />
        )}
        name={getBasicInfoName('middleName')}
      />
      <Text style={styles.placeholderText}>Last Name</Text>
      <Controller
        control={control}
        key={getBasicInfoName('lastName')}
        render={({field: {onChange, value}}) => (
          <InputBox
            placeholder="Enter last name"
            numberOfCharacter={80}
            value={value}
            onChangeText={onChange}
            borderLess
          />
        )}
        name={getBasicInfoName('lastName')}
      />
      <Text style={styles.placeholderText}>DOB</Text>
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
      <DatePicker
        modal
        open={open}
        date={dateValue}
        mode={'date'}
        theme="light"
        onConfirm={selectedDate => {
          setOpen(false);
          setDateValue(selectedDate);
          setValue(getBasicInfoName('dob'), selectedDate);
        }}
        onCancel={() => {
          setOpen(false);
        }}
      />
      <Text style={styles.placeholderText}>SSN</Text>
      <Controller
        control={control}
        key={getBasicInfoName('ssn')}
        render={({field: {onChange, value}}) => (
          <InputBox
            placeholder="Enter Ssn"
            numberOfCharacter={80}
            value={value}
            onChangeText={onChange}
            borderLess
          />
        )}
        name={getBasicInfoName('ssn')}
      />
      <Text style={styles.placeholderText}>#DL</Text>
      <Controller
        control={control}
        key={getBasicInfoName('driverLicNo')}
        render={({field: {onChange, value}}) => (
          <InputBox
            placeholder="Enter Dl"
            numberOfCharacter={80}
            value={value}
            keyboardType="dialpad"
            onChangeText={onChange}
            borderLess
          />
        )}
        name={getBasicInfoName('driverLicNo')}
      />
      <Text style={styles.placeholderText}>Marital Status</Text>
      <DropDown
        data={dropdownData?.maritalStatus}
        placeholder={'Select'}
        labelField="label"
        valueField="value"
        value={Number(allValues[getBasicInfoName('maritalStatusId')])}
        setValue={value => {
          setValue(getBasicInfoName('maritalStatusId'), value);
        }}
        rightIcon
      />
      <Text style={styles.placeholderText}>No Of Dependents</Text>
      <Controller
        control={control}
        key={getBasicInfoName('applicantNoOfDependents')}
        render={({field: {onChange, value}}) => (
          <InputBox
            placeholder="Enter no of dependents"
            numberOfCharacter={80}
            value={value}
            keyboardType="dialpad"
            onChangeText={onChange}
            borderLess
          />
        )}
        name={getBasicInfoName('applicantNoOfDependents')}
      />
      <Text style={styles.placeholderText}>Age Of Dependents</Text>
      <Controller
        control={control}
        key={getBasicInfoName('applicantAgesOfDependents')}
        render={({field: {onChange, value}}) => (
          <InputBox
            placeholder="Enter age of dependents"
            numberOfCharacter={80}
            value={value}
            keyboardType="dialpad"
            onChangeText={onChange}
            borderLess
          />
        )}
        name={getBasicInfoName('applicantAgesOfDependents')}
      />
      <Text style={styles.placeholderText}>Living</Text>
      <DropDown
        data={dropdownData?.living}
        placeholder={'Select'}
        labelField="label"
        valueField="value"
        value={Number(allValues[getBasicInfoName('applicantLivingStatusId')])}
        setValue={value => {
          setValue(getBasicInfoName('applicantLivingStatusId'), value);
        }}
        rightIcon
      />
      <Text style={styles.placeholderText}>Rent/Mortgage</Text>
      <Controller
        control={control}
        key={getBasicInfoName('applicantRentOrMortgage')}
        rules={{
          required: 'Rent/Mortgage is required',
        }}
        render={({field: {onChange, value}}) => (
          <InputBox
            placeholder="Enter rent/mortgage"
            numberOfCharacter={80}
            value={value}
            keyboardType="dialpad"
            onChangeText={onChange}
            borderLess
          />
        )}
        name={getBasicInfoName('applicantRentOrMortgage')}
      />
      {formState.errors[getBasicInfoName('applicantRentOrMortgage')] && (
        <Text style={styles.error}>Rent/Mortgage is required</Text>
      )}
      <Text style={styles.placeholderText}>DL State</Text>
      <Controller
        control={control}
        key={getBasicInfoName('dlState')}
        render={({field: {onChange, value}}) => (
          <InputBox
            placeholder="Enter dl state"
            numberOfCharacter={80}
            value={value}
            onChangeText={onChange}
            borderLess
          />
        )}
        name={getBasicInfoName('dlState')}
      />
      <PrimaryButton
        style={{marginTop: hp(5)}}
        title="Save"
        onPress={handleSubmit(props?.onSave)}
      />
    </KeyboardAwareScrollView>
  );
};
