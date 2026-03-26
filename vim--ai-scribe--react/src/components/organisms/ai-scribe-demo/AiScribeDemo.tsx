import { useNoteFormContext } from "@/providers/NoteFormContext";
import { useVimOsContext } from "@/providers/VimOSContext";
import { useState } from "react";
import { NotesScreen } from "./NotesScreen";
import { RecordingScreen } from "./RecordingScreen";
import { WelcomeScreen } from "./WelcomeScreen";
import { PreviousNotesScreen } from "./PreviousNotesScreen";
import type { Note } from "./Note.interface";
import { TranscribingScreen } from "./TranscribingScreen";
import { usePatientName } from "../../../vimOs/usePatientName";
import { useRecorder } from "./useRecorder";

const RECORDING_RESULT = {
  // Legacy fields
  subjective:
    "Patient reports experiencing colic pain on both sides of the lower abdomen for the past two days. The pain is intermittent, sharp, and cramping in nature, rated 6/10 in intensity.",
  objective:
    "Vital signs stable. BP 120/80, HR 72, RR 16, Temp 98.6 degrees F. Abdomen tender to palpation bilaterally in lower quadrants. No rebound tenderness or guarding. Bowel sounds normal.",
  assessment:
    "Acute lower abdominal pain, likely secondary to gastroenteritis or menstrual-related cramping. No clinical signs of acute surgical abdomen at this time.",
  plan: "Prescribed antispasmodic medication for pain relief\nRecommended clear liquid diet for 24 hours, advance as tolerated\nAdvised return precautions for worsening pain or new symptoms\nFollow-up visit recommended in 3 days if symptoms persist",
  // Granular fields
  subjectiveChiefComplaint: "Non-surgical abdominal pain",
  subjectiveGeneral:
    "Patient reports experiencing colic pain on both sides of the lower abdomen for the past two days. The pain is intermittent, sharp, and cramping in nature, rated 6/10 in intensity.",
  subjectiveHpi:
    "The patient presents with a two-day history of bilateral lower abdominal pain. Pain is described as intermittent, sharp, and cramping, without radiation. The patient denies associated fever, vomiting, diarrhea, or urinary symptoms. No known aggravating or relieving factors reported. Symptoms prompted evaluation due to persistence.",
  subjectiveRos:
    "Constitutional: Denies fever, chills, or weight loss\nGastrointestinal: Reports abdominal pain; denies nausea, vomiting, diarrhea, constipation, or blood in stool\nGenitourinary: Denies dysuria, hematuria, or abnormal vaginal bleeding\nCardiovascular: Denies chest pain or palpitations\nRespiratory: Denies shortness of breath or cough\nAll other systems reviewed and negative.",
  objectiveGeneral: "Vital signs stable. BP 120/80, HR 72, RR 16, Temp 98.6 degrees F.",
  objectivePhysicalExam:
    "General: Patient alert, in no acute distress\nAbdomen: Soft, non-distended. Mild tenderness to palpation in bilateral lower quadrants. No rebound tenderness or guarding. Bowel sounds present and normal.\nCardiovascular: Regular rate and rhythm\nRespiratory: Clear to auscultation bilaterally",
  assessmentGeneral:
    "Acute lower abdominal pain, likely secondary to gastroenteritis or menstrual-related cramping. No clinical signs of acute surgical abdomen at this time.",
  assessmentIcdCodes:
    "R10.30 – Lower abdominal pain, unspecified\nPain localized to the lower abdomen without a definitive etiology at time of visit.\nProvider Notes: Bilateral lower abdominal pain x2 days, intermittent and cramping. Exam with mild lower quadrant tenderness. Vitals stable. No clear etiology identified.\n\nK52.9 – Noninfective gastroenteritis and colitis, unspecified\nConsidered due to abdominal cramping and tenderness without systemic signs.\nProvider Notes: Abdominal cramping and tenderness without fever or systemic symptoms. Gastroenteritis considered. Conservative management advised.",
  planGeneral:
    "Prescribed antispasmodic medication for pain relief\nRecommended clear liquid diet for 24 hours, advance as tolerated\nAdvised return precautions for worsening pain or new symptoms\nFollow-up visit recommended in 3 days if symptoms persist",
  billingCptCodes:
    "99214 – Office or other outpatient visit, established patient\nModerate complexity visit involving detailed history, examination, and medical decision-making.\n\n81025 – Urine pregnancy test (if clinically indicated)\nPerformed or reviewed to rule out pregnancy-related causes of abdominal pain.",
  generalEncounterNotes:
    "The patient was evaluated in an outpatient setting for lower abdominal pain. History, physical examination, and clinical findings were reviewed and discussed with the patient. No red flag symptoms or signs of acute surgical pathology were identified during today's visit.\nClinical assessment supports conservative management at this time. The patient was counseled on symptom monitoring, dietary modifications, medication use, and return precautions. The patient verbalized understanding of the plan and agreed with the proposed treatment and follow-up recommendations.",
  patientInstructions:
    "Dear Patient,\nThank you for coming in today. This note summarizes your visit and provides instructions to help manage your symptoms at home.\n\nVisit Summary\nYou were seen today for lower abdominal pain that has been present for the past two days. The pain was described as intermittent, cramping, and moderate in intensity. Your vital signs were stable, and your physical exam showed tenderness in the lower abdomen without signs of a serious or surgical condition.\nAt this time, your symptoms are most consistent with abdominal cramping, which may be related to gastroenteritis or menstrual-related pain.\n\nCare Instructions\nTake the prescribed antispasmodic medication as directed.\nFollow a clear liquid diet for the next 24 hours, then slowly resume normal foods as tolerated.\nRest as needed and avoid strenuous activity until symptoms improve.\n\nWhen to Seek Care\nPlease contact us or seek urgent medical attention if you experience worsening or severe abdominal pain, persistent vomiting, fever, or new or concerning symptoms.\n\nFollow-Up\nIf your symptoms do not improve, please schedule a follow-up appointment in 3 days.\n\nWishing you a speedy recovery,\nYour Care Team",
};

