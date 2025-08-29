import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {Colors} from '../Theme/Colors';

// Define props interface
interface LoadingModalProps {
  visible: boolean;
  message?: string;
}

const LoadingModal: React.FC<LoadingModalProps> = ({visible, message}) => {
  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <ActivityIndicator
            size="large"
            color={Colors.black}
          />
          <Text style={styles.okButtonText}>
            {message ? message : 'Please wait ...'}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alertContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: '5%',
    width: '40%',
    alignItems: 'center',
  },

  okButton: {
    backgroundColor: '#E8E8E8',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  okButtonText: {
    color: Colors.black,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: 'Lato-Bold',
    marginTop: 10,
  },
});

export default LoadingModal;
