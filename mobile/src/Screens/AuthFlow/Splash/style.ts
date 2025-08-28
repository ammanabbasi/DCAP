import { StyleSheet } from 'react-native';
import { Colors } from '../../../Theme/Colors';
import { wp } from '../../../Theme/Responsiveness';

export const styles = StyleSheet.create({
  mainView: {
    backgroundColor: Colors.primary,
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    flex: 1,
  },
  // imageContainer: {
  //   width:wp(30),
  //   height:wp(30),
  //   backgroundColor:'white',
  //   flexDirection:'row',
  //   justifyContent:'center',
  //   alignItems:'center',
  //   borderRadius:wp(10),
  // },
  image: {
    width:wp(90),
    height:wp(90),
    alignSelf:'center',
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    // backgroundColor:'white',
    // marginTop:wp(10),
  }
});
