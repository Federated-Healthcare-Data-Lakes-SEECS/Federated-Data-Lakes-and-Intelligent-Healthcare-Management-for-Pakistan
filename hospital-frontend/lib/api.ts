"use client"

import axios from "axios"
import { API_BASE_URL } from "./config"
import { clearToken, getToken } from "./auth"

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
})

// Attach token
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Global 401 handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      clearToken()
      if (typeof window !== "undefined") {
        const next = encodeURIComponent(window.location.pathname)
        window.location.href = `/login?next=${next}`
      }
    }
    return Promise.reject(err)
  },
)
