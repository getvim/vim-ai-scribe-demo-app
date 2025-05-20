import { useUpdateEncounterSubscription } from "@/vimOs/useUpdateEncounter";
import { useNoteFormContext } from "@/providers/NoteFormContext";

export const useUpdateSubjective = () => {
  const { updateSubscriptionField, canUpdateSubscriptionParams } =
    useUpdateEncounterSubscription("subjective", [
      "chiefComplaintNotes",
      "reviewOfSystemsNotes",
    ]);

  const { watch } = useNoteFormContext();

  const updateSubjectiveNote = () => {
    if (canUpdateSubscriptionParams) {
      const formValues = watch();
      updateSubscriptionField(formValues.subjective);
    }
  };

  return {
    canUpdateSubjectiveNote: canUpdateSubscriptionParams,
    updateSubjectiveNote,
  };
};

export const useUpdateObjective = () => {
  const encounterUpdates = useUpdateEncounterSubscription("objective", [
    "generalNotes",
    "physicalExamNotes",
  ]);

  const { updateSubscriptionField, canUpdateSubscriptionParams } =
    encounterUpdates;
  const { watch } = useNoteFormContext();

  const updateObjectiveNote = () => {
    if (canUpdateSubscriptionParams) {
      const formValues = watch();
      updateSubscriptionField(formValues.objective);
    }
  };

  return {
    canUpdateObjectiveNote: canUpdateSubscriptionParams,
    updateObjectiveNote,
  };
};

export const useUpdateAssessment = () => {
  const { updateSubscriptionField, canUpdateSubscriptionParams } =
    useUpdateEncounterSubscription("assessment", ["generalNotes"]);

  const { watch } = useNoteFormContext();

  const updateAssessmentNote = () => {
    if (canUpdateSubscriptionParams) {
      const formValues = watch();
      updateSubscriptionField(formValues.assessment);
    }
  };

  return {
    canUpdateAssessmentNote: canUpdateSubscriptionParams,
    updateAssessmentNote,
  };
};

export const useUpdatePlan = () => {
  const { updateSubscriptionField, canUpdateSubscriptionParams } =
    useUpdateEncounterSubscription("plan", ["generalNotes"]);

  const { watch } = useNoteFormContext();

  const updatePlanNote = () => {
    if (canUpdateSubscriptionParams) {
      const formValues = watch();
      updateSubscriptionField(formValues.plan);
    }
  };

  return {
    canUpdatePlanNote: canUpdateSubscriptionParams,
    updatePlanNote,
  };
};

export const useUpdateEncounter = () => {
  const { canUpdateSubjectiveNote, updateSubjectiveNote } =
    useUpdateSubjective();
  const { canUpdateObjectiveNote, updateObjectiveNote } = useUpdateObjective();
  const { canUpdateAssessmentNote, updateAssessmentNote } =
    useUpdateAssessment();
  const { canUpdatePlanNote, updatePlanNote } = useUpdatePlan();
  return {
    canUpdateSubjectiveNote,
    updateSubjectiveNote,
    canUpdateObjectiveNote,
    updateObjectiveNote,
    canUpdateAssessmentNote,
    updateAssessmentNote,
    canUpdatePlanNote,
    updatePlanNote,
  };
};
