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
  customInputView: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    justifyContent: 'space-between',
    paddingHorizontal: wp(2),
    paddingVertical: hp(1),
  },
  subInputView: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dullWhite,
    paddingHorizontal: wp(2),
    borderRadius: wp(10),
    paddingVertical: hp(0.5),
  },
  composerTxt: {
    color: Colors.black,
  },
  sendBtnContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    width: wp(6),
    height: hp(2.6),
  },
  microphoneIcon: {
    width: wp(12),
    height: hp(6),
  },
  inputContainer: {width: wp(62)},
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingTop:hp(2),
    paddingBottom:hp(3),
    paddingHorizontal:wp(3)
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userImg: {
    width: wp(13),
    height: wp(13),
    borderRadius: wp(100),
    marginLeft:wp(3)
  },
  nameText: {
    fontFamily: Typography?.poppins?.Medium,
    color: 'white',
    fontSize: wp(4),
    marginLeft:wp(1)
  },
  activeText: {
    fontFamily: Typography?.poppins?.Regular,
    color: Colors.lightGreen,
    fontSize: wp(3.2),
  },
  leftIcn: {
    width: wp(3.8),
    height: hp(2),
  },
  greenIcn: {
    padding:wp(0.7),
    borderRadius:wp(100),
    backgroundColor:Colors.lightGreen,
    marginHorizontal:wp(1)
  },
  rightIcns: {
    width: wp(4.5),
    height: hp(2.1),
  },
  icnContainer: {
    backgroundColor: Colors.dullWhite,
    padding: wp(1.5),
    borderRadius: wp(100),
  },
  messageContainer: {
    margin: wp(2),
    padding: wp(3),
  },
  sentMessage: {
    paddingHorizontal:wp(3),
    paddingVertical:hp(2),
    borderTopLeftRadius:wp(4),
    borderTopRightRadius:wp(4),
    borderBottomLeftRadius:wp(4),
    backgroundColor:Colors.dullWhite,
    alignSelf:'flex-end'
  },
  receivedMessage: {
    paddingHorizontal:wp(3),
    paddingVertical:hp(2),
    borderTopLeftRadius:wp(4),
    borderTopRightRadius:wp(4),
    borderBottomRightRadius:wp(4),
    backgroundColor:Colors.dullWhite,
    alignSelf:'flex-start'
  },
  messageText: {
    fontSize: wp(4),
    color: Colors.black,
  },
  messageImage: {
    width: wp(50),
    height: hp(25),
    borderRadius: wp(2),
    marginTop: wp(2),
  },
  audioPlayer: {
    width: wp(50),
    height: hp(5),
    borderRadius: wp(2),
    backgroundColor: '#EEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: wp(2),
  },
  audioButtonText: {
    fontSize: wp(4),
    color: '#007BFF',
  },
  msgSubContainer:{
    paddingHorizontal:wp(3),
    paddingVertical:hp(2),
    borderTopLeftRadius:wp(4),
    borderTopRightRadius:wp(4),
    borderBottomLeftRadius:wp(4),
    backgroundColor:Colors.dullWhite
  }
});