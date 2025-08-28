import {StyleSheet} from 'react-native';
import {Colors, rgba} from '../../Theme/Colors';
import {hp, wp} from '../../Theme/Responsiveness';
import Typography from '../../Theme/Typography';

export const styles = StyleSheet.create({
  mainView: {
    backgroundColor: 'white',
    flex: 1,
    // gap: hp(1),
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(2),
    backgroundColor: Colors.dullWhite,
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderRadius: wp(2),
    marginRight: wp(3),
    width: wp(45),
  },
  selectedOptionContainer: {
    backgroundColor: Colors.primary,
  },
  optionImg: {
    width: wp(5.5), 
    height: hp(2.3)
  },
  whiteOption: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    marginTop: hp(1),
  },
  forwardIcn: {width: wp(3.5), height: hp(2), marginLeft: wp(14)},
  option: {
    backgroundColor: Colors.dullWhite,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: wp(1.9),
    paddingVertical: hp(0.6),
    borderRadius: wp(2),
    width: '106%',
  },
  optionName: {
    color: Colors.black,
    fontSize: wp(3.5),
    fontFamily: Typography?.poppins?.Regular,
    width: wp(30),
  },
  plusOptionsContainer: {
    backgroundColor: 'white',
    position: 'absolute',
    zIndex: 123,
    right: wp(10),
    alignItems: 'center',
    paddingHorizontal: wp(3),
    paddingTop: hp(2),
    paddingVertical: hp(3),
    borderTopLeftRadius: wp(3),
    borderTopRightRadius: wp(3),
    borderBottomLeftRadius: wp(3),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 11,
    }},
  selectedOptionImg: {
    tintColor: Colors.white,
  },
  
  flexEnd: {alignItems: 'flex-end'},
  subContainer: {
    paddingHorizontal: wp(3),
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  bankContainer: {
    flexDirection: 'row',
    gap: wp(2),
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: hp(1),
  },
  dataContainer: {
    flexDirection: 'row',
    alignItems:'flex-start'
  },
  centerSpaceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop:hp(2)
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop:hp(1)
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  docInfoContainer: {
    alignItems: 'flex-start',
  },
  orContainer: {
    alignItems: 'flex-start',
    marginLeft:wp(3)
  },
  greyContainer: {
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.6),
    borderRadius: wp(10),
    backgroundColor: Colors.dullWhite,
  },
  name: {
    color: Colors.black,
    fontFamily: Typography?.poppins?.Medium,
    fontSize: wp(3.6),
    textDecorationLine: 'underline',
  },
  description: {
    color: Colors.greyIcn,
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(3.1),
    marginTop:hp(0.3)
  },
  uplaod: {
    color: Colors.greyIcn,
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(3.6),
  },
  blueContainer:{
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
  uploadIcn:{width: wp(3), height: hp(1.5)},
  itemImg:{width: wp(10), height: hp(5),borderRadius:wp(1),marginTop:hp(0.3)},
  itemView:{
    backgroundColor:Colors.dullWhite,
    paddingHorizontal:wp(2),
    paddingVertical:hp(1),
    borderRadius:wp(2),
    marginBottom:hp(2)
  },
  shortIcn:{width: wp(3.5), height: hp(1.7)},
  blueDot:{
    backgroundColor:Colors.primary,
    paddingHorizontal:wp(0.7),
    paddingVertical:wp(0.7),
    borderRadius:wp(100),
    marginHorizontal:wp(1)
  },
  userName:{
    color: Colors.black,
    fontFamily: Typography?.poppins?.Medium,
    fontSize: wp(3.5),
  },
  date:{
    color: Colors.greyIcn,
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(3.3),
  },
  time:{
    color: Colors.black,
    fontFamily: Typography?.poppins?.Light,
    fontSize: wp(3),
  },
  separator:{
    backgroundColor:'#EBEBEB',
    height:hp(0.1),
    width:wp(90),
    alignSelf:'center',
    marginVertical:hp(2)
  },
  userDetailContainer:{marginLeft:wp(1)},
  priceContainer:{
    backgroundColor: Colors.primary,
    paddingHorizontal:wp(5),
    paddingVertical:hp(0.7),
    borderRadius:wp(8)
  },
  priceText:{
    color:'white',
    fontFamily:Typography?.poppins?.Regular,
    fontSize:wp(3.6)
  },
  // Modal related styles
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(3),
  },
  modalContainer: {
    backgroundColor: 'white',
    paddingHorizontal: wp(3),
    paddingVertical: hp(2),
    borderRadius: wp(5),
    width: wp(90),
    alignItems: 'center',
  },
  crossIcn: {
    width: wp(6),
    height: hp(3),
  },
  modalHeading: {
    marginTop: hp(1),
    color: Colors.black,
    fontFamily: Typography?.poppins?.Medium,
    fontSize: wp(4),
  },
  confirmationText: {
    color: Colors.greyIcn,
    textAlign: 'center',
    width: wp(58),
    marginTop: hp(0.6),
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(3.3),
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    marginTop: hp(2),
  },
  submitContainer: {
    paddingHorizontal: wp(15),
    paddingVertical: hp(1),
    borderRadius: wp(2),
    borderWidth: wp(0.2),
    borderColor: Colors.primary,
  },
  yesContainer: {
    paddingHorizontal: wp(15),
    paddingVertical: hp(1),
    borderRadius: wp(2),
    borderWidth: wp(0.2),
    backgroundColor: Colors.primary,
    marginLeft: wp(3),
  },
  submitText: {
    color: Colors.black,
    fontSize: wp(3.8),
    fontFamily: Typography?.poppins?.Medium,
  },
  clearButtonText: {
    color: Colors.white,
    fontSize: wp(3.8),
    fontFamily: Typography?.poppins?.Medium,
  },
});
