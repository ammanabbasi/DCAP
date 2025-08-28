import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Modal from 'react-native-modal';
import { styles } from './style';
import { icn } from '../../Assets/icn';

interface ModelProps {
    isVisible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

const Model = ({
    isVisible,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Yes',
    cancelText = 'No'
}: ModelProps) => {
    console.log('THIS IS IS VISIBLE', isVisible);
    
    return (
        <Modal backdropOpacity={0.5} isVisible={isVisible}>
            <View style={styles.modalView}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity
                        onPress={onClose}
                        style={{ alignSelf: 'flex-end' }}>
                        <Image source={icn.cross} style={styles.crossIcn} />
                    </TouchableOpacity>
                    <Text style={styles.modalHeading}>
                        {title}
                    </Text>
                    <Text style={styles.confirmationText}>
                        {message}
                    </Text>
                    <View style={styles.filterButtonsContainer}>
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.submitContainer}>
                            <Text style={styles.submitText}>{cancelText}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={onConfirm}
                            style={styles.yesContainer}>
                            <Text style={styles.clearButtonText}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default Model;