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

// 이메일 찾기
export async function searchId(name, phone) {

  try {
    const { data } = await apiJson().post('/api/user/searchId', {name: name, phone: phone});
    return data;
  } catch (error) {
    // 백엔드에서 보낸 에러 응답이 있다면 그 데이터를 담아서 throw
    if (error.response && error.response.data) {
      throw error.response.data; 
    }
    throw error;
  }
}

// 훅에서 'userApi.signup'으로 접근할 수 있도록 객체로 묶어서 export
export const userApi = {
  signup,
  checkId,
  searchId
};