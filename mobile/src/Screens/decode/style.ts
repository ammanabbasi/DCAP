import {StyleSheet} from 'react-native';
import {Colors, rgba} from '../../Theme/Colors';
import {hp, wp} from '../../Theme/Responsiveness';
import Typography from '../../Theme/Typography';

export const styles = StyleSheet.create({
  mainView: {
    backgroundColor: Colors.primary,
    flex: 1,
  },
  subContainer: {
    paddingHorizontal: wp(3),
  },
  centerRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  startRowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  centerSpaceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backIcn: {
    width: wp(4.4),
    height: hp(2.2),
  },
  line: {
    marginVertical: hp(2),
    backgroundColor: rgba(Colors.grey, 0.1),
    height: hp(0.1),
    width: '100%',
  },
  alignText: {
    color: rgba(Colors.white, 0.7),
    fontSize: wp(3.6),
    marginTop: hp(5),
    width: wp(80),
    alignSelf: 'center',
    textAlign: 'center',
    fontFamily: Typography?.poppins?.Regular,
  },
  cam: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.primary,
  },
  camContainer: {
    width: wp(80),
    height: hp(40),
    overflow: 'hidden',
    marginTop: hp(15),
    borderRadius: wp(4),
    alignSelf: 'center',
    backgroundColor: Colors.primary,
  },
  button: {
    position: 'absolute',
    bottom: hp(5),
    alignSelf: 'center',
  },
  successText: {
    color: Colors.white,
    fontSize: wp(4.4),
    marginTop: hp(1),
    width: wp(80),
    alignSelf: 'center',
    textAlign: 'center',
    fontFamily: Typography?.poppins?.Regular,
  },
  description: {
    color: rgba(Colors.white, 0.7),
    fontSize: wp(3.4),
    marginTop: hp(1.5),
    width: wp(75),
    alignSelf: 'center',
    textAlign: 'center',
    fontFamily: Typography?.poppins?.Regular,
  },
  successImg: {
    width: wp(50),
    height: hp(20),
    marginTop: hp(15),
    alignSelf: 'center',
  },
  sync: {
    width: wp(12),
    height: hp(6),
    marginTop: hp(1),
    alignSelf: 'center',
  },
  vinInput: {
    borderWidth: wp(0.3),
    borderRadius: wp(2),
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    width: wp(60),
    alignSelf: 'center',
    color:Colors.white,
    borderColor:Colors.white,
    marginTop:hp(2)
  },
  decodeButton: {
    width:wp(60),
    marginTop:hp(3),
    alignSelf: 'center',
    marginBottom:hp(2)
  },
  scanText: {
    color: Colors.white,
    fontSize: wp(4.4),
    marginTop: hp(1),
    alignSelf: 'center',
    textAlign: 'center',
    fontFamily: Typography?.poppins?.SemiBold,
  },
});
