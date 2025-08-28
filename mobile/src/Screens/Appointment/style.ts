import {StyleSheet} from 'react-native';
import {Colors} from '../../Theme/Colors';
import {hp, wp} from '../../Theme/Responsiveness';
import Typography from '../../Theme/Typography';

export const styles = StyleSheet.create({
  mainView: {
    backgroundColor: 'white',
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: wp(3),
  },
  placeholderText: {
    color: Colors.black,
    fontFamily: Typography?.poppins?.Medium,
    fontSize: wp(4),
    marginTop: hp(2),
    marginBottom: hp(1),
  },
  submitButton: {
    marginTop: hp(4),
    marginBottom: hp(2),
  },
}); 