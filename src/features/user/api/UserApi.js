// src/features/user/api/UserApi.js
import axios from "axios";
import { apiForm, apiJson } from '../../../app/http/request';

// 회원가입
export async function signup(formData) {
  const { data } = await apiForm().post('/api/user/createUser', formData);
  return data;
}

// 이메일 중복 확인
export async function checkId(email) {
  const { data } = await apiJson().post('/api/user/checkId', {userId: email});
  return data;
}

// 훅에서 'userApi.signup'으로 접근할 수 있도록 객체로 묶어서 export
export const userApi = {
  signup,
  checkId
};