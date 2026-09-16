import { usePatient } from "./usePatient";

/**
 * The in-context patient's first and last name, or an empty string when no patient is open.
 */
export function usePatientName() {
  const patient = usePatient();

  return [patient?.demographics?.firstName, patient?.demographics?.lastName]
    .filter(Boolean)
    .join(" ");
}
