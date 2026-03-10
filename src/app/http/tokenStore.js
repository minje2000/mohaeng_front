// src/app/http/tokenStore.js
const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';
const USERID_KEY = 'userId';
const ROLE_KEY = 'role';
const USERNAME_KEY = 'userName';

export const tokenStore = {
  getAccess() {
    return localStorage.getItem(ACCESS_KEY);
  },
  setAccess(token) {
    if (!token) return;
    localStorage.setItem(ACCESS_KEY, token);
  },
  getRefresh() {
    return localStorage.getItem(REFRESH_KEY);
  },
  setRefresh(token) {
    if (!token) return;
    localStorage.setItem(REFRESH_KEY, token);
  },
  getUserId() {
    return localStorage.getItem(USERID_KEY);
  },
  setUserId(userId) {
    if (!userId) return;
    localStorage.setItem(USERID_KEY, userId);
  },
  getRole() {
    return localStorage.getItem(ROLE_KEY);
  },
  setRole(role) {
    if (!role) return;
    localStorage.setItem(ROLE_KEY, role);
  },
  getUserName() {
    return localStorage.getItem(USERNAME_KEY);
  },
  setUserName(userName) {
    if (!userName) return;
    localStorage.setItem(USERNAME_KEY, userName);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USERID_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USERNAME_KEY);
  },
};
