import {Platform, StyleSheet} from 'react-native';
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
    color: Colors.dummyText,
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(3.4),
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
    marginBottom: hp(3),
  },
  rowSpaceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems:'center',
    marginTop:hp(3)
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal:wp(9.5),
    paddingVertical:hp(0.9),
    borderRadius:wp(1.5)
  },
  userImg: {width: wp(10), height: hp(5)},
  userDataContainer: {marginLeft: wp(2)},
  userName: {
    fontFamily: Typography?.poppins?.Medium,
    color: Colors.black,
    fontSize: wp(3.5),
  },
  lastMessage: {
    fontFamily: Typography?.poppins?.Regular,
    color: Colors.greyIcn,
    fontSize: wp(3.1),
  },
  blueContainer: {
    backgroundColor: Colors.primary,
    paddingHorizontal: wp(1.3),
    paddingVertical:wp(0.1),
    borderRadius: wp(100),
    marginLeft: wp(2),
  },
  flatListContainer: {
    marginTop: hp(3),
  },
  messageText: {
    color: 'white',
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(2.3),
  },
  leftIcn:{width: wp(4.5), height: hp(2)},
  rightIcn:{width: wp(4.5), height: hp(2)},
  allText:{
    color: 'white',
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(3),
    marginLeft:wp(1)
  },
  filterImg:{width: wp(3.5), height: hp(1.5)},
  content:{paddingBottom:Platform.OS=='ios'? hp(15):hp(20)}
});
