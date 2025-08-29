import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Colors } from '../../../../Theme/Colors';
import { hp, wp } from '../../../../Theme/Responsiveness';
import { format } from 'date-fns';
import { useDeleteDocumentMutation } from '../../../../store/api/crmApi';
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';

interface Document {
  documentId: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedAt: string;
  uploadedBy?: {
    id: number;
    name: string;
  };
}

interface DocumentsSectionProps {
  documents: Document[];
  isLoading: boolean;
  onRefresh: () => void;
  refreshing: boolean;
  onAddDocument: () => void;
}

export const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  documents,
  isLoading,
  onRefresh,
  refreshing,
  onAddDocument,
}) => {
  const [deleteDocument] = useDeleteDocumentMutation();
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('word') || fileType.includes('doc')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('video')) return '🎥';
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleViewDocument = async (document: Document) => {
    try {
      setDownloadingId(document.documentId);
      
      // Download file to temp directory
      const localFile = `${RNFS.TemporaryDirectoryPath}/${document.fileName}`;
      const options = {
        fromUrl: document.url,
        toFile: localFile,
      };
      
      await RNFS.downloadFile(options).promise;
      
      // Open file with native viewer
      await FileViewer.open(localFile);
    } catch (error) {
      Alert.alert('Error', 'Failed to open document');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDeleteDocument = (document: Document) => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${document.fileName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDocument(document.documentId).unwrap();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete document');
            }
          },
        },
      ]
    );
  };

  const renderDocument = ({ item }: { item: Document }) => {
    const isDownloading = downloadingId === item.documentId;
    const icon = getFileIcon(item.fileType);

    return (
      <TouchableOpacity
        style={styles.documentItem}
        onPress={() => handleViewDocument(item)}
        disabled={isDownloading}
        activeOpacity={0.7}
      >
        <View style={styles.documentIcon}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
        
        <View style={styles.documentInfo}>
          <Text style={styles.fileName} numberOfLines={1}>
            {item.fileName}
          </Text>
          <View style={styles.metaInfo}>
            <Text style={styles.fileSize}>
              {formatFileSize(item.fileSize)}
            </Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.uploadDate}>
              {format(new Date(item.uploadedAt), 'MMM dd, yyyy')}
            </Text>
            {item.uploadedBy && (
              <>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.uploadedBy}>
                  {item.uploadedBy.name}
                </Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.actions}>
          {isDownloading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleViewDocument(item)}
              >
                <Text style={styles.viewIcon}>👁️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteDocument(item)}
              >
                <Text style={styles.deleteIcon}>🗑️</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading documents...</Text>
      </View>
    );
  }

  const ListHeaderComponent = () => (
    <TouchableOpacity style={styles.addButton} onPress={onAddDocument}>
      <Text style={styles.addButtonIcon}>📤</Text>
      <Text style={styles.addButtonText}>Upload Document</Text>
    </TouchableOpacity>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📁</Text>
      <Text style={styles.emptyTitle}>No Documents</Text>
      <Text style={styles.emptyDescription}>
        Upload documents to keep all files in one place
      </Text>
    </View>
  );

  return (
    <FlatList
      data={documents}
      renderItem={renderDocument}
      keyExtractor={(item) => item.documentId.toString()}
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
    backgroundColor: Colors.info,
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
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: wp(2),
    padding: wp(3),
    marginBottom: hp(1.5),
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.84,
    elevation: 1,
  },
  documentIcon: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(2),
    backgroundColor: Colors.lightGray + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  iconText: {
    fontSize: wp(6),
  },
  documentInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: wp(3.8),
    color: Colors.black,
    fontWeight: '500',
    marginBottom: hp(0.5),
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  fileSize: {
    fontSize: wp(3),
    color: Colors.gray,
  },
  separator: {
    fontSize: wp(3),
    color: Colors.gray,
    marginHorizontal: wp(1),
  },
  uploadDate: {
    fontSize: wp(3),
    color: Colors.gray,
  },
  uploadedBy: {
    fontSize: wp(3),
    color: Colors.primary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: wp(2),
  },
  viewIcon: {
    fontSize: wp(4),
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