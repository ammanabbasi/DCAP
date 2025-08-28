import {StyleSheet} from 'react-native';
import {Colors} from '../../Theme/Colors';
import {hp, wp} from '../../Theme/Responsiveness';
import Typography from '../../Theme/Typography';
import DeviceInfo from 'react-native-device-info';
export const styles = StyleSheet.create({
  mainView: {
    backgroundColor: 'white',
    flex: 1,
  },
  subContainer: {
    paddingHorizontal: wp(3),
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {paddingBottom: hp(3), flexGrow: 1},
  infoContainer: {
    backgroundColor: Colors.primary,
    paddingHorizontal: wp(3),
    paddingVertical: hp(2),
    borderRadius: wp(3),
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoImg: {width: wp(10), height: hp(5), marginLeft: wp(2)},
  infoText: {
    color: Colors.black,
    fontFamily: Typography?.poppins?.Medium,
    fontSize: wp(3.8),
    marginLeft: wp(2),
  },
  infoHeadingText: {
    color: 'white',
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(3.4),
  },
  infoSubheadingText: {
    color: 'white',
    fontFamily: Typography?.poppins?.Bold,
    fontSize: wp(3.4),
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
    marginTop: DeviceInfo.isTablet()?hp(10):hp(7),
  },
  userEmail: {
    fontFamily: Typography?.poppins?.Regular,
    color: Colors.greyIcn,
    fontSize: wp(3.3),
    marginBottom: hp(2),
  },
  userImg: {width: wp(25), height: wp(25), borderRadius: wp(100)},
  blueContainer: {
    backgroundColor: Colors.primary,
    paddingHorizontal: wp(1.3),
    paddingVertical: wp(0.1),
    borderRadius: wp(100),
    marginLeft: wp(2),
  },
  leftIcn: {width: wp(4.5), height: hp(2.25)},
  rightIcn: {width: wp(4.7), height: hp(2.35)},
  profileHeader: {
    backgroundColor: Colors.primary,
    paddingHorizontal: wp(3),
    paddingBottom: DeviceInfo.isTablet()?hp(15): hp(10),
    zIndex:1
  },
  imgContainer: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: DeviceInfo.isTablet()?hp(-9):hp(-6),
    zIndex:100000
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
  },
  penContainer: {position: 'absolute', bottom: 0, right: 0,
  },
  optionContainer: {
    backgroundColor: Colors.dullWhite,
    width: wp(92),
    paddingHorizontal: wp(3),
    paddingVertical: hp(2),
    borderRadius: wp(3),
    marginTop: hp(2),
  },
  activityIndicator: {
    position: 'absolute',
    alignSelf: 'center',
    top: hp(40),
  },
});
