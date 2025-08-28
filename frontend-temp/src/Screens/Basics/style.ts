import {StyleSheet} from 'react-native';
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
    marginTop:hp(2),
    marginBottom: hp(0.5),
  },
  ageText: {
    color: Colors.greyIcn,
    fontSize: wp(3.3),
    fontFamily: Typography?.poppins?.Regular,
    marginTop:hp(2),
  },
  content:{paddingBottom: hp(5),paddingHorizontal:wp(3)},
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

  dropdownView: {height: hp(7.1), width: wp(94)},
  dropdown: {
    backgroundColor: Colors.dullWhite,
    borderRadius: wp(2),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(2),
    paddingVertical: hp(1.5),
  },
  dropdownContainer: {
    backgroundColor: Colors.dullWhite,
    height: hp(30),
    borderRadius: wp(2),
    marginTop: hp(1),
  },
  selected: {
    backgroundColor: Colors.green,
    borderRadius: wp(1),
    color: 'red',
    borderColor: Colors.grey,
  },
  itemTextStyle: {
    fontSize: wp(3.5),
    color: Colors.greyIcn,
    fontFamily: Typography?.poppins?.Regular,
  },
  placeholderStyle: {
    paddingLeft: wp(3),
    fontSize: wp(3.5),
    color: Colors.greyIcn,
    fontFamily: Typography?.poppins?.Regular,
  },
  selectedTextStyle: {
    backgroundColor: Colors.dullWhite,
    paddingLeft: wp(3),
    fontSize: rfs(13),
    color: Colors.black,
    fontFamily: Typography?.poppins?.Regular,
  },
  arrow: {width: wp(4.4), height: hp(2.2)},
  switchContainerStyle:{
    marginTop: 16,
    width: wp(15),
    height: hp(3.3),
    borderRadius: 25,
    padding: 5,
    borderColor:Colors.lightWhite,
    borderWidth:wp(0.3)
  },
  circleStyle:{
    width: wp(5),
    height: wp(5),
    borderRadius: 20,
  },
  activityIndicator: {
    position: 'absolute',
    alignSelf: 'center',
    top: hp(42),
  },
});
