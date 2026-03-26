import { useVimOsContext } from "@/providers/VimOSContext";
import { EHR } from "vim-os-js-browser/types";
import { useEffect, useState } from "react";

export function usePatientDob() {
  const vimOS = useVimOsContext();
  const [dateOfBirth, setDateOfBirth] = useState<string | undefined>(undefined);

  useEffect(() => {
    const onPatientChange = (patient: EHR.Patient | undefined) => {
      setDateOfBirth(patient?.demographics?.dateOfBirth);
    };
    vimOS.ehr.subscribe("patient", onPatientChange);
    return () => vimOS.ehr.unsubscribe("patient", onPatientChange);
  }, [vimOS.ehr]);

  return dateOfBirth;
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
