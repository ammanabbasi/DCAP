import { StyleSheet } from 'react-native';
import { Colors } from '../../../Theme/Colors';
import { hp, wp } from '../../../Theme/Responsiveness';
import Typography from '../../../Theme/Typography';

export const styles = StyleSheet.create({
  mainView: {
    backgroundColor: 'white',
    flex: 1,
  },
  image: {
    width: wp(50),
    height: hp(20),
    alignSelf: 'center',
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    marginTop:wp(10),
  },
  whiteSheet: {
    backgroundColor: 'white',
    borderStartStartRadius: wp(5),
    borderTopRightRadius:wp(5),
    paddingVertical: hp(2),
    paddingHorizontal: wp(3),
    flex:1,
  },
  error: {
    maxWidth: wp(43),
    marginTop:hp(0.4),
    marginLeft:wp(0.8),
    color: 'red',
    fontSize: wp(3.3),
    fontFamily: Typography?.poppins?.Regular,
  },
  signInText: {
    fontSize: wp(5),
    marginTop: hp(2),
    fontFamily: Typography?.poppins?.ExtraBold,
    color: Colors.black,
  },
  greetText: {
    fontSize: wp(3.7),
    fontFamily: Typography?.poppins?.Regular,
    color: Colors.grey,
    marginTop: hp(0.5),
    marginBottom: hp(4),
  },
  placeholderText: {
    color: Colors.primary,
    fontSize: wp(3.5),
    fontFamily: Typography?.poppins?.Medium,
    marginBottom: hp(0.8),
  },
  passwordPlaceholderText: {
    color: Colors.black,
    fontSize: wp(3.5),
    fontFamily: Typography?.poppins?.Medium,
    marginBottom: hp(0.8),
    marginTop:hp(3),
  },
  example: {
    color: Colors.grey,
    fontSize: wp(3.5),
    fontFamily: Typography?.poppins?.Regular,
    alignSelf: 'flex-end',
    marginTop: hp(1),
  },
  button: {
    
    // alignSelf:'flex-end',
  },
});
