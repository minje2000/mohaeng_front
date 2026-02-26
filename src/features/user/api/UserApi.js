// src/features/user/api/UserApi.js
import axios from "axios";
import { apiForm, apiJson } from '../../../app/http/request';
import { tokenStore } from '../../../app/http/tokenStore';

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

// 비밀번호 찾기
export async function renewPwd(email, phone) {

  try {
    const { data } = await apiJson().post('/api/user/renewPwd', {userId: email, phone: phone});
    return data;
  } catch (error) {
    // 백엔드에서 보낸 에러 응답 throw
    if (error.response && error.response.data) {
      throw error.response.data; 
    }
    throw error;
  }
}

// 개인 정보 조회(마이페이지 - 개인 정보 관리)
export const getProfile = async () => {
  try {
    const { data } = await apiJson().get('/api/user/profile');
    return data.data;
  } catch (error) {
    console.error('개인 정보 조회 중 오류 발생:', error);
    throw error;
  }
};

// 개인 정보 수정(마이페이지 - 개인 정보 관리)
export const updateProfile = async (userInfo) => {
  try {
    const { message } = await apiJson().patch('/api/user/profile');
    return message;
  } catch (error) {
    console.error('개인 정보 조회 중 오류 발생:', error);
    throw error;
  }
};

 // multipart라서 fetch 사용 (apiJson은 Content-Type 자동 설정 안 됨)
export async function createEvent({ userInfo, deletePhoto, newPhoto}) {
  const formData = new FormData();

  // @RequestPart 에 대응 — JSON을 Blob으로 감싸야 함
  formData.append(
    'userInfo',
    new Blob([JSON.stringify(userInfo)], { type: 'application/json' })
  );
  formData.append('deletePhoto', deletePhoto);
  formData.append('newPhoto', newPhoto);

  const token = tokenStore.getAccess();
  const res = await fetch('/api/user/profile', {
    method: 'PATCH',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    // Content-Type 은 직접 쓰면 안 됨 — FormData가 boundary 포함해서 자동 설정
    body: formData,
  });

  console.log(`res ${res}`);
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message || `서버 오류 (${res.status})`);
  return json; // 생성된 eventId (Long)
}

// 훅에서 접근할 수 있도록 객체로 묶어서 export
export const userApi = {
  signup,
  checkId,
  searchId,
  renewPwd
};