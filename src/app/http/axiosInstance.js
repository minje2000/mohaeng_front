// src/app/http/axiosInstance.js
import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: "",
  timeout: 20000,
  withCredentials: true,
});
