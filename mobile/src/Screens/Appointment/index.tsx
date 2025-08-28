import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
// import DatePicker from 'react-native-date-picker'; // Temporarily disabled
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import { icn } from '../../Assets/icn';
import DropDown from '../../Components/DropDown';
import Header from '../../Components/Header';
import InputBox from '../../Components/InputBox';
import LoadingModal from '../../Components/LoadingModal';
import PrimaryButton from '../../Components/PrimaryButton';
import { wp, hp } from '../../Theme/Responsiveness';
import {
  updateCrmAppointment,
  addAppointment,
  getCategoryStatus,
  crmDropdowns,
} from '../../Services/apis/APIs';
import { styles } from './style';
import type { RouteProp } from '@react-navigation/native';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const Appointment = ({route}: {route: RouteProp<any, any>}) => {
  const params = route?.params;
  const {control, handleSubmit, setValue} = useForm();
  const navigation = useNavigation();
  const user = useSelector((state: any) => state?.userReducer?.user);
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
  const [categoryStatus, setCategoryStatus] = useState<any[]>([]);
  const [attendeeData, setAttendeeData] = useState<any[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [isDateClicked, setIsDateClicked] = useState<boolean>(false);
  const [appointmentData, setAppointmentData] = useState<any>(() => {
    if (params?.appointmentToEdit) {
      return {
        ...params.appointmentToEdit,
        dueDate: params?.appointmentToEdit?.dueDate ? new Date(params?.appointmentToEdit?.dueDate) : new Date(),
      };
    }
    return { dueDate: new Date() };
  });

  const { appointmentToEdit, onAppointmentEdited } = params || {};
  const isEditMode = !!appointmentToEdit;

  useEffect(() => {
    if (isEditMode && appointmentToEdit) {
      setValue('taskName', appointmentToEdit.taskName || appointmentToEdit.taskTitle || '');
      setValue('description', appointmentToEdit.description || '');
      setValue('location', appointmentToEdit.location || '');
      setAppointmentData((prev:any) => ({
        ...prev,
        categoryStatusID: appointmentToEdit.categoryStatusID,
        attendeeID: appointmentToEdit.attendeeID,
        time: appointmentToEdit.time,
      }));
    } else {
      setValue('taskName', '');
      setValue('description', '');
      setValue('location', '');
    }
  }, [isEditMode, appointmentToEdit]);

  useEffect(() => {
    const fetchCategoryStatus = async () => {
      try {
        const response = await getCategoryStatus({ taskTypeID: 7 }); // 7 for appointments
        setCategoryStatus(response?.data?.data || []);
      } catch (error: any) {
        console.error('Error fetching category status:', error);
      }
    };
    fetchCategoryStatus();
  }, []);

  useEffect(() => {
    const fetchAttendeeData = async () => {
      try {
        const response = await crmDropdowns();
        setAttendeeData(response?.data?.attendee || []);
      } catch (error: any) {
        console.error('Error fetching attendee data:', error);
      }
    };
    fetchAttendeeData();
  }, []);

  const updateAppointmentData = (key: string, value: any) => {
    setAppointmentData((prev:any) => ({ ...prev, [key]: value }));
  };

  const handleSaveAppointment = async (data: any) => {
    try {
      setIsModalLoading(true);
      const customerID = params?.item?.customerID || params?.item?.customerId;
      
      if (isEditMode) {
        const payload = {
          appointmentID: appointmentToEdit.appointmentID,
          taskName: data?.taskName || '',
          dueDate: appointmentData?.dueDate,
          description: data?.description || '',
          categoryStatusID: appointmentData?.categoryStatusID || 1,
          location: data?.location || '',
          attendeeID: appointmentData?.attendeeID,
        };

        if (!payload.location || !payload.attendeeID || !payload.categoryStatusID) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'All required fields must be provided.',
          });
          return;
        }

        console.log('Update Appointment Payload:', payload);
        const response = await updateCrmAppointment(payload);
        console.log('Update response:', response);
      } else {
        const payload = {
          taskTitle: data?.taskName || '',
          dueDate: appointmentData?.dueDate,
          description: data?.description || '',
          categoryStatusID: appointmentData?.categoryStatusID || 1,
          location: data?.location || '',
          attendeeID: appointmentData?.attendeeID,
          interactionTypeID: 7, // 7 for appointments
          customerID: customerID,
          userID: user?.id,
        };

        if (!payload.interactionTypeID || !payload.customerID || !payload.dueDate || !payload.userID) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'All required fields must be provided.',
          });
          return;
        }

        console.log('Add Appointment Payload:', payload);
        const response = await addAppointment(payload);
        console.log('Add response:', response);
      }
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: isEditMode ? 'Appointment updated successfully' : 'Appointment added successfully',
      });

      if (onAppointmentEdited) {
        await onAppointmentEdited();
      }
      
      navigation.goBack();

    } catch (error: any) {
      console.error('Appointment save error:', error?.response?.data || error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setIsModalLoading(false);
    }
  };

  const safeParseDate = (val: any): Date => {
    if (!val || val === '' || val === 'Invalid Date') return new Date();
    const d = new Date(val);
    if (isNaN(d.getTime()) || d.getFullYear() < 1000 || d.getFullYear() > 9999) {
      return new Date();
    }
    return d;
  };

  const dateField = safeParseDate(appointmentData?.dueDate);

  return (
    <View style={styles.mainView}>
      <Header
        title={isEditMode ? "Edit Appointment" : "Add Appointment"}
        leftIcn={icn.back}
        style={{marginLeft: wp(3)}}
        onLeftIconPress={() => navigation.goBack()}
      />
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: hp(5) }}
      >
        <Text style={styles.placeholderText}>Title</Text>
        <Controller
          control={control}
          rules={{ required: 'Title is required' }}
          render={({ field: { onChange, value } }) => (
            <InputBox
              placeholder="Appointment title"
              value={value}
              onChangeText={onChange}
              numberOfCharacter={280}
              borderLess
            />
          )}
          name="taskName"
        />

        <Text style={styles.placeholderText}>From</Text>
        <TouchableOpacity
          onPress={() => {
            setIsDateClicked(true);
            setOpen(true);
          }}>
          <InputBox
            borderLess
            value={dateField?.toDateString()}
            style={{ paddingVertical: hp(0.4) }}
            onChangeText={() => {}}
            disabled
            rightIcon={icn.calender}
            numberOfCharacter={100}
          />
        </TouchableOpacity>

        <Text style={styles.placeholderText}>Time</Text>
        <TouchableOpacity
          onPress={() => {
            setIsDateClicked(false);
            setOpen(true);
          }}>
          <InputBox
            borderLess
            value={appointmentData?.time || ''}
            style={{ paddingVertical: hp(0.4) }}
            onChangeText={() => {}}
            disabled
            rightIcon={icn.blueClock}
            numberOfCharacter={100}
          />
        </TouchableOpacity>

        <Text style={styles.placeholderText}>Attendee</Text>
        <DropDown
          data={attendeeData}
          placeholder={'Select'}
          value={appointmentData?.attendeeID}
          labelField="attendeeName"
          valueField="attendeeID"
          setValue={(value: any) => updateAppointmentData('attendeeID', value)}
          rightIcon
        />

        <Text style={styles.placeholderText}>Outcome</Text>
        <DropDown
          data={categoryStatus}
          placeholder={'Select'}
          value={appointmentData?.categoryStatusID}
          labelField="description"
          valueField="categoryStatusID"
          setValue={(value: any) => updateAppointmentData('categoryStatusID', value)}
          rightIcon
        />

        <Text style={styles.placeholderText}>Where</Text>
        <Controller
          control={control}
          rules={{ required: 'Location is required' }}
          render={({ field: { onChange, value } }) => (
            <InputBox
              placeholder="Location"
              value={value}
              onChangeText={onChange}
              numberOfCharacter={280}
              borderLess
            />
          )}
          name="location"
        />

        <Text style={styles.placeholderText}>Description</Text>
        <Controller
          control={control}
          rules={{ required: 'Description is required' }}
          render={({ field: { onChange, value } }) => (
            <InputBox
              placeholder="Type here..."
              value={value}
              onChangeText={onChange}
              multiline
              numberOfCharacter={300}
              style={{ height: hp(16), alignItems: 'flex-start' }}
              inputStyle={{
                height: hp(16),
                textAlignVertical: 'top',
                width: wp(90),
              }}
            />
          )}
          name="description"
        />

        {/* DatePicker temporarily disabled - needs proper import */}
        {/*<DatePicker
          modal
          open={open}
          date={dateField}
          mode={isDateClicked ? 'date' : 'time'}
          theme="light"
          onConfirm={date => {
            setOpen(false);
            if (isDateClicked) {
              updateAppointmentData('dueDate', date);
            } else {
              const formattedTime = new Date(date).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              });
              updateAppointmentData('time', formattedTime);
            }
          }}
          onCancel={() => setOpen(false)}
        />*/}

        <PrimaryButton
          title={isEditMode ? "Update Appointment" : "Add Appointment"}
          style={styles.submitButton}
          onPress={handleSubmit(handleSaveAppointment)}
        />
      </ScrollView>
      <LoadingModal visible={isModalLoading} message={isEditMode ? "Updating..." : "Adding..."} />
    </View>
  );
};

export default Appointment; 