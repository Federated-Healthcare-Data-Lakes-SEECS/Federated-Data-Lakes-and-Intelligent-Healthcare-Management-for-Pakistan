/**
 * Centralized branding configuration for the admin panel.
 *
 * All values are driven by NEXT_PUBLIC_* environment variables so that each
 * deployment can carry its own identity without any code changes.
 *
 * Usage:
 *   import { branding } from "@/lib/branding"
 *   <h1>{branding.hospitalName}</h1>
 */

export const branding = {
  /** Full hospital / organization name */
  hospitalName:
    process.env.NEXT_PUBLIC_HOSPITAL_NAME || "HMS Admin",

  /** Short tagline shown beneath the name or in meta descriptions */
  tagline:
    process.env.NEXT_PUBLIC_HOSPITAL_TAGLINE ||
    "Hospital Management System",

  /** One-line description for SEO / meta tags */
  description:
    process.env.NEXT_PUBLIC_HOSPITAL_DESCRIPTION ||
    "Streamline your hospital operations with our comprehensive administrative panel. Manage staff, departments, and medical resources all in one place.",

  /** Copyright holder – used in the footer */
  copyrightHolder:
    process.env.NEXT_PUBLIC_HOSPITAL_COPYRIGHT ||
    process.env.NEXT_PUBLIC_HOSPITAL_NAME ||
    "Hospital Management System",

  /** Optional logo URL (external or from /public) */
  logoUrl:
    process.env.NEXT_PUBLIC_HOSPITAL_LOGO_URL || "",

  /** Year shown in the footer copyright line */
  copyrightYear:
    process.env.NEXT_PUBLIC_HOSPITAL_COPYRIGHT_YEAR ||
    new Date().getFullYear().toString(),
} as const

export type Branding = typeof branding