type TabType = "record" | "notes" | "user";

export const AiScribeDemo = () => {
  const vimOS = useVimOsContext();
  const [activeTab, setActiveTab] = useState<TabType>("record");
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "mock-1",
      patientName: "Sarah Cohen",
      timestamp: "1/12/2026, 9:15:00 AM",
      soap: {
        subjective: "Patient reports fatigue and mild headache.",
        objective: "BP 118/76, HR 68, Temp 98.4F.",
        assessment: "Annual physical exam. Overall health is good.",
        plan: "Continue current medications. Follow up in 12 months.",
      },
    },
    {
      id: "mock-2",
      patientName: "Michael Rivera",
      timestamp: "1/12/2026, 10:40:00 AM",
      soap: {
        subjective: "Patient reports elevated blood pressure readings at home.",
        objective: "BP 148/92, HR 74.",
        assessment: "Follow-up for hypertension. Blood pressure not well controlled.",
        plan: "Adjust antihypertensive medication. Recheck in 4 weeks.",
      },
    },
    {
      id: "mock-3",
      patientName: "Emily Thompson",
      timestamp: "1/11/2026, 2:05:00 PM",
      soap: {
        subjective: "Sore throat, runny nose, mild fever for 3 days.",
        objective: "Temp 99.8F, throat erythema, no exudate.",
        assessment: "Upper respiratory infection symptoms. Likely viral.",
        plan: "Rest, fluids, OTC symptom relief. Return if no improvement in 5 days.",
      },
    },
  ]);
  const patientName = usePatientName();
  const [visitedPatient, setVisitedPatient] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSelectingTemplate, setIsSelectingTemplate] = useState(false);
const { watch, reset } = useNoteFormContext();
  const {
    isPaused,
    setIsPaused,
    isRecording,
    recordingTime,
    simulateRecording,
    stopRecording,
  } = useRecorder();
  const currentNote = watch();
  const hasCurrentNote = Boolean(
    currentNote.subjective ||
      currentNote.objective ||
      currentNote.assessment ||
      currentNote.plan
  );

  const handleTabChange = (tab: TabType) => {
    if (tab === "notes" && !hasCurrentNote) {
      return;
    }
    setActiveTab(tab);
    vimOS.hub.setDynamicAppSize("CLASSIC");
  };

  const handlePausePlay = () => {
    setIsPaused(!isPaused);
  };

  const handleStopVisit = () => {
    setIsSelectingTemplate(true);
  };

  const handleTemplateSelected = (_template: string) => {
    setIsSelectingTemplate(false);
    stopRecording();
    setVisitedPatient(patientName);
    setIsProcessing(true);

    setTimeout(() => {
      const newNote = RECORDING_RESULT;
      reset(newNote);

      const savedNote: Note = {
        id: Date.now().toString(),
        patientName,
        timestamp: new Date().toLocaleString(),
        soap: newNote,
      };

      setNotes((prevNotes) => [savedNote, ...prevNotes]);
      setIsProcessing(false);
      setActiveTab("notes");
    }, 8000);
  };




  if (activeTab === "notes") {
    return (
      <div className="flex flex-col h-screen">
        <NotesScreen
          patientName={visitedPatient}
          onStartNewRecording={simulateRecording}
          hasCurrentNote={hasCurrentNote}
          onTabChange={handleTabChange}
        />
      </div>
    );
  }

  if (activeTab === "user") {
    return (
      <div className="flex flex-col h-screen">
        <PreviousNotesScreen
          notes={notes}
          onStartVisit={simulateRecording}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          hasCurrentNote={hasCurrentNote}
        />
      </div>
    );
  }

  if (activeTab === "record" && !isRecording && !isProcessing) {
    return (
      <div className="flex flex-col h-screen">
        <WelcomeScreen
          onStartVisit={simulateRecording}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          hasCurrentNote={hasCurrentNote}
        />
      </div>
    );
  }

  if (activeTab === "record" && isProcessing) {
    return (
      <div className="flex flex-col h-screen">
        <TranscribingScreen
          hasCurrentNote={hasCurrentNote}
          onTabChange={handleTabChange}
        />
      </div>
    );
  }

  if (activeTab === "record" && isRecording && !isProcessing) {
    return (
      <div className="flex flex-col h-screen">
        <RecordingScreen
          isPaused={isPaused}
          recordingTime={recordingTime}
          onPausePlay={handlePausePlay}
          onStopVisit={handleStopVisit}
          onTemplateSelected={handleTemplateSelected}
          showTemplateSelect={isSelectingTemplate}
          onCloseTemplateSelect={() => setIsSelectingTemplate(false)}
          hasCurrentNote={hasCurrentNote}
          onTabChange={handleTabChange}
        />
      </div>
    );
  }

  return null;
};
