// src/App.jsx
import React from 'react';
import AppRouter from './app/router';
import { AuthProvider } from './app/providers/AuthProvider';

export default function App() {
  return (
    <React.StrictMode>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
    </React.StrictMode>
  );
}