import { useVimOsContext } from "@/providers/VimOSContext";
import type { Patient } from "@vimconnect/app-sdk";
import { useEffect, useState } from "react";

/**
 * Patient arrives under two context keys. The encounter-scoped one wins when both are
 * present, so a scribe writing into an open encounter always sees that encounter's patient.
 */
export function usePatient(): Patient | undefined {
  const vimOS = useVimOsContext();
  const [chartPatient, setChartPatient] = useState<Patient | undefined>();
  const [encounterPatient, setEncounterPatient] = useState<
    Patient | undefined
  >();

  useEffect(() => {
    const unsubscribers = [
      vimOS.ehr.context.onChange("chart_open:patient", (_previous, current) =>
        setChartPatient(current)
      ),
      vimOS.ehr.context.onChange(
        "encounter_open:patient",
        (_previous, current) => setEncounterPatient(current)
      ),
    ];
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [vimOS]);

  return encounterPatient ?? chartPatient;
}
