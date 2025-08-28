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
    paddingHorizontal: wp(5),
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dullWhite,
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderRadius: wp(2),
    marginRight: wp(3),
  },
  centerSpaceContainer: {
    marginTop: hp(2),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dotContainer: {
    position: 'absolute',
    bottom: hp(2),
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(1),
    alignSelf: 'center',
  },
  longDot: {
    paddingHorizontal: wp(0.8),
    paddingVertical: hp(0.4),
    borderRadius: wp(3),
    backgroundColor: 'white',
    marginHorizontal: wp(0.5),
  },
  shortDot: {
    marginHorizontal: wp(0.5),
    paddingHorizontal: wp(0.8),
    paddingVertical: hp(0.4),
    borderRadius: wp(3),
    backgroundColor: rgba('#FFFFFF', 0.5),
  },
  carName: {
    color: Colors.black,
    fontFamily: Typography?.poppins?.SemiBold,
    fontSize: wp(4.5),
  },
  price: {
    color: Colors.primary,
    fontFamily: Typography?.poppins?.SemiBold,
    fontSize: wp(4),
  },
  subPrice: {
    color: Colors.black,
    fontFamily: Typography?.poppins?.Medium,
    fontSize: wp(3.4),
  },
  optionText: {
    color: Colors.greyIcn,
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(3.4),
    marginLeft: wp(2),
  },
  model: {
    color: Colors.greyIcn,
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(3.3),
    marginLeft: wp(2),
  },
  leftIcn: {width: wp(6), height: hp(3)},
  backIcn: {width: wp(4.4), height: hp(2.2)},
  shortIcn: {width: wp(4), height: hp(2), marginLeft: wp(3)},
  carKetaImg: {width: wp(11), height: hp(5.5)},
  next: {width: wp(3), height: hp(1.5), marginLeft: wp(0.2)},
  manage: {
    color: Colors.black,
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(3.1),
  },
  carKetaText: {
    color: Colors.black,
    fontFamily: Typography?.poppins?.SemiBold,
    fontSize: wp(4.2),
  },
  vehicleImg: {
    width: wp(100),
    height: hp(30),
    resizeMode: 'stretch',
    backgroundColor: 'lightgrey',
  },
  crossIcn: {
    position: 'absolute',
    top: 3,
    right: 5,
    width: 32,
    height: 32,
    borderRadius: 16,
    // backgroundColor: '#F87171', // light red background
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  }
,  
  pendingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgba(100, 99, 97, 0.9)', // soft yellowish background
    zIndex: 999, // optional: ensure it's above other elements
  },  
  card: {
    backgroundColor: '#FEF3C7', // light amber
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
    width: '80%',
  },
  warningSymbol: {
    fontSize: 48,
    marginBottom: 8,
  },
  text: {
    marginTop: 10,
    fontSize: 18,
    color: '#92400E', // dark amber
    fontWeight: '600',
  },
  spinner: {
    marginBottom: 10,
  },
  headerContainer: {
    paddingHorizontal: wp(3),
    position: 'absolute',
    width: wp(100),
    top: hp(2),
  },
  optionImg: {width: wp(5.5), height: hp(2.3)},
  activityIndicator: {
    position: 'absolute',
    alignSelf: 'center',
    top: hp(40),
  },
  // Menu related styles
  optionSpaceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    // marginBottom: hp(0.5),
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
  },
  optionName: {
    color: Colors.black,
    fontSize: wp(3.5),
    fontFamily: Typography?.poppins?.Regular,
  },
  forwardIcn: {
    width: wp(3.5),
    height: hp(2),
    marginLeft: wp(3),
  },
  menuContainer: {
    position: 'absolute',
    top: hp(2),
    // left: wp(3),
    right: wp(12),
    backgroundColor: 'white',
    borderRadius: wp(2),
    width: wp(55),
    paddingHorizontal: wp(2),
    paddingVertical: hp(1),
    shadowColor: '#00000033',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
