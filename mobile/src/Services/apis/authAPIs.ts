import {getRequest,putRequest, patchRequestFD, postRequest, postRequestFD,patchRequest, putRequestFD} from '../';

export const login = payload => postRequest(`login`, payload);
export const signUpApi = payload => postRequest(`auth/signUp`, payload);
export const forgetPasswordApi = payload =>
  postRequest(`auth/forgotPallocIdAndPass`, payload);
export const resendOtp = payload => postRequest(`/users/resend-otp`, payload);

export const resetPasswordApi = (userId: any, payload: any) =>
  patchRequest(`auth/resetPassword/${userId}`, payload);
export const verifyOTPAPI = (userId: any, payload: any) => patchRequest(`auth/verifyOtp/${userId}`, payload);
export const changePassword = payload =>
  postRequest(`users/change-password`, payload);
export const EditProfileAPI = payload =>
  putRequestFD(`user/editProfile`, payload);
export const UserDataAPI = (): any => getRequest(`auth/getUser`);
