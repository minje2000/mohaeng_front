// src/features/auth/api/authApi.js
import { apiJson } from '../../../app/http/request';
import { tokenStore } from '../../../app/http/tokenStore';
import { normalizeApiError } from '../../../app/http/errorMapper';


function unwrap(body) {
  return body?.data ?? body;
}

function decodeJwt(token) {
  try {
    const part = token.split('.')[1];
    const pad = part.length % 4;
    const normalized = part.replace(/-/g, '+').replace(/_/g, '/')
      + (pad ? '='.repeat(4 - pad) : '');
    return JSON.parse(decodeURIComponent(
      atob(normalized).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    ));
  } catch {
    return {};
  }
}

function normalizeTokenPayload(payload) {
  const p = payload ?? {};
  const accessToken =
    p.accessToken || p.access || p.token || p.jwt || p.access_token || null;
  const refreshToken = p.refreshToken || p.refresh || p.refresh_token || null;
  const userId = p.userId || p.userid || p.username || null;

  const jwtPayload = accessToken ? decodeJwt(accessToken) : {};
  const role = p.role || p.authority || p.auth || jwtPayload.role || null;

  return { accessToken, refreshToken, userId, role, raw: p };
}

// 'Bearer ' 1번만 붙이기
function toBearerHeaderValue(token) {
  if (!token) return null;
  const t = String(token).trim();
  const pure = t.startsWith('Bearer ')
    ? t.substring('Bearer '.length).trim()
    : t;
  return pure ? `Bearer ${pure}` : null;
}

// 로그인 제한 에러인지 판별 (백엔드가 401/403/500을 내려도 메시지/코드로 구분)
function isLoginBlocked(apiErr) {
  const msg = (apiErr?.message || '').toLowerCase();
  const code = (apiErr?.code || '').toUpperCase();

  // code 기반(백엔드가 code를 주는 경우)
  if (
    code.includes('LOGIN') &&
    (code.includes('BLOCK') ||
      code.includes('DENY') ||
      code.includes('DISABLED'))
  )
    return true;

  // message 기반(백엔드가 message만 주는 경우)
  // "로그인 제한", "loginOk", "허용되지" 등 포함 시 제한으로 간주
  return (
    msg.includes('로그인 제한') ||
    msg.includes('loginok') ||
    (msg.includes('허용') && msg.includes('않')) ||
    msg.includes('disabled') ||
    msg.includes('blocked')
  );
}

export async function login({ userId, userPwd }) {
  try {
    const resp = await apiJson().post('/auth/login', { userId, userPwd });

    const payload = unwrap(resp?.data);
    const token = normalizeTokenPayload(payload);

    if (!token.accessToken) {
      throw new Error(
        resp?.data?.message || '로그인 응답에 access 토큰이 없습니다.'
      );
    }

    tokenStore.setAccess(token.accessToken);
    if (token.refreshToken) tokenStore.setRefresh(token.refreshToken);
    tokenStore.setUserId(token.userId || userId);
    if (token.role) tokenStore.setRole(token.role);

    return token;
  } catch (err) {
    const apiErr = normalizeApiError(err);

    // 로그인 제한이면 사용자에게 명확히 출력할 문구로 통일
    if (isLoginBlocked(apiErr)) {
      throw new Error('로그인 제한 회원입니다.');
    }

    // 그 외에는 백엔드 메시지 노출(없으면 기본)
    throw new Error(apiErr?.message || '로그인 실패');
  }
}

export async function refresh({ extendLogin = false } = {}) {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) throw new Error('no refreshToken');

  const resp = await apiJson().post(
    '/auth/refresh',
    { extendLogin },
    { headers: { RefreshToken: toBearerHeaderValue(refreshToken) } }
  );

  const payload = unwrap(resp?.data);
  const token = normalizeTokenPayload(payload);

  if (!token.accessToken)
    throw new Error(
      resp?.data?.message || 'refresh 응답에 access 토큰이 없습니다.'
    );

  tokenStore.setAccess(token.accessToken);
  if (token.refreshToken) tokenStore.setRefresh(token.refreshToken);
  if (token.userId) tokenStore.setUserId(token.userId);
  if (token.role) tokenStore.setRole(token.role);

  return token;
}

export async function logout() {
  const accessToken = tokenStore.getAccess();
  const authHeaderValue = toBearerHeaderValue(accessToken);

  try {
    await apiJson().post(
      '/auth/logout',
      {},
      {
        skipAuthRefresh: true,
        ...(authHeaderValue
          ? { headers: { Authorization: authHeaderValue } }
          : {}),
      }
    );
  } finally {
    tokenStore.clear();
  }
}
