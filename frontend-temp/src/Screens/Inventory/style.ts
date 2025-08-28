import {StyleSheet} from 'react-native';
import {Colors} from '../../Theme/Colors';
import {hp, wp} from '../../Theme/Responsiveness';
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
  catIcnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dullWhite,
    paddingHorizontal: wp(1),
    paddingVertical: hp(0.7),
    borderRadius: wp(1),
  },
  chartIndicatorText: {
    color: Colors.black,
    fontSize: wp(4),
    fontFamily: Typography?.poppins?.Medium,
  },
  model: {
    color: Colors.black,
    fontSize: wp(3.7),
    textAlign: 'center',
    marginTop: hp(2),
    width: '85%',
    alignSelf: 'center',
    fontFamily: Typography?.poppins?.Regular,
  },
  categoriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp(2),
  },
  rowSpaceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.dullWhite,
    paddingHorizontal: wp(3),
    marginBottom: hp(2),
    paddingVertical: hp(1.5),
    borderRadius: wp(2),
  },
  iconStyle: {
    width: wp(5),
    height: hp(2.5),
  },
  forwardIcn: {
    width: wp(3),
    height: hp(2),
    alignSelf: 'flex-end',
  },
  img: {
    width: wp(38),
    height: hp(9),
    alignSelf: 'center',
    resizeMode:'contain',
  },
  listImg: {
    width: wp(18),
    height: hp(6),
  },
  listModel: {
    color: Colors.black,
    fontSize: wp(3.7),
    marginLeft: wp(3),
    fontFamily: Typography?.poppins?.Regular,
    width: '70%',
  },
  listForwardIcn: {
    width: wp(3),
    height: hp(2),
  },
  imgContainer: {
    paddingHorizontal: wp(0.3),
    paddingVertical: hp(0.7),
    borderRadius: wp(1),
  },
  icnContainer: {
    paddingHorizontal: wp(1.4),
    paddingVertical: hp(0.5),
    borderRadius: wp(1),
  },
  brandContainer: {
    backgroundColor: Colors.dullWhite,
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderRadius: wp(2),
    width: '47.5%',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: hp(3),
  },
  activityIndicator: {
    position: 'absolute',
    alignSelf: 'center',
    top: hp(40),
  },
  noDataAvailable: {
    color: Colors.black,
    fontSize: wp(4),
    alignSelf: 'center',
    fontFamily: Typography?.poppins?.Medium,
  },
  content: {paddingBottom: hp(20)},
  addIconContainer:{
    marginTop:hp(2),
    flexDirection:'row',
    alignSelf:'flex-end',
    alignItems:'center'
  },
  addIcn: {
    width: wp(7),
    height: wp(7),
  },
  scanIcn: {
    width: wp(7),
    height: wp(7),
    marginLeft:wp(3)
  },
});
