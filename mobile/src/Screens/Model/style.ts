import { StyleSheet } from 'react-native';
import { Colors } from '../../Theme/Colors';
import Typography from '../../Theme/Typography';

export const styles = StyleSheet.create({
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    width: '85%',
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  crossIcn: {
    width: 20,
    height: 20,
    tintColor: Colors.grey,
  },
  modalHeading: {
    fontSize: 18,
    fontFamily: Typography?.poppins?.Medium,
    color: Colors.black,
    marginTop: 10,
    marginBottom: 15,
  },
  confirmationText: {
    fontSize: 16,
    fontFamily: Typography?.poppins?.Regular,
    color: Colors.grey,
    marginBottom: 20,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  submitContainer: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.grey,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    marginRight: 10,
  },
  submitText: {
    color: Colors.grey,
    fontSize: 16,
    fontFamily: Typography?.poppins?.Medium,
    textAlign: 'center',
  },
  yesContainer: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
  },
  clearButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Typography?.poppins?.Medium,
    textAlign: 'center',
  },
});
