import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Check if patient has actual allergies (not placeholder text like "No allergies", "None", etc.)
 */
export function hasActualAllergies(allergies: string | null | undefined): boolean {
  if (!allergies || allergies.trim() === '') return false;
  
  const normalizedAllergies = allergies.toLowerCase().trim();
  const placeholderValues = [
    'no allergies',
    'no known allergies',
    'none',
    'n/a',
    'na',
    'nil',
    'not applicable',
    'no',
    '-',
    'none known',
    'nka',
    'nkda',
  ];
  
  return !placeholderValues.includes(normalizedAllergies);
}

/**
 * Check if patient has actual medical history (not placeholder text)
 */
export function hasActualMedicalHistory(history: string | null | undefined): boolean {
  if (!history || history.trim() === '') return false;
  
  const normalizedHistory = history.toLowerCase().trim();
  const placeholderValues = [
    'no history',
    'no medical history',
    'no significant history',
    'none',
    'n/a',
    'na',
    'nil',
    'not applicable',
    'no',
    '-',
  ];
  
  return !placeholderValues.includes(normalizedHistory);
}
