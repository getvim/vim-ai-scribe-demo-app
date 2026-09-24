import { useVimOsContext } from "@/providers/VimOSContext";
import type { Patient } from "@vimconnect/app-sdk";
import { useEffect, useState } from "react";

type PatientSource = "chart_open:patient" | "encounter_open:patient";

interface HeldPatient {
  fields: Partial<Patient>;
  source: PatientSource;
}

/**
 * The in-context patient, held across a chart → encounter transition.
 *
 * Both keys go empty during that transition — the chart context closes before the
 * encounter's patient arrives, and some EHRs never populate `encounter_open:patient`
 * at all. Dropping the patient on any empty event blanks the UI mid-encounter, so the
 * held value is cleared only by the key that supplied it.
 *
 * onChange hands back a context envelope, not the entity: it lives under `.fields`, and
 * every field on it is optional because the EHR supplies only what it has.
 */
export function usePatient(): Partial<Patient> | undefined {
  const vimOS = useVimOsContext();
  const [held, setHeld] = useState<HeldPatient>();

  useEffect(() => {
    const apply = (source: PatientSource, fields: Partial<Patient> | undefined) =>
      setHeld((previous) => {
        if (fields) return { fields, source };
        return previous?.source === source ? undefined : previous;
      });

    const unsubscribers: Array<() => void> = (
      ["chart_open:patient", "encounter_open:patient"] as const
    ).map((key) =>
      vimOS.ehr.context.onChange(key, (_previous, current) =>
        apply(key, current?.fields)
      )
    );

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [vimOS]);

  return held?.fields;
}
