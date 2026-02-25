import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './app/providers/AuthProvider';
// src/index.js
import { initHttpClient } from './app/http/request';

initHttpClient(); // ✅ 앱 시작 시 1회

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);

reportWebVitals();
