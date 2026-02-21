"use client"

import useSWR, { mutate } from "swr"
import { getToken, clearToken } from "@/lib/auth"
import { api } from "@/lib/api"

export type Role = "PATIENT" | "DOCTOR" | "RECEPTIONIST" | "ADMIN" | "LAB_TECHNICIAN" | "PATHOLOGIST"

export interface UserProfile {
  id: number
  email: string
  firstName: string
  lastName: string
  gender: "MALE" | "FEMALE" | "OTHER"
  cnic: string
  roles: Role[]
  patient?: {
    id: number
    dateOfBirth?: string | null
    bloodGroup?: string | null
    address?: string | null
    phoneNumber?: string | null
    emergencyContact?: string | null
    medicalHistory?: string | null
    familyHistory?: string | null
    allergies?: string | null
    onboardingDone: boolean
  }
  doctor?: Record<string, any>
  receptionist?: Record<string, any>
  labTechnician?: Record<string, any>
  pathologist?: Record<string, any>
}

const fetcher = (url: string) => api.get(url).then((r) => r.data)

export function useAuth() {
  const hasToken = !!getToken()
  const { data, error, isLoading } = useSWR<UserProfile>(hasToken ? "/users/me" : null, fetcher, {
    revalidateOnFocus: true,
  })

  const isAuthenticated = !!data && !error
  const roles = data?.roles || []
  const isAdmin = roles.includes("ADMIN")
  const isPatient = roles.includes("PATIENT")
  const isDoctor = roles.includes("DOCTOR")
  const isLabTechnician = roles.includes("LAB_TECHNICIAN")
  const isPathologist = roles.includes("PATHOLOGIST")

  function logout() {
    clearToken()
    mutate("/users/me", undefined, { revalidate: false })
    if (typeof window !== "undefined") window.location.href = "/login"
  }

  return {
    user: data,
    isLoading,
    error,
    isAuthenticated,
    roles,
    isAdmin,
    isPatient,
    isDoctor,
    isLabTechnician,
    isPathologist,
    logout,
  }
}
