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
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: wp(2),
  },
  yesNoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: wp(3),
  },
  content: {paddingBottom: hp(5), paddingHorizontal: wp(3)},
  startRowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  centerSpaceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modelLayoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp(2),
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp(2),
    marginBottom: hp(1),
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp(1),
  },
  checkboxTabContainer: {marginTop: hp(2)},
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
  ipText: {
    color: Colors.black,
    fontSize: wp(3.7),
    fontFamily: Typography?.poppins?.Medium,
    marginTop: hp(2),
  },
  ipValueText: {
    color: Colors.greyIcn,
    fontSize: wp(3.7),
    fontFamily: Typography?.poppins?.Regular,
  },
  datePlaceholderText: {
    color: Colors.black,
    fontSize: wp(3.7),
    fontFamily: Typography?.poppins?.Regular,
  },
  ageText: {
    color: Colors.greyIcn,
    fontSize: wp(3.3),
    fontFamily: Typography?.poppins?.Regular,
    marginTop: hp(2),
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
  switchContainerStyle: {
    marginTop: 16,
    width: wp(15),
    height: hp(3.3),
    borderRadius: 25,
    padding: 5,
    borderColor: Colors.lightWhite,
    borderWidth: wp(0.3),
  },
  circleStyle: {
    width: wp(5),
    height: wp(5),
    borderRadius: 20,
  },
  cont: {
    marginTop: hp(3),
    flexDirection: 'row',
    alignItems: 'center',
  },
  accidentText: {
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(4),
    color: Colors.black,
  },
  yesNoText: {
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(3.8),
    color: Colors.black,
    marginLeft: wp(1),
  },
  blueDot: {
    backgroundColor: Colors.primary,
    width: wp(2.9),
    height: wp(2.9),
    borderRadius: wp(100),
  },
  outerCircle: {
    borderColor: Colors.primary,
    borderWidth: wp(0.3),
    width: wp(4),
    height: wp(4),
    borderRadius: wp(100),
    alignItems: 'center',
    justifyContent: 'center',
  },
  blackPlaceholderText: {
    color: Colors.black,
    fontSize: wp(3.5),
    fontFamily: Typography?.poppins?.Regular,
    marginLeft: wp(1),
    marginRight: wp(3),
  },
  tabText: {
    fontSize: wp(3),
    fontFamily: Typography?.poppins?.Regular,
    marginLeft: wp(2),
  },
  tabIcn: {
    width: wp(4.5),
    height: hp(2.25),
  },
  screenTabContainer: {
    backgroundColor: Colors.dullWhite,
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.9),
    borderRadius: wp(1.6),
    marginRight: wp(3),
  },
  reportIcn: {width: wp(5), height: hp(2.5)},
  printerIcn: {marginLeft: wp(3), width: wp(5), height: hp(2.5)},
  modalContainer: {
    backgroundColor: 'white',
    paddingHorizontal: wp(3),
    paddingTop: hp(2),
    paddingBottom: hp(5),
    borderRadius: wp(3),
    width: wp(80),
    alignSelf: 'center',
  },
  modelText: {
    color: Colors.black,
    fontFamily: Typography?.poppins?.SemiBold,
    fontSize: wp(5),
  },
  layoutText: {
    color: Colors.greyIcn,
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(3.7),
    marginLeft: wp(2),
  },
  crossIcn: {
    width: wp(6),
    height: hp(3),
  },
  forwardIcn: {width: wp(4), height: hp(1.7)},
  pageIcn: {
    width: wp(5),
    height: hp(2.5),
  },
  addressTab: {
    borderColor: Colors.primary,
    width: wp(44),
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(1),
  },
  addressTabContainer:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal:wp(3)
  },
  addressContent: {paddingBottom: hp(27), paddingHorizontal: wp(3)},
  mainScroll:{marginTop: hp(2)},
  rowView:{
    flexDirection: 'row',
    alignItems: 'center',
  },
  portion:{
    flex:1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical:hp(1.5),
  },
  portionText:{
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(4),
    color: Colors.black,
  },
  activityIndicator: {
    top: '45%',
    alignSelf: 'center',
    position:'absolute'
  },
});
