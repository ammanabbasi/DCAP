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
    marginTop: hp(2),
    marginBottom: hp(0.5),
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
  actionIcn: {width: wp(3), height: hp(1.5)},

  dropdownView: {height: hp(7.1), width: wp(94)},
  dropdown: {
    backgroundColor: Colors.dullWhite,
    borderRadius: wp(2),
    borderColor: Colors.primary,
    borderWidth: wp(0.25),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(2),
    paddingVertical: hp(1.5),
  },
  smallDropdown: {
    backgroundColor: Colors.dullWhite,
    borderRadius: wp(2),
    width: wp(42),
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

  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(2),
  },

  button: {
    marginTop: hp(7),
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
  dropText: {
    color: Colors.black,
    fontSize: wp(3.5),
    fontFamily: Typography?.poppins?.Regular,
    marginTop: hp(1),
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
  maxCharText: {
    color: Colors.greyIcn,
    fontSize: wp(3.2),
    marginTop: hp(1),
    fontFamily: Typography?.poppins?.Regular,
  },
  imgPicker: {width: wp(10), height: hp(4)},
  actionButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.8),
    borderRadius: wp(2),
  },
  actionText: {color: Colors.white, fontSize: wp(3.4), marginHorizontal: wp(3)},
  simplePlaceholder: {
    color: Colors.black,
    fontSize: wp(3.7),
    fontFamily: Typography?.poppins?.Regular,
  },
  bottomActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp(2),
  },
  editor: {
    padding: 0,
    margin:0,
    minHeight: hp(15),
  },
  editorContainer: {
    marginTop: hp(2),
    backgroundColor: Colors.dullWhite,
    overflow: 'hidden',
    borderRadius: wp(2),
  },
  line: {
    height: hp(0.14),
    width:'93%',
    marginLeft:wp(3.5),
    backgroundColor: Colors.dashBoardInactive,
  },
  fileInfoContainer: {
    marginTop: hp(1),
    width:wp(40),
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    backgroundColor: Colors.primary,
    borderRadius: wp(2),
  },
  fileName: {
    color: Colors.white,
    fontSize: wp(3.5),
    fontFamily: Typography?.poppins?.Medium,
  },
});
