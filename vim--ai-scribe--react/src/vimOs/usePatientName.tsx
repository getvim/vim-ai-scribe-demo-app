import { useVimOsContext } from "@/providers/VimOSContext";
import { EHR } from "vim-os-js-browser/types";
import { useEffect, useState } from "react";

/**
 * Securely fetches the current user's first and last name using the VimOS SDK session context.
 * Does not expose sensitive error details. Only returns first and last name.
 *
 * @returns { providerName, loading }
 */
export function usePatientName() {
  const vimOS = useVimOsContext();
  const [patientName, setPatientName] = useState("");
  useEffect(() => {
    const onPatientChange = (patient: EHR.Patient | undefined) => {
      setPatientName(
        [patient?.demographics?.firstName, patient?.demographics?.lastName]
          .filter(Boolean)
          .join(" ")
      );
    };
    vimOS.ehr.subscribe("patient", onPatientChange);

    return () => vimOS.ehr.unsubscribe("patient", onPatientChange);
  }, [vimOS.ehr]);

  return patientName;
}
