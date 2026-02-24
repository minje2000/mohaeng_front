// src/features/user/api/UserApi.js
import axios from "axios";
import { apiForm } from '../../../app/http/request';

export async function signup(formData) {
  const { data } = await apiForm().post('/api/user/createUser', formData);
  return data;
}

// 훅에서 'userApi.signup'으로 접근할 수 있도록 객체로 묶어서 export
export const userApi = {
  signup
};