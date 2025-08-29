import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Colors } from '../../../../Theme/Colors';
import { hp, wp } from '../../../../Theme/Responsiveness';
import { format } from 'date-fns';
import { useDeleteTaskMutation, useUpdateTaskMutation } from '../../../../store/api/crmApi';

interface Task {
  taskId: number;
  taskName: string;
  taskTitle: string;
  description: string;
  dueDate: string;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
  assignedTo?: {
    id: number;
    name: string;
  };
}

interface TasksSectionProps {
  tasks: Task[];
  isLoading: boolean;
  onRefresh: () => void;
  refreshing: boolean;
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
}

export const TasksSection: React.FC<TasksSectionProps> = ({
  tasks,
  isLoading,
  onRefresh,
  refreshing,
  onAddTask,
  onEditTask,
}) => {
  const [deleteTask] = useDeleteTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);

  const handleToggleComplete = async (task: Task) => {
    try {
      setUpdatingTaskId(task.taskId);
      await updateTask({
        id: task.taskId,
        data: { completed: !task.completed },
      }).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to update task status');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleDeleteTask = (task: Task) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.taskTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(task.taskId).unwrap();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return Colors.danger;
      case 'medium':
        return Colors.warning;
      case 'low':
        return Colors.success;
      default:
        return Colors.gray;
    }
  };

  const renderTask = ({ item }: { item: Task }) => {
    const isUpdating = updatingTaskId === item.taskId;
    const priorityColor = getPriorityColor(item.priority);
    const isOverdue = new Date(item.dueDate) < new Date() && !item.completed;

    return (
      <TouchableOpacity
        style={[
          styles.taskItem,
          item.completed && styles.completedTask,
          isOverdue && styles.overdueTask,
        ]}
        onPress={() => onEditTask(item)}
        activeOpacity={0.7}
      >
        <View style={styles.taskHeader}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => handleToggleComplete(item)}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <View style={[styles.checkbox, item.completed && styles.checkboxCompleted]}>
                {item.completed && <Text style={styles.checkmark}>✓</Text>}
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.taskContent}>
            <Text style={[styles.taskTitle, item.completed && styles.completedText]}>
              {item.taskTitle}
            </Text>
            {item.description && (
              <Text
                style={[styles.taskDescription, item.completed && styles.completedText]}
                numberOfLines={2}
              >
                {item.description}
              </Text>
            )}
            
            <View style={styles.taskMeta}>
              {item.priority && (
                <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20' }]}>
                  <Text style={[styles.priorityText, { color: priorityColor }]}>
                    {item.priority}
                  </Text>
                </View>
              )}
              
              <Text style={[styles.dueDate, isOverdue && styles.overdueDueDate]}>
                {format(new Date(item.dueDate), 'MMM dd, yyyy')}
              </Text>
              
              {item.assignedTo && (
                <Text style={styles.assignedTo}>
                  @{item.assignedTo.name}
                </Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteTask(item)}
          >
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    );
  }

  const ListHeaderComponent = () => (
    <TouchableOpacity style={styles.addButton} onPress={onAddTask}>
      <Text style={styles.addButtonIcon}>+</Text>
      <Text style={styles.addButtonText}>Add New Task</Text>
    </TouchableOpacity>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>✅</Text>
      <Text style={styles.emptyTitle}>No Tasks Yet</Text>
      <Text style={styles.emptyDescription}>
        Tap the button above to create your first task
      </Text>
    </View>
  );

  const sortedTasks = [...tasks].sort((a, b) => {
    // Incomplete tasks first
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // Then by due date
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <FlatList
      data={sortedTasks}
      renderItem={renderTask}
      keyExtractor={(item) => item.taskId.toString()}
      contentContainerStyle={styles.container}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.primary]}
        />
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(10),
  },
  loadingText: {
    marginTop: hp(2),
    fontSize: wp(3.5),
    color: Colors.gray,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    padding: wp(3),
    borderRadius: wp(2),
    marginBottom: hp(2),
  },
  addButtonIcon: {
    fontSize: wp(5),
    color: Colors.white,
    marginRight: wp(2),
  },
  addButtonText: {
    fontSize: wp(3.8),
    color: Colors.white,
    fontWeight: '600',
  },
  taskItem: {
    backgroundColor: Colors.white,
    borderRadius: wp(2),
    padding: wp(3),
    marginBottom: hp(2),
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  completedTask: {
    opacity: 0.7,
    backgroundColor: Colors.lightGray + '30',
  },
  overdueTask: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.danger,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxContainer: {
    marginRight: wp(3),
    padding: wp(1),
  },
  checkbox: {
    width: wp(5),
    height: wp(5),
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: wp(1),
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: Colors.primary,
  },
  checkmark: {
    color: Colors.white,
    fontSize: wp(3),
    fontWeight: 'bold',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: wp(3.8),
    color: Colors.black,
    fontWeight: '500',
    marginBottom: hp(0.5),
  },
  taskDescription: {
    fontSize: wp(3.2),
    color: Colors.darkGray,
    marginBottom: hp(1),
    lineHeight: hp(2.2),
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: Colors.gray,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: wp(2),
  },
  priorityBadge: {
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
    borderRadius: wp(1),
  },
  priorityText: {
    fontSize: wp(2.8),
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dueDate: {
    fontSize: wp(3),
    color: Colors.gray,
  },
  overdueDueDate: {
    color: Colors.danger,
    fontWeight: '600',
  },
  assignedTo: {
    fontSize: wp(3),
    color: Colors.primary,
  },
  deleteButton: {
    padding: wp(2),
  },
  deleteIcon: {
    fontSize: wp(4),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(10),
  },
  emptyIcon: {
    fontSize: wp(15),
    marginBottom: hp(2),
  },
  emptyTitle: {
    fontSize: wp(4),
    color: Colors.black,
    fontWeight: '600',
    marginBottom: hp(1),
  },
  emptyDescription: {
    fontSize: wp(3.5),
    color: Colors.gray,
    textAlign: 'center',
  },
});