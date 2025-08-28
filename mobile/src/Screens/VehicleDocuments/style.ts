import { StyleSheet } from 'react-native';
import { Colors, rgba } from '../../Theme/Colors';
import { hp, wp } from '../../Theme/Responsiveness';
import Typography from '../../Theme/Typography';

export const styles = StyleSheet.create({
  // Main container styles
  container: {
    flex: 1,
    backgroundColor: Colors.dullWhite,
  },
  contentContainer: {
    flex: 1,
    padding: wp(4),
  },
  
  // Header styles
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
    marginTop: hp(1),
  },
  title: {
    color: Colors.black,
    fontFamily: Typography?.poppins?.SemiBold,
    fontSize: wp(5),
  },

  // New Add button container with rounded background
  addButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dullWhite, // Light gray background
    borderRadius: wp(8), // Rounded container
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  // Add text styling
  addText: {
    color: Colors.black,
    fontFamily: Typography?.poppins?.Medium,
    fontSize: wp(3.8),
    marginRight: wp(2),
  },

  // Circular blue button with plus
  circularPlusButton: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4), // Perfect circle
    backgroundColor: Colors.primary, // Blue background
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Plus icon styling
  plusIcon: {
    width: wp(3.5),
    height: wp(3.5),
    tintColor: Colors.white,
  },

  // Document item styles
  documentCard: {
    backgroundColor: Colors.white,
    borderRadius: wp(3),
    marginBottom: hp(1.5),
    padding: wp(4),
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  documentIcon: {
    width: wp(10),
    height: wp(10),
    marginRight: wp(3),
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    color: Colors.black,
    fontFamily: Typography?.poppins?.SemiBold,
    fontSize: wp(4),
    marginBottom: hp(0.2),
  },
  documentDescription: {
    color: Colors.greyIcn,
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(3.3),
  },
  deleteButton: {
    padding: wp(2),
  },
  deleteIcon: {
    width: wp(5.5),
    height: wp(5.5),
    tintColor: Colors.red,
  },
  
  // Document footer styles
  documentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp(1),
    paddingTop: hp(1),
    borderTopWidth: 1,
    borderTopColor: Colors.dullWhite,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userProfileImage: {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3), // Make it circular
    marginRight: wp(1.5),
    backgroundColor: Colors.dullWhite, // Fallback background
  },
  userIcon: {
    width: wp(4),
    height: wp(4),
    marginRight: wp(1.5),
    tintColor: Colors.greyIcn,
  },
  userName: {
    color: Colors.greyIcn,
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(3),
  },
  documentMeta: {
    color: Colors.greyIcn,
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(3),
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: rgba(Colors.black, 0.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: wp(3),
    padding: wp(5),
    width: wp(85),
    maxWidth: 400,
    maxHeight: hp(70),
  },
  modalTitle: {
    color: Colors.black,
    fontFamily: Typography?.poppins?.SemiBold,
    fontSize: wp(4.5),
    marginBottom: hp(2),
    textAlign: 'center',
  },
  
  // Input styles
  inputContainer: {
    marginBottom: hp(2),
  },
  inputLabel: {
    color: Colors.black,
    fontFamily: Typography?.poppins?.Medium,
    fontSize: wp(3.8),
    marginBottom: hp(0.8),
  },
  textInput: {
    backgroundColor: Colors.dullWhite,
    borderRadius: wp(2),
    paddingHorizontal: wp(3),
    paddingVertical: hp(1.2),
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(3.5),
    color: Colors.black,
    borderWidth: 1,
    borderColor: Colors.lightWhite,
    height: hp(12),
    textAlignVertical: 'top',
  },

  // File picker styles
  filePickerContainer: {
    marginBottom: hp(2),
  },
  filePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: wp(2),
    paddingHorizontal: wp(3),
    paddingVertical: hp(1.2),
    alignSelf: 'flex-start',
  },
  filePickerText: {
    color: Colors.white,
    fontFamily: Typography?.poppins?.Medium,
    fontSize: wp(3.5),
  },
  selectedFileName: {
    color: Colors.black,
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(3.3),
    marginTop: hp(0.8),
    marginLeft: wp(1),
  },

  // Button styles
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp(2),
    paddingTop: hp(1.5),
    borderTopWidth: 1,
    borderTopColor: Colors.dullWhite,
  },
  cancelButton: {
    width: wp(35),
    height: hp(6),
    backgroundColor: Colors.lightWhite,
    borderRadius: wp(2),
  },
  cancelButtonText: {
    color: Colors.greyIcn,
    fontFamily: Typography?.poppins?.Medium,
    fontSize: wp(3.5),
  },
  uploadButton: {
    width: wp(35),
    height: hp(6),
    backgroundColor: Colors.primary,
    paddingHorizontal: wp(2),
    borderRadius: wp(2),
  },
  uploadButtonText: {
    color: Colors.white,
    fontFamily: Typography?.poppins?.Medium,
    fontSize: wp(3.5),
  },

  // Loading and empty states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(10),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(10),
  },
  emptyText: {
    color: Colors.greyIcn,
    fontFamily: Typography?.poppins?.Regular,
    fontSize: wp(4),
    textAlign: 'center',
  },
  emptyIcon: {
    width: wp(20),
    height: wp(20),
    tintColor: Colors.lightWhite,
    marginBottom: hp(2),
  },

  // List styles
  listContainer: {
    paddingBottom: hp(3),
  },
  separator: {
    height: hp(1),
  },

  // Utility styles
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },

  // New styles
  actionIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: wp(1.5),
    marginLeft: wp(1),
  },
  actionIcon: {
    width: wp(4.5),
    height: wp(4.5),
    tintColor: Colors.primary,
  },
  // deleteIcon: {
  //   tintColor: Colors.red,
  // },

  // Add these new styles for better modal layout
  modalContent: {
    maxHeight: hp(50),
  },

  modalScrollContent: {
    flexGrow: 1,
  },
});