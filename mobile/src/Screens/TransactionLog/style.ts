import {StyleSheet} from 'react-native';
import {Colors, rgba} from '../../Theme/Colors';
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
    marginVertical:hp(0.4)
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
  docInfoContainer: {},
  greyContainer: {
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.6),
    borderRadius: wp(10),
    backgroundColor: Colors.dullWhite,
  },
  name: {
    color: Colors.black,
    fontFamily: Typography?.poppins?.SemiBold,
    fontSize: wp(3.9),
  },
  description: {
    color: Colors.greyIcn,
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(3.3),
    width: wp(60),
  },
  uplaod: {
    color: Colors.greyIcn,
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(3.6),
  },
  blueContainer: {
    backgroundColor: Colors.primary,
    width: wp(7),
    height: wp(7),
    borderRadius: wp(100),
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: wp(2),
  },
  backIcn: {width: wp(4.4), height: hp(2.2)},
  recent: {
    color: Colors.black,
    fontFamily: Typography?.poppins?.Medium,
    fontSize: wp(4.7),
  },
  uploadIcn: {width: wp(3), height: hp(1.5)},
  itemImg: {
    width: wp(10),
    height: hp(5),
    borderRadius: wp(1),
    marginTop: hp(0.3),
  },
  itemView: {
    backgroundColor: Colors.dullWhite,
    paddingHorizontal: wp(2),
    paddingVertical: hp(1),
    borderRadius: wp(2),
    marginBottom: hp(2),
  },
  shortIcn: {width: wp(3), height: hp(1.5), marginLeft: wp(2)},
  userImg: {width: wp(10), height: wp(10), borderRadius: wp(100)},
  blueDot: {
    backgroundColor: Colors.primary,
    paddingHorizontal: wp(0.7),
    paddingVertical: wp(0.7),
    borderRadius: wp(100),
    marginHorizontal: wp(1),
  },
  value: {
    color: Colors.black,
    fontFamily: Typography?.poppins?.Medium,
    fontSize: wp(2.7),
    width:wp(24),
    marginLeft:wp(1)
  },
  simpleValue: {
    color: Colors.black,
    fontFamily: Typography?.poppins?.Medium,
    fontSize: wp(2.7),
  },
  lastItemContainer:{
    alignItems:'flex-end',
    flex:1,
  },
  label: {
    color: Colors.black,
    fontFamily: Typography?.poppins?.Light,
    fontSize: wp(2.7),
    width:wp(24),
    marginLeft:wp(1)
  },
  simpleLabel: {
    color: Colors.black,
    fontFamily: Typography?.poppins?.Light,
    fontSize: wp(2.7),
  },
  time: {
    color: Colors.black,
    fontFamily: Typography?.poppins?.Light,
    fontSize: wp(3),

  },
  separator: {
    backgroundColor: '#EBEBEB',
    height: hp(0.1),
    width: wp(90),
    alignSelf: 'center',
    marginVertical: hp(2),
  },
  detailContainer: {marginLeft: wp(3)},
  userDetailContainer: {marginLeft: wp(1)},
  date: {
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(3.1),
    color: Colors.greyIcn,
  },
  activityIndicator: {
    alignSelf: 'center',
    top: hp(45),
    position:'absolute'
  },
  noDataAvailable: {
    color: Colors.black,
    fontSize: wp(4),
    alignSelf: 'center',
    fontFamily: Typography?.poppins?.Medium,
  },
});
