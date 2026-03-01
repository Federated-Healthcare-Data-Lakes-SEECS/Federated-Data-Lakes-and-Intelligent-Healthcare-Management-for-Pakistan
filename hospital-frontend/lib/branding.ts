/**
 * Centralized branding configuration for the hospital frontend.
 *
 * All values are driven by NEXT_PUBLIC_* environment variables so that each
 * deployment can carry its own identity without any code changes.
 *
 * Usage:
 *   import { branding } from "@/lib/branding"
 *   <h1>{branding.hospitalName}</h1>
 */

export const branding = {
  /** Full hospital / organization name – appears in page titles, hero, etc. */
  hospitalName:
    process.env.NEXT_PUBLIC_HOSPITAL_NAME || "MediCare",

  /** Short tagline shown beneath the name or in meta descriptions */
  tagline:
    process.env.NEXT_PUBLIC_HOSPITAL_TAGLINE ||
    "Digital Healthcare Platform",

  /** One-line description for SEO / meta tags */
  description:
    process.env.NEXT_PUBLIC_HOSPITAL_DESCRIPTION ||
    "Streamline hospital operations with online appointment booking, patient records management, and digital checkup system.",

  /** Copyright holder – used in the footer */
  copyrightHolder:
    process.env.NEXT_PUBLIC_HOSPITAL_COPYRIGHT ||
    process.env.NEXT_PUBLIC_HOSPITAL_NAME ||
    "MediCare",

  /** Optional logo URL (external or from /public) */
  logoUrl:
    process.env.NEXT_PUBLIC_HOSPITAL_LOGO_URL || "",

  /** Year shown in the footer copyright line */
  copyrightYear:
    process.env.NEXT_PUBLIC_HOSPITAL_COPYRIGHT_YEAR ||
    new Date().getFullYear().toString(),

  /**
   * Quick-login demo credentials shown on the login page.
   * Each entry is only included if both email and password env vars are set.
   * Set any pair to empty strings to omit that button from the UI.
   */
  quickLogin: [
    {
      label: "Doctor",
      email: process.env.NEXT_PUBLIC_QUICK_LOGIN_DOCTOR_EMAIL || "",
      password: process.env.NEXT_PUBLIC_QUICK_LOGIN_DOCTOR_PASSWORD || "",
    },
    {
      label: "Patient",
      email: process.env.NEXT_PUBLIC_QUICK_LOGIN_PATIENT_EMAIL || "",
      password: process.env.NEXT_PUBLIC_QUICK_LOGIN_PATIENT_PASSWORD || "",
    },
    {
      label: "Receptionist",
      email: process.env.NEXT_PUBLIC_QUICK_LOGIN_RECEPTIONIST_EMAIL || "",
      password: process.env.NEXT_PUBLIC_QUICK_LOGIN_RECEPTIONIST_PASSWORD || "",
    },
    {
      label: "Lab Technician",
      email: process.env.NEXT_PUBLIC_QUICK_LOGIN_LAB_TECHNICIAN_EMAIL || "",
      password: process.env.NEXT_PUBLIC_QUICK_LOGIN_LAB_TECHNICIAN_PASSWORD || "",
    },
    {
      label: "Pathologist",
      email: process.env.NEXT_PUBLIC_QUICK_LOGIN_PATHOLOGIST_EMAIL || "",
      password: process.env.NEXT_PUBLIC_QUICK_LOGIN_PATHOLOGIST_PASSWORD || "",
    },
  ].filter((entry) => entry.email && entry.password),
} as const

export type Branding = typeof branding
