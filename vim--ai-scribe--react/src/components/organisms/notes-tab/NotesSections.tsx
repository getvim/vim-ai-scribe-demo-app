import { SoapSection } from "../../molecules/SoapSection";
import type {
  SectionTypes,
  TranscriptionSegment,
} from "../ai-scribe-demo/transcription.mock";
import { useUpdateEncounter } from "./useSectionWriteAvailability";

interface NotePanelProps {
  hoveredSegment: number | null;
  transcriptionSegments: TranscriptionSegment[];
  renderHighlightedText: (text: string) => JSX.Element;
}

export const NotesSections = ({
  hoveredSegment,
  transcriptionSegments,
  renderHighlightedText,
}: NotePanelProps) => {
  const {
    canUpdateSubjectiveNote,
    canUpdateObjectiveNote,
    canUpdateAssessmentNote,
    canUpdatePlanNote,
    updateSubjectiveNote,
    updateObjectiveNote,
    updateAssessmentNote,
    updatePlanNote,
  } = useUpdateEncounter();
  const isHighlighted = (section: SectionTypes) => {
    if (hoveredSegment === null) return false;
    return transcriptionSegments[hoveredSegment].affectedSections.includes(
      section
    );
  };

  return (
    <div className="space-y-4">
      <SoapSection
        title="Subjective"
        fieldName="subjective"
        isHighlighted={isHighlighted("subjective")}
        isWriteAvailable={canUpdateSubjectiveNote}
        renderHighlightedText={renderHighlightedText}
        onPushToEHR={updateSubjectiveNote}
      />
      <SoapSection
        title="Objective"
        fieldName="objective"
        isHighlighted={isHighlighted("objective")}
        isWriteAvailable={canUpdateObjectiveNote}
        renderHighlightedText={renderHighlightedText}
        onPushToEHR={updateObjectiveNote}
      />
      <SoapSection
        title="Assessment"
        fieldName="assessment"
        isHighlighted={isHighlighted("assessment")}
        isWriteAvailable={canUpdateAssessmentNote}
        renderHighlightedText={renderHighlightedText}
        onPushToEHR={updateAssessmentNote}
      />
      <SoapSection
        title="Plan"
        fieldName="plan"
        isHighlighted={isHighlighted("plan")}
        isWriteAvailable={canUpdatePlanNote}
        renderHighlightedText={renderHighlightedText}
        onPushToEHR={updatePlanNote}
      />
    </div>
  );
};
