import {Platform, StyleSheet} from 'react-native';
import {Colors} from '../../Theme/Colors';
import {hp, rfs, wp} from '../../Theme/Responsiveness';
import Typography from '../../Theme/Typography';

export const styles = StyleSheet.create({
  mainView: {
    backgroundColor: 'white',
    flex: 1,
  },
  subContainer: {
    paddingHorizontal: wp(3),
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  carPropContainer: {
    flexDirection: 'row',
    marginTop: hp(1),
    flexWrap:'wrap'
  },
  priceTxt: {
    color: 'white',
    fontSize: wp(3.5),
    fontWeight:'400'
  },
  carName: {
    color: Colors.black,
    maxWidth:wp(40),
    fontSize: wp(3.7),
    // borderWidth:1,
    fontFamily: Typography?.poppins?.SemiBold,
  },
  optionName: {
    color: Colors.black,
    fontSize: wp(3.5),
    fontFamily: Typography?.poppins?.Regular,
  },
  itemContainer: {
    backgroundColor: Colors.dullWhite,
    paddingHorizontal: wp(2),
    paddingVertical: hp(1.2),
    borderRadius: wp(3),
    marginBottom: hp(2),
  },
  modalContainer: {
    backgroundColor: 'white',
    paddingHorizontal: wp(3),
    width:'95%',
    paddingVertical: hp(2),
    borderRadius: wp(5),

  },
  rowSpaceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    // flexWrap:'wrap',
    justifyContent: 'space-between',
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: wp(94),
    marginTop: hp(5),
  },
  optionSpaceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: hp(0.5),
  },
  searchContainer: {
    marginTop: hp(2.5),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowIcnContainer: {
    marginTop: hp(2.5),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  placeholderContainer: {
    marginVertical: hp(1),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconStyle: {
    width: wp(12),
    height: hp(6),
  },
  backIcn: {
    width: wp(4),
    height: hp(2),
  },
  img: {
    width: wp(80),
    height: hp(20),
    alignSelf: 'center',
    borderRadius:wp(2)
  },
  carImg: {
    width: wp(18),
    height: hp(7),
    borderRadius:wp(2)
  },
  listForwardIcn: {
    width: wp(3),
    height: hp(1.5),
    marginLeft: wp(0.5),
  },
  bottomIcn: {
    width: wp(8),
    height: hp(3.5),
  },
  crossIcn: {
    width: wp(6),
    height: hp(3),
  },
  printerIcn: {
    width: wp(5),
    height: hp(2.5),
  },
  optionIcn: {
    width: wp(5.5),
    height: hp(3),
    marginTop: hp(0.2),
  },
  searchBar: {width: wp(78), marginTop: 0},
  priceContainer: {
    backgroundColor: Colors.primary,
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.7),
    borderRadius: wp(5),
    marginLeft: wp(-20),
   
  },
  carInfoContainer: {
    marginLeft: hp(1.5),
    // borderWidth:1,
    flexDirection:'column',
    flexWrap:'wrap',
  },
  description: {
    color: Colors.greyIcn,
    // borderWidth:1,
    width:wp(55),
    flexDirection:'row',  
    flexWrap:'wrap',
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(3.1),
  },
  detailText: {
    color: Colors.black,
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(3.3),
  },
  detailContainer: {
    marginTop: hp(0.5),
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(3),
  },
  bottomView: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: wp(3),
    paddingBottom: Platform.OS == 'ios' ? hp(10) : hp(1),
    flexGrow:1,
  },
  indicatorContainer: {alignSelf: 'center'},
  crossContainer: {
    position: 'absolute',
    top: hp(1),
    right: Platform.OS == 'ios' ? wp(2) : wp(3),
  },
  optionText: {
    color: Colors.greyIcn,
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(3),
    marginRight: wp(1.5),
  },
  valueText: {
    color: Colors.black,
    fontFamily: Typography?.poppins?.Medium,
    fontSize: wp(3),
  },
  optionContainer: {
    position: 'relative',
    zIndex: 1000,
    backgroundColor: 'white',
    paddingHorizontal: wp(2),
    paddingVertical: hp(1),
    borderRadius: wp(2),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 24,
  },
  forwardIcn: {width: wp(3.5), height: hp(2), marginLeft: wp(3),marginBottom:hp(1)},
  modelText: {
    color: Colors.black,
    fontFamily: Typography?.poppins?.SemiBold,
    fontSize: wp(5),
  },
  button: {marginTop: hp(3), width: wp(84), alignSelf: 'center'},
  placeholderText: {
    color: Colors.primary,
    fontSize: wp(3.5),
    fontFamily: Typography?.poppins?.Medium,
    marginBottom: hp(0.5),
  },
  filterPlaceholderText: {
    color: Colors.primary,
    fontSize: wp(3.8),
    fontFamily: Typography?.poppins?.Medium,
    marginBottom: hp(0.5),
  },
  blackPlaceholderText: {
    color: Colors.black,
    fontSize: wp(3.5),
    fontFamily: Typography?.poppins?.Medium,
    marginLeft: wp(1),
  },
  filterBlackPlaceholderText: {
    color: Colors.black,
    fontSize: wp(3.8),
    fontFamily: Typography?.poppins?.Medium,
    marginLeft: wp(1),
    marginTop: hp(1),
    marginBottom: hp(0.4),
  },
  submitText: {
    color: Colors.black,
    fontSize: wp(3.8),
    fontFamily: Typography?.poppins?.Medium,
  },
  error: {
    maxWidth: wp(43),
    marginTop: hp(0.4),
    marginLeft: wp(0.8),
    color: 'red',
    fontSize: wp(3.3),
    fontFamily: Typography?.poppins?.Regular,
  },
  dropdown: {
    backgroundColor: Colors.dullWhite,
    borderRadius: wp(2),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(2),
    paddingVertical: hp(1.1),
    borderWidth: wp(0.2),
    borderColor: Colors.primary,
  },
  simpleDropdown: {
    backgroundColor: Colors.dullWhite,
    borderRadius: wp(2),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(2),
    paddingVertical: hp(1.1),
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
  printTop: {
    marginTop: hp(2),
  },
  filterContainer: {
    paddingHorizontal: wp(8),
    height: hp(5),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dullWhite,
    borderRadius: wp(2),
    marginRight: wp(3),
  },
  filterText: {
    fontSize: wp(3.7),
    color: Colors.black,
    fontFamily: Typography?.poppins?.Medium,
  },
  primaryInput: {
    width: wp(94),
    borderWidth: wp(0.2),
    borderColor: Colors.primary,
    color: Colors.black,
    paddingVertical: hp(1.2),
    borderRadius: wp(2),
    fontFamily: Typography?.poppins?.Regular,
    backgroundColor: Colors.dullWhite,
    paddingHorizontal: wp(4),
  },
  input: {
    width: wp(94),
    color: Colors.black,
    paddingVertical: hp(1.2),
    borderRadius: wp(2),
    fontFamily: Typography?.poppins?.Regular,
    backgroundColor: Colors.dullWhite,
    paddingHorizontal: wp(4),
  },
  upperIndicator: {
    backgroundColor: Colors.dashBoardInactive,
    paddingHorizontal: wp(5),
    paddingVertical: hp(0.3),
    borderRadius: wp(3),
  },
  lowerIndicator: {
    backgroundColor: Colors.dashBoardInactive,
    paddingHorizontal: wp(5),
    paddingVertical: hp(0.3),
    borderRadius: wp(3),
    marginTop: hp(0.3),
  },
  submitContainer: {
    paddingHorizontal: wp(12),
    paddingVertical: hp(1),
    borderRadius: wp(2),
    borderWidth: wp(0.3),
    borderColor: Colors.primary,
  },
  clearContainer: {
    paddingHorizontal: wp(8),
    paddingVertical: hp(1),
    borderRadius: wp(2),
    borderWidth: wp(0.2),
    backgroundColor: Colors.primary,
  },
  clearText: {
    width: wp(30),
    paddingVertical: hp(0.9),
    borderRadius: wp(2),
  },
  clearButtonText: {
    color: Colors.white,
    fontSize: wp(3.8),
    fontFamily: Typography?.poppins?.Medium,
  },
  activityIndicator: {
    position: 'absolute',
    alignSelf: 'center',
    top: hp(42),
  },
  noDataAvailable: {
    color: Colors.black,
    fontSize: wp(4),
    alignSelf: 'center',
    fontFamily: Typography?.poppins?.Medium,
  },
  verticalCenter:{
    alignItems:'center'
  },
  countText:{
    color: Colors.black,
    fontSize: wp(3.1),
    textAlign: 'center',
    width:wp(13),
    fontFamily: Typography?.poppins?.Regular,
  },
  tabletItemContainer: {
    marginBottom: hp(4),
  },
});
