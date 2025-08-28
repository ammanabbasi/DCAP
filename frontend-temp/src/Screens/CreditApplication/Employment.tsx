import {useEffect, useState} from 'react';
import {Controller, useForm, useFormContext} from 'react-hook-form';
import {Text, TouchableOpacity, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import DropDown from '../../Components/DropDown';
import InputBox from '../../Components/InputBox';
import PrimaryButton from '../../Components/PrimaryButton';
import {Colors} from '../../Theme/Colors';
import {hp, wp} from '../../Theme/Responsiveness';
import Typography from '../../Theme/Typography';
import {styles} from './style';
import {getName} from '../../Utils/helperFunctions';
export const Employment = props => {
  const {data, userType} = props || {};
  const [receivedUnderValue, setReceivedUnderValue] = useState<any>(null);
  const [isEmploymentSelected, setIsEmploymentSelected] = useState<boolean>(true);
  const {control, reset, formState, getValues, handleSubmit} = useFormContext();
  const prefix = isEmploymentSelected ? 'applicantEmployment' : 'applicantPrevEmployment';
  const getEmploymentName = (name: string) => {
    console.log('Get Employment Name is : ' , getName(name, userType, prefix));
    return getName(name, userType, prefix);
  };
  return (
    <View>
      <View style={styles.addressTabContainer}>
        <TouchableOpacity
          onPress={() => setIsEmploymentSelected(true)}
          style={[
            {
              borderBottomWidth: isEmploymentSelected ? wp(0.3) : 0,
            },
            styles.addressTab,
          ]}>
          <Text
            style={{
              color: isEmploymentSelected ? Colors.primary : Colors.greyIcn,
              fontFamily: isEmploymentSelected
                ? Typography?.poppins?.Medium
                : Typography?.poppins?.Regular,
              fontSize: wp(4),
            }}>
            Employment
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsEmploymentSelected(false)}
          style={[
            {
              borderBottomWidth: !isEmploymentSelected ? wp(0.3) : 0,
            },
            styles.addressTab,
          ]}>
          <Text
            style={{
              color: !isEmploymentSelected ? Colors.primary : Colors.greyIcn,
              fontFamily: !isEmploymentSelected
                ? Typography?.poppins?.Medium
                : Typography?.poppins?.Regular,
              fontSize: wp(4),
            }}>
            Previous Employment
          </Text>
        </TouchableOpacity>
      </View>
      <KeyboardAwareScrollView
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.addressContent}>
        <Text style={[styles.placeholderText, {marginTop: 0}]}>Name</Text>
        <Controller
          control={control}
          key={getEmploymentName('name')}
          rules={{
            required: 'Name is required',
          }}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="Enter name"
              numberOfCharacter={80}
              value={value}
              onChangeText={onChange}
              borderLess
            />
          )}
          name={getEmploymentName('name')}
        />
        {formState.errors[getEmploymentName('name')] && (
          <Text style={styles.error}>Name is required</Text>
        )}
        <Text style={styles.placeholderText}>Job Title</Text>
        <Controller
          control={control}
          key={getEmploymentName('JobTitle')}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="Enter job title"
              numberOfCharacter={80}
              value={value}
              onChangeText={onChange}
              borderLess
            />
          )}
          name={getEmploymentName('JobTitle')}
        />
        <Text style={styles.placeholderText}>Gross Income</Text>
        <Controller
          control={control}
          key={getEmploymentName('GrossIncome')}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="Enter gross income"
              numberOfCharacter={80}
              value={value}
              onChangeText={onChange}
              borderLess
            />
          )}
          name={getEmploymentName('grossIncome')}
        />
        <Text style={styles.placeholderText}>Years</Text>
        <Controller
          control={control}
          key={getEmploymentName('InYears')}
          rules={{
            required: 'Years is required',
          }}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="Enter years"
              numberOfCharacter={80}
              keyboardType="dialpad"
              value={value}
              onChangeText={onChange}
              borderLess
            />
          )}
          name={getEmploymentName('InYears')}
        />
        {formState.errors[getEmploymentName('InYears')] && (
          <Text style={styles.error}>Years is required</Text>
        )}
        <Text style={styles.placeholderText}>Months</Text>
        <Controller
          control={control}
          key={getEmploymentName('InMonths')}
          rules={{
            required: 'Months is required',
          }}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="Enter months"
              numberOfCharacter={80}
              keyboardType="dialpad"
              value={value}
              onChangeText={onChange}
              borderLess
            />
          )}
          name={getEmploymentName('InMonths')}
        />
        {formState.errors[getEmploymentName('InMonths')] && (
          <Text style={styles.error}>Months is required</Text>
        )}
        <Text style={styles.placeholderText}>Street</Text>
        <Controller
          control={control}
          key={getEmploymentName('StreetAddress')}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="Enter street"
              numberOfCharacter={80}
              keyboardType="dialpad"
              value={value}
              onChangeText={onChange}
              borderLess
            />
          )}
          name={getEmploymentName('StreetAddress')}
        />
        <Text style={styles.placeholderText}>Street Number</Text>
        <Controller
          control={control}
          key={getEmploymentName('StreetNo')}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="Enter street number"
              numberOfCharacter={80}
              keyboardType="dialpad"
              value={value}
              onChangeText={onChange}
              borderLess
            />
          )}
          name={getEmploymentName('StreetNo')}
        />
        <Text style={styles.placeholderText}>Zip</Text>
        <Controller
          control={control}
          key={getEmploymentName('Zipcode')}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="Enter zip"
              numberOfCharacter={80}
              keyboardType="dialpad"
              value={value}
              onChangeText={onChange}
              borderLess
            />
          )}
          name={getEmploymentName('Zipcode')}
        />
        <Text style={styles.placeholderText}>City</Text>
        <Controller
          control={control}
          key={getEmploymentName('city')}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="Enter city"
              numberOfCharacter={80}
              keyboardType="dialpad"
              value={value}
              onChangeText={onChange}
              borderLess
            />
          )}
          name={getEmploymentName('city')}
        />
        <Text style={styles.placeholderText}>State</Text>
        <Controller
          control={control}
          key={getEmploymentName('state')}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="Enter state"
              numberOfCharacter={80}
              keyboardType="dialpad"
              value={value}
              onChangeText={onChange}
              borderLess
            />
          )}
          name={getEmploymentName('state')}
        />
        <Text style={styles.placeholderText}>Phone</Text>
        <Controller
          control={control}
          key={getEmploymentName('phone')}
          render={({field: {onChange, value}}) => (
            <InputBox
              placeholder="Enter phone"
              numberOfCharacter={80}
              keyboardType="dialpad"
              value={value}
              onChangeText={onChange}
              borderLess
            />
          )}
          name={getEmploymentName('phone')}
        />
        {isEmploymentSelected && (
          <View>
            <Text style={styles.placeholderText}>Other Income</Text>
            <Controller
              control={control}
              key={getEmploymentName('otherIncome')}
              render={({field: {onChange, value}}) => (
                <InputBox
                  placeholder="Enter other income"
                  numberOfCharacter={80}
                  value={value}
                  onChangeText={onChange}
                  borderLess
                />
              )}
              name={getEmploymentName('otherIncome')}
            />
            <Text style={styles.placeholderText}>Source</Text>
            <Controller
              control={control}
              key={getEmploymentName('source')}
              render={({field: {onChange, value}}) => (
                <InputBox
                  placeholder="Enter source"
                  numberOfCharacter={80}
                  value={value}
                  onChangeText={onChange}
                  borderLess
                />
              )}
              name={getEmploymentName('source')}
            />
            <Text style={styles.placeholderText}>Received Under</Text>
            <DropDown
              data={[]}
              placeholder={'Select'}
              value={receivedUnderValue}
              setValue={setReceivedUnderValue}
              rightIcon
            />
          </View>
        )}
        <PrimaryButton
          style={{marginTop: hp(5)}}
          title="Save"
          onPress={handleSubmit(props?.onSave)}
        />
      </KeyboardAwareScrollView>
    </View>
  );
};
