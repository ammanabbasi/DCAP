import {StyleSheet} from 'react-native';
import {Colors} from '../../Theme/Colors';
import {hp, wp} from '../../Theme/Responsiveness';
import Typography from '../../Theme/Typography';

export const styles = StyleSheet.create({
  mainView: {
    backgroundColor: 'white',
    flex: 1,
    // marginLeft:wp(3),
  },
  container: {
    flex: 1,
    paddingHorizontal: wp(3),
  },
  centerSpaceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp(2),
  },
  backIcn: {
    width: wp(4.4), 
    height: hp(2.2)
  },
  recent: {
    color: Colors.black,
    fontFamily: Typography?.poppins?.Medium,
    fontSize: wp(4.7),
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
  uploadIcn: {
    width: wp(3), 
    height: hp(1.5)
  },
  placeholderText: {
    color: Colors.black,
    fontSize: wp(3.7),
    fontFamily: Typography?.poppins?.Regular,
    marginTop: hp(1),
    marginBottom: hp(0.5),
  },
  submitButton: {
    width: '100%', 
    marginTop: hp(3)
  },
  noteCard: {
    backgroundColor: Colors.dullWhite,
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderRadius: wp(2),
    marginBottom: hp(2),
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp(1),
  },
  noteTitle: {
    color: Colors.black,
    fontFamily: Typography?.poppins?.Medium,
    fontSize: wp(4),
    flex: 1,
  },
  noteDate: {
    color: Colors.greyIcn,
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(3.2),
    marginLeft: wp(2),
  },
  noteDescription: {
    color: Colors.black,
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(3.5),
    lineHeight: wp(5),
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: hp(1),
  },
  actionButton: {
    marginLeft: wp(3),
  },
  actionIcon: {
    width: wp(4),
    height: wp(4),
  },
  noDataAvailable: {
    color: Colors.black,
    fontSize: wp(4),
    alignSelf: 'center',
    fontFamily: Typography?.poppins?.Medium,
    marginTop: hp(20),
  },
  activityIndicator: {
    position: 'absolute',
    alignSelf: 'center',
    top: hp(40),
  },
  modalContainer: {
    backgroundColor: 'white',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderRadius: wp(3),
  },
  crossContainer: {
    position: 'absolute', 
    top: hp(1), 
    right: wp(2)
  },
  crossIcn: {
    width: wp(5.5),
    height: hp(2.75),
  },
  error: {
    maxWidth: wp(43),
    marginTop: hp(0.4),
    marginLeft: wp(0.8),
    color: 'red',
    fontSize: wp(3.3),
    fontFamily: Typography?.poppins?.Regular,
  },
}); 