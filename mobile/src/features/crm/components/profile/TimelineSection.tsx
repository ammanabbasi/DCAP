import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../../../Theme/Colors';
import { hp, wp } from '../../../../Theme/Responsiveness';
import { format } from 'date-fns';

interface TimelineItem {
  id: string;
  type: 'task' | 'note' | 'appointment' | 'email' | 'sms' | 'call' | 'vehicle';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  user?: {
    id: number;
    name: string;
  };
}

interface TimelineSectionProps {
  data: TimelineItem[];
  isLoading: boolean;
  onRefresh: () => void;
  refreshing: boolean;
  onItemPress?: (item: TimelineItem) => void;
}

export const TimelineSection: React.FC<TimelineSectionProps> = ({
  data,
  isLoading,
  onRefresh,
  refreshing,
  onItemPress,
}) => {
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [data]);

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'task':
        return '✓';
      case 'note':
        return '📝';
      case 'appointment':
        return '📅';
      case 'email':
        return '✉️';
      case 'sms':
        return '💬';
      case 'call':
        return '📞';
      case 'vehicle':
        return '🚗';
      default:
        return '•';
    }
  };

  const getItemColor = (type: string) => {
    switch (type) {
      case 'task':
        return Colors.primary;
      case 'note':
        return Colors.secondary;
      case 'appointment':
        return Colors.warning;
      case 'email':
        return Colors.info;
      case 'sms':
        return Colors.success;
      case 'call':
        return Colors.danger;
      case 'vehicle':
        return Colors.purple;
      default:
        return Colors.gray;
    }
  };

  const renderTimelineItem = ({ item }: { item: TimelineItem }) => {
    const color = getItemColor(item.type);
    const icon = getItemIcon(item.type);

    return (
      <TouchableOpacity
        style={styles.timelineItem}
        onPress={() => onItemPress?.(item)}
        activeOpacity={0.7}
      >
        <View style={styles.timelineLeft}>
          <View style={[styles.iconContainer, { backgroundColor: color }]}>
            <Text style={styles.icon}>{icon}</Text>
          </View>
          <View style={[styles.timelineLine, { backgroundColor: color }]} />
        </View>
        
        <View style={styles.timelineContent}>
          <View style={styles.contentHeader}>
            <Text style={styles.itemType}>{item.type.toUpperCase()}</Text>
            <Text style={styles.timestamp}>
              {format(new Date(item.timestamp), 'MMM dd, yyyy h:mm a')}
            </Text>
          </View>
          
          <Text style={styles.itemTitle}>{item.title}</Text>
          {item.description && (
            <Text style={styles.itemDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          
          {item.user && (
            <Text style={styles.userName}>by {item.user.name}</Text>
          )}
          
          {item.status && (
            <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
              <Text style={[styles.statusText, { color }]}>
                {item.status}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading timeline...</Text>
      </View>
    );
  }

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>No Timeline Events</Text>
      <Text style={styles.emptyDescription}>
        Timeline events will appear here as activities are added
      </Text>
    </View>
  );

  return (
    <FlatList
      data={sortedData}
      renderItem={renderTimelineItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.primary]}
        />
      }
      ListEmptyComponent={ListEmptyComponent}
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
  timelineItem: {
    flexDirection: 'row',
    marginBottom: hp(3),
  },
  timelineLeft: {
    width: wp(10),
    alignItems: 'center',
  },
  iconContainer: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    zIndex: 1,
  },
  icon: {
    fontSize: wp(3.5),
    color: Colors.white,
  },
  timelineLine: {
    position: 'absolute',
    top: wp(8),
    bottom: -hp(3),
    width: 2,
    backgroundColor: Colors.lightGray,
  },
  timelineContent: {
    flex: 1,
    marginLeft: wp(3),
    backgroundColor: Colors.white,
    borderRadius: wp(2),
    padding: wp(3),
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(0.5),
  },
  itemType: {
    fontSize: wp(2.8),
    color: Colors.gray,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  timestamp: {
    fontSize: wp(2.8),
    color: Colors.gray,
  },
  itemTitle: {
    fontSize: wp(3.8),
    color: Colors.black,
    fontWeight: '500',
    marginBottom: hp(0.5),
  },
  itemDescription: {
    fontSize: wp(3.2),
    color: Colors.darkGray,
    lineHeight: hp(2.5),
    marginBottom: hp(1),
  },
  userName: {
    fontSize: wp(3),
    color: Colors.gray,
    fontStyle: 'italic',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
    borderRadius: wp(1),
    marginTop: hp(0.5),
  },
  statusText: {
    fontSize: wp(2.8),
    fontWeight: '600',
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
    paddingHorizontal: wp(10),
  },
});