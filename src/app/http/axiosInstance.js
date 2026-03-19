
// src/app/http/axiosInstance.js
import axios from 'axios';

export const backendUrl = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8080'
  : '';

export const axiosInstance = axios.create({
  baseURL: backendUrl,
  timeout: 60000,
  withCredentials: true,
});
