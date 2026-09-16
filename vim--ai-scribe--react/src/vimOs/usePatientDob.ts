import { usePatient } from "./usePatient";

export function usePatientDob() {
  return usePatient()?.demographics?.dateOfBirth;
}

/** Format "YYYY-MM-DD" → "Jan 14, 1983" */
export function formatDob(dob: string): string {
  const date = new Date(dob + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Calculate age in years from "YYYY-MM-DD" */
export function calculateAge(dob: string): number {
  const today = new Date();
  const birth = new Date(dob + "T00:00:00");
  let age = today.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hasHadBirthdayThisYear) age--;
  return age;
}
