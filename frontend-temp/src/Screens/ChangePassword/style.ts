import {StyleSheet} from 'react-native';
import {Colors} from '../../Theme/Colors';
import {hp, wp} from '../../Theme/Responsiveness';
import Typography from '../../Theme/Typography';

export const styles = StyleSheet.create({
  mainView: {
    backgroundColor: 'white',
    flex: 1,
  },
  userInfoContainer: {
    paddingHorizontal: wp(3),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom:hp(2)
  },
  subContainer: {
    paddingHorizontal: wp(3),
  },
  leftIcn: {
    width: wp(4.5),
    height: hp(2.1),
  },
  contentContainer: {paddingBottom: hp(3), flexGrow: 1,paddingHorizontal:wp(3)},
  infoText: {
    color: Colors.black,
    fontFamily: Typography?.poppins?.Medium,
    fontSize: wp(3.8),
    marginLeft: wp(2),
  },
  spaceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontFamily: Typography?.poppins?.Medium,
    color: Colors.black,
    fontSize: wp(4.4),
    marginTop: hp(7),
  },
  userEmail: {
    fontFamily: Typography?.poppins?.Regular,
    color: Colors.greyIcn,
    fontSize: wp(3.3),
    marginBottom: hp(2),
  },
  userImg: {width: wp(25), height: wp(25), borderRadius: wp(100)},
  profileHeader: {
    backgroundColor: Colors.primary,
    paddingHorizontal: wp(3),
    paddingBottom: hp(10),
    zIndex:1
  },
  imgContainer: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: hp(-6),
    zIndex: 1000,
  },
  whiteRadius: {
    padding: wp(1.3),
    backgroundColor: 'white',
    borderRadius: wp(50),
    alignSelf: 'center',
  },
  penIcn: {
    width: wp(7),
    height: hp(3.5),
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  error: {
    maxWidth: wp(43),
    marginTop: hp(0.4),
    marginLeft: wp(0.8),
    color: 'red',
    fontSize: wp(3.3),
    fontFamily: Typography?.poppins?.Regular,
  },
  bluePlaceholderText: {
    color: Colors.primary,
    fontSize: wp(3.5),
    fontFamily: Typography?.poppins?.Medium,
    marginBottom: hp(0.8),
  },
  blackPlaceholderText: {
    color: Colors.black,
    fontSize: wp(3.5),
    fontFamily: Typography?.poppins?.Medium,
    marginBottom: hp(0.8),
  },
  controller: {
    marginBottom: hp(2),
  },
  button: {
    marginTop: hp(22),
  },
  penContainer: {position: 'absolute', bottom: 0, right: 0},
});
