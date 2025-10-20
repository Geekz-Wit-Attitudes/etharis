// src/lib/api.ts

import axios from 'axios';

// Asumsi backend berjalan di port 3001, sesuai dengan convention Node.js backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Custom Axios instance untuk Etharis Backend API.
 */
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menambahkan token otorisasi ke setiap request
api.interceptors.request.use(
  (config) => {
    // Ambil token dari Local Storage
    const token = localStorage.getItem('etharis_token');
    if (token && token !== "undefined") {
      // Pastikan headers sudah ada sebelum menambahkan Authorization
      if (!config.headers) {
        config.headers = {} as any; 
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);