import { useVimOsContext } from "@/providers/VimOSContext";
import type { Patient } from "@vimconnect/app-sdk";
import { useEffect, useState } from "react";

type PatientSource = "chart_open:patient" | "encounter_open:patient";

interface HeldPatient {
  fields: Partial<Patient>;
  source: PatientSource;
}

interface PatientContext {
  id?: string;
  fields?: Partial<Patient>;
}

/** Read loosely: `sourceId` arrives on newer collections than the installed types know. */
const IDENTIFIER_KEYS = ["sourceId", "ehrPatientId", "mrn", "id"] as const;

/** Same person if the envelopes share an id, or the patients share any identifier. */
function isSamePatient(a: PatientContext, b: PatientContext): boolean {
  if (a.id !== undefined && a.id === b.id) return true;
  const aIds = (a.fields?.identifiers ?? {}) as Record<string, string | undefined>;
  const bIds = (b.fields?.identifiers ?? {}) as Record<string, string | undefined>;
  return IDENTIFIER_KEYS.some((key) => aIds[key] !== undefined && aIds[key] === bIds[key]);
}

/**
 * `later` over `earlier`, one level deep: the encounter may send `demographics` holding
 * only a date of birth, which a shallow spread would let wipe the chart's name.
 */
function mergeFields(
  earlier: Partial<Patient>,
  later: Partial<Patient>
): Partial<Patient> {
  const merged: Record<string, unknown> = { ...earlier };
  for (const [key, value] of Object.entries(later)) {
    if (value === undefined) continue;
    const before = merged[key];
    merged[key] =
      isPlainObject(before) && isPlainObject(value)
        ? { ...before, ...withoutUndefined(value) }
        : value;
  }
  return merged as Partial<Patient>;
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const withoutUndefined = (value: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined));

/**
 * The in-context patient, held across a chart → encounter transition.
 *
 * Both keys go empty during that transition — the chart context closes before the
 * encounter's patient arrives, and some EHRs never populate `encounter_open:patient`
 * at all. Dropping the patient on any empty event blanks the UI mid-encounter, so the
 * held value is cleared only by the key that supplied it.
 *
 * A patient that arrives with no name — the encounter supplies only identifiers — is
 * filled in from the last chart patient when it is the same person. The chart closes before
 * the encounter opens, so by then `ehr.api.patient.getPatient()` has no patient in context
 * and fails; it is only a fallback for an EHR that keeps one open.
 *
 * onChange hands back a context envelope, not the entity: it lives under `.fields`, and
 * every field on it is optional because the EHR supplies only what it has.
 */
export function usePatient(): Partial<Patient> | undefined {
  const vimOS = useVimOsContext();
  const [held, setHeld] = useState<HeldPatient>();

  useEffect(() => {
    let disposed = false;
    // Outlives the chart context, which is already empty when the encounter's patient arrives.
    let lastChartPatient: PatientContext | undefined;

    const fillFromApi = async (requested: HeldPatient) => {
      try {
        const response = await vimOS.ehr.api.patient.getPatient();
        if (disposed || !response.success) return;
        // Applied only if no other patient arrived while the call was in flight.
        setHeld((previous) =>
          previous === requested
            ? { ...previous, fields: { ...response.data, ...previous.fields } }
            : previous
        );
      } catch {
        // The app's scope may not grant getPatient; the patient keeps the fields the context gave.
      }
    };

    const apply = (source: PatientSource, current: PatientContext | undefined) => {
      let fields = current?.fields;
      if (fields && current) {
        if (source === "chart_open:patient") {
          lastChartPatient = current;
        } else if (lastChartPatient?.fields && isSamePatient(lastChartPatient, current)) {
          fields = mergeFields(lastChartPatient.fields, fields);
        }
        const next = { fields, source };
        setHeld(next);
        if (!fields.demographics?.firstName && !fields.demographics?.lastName) void fillFromApi(next);
        return;
      }
      setHeld((previous) => (previous?.source === source ? undefined : previous));
    };

    const unsubscribers: Array<() => void> = (
      ["chart_open:patient", "encounter_open:patient"] as const
    ).map((key) =>
      vimOS.ehr.context.onChange(key, (_previous, current) => apply(key, current))
    );

    return () => {
      disposed = true;
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [vimOS]);

  return held?.fields;
}
