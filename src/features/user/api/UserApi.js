// src/features/user/api/UserApi.js
import { apiForm, apiJson } from '../../../app/http/request';
import { tokenStore } from '../../../app/http/tokenStore';
import { normalizeApiError } from '../../../app/http/errorMapper';

// 백엔드 응답이 ApiResponse로 감싸져도 토큰을 찾게 처리
function unwrap(body) {
  return body?.data ?? body;
}

// access/refresh 토큰 키
function normalizeTokenPayload(payload) {
  const p = payload ?? {};
  const accessToken = p.accessToken || null;
  const refreshToken = p.refreshToken || null;
  const role = p.role || null;
  const userId = p.userId || null;
  return { accessToken, refreshToken, userId, role, raw: p };
}

// 회원가입
export async function signup(formData) {
  const { data } = await apiForm().post('/api/user/createUser', formData);
  return data;
}

// 소셜 회원가입
export const completeSocialSignup = async (formData) => {
  try {
      const resp = await apiForm().post('/api/user/socialSignupComplete', formData);
  
      const payload = unwrap(resp?.data);
      const token = normalizeTokenPayload(payload);
  
      if (!token.accessToken) {
        throw new Error(
          resp?.data?.message || '로그인 응답에 access 토큰이 없습니다.'
        );
      }
  
      tokenStore.setAccess(token.accessToken);
      if (token.refreshToken) tokenStore.setRefresh(token.refreshToken);
      tokenStore.setUserId(token.userId || formData.email);
      if (token.role) tokenStore.setRole(token.role);
  
      return token;
    } catch (err) {
      const apiErr = normalizeApiError(err);
  
      // 그 외에는 백엔드 메시지 노출(없으면 기본)
      throw new Error(apiErr?.message || '로그인 실패');
    }
};

// 이메일 중복 확인
export async function checkId(email) {
  const { data } = await apiJson().post('/api/user/checkId', {userId: email});
  return data;
}

// 본인 인증 문자 전송
export async function verifyByPhone(phone) {
  const { data } = await apiJson().post('/api/sms/send', {phone});
  return data;
}

// 본인 인증 번호 확인
export async function checkCode(phone, code) {
  const { data } = await apiJson().post('/api/sms/verify', {phone, code});
  return data;
}

// 사업자 등록 번호 조회
export async function checkBusinessNum(businessNum) {
  const { data } = await apiJson().post(`/api/nts/status?bno=${businessNum}`);
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
// multipart라서 fetch 사용 (apiJson은 Content-Type 자동 설정 안 됨)
export async function updateProfile(userInfo, deletePhoto, newPhoto) {
  const formData = new FormData();

  // @RequestPart 에 대응 — JSON을 Blob으로 감싸야 함
  formData.append(
    'userInfo',
    new Blob([JSON.stringify(userInfo)], { type: 'application/json' })
  );
  formData.append('deletePhoto', deletePhoto);
  if (newPhoto && newPhoto instanceof File) {
    formData.append('newPhoto', newPhoto);
  }

  const token = tokenStore.getAccess();
  const res = await fetch('/api/user/profile', {
    method: 'PATCH',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    // Content-Type 은 직접 쓰면 안 됨 — FormData가 boundary 포함해서 자동 설정
    body: formData,
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message || `서버 오류 (${res.status})`);
  return json;
}

// 회원 탈퇴(마이페이지 - 개인 정보 관리)
export async function withdrawal(reasonIndex, extraReason) {
  try{
    const res = await apiJson().patch('/api/user/withdrawal', {withReasonId: reasonIndex, withdrawalReason: extraReason});
    return res.data;
  } catch(error) {
    console.error('회원 탈퇴 중 오류 발생:', error);
    throw error;
  }
}

// 훅에서 접근할 수 있도록 객체로 묶어서 export
export const userApi = {
  signup,
  completeSocialSignup,
  checkId,
  searchId,
  verifyByPhone,
  checkCode,
  checkBusinessNum, 
  renewPwd
};