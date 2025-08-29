import { StyleSheet } from 'react-native';

export const styled = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  hiddenImage: {
    opacity: 0,
  },
  placeholder: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#f8f9fa',
    zIndex: 1,
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    fontWeight: '400',
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#ffe6e6',
    padding: 16,
  },
  fallbackText: {
    fontSize: 12,
    color: '#d32f2f',
    textAlign: 'center',
    fontWeight: '500',
  },
});