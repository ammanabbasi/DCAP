import {Platform, StyleSheet} from 'react-native';
import {Colors, rgba} from '../../Theme/Colors';
import {hp, rfs, rwp, wp} from '../../Theme/Responsiveness';
import Typography from '../../Theme/Typography';

export const styles = StyleSheet.create({
  mainView: {
    backgroundColor: 'white',
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
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  docInfoContainer: {
    alignItems: 'center',
    marginLeft: wp(2),
  },
  placeholderText: {
    color: Colors.black,
    fontSize: wp(3.7),
    fontFamily: Typography?.poppins?.Regular,
    marginTop: hp(2),
    marginBottom: hp(0.5),
  },
  heading: {
    color: Colors.black,
    fontSize: wp(5),
    fontFamily: Typography?.poppins?.Medium,
    marginTop: hp(4),
  },
  bottomHeading: {
    color: Colors.black,
    fontSize: wp(5),
    fontFamily: Typography?.poppins?.Medium,
    marginVertical: hp(2),
  },
  dottedView: {
    marginTop: hp(2),
    borderWidth: wp(0.3),
    borderColor: rgba(Colors.primary, 0.4),
    borderStyle: 'dashed',
    borderRadius: wp(3),
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(5),
  },
  error: {
    maxWidth: wp(43),
    marginTop: hp(0.4),
    marginLeft: wp(0.8),
    color: 'red',
    fontSize: wp(3.3),
    fontFamily: Typography?.poppins?.Regular,
  },
  name: {
    color: Colors.black,
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(3.7),
  },
  backIcn: {width: wp(4.4), height: hp(2.2)},
  arrow: {width: wp(4.4), height: hp(2.2)},
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(2),
  },
  button: {marginTop: Platform.OS == 'android' ? hp(7) : hp(3)},
  dropText: {
    color: Colors.black,
    fontSize: wp(3.5),
    fontFamily: Typography?.poppins?.Regular,
    marginTop: hp(2),
  },
  browse: {
    color: Colors.primary,
    textDecorationLine: 'underline',
    fontSize: wp(3.5),
    fontFamily: Typography?.poppins?.Regular,
    marginTop: hp(2),
  },
  dropSubText: {
    color: Colors.greyIcn,
    fontSize: wp(3.2),
    fontFamily: Typography?.poppins?.Regular,
  },
  imgPicker: {width: wp(9), height: hp(4.5)},
  verticalAlign: {alignItems: 'center'},
  imageDetailContainer: {marginLeft: wp(2)},
  imgName: {
    color: Colors.black,
    fontSize: wp(3.2),
    fontFamily: Typography?.poppins?.Medium,
  },
  imgSize: {
    color: Colors.greyIcn,
    marginTop: hp(0.4),
    fontSize: wp(3),
    fontFamily: Typography?.poppins?.Regular,
  },
  car: {width: wp(15), height: hp(7.5)},
  delete: {width: wp(4.4), height: hp(2.2)},
  line: {
    marginVertical: hp(2),
    backgroundColor: rgba(Colors.grey, 0.1),
    height: hp(0.1),
    width: '100%',
  },
  progressBar: {width: wp(30), height: hp(0.6), borderRadius: wp(4)},
  progressText: {
    color: Colors.greyIcn,
    marginLeft: wp(2.5),
    fontSize: wp(3),
    fontFamily: Typography?.poppins?.Regular,
  },
});
