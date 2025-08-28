import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const TryAgain = ({
  message = 'Something went wrong',
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) => {
  return (
    <View style={styles.overlay}>
      <View style={[styles.container, { backgroundColor: '#fff' }]}>
        <Text style={styles.title}>Oops!</Text>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity style={styles.button} onPress={onRetry} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width,
    height,
    backgroundColor: 'rgba(30, 30, 30, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  container: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: '#23272F', // removed, now set inline as white
    borderRadius: 18,
    marginHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
    minWidth: 260,
    maxWidth: 340,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF5A5F',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  message: {
    color: '#23272F',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 260,
  },
  button: {
    backgroundColor: '#FF5A5F',
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 24,
    marginTop: 8,
    shadowColor: '#FF5A5F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});

export default TryAgain;
