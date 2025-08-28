import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
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
  updateCrmTask,
  addTask,
  getCategoryStatus,
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

const Task = ({route}: {route: RouteProp<any, any>}) => {
  const params = route?.params;
  const {control, handleSubmit, setValue} = useForm();
  const navigation = useNavigation();
  const user = useSelector((state: any) => state?.userReducer?.user);
  const { data } = useSelector((state: any) => state?.crmDropdownReducer);
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
  const [categoryStatus, setCategoryStatus] = useState<any[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [isDateClicked, setIsDateClicked] = useState<boolean>(false);
  const [taskData, setTaskData] = useState<any>(() => {
    if (params?.taskToEdit) {
      return {
        ...params.taskToEdit,
        dueDate: params?.taskToEdit?.dueDate ? new Date(params?.taskToEdit?.dueDate) : new Date(),
      };
    }
    return { dueDate: new Date() };
  });

  const { taskToEdit, onTaskEdited } = params || {};
  const isEditMode = !!taskToEdit;

  useEffect(() => {
    if (isEditMode && taskToEdit) {
      setValue('taskName', taskToEdit.taskName || taskToEdit.taskTitle || '');
      setValue('description', taskToEdit.description || '');
      setTaskData((prev:any) => ({
        ...prev,
        taskTypeId: taskToEdit.taskTypeId,
        categoryStatusID: taskToEdit.categoryStatusID,
        time: taskToEdit.time,
      }));
    } else {
      setValue('taskName', '');
      setValue('description', '');
    }
  }, [isEditMode, taskToEdit]);

  useEffect(() => {
    const fetchCategoryStatus = async () => {
      if (taskData?.taskTypeId) {
        try {
          const response = await getCategoryStatus({ taskTypeID: taskData.taskTypeId });
          setCategoryStatus(response?.data?.data || []);
        } catch (error: any) {
          console.error('Error fetching category status:', error);
        }
      }
    };
    fetchCategoryStatus();
  }, [taskData?.taskTypeId]);

  const updateTaskData = (key: string, value: any) => {
    setTaskData((prev:any) => ({ ...prev, [key]: value }));
  };

  const handleSaveTask = async (data: any) => {
    try {
      setIsModalLoading(true);
      const customerID = params?.item?.customerID || params?.item?.customerId;
      
      const getDueDateString = (val: any) => {
        if (!val) return new Date().toISOString().split('T')[0];
        if (val instanceof Date && !isNaN(val.getTime())) {
          return val.toISOString().split('T')[0];
        }
        if (typeof val === 'string') {
          const d = new Date(val);
          if (!isNaN(d.getTime())) {
            return d.toISOString().split('T')[0];
          }
          return val;
        }
        return new Date().toISOString().split('T')[0];
      };

      const payload = {
        taskName: data?.taskName || 'N/A',
        taskTitle: data?.taskName || 'N/A',
        taskTypeId: taskData?.taskTypeId || 1,
        categoryStatusID: taskData?.categoryStatusID || 1,
        customerID: customerID,
        dueDate: getDueDateString(taskData?.dueDate),
        description: data?.description || 'N/A',
        userID: user?.id,
        time: taskData?.time || '',
      } as any;
      
      if (isEditMode) {
        payload.taskId = taskToEdit.taskId;
        console.log('Update Task Payload:', payload);
        const response = await updateCrmTask(payload);
        console.log('Update response:', response);
      } else {
        console.log('Add Task Payload:', payload);
        const response = await addTask(payload);
        console.log('Add response:', response);
      }
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: isEditMode ? 'Task updated successfully' : 'Task added successfully',
      });

      if (onTaskEdited) {
        await onTaskEdited();
      }
      
      navigation.goBack();

    } catch (error: any) {
      console.error('Task save error:', error?.response?.data || error);
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

  const dateField = safeParseDate(taskData?.dueDate);

  return (
    <View style={styles.mainView}>
      <Header
        title={params?.title ? params?.title : isEditMode ? "Task" : "Task"}
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
              placeholder="Task title"
              value={value}
              onChangeText={onChange}
              numberOfCharacter={280}
              borderLess
            />
          )}
          name="taskName"
        />

        <Text style={styles.placeholderText}>Due Date</Text>
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
            value={taskData?.time || ''}
            style={{ paddingVertical: hp(0.4) }}
            onChangeText={() => {}}
            disabled
            rightIcon={icn.blueClock}
            numberOfCharacter={100}
          />
        </TouchableOpacity>

        <Text style={styles.placeholderText}>Task Type</Text>
        <DropDown
          data={data?.taskType || []}
          placeholder={'Select'}
          value={taskData?.taskTypeId}
          labelField="description"
          valueField="taskTypeId"
          setValue={(value: any) => updateTaskData('taskTypeId', value)}
          rightIcon
        />

        <Text style={styles.placeholderText}>Outcome</Text>
        <DropDown
          data={categoryStatus}
          placeholder={'Select'}
          value={taskData?.categoryStatusID}
          labelField="description"
          valueField="categoryStatusID"
          setValue={(value: any) => updateTaskData('categoryStatusID', value)}
          rightIcon
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

        <DatePicker
          modal
          open={open}
          date={dateField}
          mode={isDateClicked ? 'date' : 'time'}
          theme="light"
          onConfirm={date => {
            setOpen(false);
            if (isDateClicked) {
              updateTaskData('dueDate', date);
            } else {
              const formattedTime = new Date(date).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              });
              updateTaskData('time', formattedTime);
            }
          }}
          onCancel={() => setOpen(false)}
        />

        <PrimaryButton
          title={isEditMode ? "Add Task" : "Add Task"}
          style={styles.submitButton}
          onPress={handleSubmit(handleSaveTask)}
        />
      </ScrollView>
      <LoadingModal visible={isModalLoading} message={isEditMode ? "Updating..." : "Adding..."} />
    </View>
  );
};

export default Task; 