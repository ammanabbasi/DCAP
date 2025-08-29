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
import { useDeleteNoteMutation } from '../../../../store/api/crmApi';

interface Note {
  noteId: number;
  description: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
  };
}

interface NotesSectionProps {
  notes: Note[];
  isLoading: boolean;
  onRefresh: () => void;
  refreshing: boolean;
  onAddNote: () => void;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  notes,
  isLoading,
  onRefresh,
  refreshing,
  onAddNote,
}) => {
  const [deleteNote] = useDeleteNoteMutation();
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());

  const toggleExpanded = (noteId: number) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  };

  const handleDeleteNote = (note: Note) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNote(note.noteId).unwrap();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete note');
            }
          },
        },
      ]
    );
  };

  const renderNote = ({ item }: { item: Note }) => {
    const isExpanded = expandedNotes.has(item.noteId);
    const shouldTruncate = item.description.length > 150;

    return (
      <TouchableOpacity
        style={styles.noteItem}
        onPress={() => shouldTruncate && toggleExpanded(item.noteId)}
        activeOpacity={0.7}
      >
        <View style={styles.noteHeader}>
          <View style={styles.noteInfo}>
            <Text style={styles.noteAuthor}>
              {item.user?.name || 'Unknown User'}
            </Text>
            <Text style={styles.noteDate}>
              {format(new Date(item.createdAt), 'MMM dd, yyyy h:mm a')}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteNote(item)}
          >
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
        
        <Text
          style={styles.noteText}
          numberOfLines={isExpanded ? undefined : 4}
        >
          {item.description}
        </Text>
        
        {shouldTruncate && !isExpanded && (
          <Text style={styles.readMore}>Read more...</Text>
        )}
        
        {item.updatedAt !== item.createdAt && (
          <Text style={styles.editedText}>
            Edited: {format(new Date(item.updatedAt), 'MMM dd, yyyy h:mm a')}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading notes...</Text>
      </View>
    );
  }

  const ListHeaderComponent = () => (
    <TouchableOpacity style={styles.addButton} onPress={onAddNote}>
      <Text style={styles.addButtonIcon}>📝</Text>
      <Text style={styles.addButtonText}>Add New Note</Text>
    </TouchableOpacity>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>No Notes Yet</Text>
      <Text style={styles.emptyDescription}>
        Add notes to keep track of important information
      </Text>
    </View>
  );

  const sortedNotes = [...notes].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <FlatList
      data={sortedNotes}
      renderItem={renderNote}
      keyExtractor={(item) => item.noteId.toString()}
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
    backgroundColor: Colors.secondary,
    padding: wp(3),
    borderRadius: wp(2),
    marginBottom: hp(2),
  },
  addButtonIcon: {
    fontSize: wp(5),
    marginRight: wp(2),
  },
  addButtonText: {
    fontSize: wp(3.8),
    color: Colors.white,
    fontWeight: '600',
  },
  noteItem: {
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
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp(1),
  },
  noteInfo: {
    flex: 1,
  },
  noteAuthor: {
    fontSize: wp(3.5),
    fontWeight: '600',
    color: Colors.black,
    marginBottom: hp(0.25),
  },
  noteDate: {
    fontSize: wp(3),
    color: Colors.gray,
  },
  deleteButton: {
    padding: wp(1),
  },
  deleteIcon: {
    fontSize: wp(4),
  },
  noteText: {
    fontSize: wp(3.5),
    color: Colors.darkGray,
    lineHeight: hp(2.5),
  },
  readMore: {
    fontSize: wp(3.2),
    color: Colors.primary,
    marginTop: hp(0.5),
    fontWeight: '500',
  },
  editedText: {
    fontSize: wp(2.8),
    color: Colors.gray,
    marginTop: hp(1),
    fontStyle: 'italic',
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