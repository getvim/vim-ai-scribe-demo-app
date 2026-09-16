import { useVimOsContext } from "@/providers/VimOSContext";
import type { Patient } from "@vimconnect/app-sdk";
import { useEffect, useState } from "react";

/**
 * Patient arrives under two context keys. The encounter-scoped one wins when both are
 * present, so a scribe writing into an open encounter always sees that encounter's patient.
 *
 * onChange hands back a context envelope, not the entity: the entity lives under `.fields`
 * and every field on it is optional, because the EHR supplies only what it has.
 */
export function usePatient(): Partial<Patient> | undefined {
  const vimOS = useVimOsContext();
  const [chartPatient, setChartPatient] = useState<Partial<Patient>>();
  const [encounterPatient, setEncounterPatient] = useState<Partial<Patient>>();

  useEffect(() => {
    const unsubscribers = [
      vimOS.ehr.context.onChange("chart_open:patient", (_previous, current) =>
        setChartPatient(current?.fields)
      ),
      vimOS.ehr.context.onChange(
        "encounter_open:patient",
        (_previous, current) => setEncounterPatient(current?.fields)
      ),
    ];
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [vimOS]);

  return encounterPatient ?? chartPatient;
}
