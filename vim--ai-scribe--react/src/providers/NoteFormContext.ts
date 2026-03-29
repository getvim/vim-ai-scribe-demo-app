import { useForm, UseFormReturn } from "react-hook-form";
import { createContext, useContext } from "react";

export interface NoteFormData {
  // Legacy fields (used for hasCurrentNote check)
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  // Granular section fields
  subjectiveChiefComplaint: string;
  subjectiveGeneral: string;
  subjectiveHpi: string;
  subjectiveRos: string;
  objectiveGeneral: string;
  objectivePhysicalExam: string;
  assessmentGeneral: string;
  assessmentIcdCodes: string;
  planGeneral: string;
  billingCptCodes: string;
  generalEncounterNotes: string;
  patientInstructions: string;
}

export const useNoteForm = () => {
  return useForm<NoteFormData>({
    defaultValues: {
      subjective: "",
      objective: "",
      assessment: "",
      plan: "",
      subjectiveChiefComplaint: "",
      subjectiveGeneral: "",
      subjectiveHpi: "",
      subjectiveRos: "",
      objectiveGeneral: "",
      objectivePhysicalExam: "",
      assessmentGeneral: "",
      assessmentIcdCodes: "",
      planGeneral: "",
      billingCptCodes: "",
      generalEncounterNotes: "",
      patientInstructions: "",
    },
  });
};

export const NoteFormContext = createContext<UseFormReturn<NoteFormData> | null>(null);

export const useNoteFormContext = () => {
  const context = useContext(NoteFormContext);
  if (!context) {
    throw new Error("useNoteFormContext must be used within a NoteFormProvider");
  }
  return context;
}; 