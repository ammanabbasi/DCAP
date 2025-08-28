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
    marginTop: hp(2),
  },
  contentContainer: {
    paddingBottom: hp(3),
    flexGrow: 1,
    paddingHorizontal: wp(3),
  },
  infoContainer: {
    backgroundColor: Colors.primary,
    paddingHorizontal: wp(3),
    minHeight: hp(11),
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
    width: wp(25),
  },
  spaceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(2),
    marginTop: hp(1),
  },
  chartTitle: {
    color: Colors.black,
    marginTop: hp(2),
    fontFamily: Typography?.poppins?.Medium,
    fontSize: wp(4.5),
  },
  chartContainer: {
    backgroundColor: Colors.dullWhite,
    paddingHorizontal: wp(3),
    paddingVertical: hp(2),
    borderRadius: wp(2),
    marginTop: hp(2),
    position: 'relative',
    overflow: 'hidden',
  },
  colorIndicator: {
    backgroundColor: Colors.primary,
    padding: wp(1),
    borderRadius: wp(100),
  },
  colorPurpleIndicator: {
    backgroundColor: Colors.chartPurple,
    padding: wp(1),
    borderRadius: wp(100),
  },
  colorBlackIndicator: {
    backgroundColor: 'black',
    padding: wp(1),
    borderRadius: wp(100),
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: wp(3),
  },
  chartIndicatorText: {
    color: Colors.black,
    fontSize: wp(3.7),
    marginLeft: wp(1),
  },
  rowSpaceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leadsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp(2),
  },
  numberContainer: {
    borderWidth: wp(0.3),
    paddingHorizontal: wp(6),
    paddingVertical: hp(0.4),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: wp(5),
  },
  numberText: {
    color: Colors.primary,
    fontFamily: Typography?.poppins?.Medium,
    fontSize: wp(3.4),
  },
  dropdown: {
    marginTop: hp(3.5),
    borderRadius: wp(90),
    width: wp(35),
    paddingHorizontal: wp(5),
    paddingVertical: hp(1),
    backgroundColor: Colors.dullWhite,
  },
  placeholderStyle: {
    color: Colors.black,
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(3.5),
  },
  selectedTextStyle: {
    color: Colors.black,
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(3.7),
  },
  iconStyle: {
    width: wp(5),
    height: hp(2.5),
  },
  inputSearchStyle: {
    color: Colors.black,
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(3.7),
    borderRadius: wp(2),
  },
  containerStyle: {
    borderRadius: wp(3),
  },
  activeText: {
    color: Colors.green,
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(3.7),
  },
  activeContainer: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(0.7),
    backgroundColor: Colors.transparentGreen,
    borderRadius: wp(12),
  },
  leadsText: {
    color: Colors.greyIcn,
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(3.5),
    marginLeft: wp(1.5),
    maxWidth: '80%',
  },
  leadsValue: {
    color: Colors.black,
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(3.5),
  },
  activityIndicator: {
    position: 'absolute',
    alignSelf: 'center',
    top: hp(35),
  },
  statusAwaitingColorIndicator: {
    backgroundColor: Colors.primary,
    padding: wp(1.5),
    borderRadius: wp(100),
  },
  statusRespondedColorIndicator: {
    backgroundColor: Colors.chartPurple,
    padding: wp(1.5),
    borderRadius: wp(100),
  },
  statusNotRespondedColorIndicator: {
    backgroundColor: 'black',
    padding: wp(1.5),
    borderRadius: wp(100),
  },
  leadsRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom:hp(1)
  },
  activity: {
    alignSelf: 'center',
    marginTop: hp(3),
  },
  absoluteActivity: {
    alignSelf: 'center',
    position:'absolute',
    zIndex:1234,
    top:'44%'
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 5,
    zIndex: 100000,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 12,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
  },
  stackDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#FF6384',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
});
