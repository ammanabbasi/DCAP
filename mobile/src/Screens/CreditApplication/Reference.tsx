import {Controller, useFormContext} from 'react-hook-form';
import {Text} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useSelector} from 'react-redux';
import DropDown from '../../Components/DropDown';
import InputBox from '../../Components/InputBox';
import PrimaryButton from '../../Components/PrimaryButton';
import {hp} from '../../Theme/Responsiveness';
import {getName} from '../../Utils/helperFunctions';
import {styles} from './style';
export const Reference = props => {
  const {data, userType} = props || {};
  const {data: dropdownData} = useSelector((state: any) => state?.crmDropdownReducer);
  const {control, getValues, setValue, handleSubmit} = useFormContext();
  const allValues = getValues();
  const getReferenceName = (name: string) => {
    return getName(name, userType);
  };

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}>
      <Text style={styles.placeholderText}>First Name</Text>
      <Controller
        control={control}
        key={getReferenceName('applicantReferenceContactFirstName')}
        render={({field: {onChange, value}}) => (
          <InputBox
            placeholder="Enter first name"
            numberOfCharacter={80}
            value={value}
            onChangeText={onChange}
            borderLess
          />
        )}
        name={getReferenceName('applicantReferenceContactFirstName')}
      />
      <Text style={styles.placeholderText}>Middle Name</Text>
      <Controller
        control={control}
        key={getReferenceName('applicantReferenceContactMiddleName')}
        render={({field: {onChange, value}}) => (
          <InputBox
            placeholder="Enter middle name"
            numberOfCharacter={80}
            value={value}
            onChangeText={onChange}
            borderLess
          />
        )}
        name={getReferenceName('applicantReferenceContactMiddleName')}
      />
      <Text style={styles.placeholderText}>Last Name</Text>
      <Controller
        control={control}
        key={getReferenceName('applicantReferenceContactLastName')}
        render={({field: {onChange, value}}) => (
          <InputBox
            placeholder="Enter last name"
            numberOfCharacter={80}
            value={value}
            onChangeText={onChange}
            borderLess
          />
        )}
        name={getReferenceName('applicantReferenceContactLastName')}
      />
      <Text style={styles.placeholderText}>Phone</Text>
      <Controller
        control={control}
        key={getReferenceName('applicantReferenceContactPhone')}
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
        name={getReferenceName('applicantReferenceContactPhone')}
      />
      <Text style={styles.placeholderText}>Street</Text>
      <Controller
        control={control}
        key={getReferenceName('applicantReferenceContactStreetAddress')}
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
        name={getReferenceName('applicantReferenceContactStreetAddress')}
      />
      <Text style={styles.placeholderText}>Street Number</Text>
      <Controller
        control={control}
        key={getReferenceName('applicantReferenceContactStreetNo')}
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
        name={getReferenceName('applicantReferenceContactStreetNo')}
      />
      <Text style={styles.placeholderText}>Zip</Text>
      <Controller
        control={control}
        key={getReferenceName('applicantReferenceContactZipcode')}
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
        name={getReferenceName('applicantReferenceContactZipcode')}
      />
      <Text style={styles.placeholderText}>City</Text>
      <Controller
        control={control}
        key={getReferenceName('applicantReferenceContactCity')}
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
        name={getReferenceName('applicantReferenceContactCity')}
      />
      <Text style={styles.placeholderText}>State</Text>
      <Controller
        control={control}
        key={getReferenceName('applicantReferenceContactState')}
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
        name={getReferenceName('applicantReferenceContactState')}
      />
      <Text style={styles.placeholderText}>Relationship</Text>
      <DropDown
        data={dropdownData?.relationship}
        placeholder={'Select'}
        valueField="value"
        labelField="label"
        value={Number(
          allValues[getReferenceName('applicantContactRelationshipID')],
        )}
        setValue={value => {
          setValue(getReferenceName('applicantContactRelationshipID'), value);
        }}
        rightIcon
      />
      <PrimaryButton
        style={{marginTop: hp(5)}}
        title="Save"
        onPress={handleSubmit(props?.onSave)}
      />
    </KeyboardAwareScrollView>
  );
};
