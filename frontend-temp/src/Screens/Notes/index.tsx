import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {
  Text,
  View,
  ScrollView,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {useSelector} from 'react-redux';
import {icn} from '../../Assets/icn';
import Header from '../../Components/Header';
import InputBox from '../../Components/InputBox';
import LoadingModal from '../../Components/LoadingModal';
import PrimaryButton from '../../Components/PrimaryButton';
import {wp} from '../../Theme/Responsiveness'
import {
  addNote,
  updateCrmNote,
} from '../../Services/apis/APIs';
import {styles} from './style';
import type {RouteProp} from '@react-navigation/native';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}
const Notes = ({route}: {route: RouteProp<any, any>}) => {
  const params = route?.params;
  const {control, handleSubmit, setValue} = useForm();
  const navigation = useNavigation();
  const user = useSelector((state: any) => state?.userReducer?.user);
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
  const { noteToEdit, onNoteEdited } = params || {};
  const isEditMode = !!noteToEdit;
  useEffect(() => {
    if (isEditMode && noteToEdit) {
      setValue('description', noteToEdit.description || noteToEdit.Description || '');
    } else {
      setValue('description', '');
    }
  }, [isEditMode, noteToEdit]);

  const handleSaveNote = async (data: any) => {
    try {
      setIsModalLoading(true);
      const customerID = params?.item?.customerID || params?.item?.customerId;
      
      if (isEditMode) {
        const payload = { 
          noteId: noteToEdit.noteId || noteToEdit.NoteID,
          description: data.description 
        };
        console.log('Update Note Payload:', payload);
        const response = await updateCrmNote(payload);
        console.log('Update response:', response);
      } else {
        const payload = {
          description: data.description,
          userId: user?.id,
          customerID,
          objectID: customerID,
          objectTypeID: 6,
        };
        console.log('Add Note Payload:', payload);
        const response = await addNote(payload);
        console.log('Add response:', response);
      }
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: isEditMode ? 'Note updated successfully' : 'Note added successfully',
      });

      if (onNoteEdited) {
        await onNoteEdited();
      }
      
      navigation.goBack();

    } catch (error: any) {
      console.error('Note save error:', error?.response?.data || error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setIsModalLoading(false);
    }
  };

  return (
    <View style={styles.mainView}>
      <Header
        title={isEditMode ? "Note" : "Note"}
        leftIcn={icn.back}
        style={{marginLeft:wp(3)}}
        onLeftIconPress={() => navigation.goBack()}
      />
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        <Text style={styles.placeholderText}>Description</Text>
        <Controller
          control={control}
          rules={{ required: 'Description is required' }}
          render={({ field: { onChange, value } }) => (
            <InputBox
              placeholder="Type your note here..."
              value={value}
              onChangeText={onChange}
              multiline
              numberOfCharacter={350}
              style={{ 
                height: 120, 
                backgroundColor: '#f5f5f5', 
                marginTop: 10
              }}
            />
          )}
          name="description"
        />

        <PrimaryButton
          title={isEditMode ? "Send" : "Send"}
          style={styles.submitButton}
          onPress={handleSubmit(handleSaveNote)}
        />
      </ScrollView>
      <LoadingModal visible={isModalLoading} message={isEditMode ? "Updating..." : "Adding..."} />
    </View>
  );
};

export default Notes; 