import { TranscriptionPanel } from "../transcription-panel/TranscriptionPanel";
import { NotesSections } from "./NotesSections";
import type { TranscriptionSegment } from "../ai-scribe-demo/transcription.mock";
import { useUpdateEncounter } from "./useSectionWriteAvailability";

interface DebugViewProps {
  transcriptionSegments: TranscriptionSegment[];
  hoveredSegment: number | null;
  onHoverSegment: (index: number | null) => void;
  currentNote: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  renderHighlightedText: (text: string) => JSX.Element;
}

export const DebugView = ({
  transcriptionSegments,
  hoveredSegment,
  onHoverSegment,
  renderHighlightedText,
}: DebugViewProps) => {
  const updateEncounterState = useUpdateEncounter();

  return (
    <div className="grid grid-cols-2 gap-6">
      <TranscriptionPanel
        segments={transcriptionSegments}
        hoveredSegment={hoveredSegment}
        onHoverSegment={onHoverSegment}
      />
      <NotesSections
        hoveredSegment={hoveredSegment}
        transcriptionSegments={transcriptionSegments}
        renderHighlightedText={renderHighlightedText}
        {...updateEncounterState}
      />
    </div>
  );
};
