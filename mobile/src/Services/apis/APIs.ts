import {
  deleteRequest,
  getRequest,
  postRequest,
  postRequestFD,
  putRequest,
  putRequestFD,
} from '../';
import axios from 'axios';
import { BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
export interface VehicleDocumentsPayload {
  objectId: any;
}
export interface SearchQueryPayload {
  description: string;
}
export interface VehiclePayload {
  
  makeId?: number;
  modelId?: number;
  year?: string;
  [key: string]: any;
}
export interface ExpensePayload {
  vehicleId?: number;
  [key: string]: any;
}
export interface TaskPayload {
  taskId?: number;
  taskName?: string;
  taskTitle?: string;
  taskTypeId?: number;
  categoryStatusID?: number;
  customerID?: number;
  dueDate?: string;
  description?: string;
  userID?: number;
  [key: string]: any;
}
export interface NotePayload {
  noteId?: number;
  description?: string;
  userId?: number;
  customerID?: number;
  objectID?: number;
  objectTypeID?: number;
}
export interface AppointmentPayload {
  appointmentID?: number;
  taskName?: string;
  dueDate?: string;
  description?: string;
  categoryStatusID?: number;
  location?: string;
  attendeeID?: number;
  interactionTypeID?: number;
  customerID?: number;
  userID?: number;
}
export interface VehicleOfInterestPayload {
  vehicleInterestId?: number;
  customerId?: number;
  modelYear?: string;
  makeId?: number;
  modelId?: number;
  memo?: string;
  trimId?: number;
  exteriorColorId?: number;
  interiorColorId?: number;
  mileage?: number;
}
export interface WishlistPayload {
  wishListId?: number;
  modelYear?: string;
  makeId?: number;
  modelId?: number;
  expirationDate?: string;
  memo?: string;
}
export const categories = (): any => postRequest(`categories`);  
export const searchCategories = (searchQuery: SearchQueryPayload) =>
  postRequest(`categories/search?description=${searchQuery.description}`);  
export const getVehiclesByMake = (payload: VehiclePayload) =>
  postRequest(`getVehiclesByMake`, payload);  
export const getVendors = (payload: any) => postRequest(`vendors`, payload);  
export const expense = (payload: ExpensePayload) => postRequest(`getExpenseTransaction`, payload);
export const expenseLogs = (vehicleId: number) =>
  postRequest(`transaction-logs/${vehicleId}`);  
export const expenseTypes = (): any => postRequest(`expense-types`);
export const bankTypes = (): any => postRequest(`bank-types`);  
export const expenseTransaction = (payload: ExpensePayload) =>
  postRequest(`addTransactionAndExpense`, payload);
export const updateExpenseTransaction = (payload: ExpensePayload) =>
  putRequest(`editTransactionAndExpense`, payload);
export const vehicleImages = (payload: VehiclePayload) => postRequest(`vehicle-images`, payload);
export const vehicleDocuments = (payload: VehicleDocumentsPayload) => postRequest(`vehicle-documents`, payload);
export const dashboard = (): any => getRequest(`dashboard`);
export const weeklyRevenue = (payload: any) => postRequest(`revenue/weekly`, payload);
export const profile = (payload: any) => postRequest(`get-profile-details`, payload);
export const editProfile = (payload: any) =>
  putRequest(`update-profile-details`, payload);
export const updatePassword = (payload: any) => putRequest(`update-password`, payload);
export const uploadVehicleImages = (payload: any) =>
  postRequestFD(`add-vehicle-images`, payload);
export const uploadVehicleDocuments = (payload: any) =>
  postRequestFD(`add-vehicle-document`, payload);
export const inventoryDropdown = (): any => getRequest(`inventory-dropdowns`);
export const vehicleBasicData = (payload: VehiclePayload) =>
  postRequest(`get-vehicle-basic-data`, payload);
export const getCarfax = (payload: { CustomerID: number }) =>
  postRequest('carfax', payload);
export const updateCarfax = (payload: { CustomerID: number }) =>
  putRequest(`carfax`, payload);
export const updateVehicleBasics = (payload: VehiclePayload) =>
  putRequest(`update-vehicle-basic`, payload);
export const vehicleMarketing = (payload: VehiclePayload) =>
  postRequest(`get-vehicle-marketing`, payload);
export const updateVehicleMarketing = (payload: VehiclePayload) =>
  putRequest(`update-vehicle-marketing`, payload);
export const vehicleOptions = (payload: VehiclePayload) =>
  postRequest(`get-vehicle-options`, payload);
export const updateVehicleOptions = (payload: VehiclePayload) => {
  console.log('Update vehicle options API called with payload:', payload);
  return postRequest(`update-vehicle-option`, payload)
    .then(response => {
      console.log('Raw API response:', response);
      console.log('Response status:', response?.status);
      console.log('Response data:', response?.data);
      return response;
    })
    .catch(error => {
      console.log('API Error:', error);
      console.log('Error response:', error?.response);
      throw error;
    });
};
export const vehiclePurchase = (payload: VehiclePayload) =>
  postRequest(`get-vehicle-purchase`, payload);
export const searchVehicleForSet = (payload: VehiclePayload) =>
  postRequest(`SearchVehicleForSetVehicle`, payload);
export const deletePurchasePayment = (payload: { transactionID: number }) => {
  console.log('Delete payment API called with payload:', payload);

  // The most likely pattern is using the transaction ID in the URL path,
  // similar to other delete endpoints in the app.
  // The endpoint is likely 'financial-transaction' based on the 'edit' endpoint.
  return deleteRequest(`financial-transaction/${payload.transactionID}`);
};
export const editFinancialTransaction = (payload: any) =>
  putRequest(`edit-financial-transaction`, payload);
export const addVehiclePurchase = (payload: any) =>
  putRequest(`add-vehicle-purchase`, payload);
export const searchVehicles = (payload: any) =>
  postRequest(`getVehiclesBySearch`, payload);
export const deleteVehicleDocument = (DocumentID: number) =>
  deleteRequest(`delete-vehicle-document/${DocumentID}`);
export const vehicleRecon = (vehicleId: number) =>
  getRequest(`vehicle-recon/${vehicleId}`);
export const vehicleZipImages = (vehicleId: number) =>
  getRequest(`download-vehicle-images/${vehicleId}`);
export const deleteVehicleImages = (payload: VehiclePayload) =>
  deleteRequest(`delete-vehicle-image`, payload);
export const toggleVehicleFeature = (payload: VehiclePayload) =>
  putRequest(`toggleFeature`, payload);
export const toggleVehicleSpotLight = (payload: VehiclePayload) =>
  putRequest(`toggleSpotLight`, payload);
export const toggleVehicleIsPublished = (payload: VehiclePayload) =>
  putRequest(`toggleIsPublished`, payload);
export const vehicleFilter = (payload: VehiclePayload) =>
  postRequest(`getVehicleByFilter`, payload);
export const crmLeads = (payload: any) => postRequest(`leads`, payload);
export const overdueTasks = (payload: TaskPayload) => postRequest(`overdue-tasks`, payload);
export const appointments = (payload: AppointmentPayload) => postRequest(`appointments`, payload);
export const reminders = (payload: any) => postRequest(`reminders`, payload);
export const showroomLeads = (payload: any) => postRequest(`showroom-leads`, payload);
export const emailReplies = (payload: any) => postRequest(`getEmailText`, payload);
export const crmDropdowns = (): any => postRequest(`dropdowns`);
export const addLead = (payload: any) => postRequest(`add-lead`, payload);
export const cities = (payload: any) => postRequest(`cities`, payload);
export const crmTasks = (payload: TaskPayload) => postRequest(`get-tasks`, payload);
export const crmNotes = (payload: NotePayload) => postRequest(`get-notes`, payload);
export const crmAppointments = (payload: AppointmentPayload) =>
  postRequest(`get-appointment`, payload);
export const crmSms = (payload: any) => postRequest(`get-sms`, payload);
export const crmEmail = (customerId: string) =>
  getRequest(`email?customerId=${customerId}`);
export const crmVehicleOfInterest = (payload: { CustomerID: number }) =>
  postRequest('get-vehicleOfInterest', payload);
export const crmVehicleWishlist = (payload: { CustomerID: number; BusinessID?: number }) =>
  postRequest('get-vehicleWishlist', payload);
export const crmTimeline = (customerId: string) =>
  getRequest(`timeline?customerId=${customerId}`);
export const updateCrmProfile = (payload: any) =>
  putRequest(`update-profile`, payload);
export const deleteTask = (payload: { taskID: number }) => deleteRequest(`delete-task`, payload);
export const deleteNote = (payload: { noteId: number }) => deleteRequest(`delete-notes`, payload);
export const deleteSms = (payload: { smsID: number }) => deleteRequest(`sms`, payload);
export const deleteAppointment = (payload: { appointmentID: number }) =>
  deleteRequest(`delete-appointment`, payload);
export const deleteVehicleOfInterest = (payload: { vehicleInterestId: number }) =>
  deleteRequest(`delete-vehicleOfInterest`, payload);
export const deleteWishlist = (payload: { wishListId: number }) =>
  deleteRequest(`delete-vehicleWishlist`, payload);
export const updateCrmTask = (payload: TaskPayload) => putRequest(`update-task`, payload);
export const updateCrmNote = (payload: NotePayload) => putRequest(`update-notes`, payload);
export const updateCrmAppointment = (payload: AppointmentPayload) =>
  putRequest(`update-appointment`, payload);
export const updateCrmSms = (payload: { smsID: number; message: string }) => putRequest('sms', payload);
export const updateVehicleDocument = (payload: any) =>
  putRequestFD(`edit-vehicle-document`, payload);
export const updateCrmVehicleOfInterest = (payload: VehicleOfInterestPayload) => {
  console.log("API: updateCrmVehicleOfInterest called", payload);
  return putRequest('update-vehicleOfInterest', payload);
};
export const updateCrmVehicleWishlist = (payload: WishlistPayload) =>
  putRequest(`update-vehicleWishlist`, payload);
export const sendEmail = (payload: any) => postRequestFD(`send-email`, payload);
export const decode = (payload: any) => postRequest(`vin/decode`, payload);
export const addVehicleBasic = (payload: any) => postRequest(`add-vehicle-basic`, payload);
// export const addWatermark = payload => postRequest(`watermark`, payload);
export const modelByMake = (payload: any) => postRequest(`modelByMake`, payload);
export const uploadVideoUrl = (payload: any) => postRequest(`vehicle-video-link`, payload);
export const getVideoUrl = (vehicleId: number) => getRequest(`get-video-links/${vehicleId}`);
export const trimByModel = (payload: any) => postRequest(`trimByModel`, payload);
export const deleteVideoUrl = (payload: any) => postRequest(`delete-video-links`, payload);
export const getTradeRequest = (payload: any) => postRequest(`get-trade-request`, payload);
export const tradeRequest = (payload: any) => postRequest(`trade-request`, payload);
export const getCreditApplication = (payload: any) => postRequest(`get-credit-application`, payload);
export const creditApplication = (payload: any) => postRequest(`credit-application`, payload);
export const getVehicleMake = (payload: any) => postRequest(`getVehicleMake`, payload);
export const getEmployeeAccess = (): any => getRequest(`getEmployeeAccess`);
export const getVehicleBodyStyle = (payload: any) => postRequest(`getVehicleBodyStyle`, payload);
export const getCategoryStatus = (payload: any) => postRequest(`getCategoryStatus`, payload);
export const getChat = (payload: any) => postRequest(`chats`, payload);
export const getChatMessages = (payload: any) => postRequest(`conversations`, payload);
export const returnVehicle = (payload: any) => postRequest(`return-vehicle`, payload);
export const searchChatContacts = (payload: any) => postRequest(`search-employee`, payload);
export const deleteVehicle = (payload: any) => deleteRequest(`remove-vehicle`, payload);
export const addTask = (payload: TaskPayload) => postRequest('add-task', payload);
export const addNote = (payload: NotePayload) => postRequest('add-notes', payload);
export const getSetVehicle = (payload: any) => postRequest('get-set-vehicle', payload);
export const selectVehicle = (payload: any) => postRequest('change-vehicle', payload);
export const removeWatermark = (payload: any) => postRequest('remove-watermark', payload);
export const applyWatermark = (payload: any) => postRequest('watermark', payload);
export const addSms = (payload: { customerID: number; message: string; userID: number }) => postRequest('sms', payload);
export const addAppointment = (payload: AppointmentPayload) => postRequest('add-appointment', payload);
export const addVehicleOfInterest = (payload: VehicleOfInterestPayload) => {
  console.log("API: addVehicleOfInterest called", payload);
  return postRequest('add-vehicleOfInterest', payload);
};
export const addVehicleWishlist = (payload: WishlistPayload) => postRequest('add-vehicleWishlist', payload);
export const pricingLog = (payload: { vehicleId: number }) => postRequest('pricing-logs', payload);
export const getLog = (payload: { vehicleId: number }) => postRequest('logs', payload);
export const uploadVideoFile = async ({ file }: { file: any }) => {
  const token = await AsyncStorage.getItem('token');
  console.log('Token before upload:', token);
  const formData = new FormData();
  formData.append('video', file);
  return axios.post(`${BASE_URL}upload-video`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
};
// export const uploadVideoUrl = async ({ token, VehicleID, url }: { token: string, VehicleID: string, url: string }) => {
//   return axios.post(
//     `${BASE_URL}vehicle-video-link`,
//     { VehicleID, url },
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );
// };
