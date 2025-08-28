import {useState} from 'react';
import {Controller, useFormContext} from 'react-hook-form';
import {Text, TouchableOpacity, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import InputBox from '../../Components/InputBox';
import PrimaryButton from '../../Components/PrimaryButton';
import {Colors} from '../../Theme/Colors';
import {hp, wp} from '../../Theme/Responsiveness';
import Typography from '../../Theme/Typography';
import {getName} from '../../Utils/helperFunctions';
import {styles} from './style';
export const Address = props => {
  const {data, userType} = props || {};
  const [isAddressSelected, setIsAddressSelected] = useState<boolean>(true);
  const {control, reset, getValues, formState, handleSubmit} = useFormContext();
  const prefix = isAddressSelected ? 'applicant' : 'applicantPrevious';
  const getAddressName = (name: string) => {
    console.log('name is : ' , name);
    console.log('GetName is : ' , getName(name, userType, prefix));
    return getName(name, userType, prefix);
  };
  const handleTabChange = selectCurrentAddress => {
    setIsAddressSelected(selectCurrentAddress);
  };

  

  return (
    <View>
      <View style={styles.addressTabContainer}>
        <TouchableOpacity
          onPress={() => handleTabChange(true)}
          style={[
            {
              borderBottomWidth: isAddressSelected ? wp(0.3) : 0,
            },
            styles.addressTab,
          ]}>
          <Text
            style={{
              color: isAddressSelected ? Colors.primary : Colors.greyIcn,
              fontFamily: isAddressSelected
                ? Typography?.poppins?.Medium
                : Typography?.poppins?.Regular,
              fontSize: wp(4),
            }}>
            Address
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleTabChange(false)}
          style={[
            {
              borderBottomWidth: !isAddressSelected ? wp(0.3) : 0,
            },
            styles.addressTab,
          ]}>
          <Text
            style={{
              color: !isAddressSelected ? Colors.primary : Colors.greyIcn,
              fontFamily: !isAddressSelected
                ? Typography?.poppins?.Medium
                : Typography?.poppins?.Regular,
              fontSize: wp(4),
            }}>
            Previous Address
          </Text>
        </TouchableOpacity>
      </View>
      <KeyboardAwareScrollView
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.addressContent}>
        <>
          <Text style={[styles.placeholderText, {marginTop: 0}]}>Street</Text>
          <Controller
            control={control}
            key={getAddressName('StreetAddress')}
            render={({field: {onChange, value}}) => (
              <InputBox
                placeholder="Enter street"
                numberOfCharacter={80}
                value={value}
                onChangeText={onChange}
                borderLess
              />
            )}
            name={getAddressName('StreetAddress')}
          />
          <Text style={styles.placeholderText}>Street Number</Text>
          <Controller
            control={control}
            key={getAddressName('StreetNo')}
            render={({field: {onChange, value}}) => (
              <InputBox
                placeholder="Enter street number"
                numberOfCharacter={80}
                value={value}
                keyboardType="dialpad"
                onChangeText={onChange}
                borderLess
              />
            )}
            name={getAddressName('StreetNo')}
          />
          <Text style={styles.placeholderText}>Zip</Text>
          <Controller
            control={control}
            key={getAddressName('Zipcode')}
            render={({field: {onChange, value}}) => (
              <InputBox
                placeholder="Enter zip"
                numberOfCharacter={80}
                value={value}
                onChangeText={onChange}
                borderLess
              />
            )}
            name={getAddressName('Zipcode')}
          />
          <Text style={styles.placeholderText}>Country</Text>
          <Controller
            control={control}
            key={getAddressName('County')}
            render={({field: {onChange, value}}) => (
              <InputBox
                placeholder="Enter Country"
                numberOfCharacter={80}
                value={value}
                onChangeText={onChange}
                borderLess
              />
            )}
            name={getAddressName('county')}
          />

          <Text style={styles.placeholderText}>City</Text>
          <Controller
            control={control}
            key={getAddressName('city')}
            render={({field: {onChange, value}}) => (
              <InputBox
                placeholder="Enter City"
                numberOfCharacter={80}
                value={value}
                onChangeText={onChange}
                borderLess
              />
            )}
            name={getAddressName('city')}
          />
          <Text style={styles.placeholderText}>State</Text>
          <Controller
            control={control}
            key={getAddressName('state')}
            render={({field: {onChange, value}}) => (
              <InputBox
                placeholder="Enter state"
                numberOfCharacter={80}
                value={value}
                onChangeText={onChange}
                borderLess
              />
            )}
            name={getAddressName('state')}
          />
          {props.isAddressSelected && (
            <View>
              <Text style={styles.placeholderText}>Email</Text>
              <Controller
                control={control}
                key={getAddressName('emailAddress')}
                rules={{
                  required: 'Email is required',
                }}
                render={({field: {onChange, value}}) => (
                  <InputBox
                    placeholder="Enter email"
                    numberOfCharacter={80}
                    value={value}
                    onChangeText={onChange}
                    borderLess
                  />
                )}
                name={getAddressName('emailAddress')}
              />
              {formState.errors[getAddressName('emailAddress')] && (
                <Text style={styles.error}>Email is required</Text>
              )}
            </View>
          )}

          <Text style={styles.placeholderText}>Years</Text>
          <Controller
            control={control}
            key={getAddressName('TimeAtAddressYears')}
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
            name={getAddressName('TimeAtAddressYears')}
          />
          <Text style={styles.placeholderText}>Months</Text>
          <Controller
            control={control}
            key={getAddressName('TimeAtAddressMonths')}
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
            name={getAddressName('TimeAtAddressMonths')}
          />
          {isAddressSelected && (
            <View>
              <Text style={styles.placeholderText}>Cell</Text>
              <Controller
                control={control}
                key={getAddressName('CellPhone')}
                rules={{
                  required: 'Cell is required',
                }}
                render={({field: {onChange, value}}) => (
                  <InputBox
                    placeholder="Enter cell"
                    numberOfCharacter={80}
                    keyboardType="dialpad"
                    value={value}
                    onChangeText={onChange}
                    borderLess
                  />
                )}
                name={getAddressName('CellPhone')}
              />
              {formState.errors[getAddressName('CellPhone')] && (
                <Text style={styles.error}>Cell is required</Text>
              )}
              <Text style={styles.placeholderText}>Home</Text>
              <Controller
                control={control}
                key={getAddressName('home')}
                render={({field: {onChange, value}}) => (
                  <InputBox
                    placeholder="Enter home"
                    numberOfCharacter={80}
                    value={value}
                    onChangeText={onChange}
                    borderLess
                  />
                )}
                name={getAddressName('home')}
              />
              <Text style={styles.placeholderText}>Work</Text>
              <Controller
                control={control}
                key={getAddressName('work')}
                render={({field: {onChange, value}}) => (
                  <InputBox
                    placeholder="Enter work"
                    numberOfCharacter={80}
                    value={value}
                    onChangeText={onChange}
                    borderLess
                  />
                )}
                name={getAddressName('work')}
              />
            </View>
          )}
          <PrimaryButton
            style={{marginTop: hp(5)}}
            title="Save"
            onPress={handleSubmit(props?.onSave)}
          />
        </>
      </KeyboardAwareScrollView>
    </View>
  );
};
