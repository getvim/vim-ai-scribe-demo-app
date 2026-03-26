import { useState, useEffect, useRef } from "react";
import { Mic, ClipboardList, User, UserCircle, ChevronDown, Send, CheckCircle2, X } from "lucide-react";
import { usePatientName } from "@/vimOs/usePatientName";
import { usePatientDob, formatDob, calculateAge } from "@/vimOs/usePatientDob";
import { useNoteFormContext } from "@/providers/NoteFormContext";
import { useVimOsContext } from "@/providers/VimOSContext";

const imgDemoMic = "https://static.getvim.com/prod/vim-os-appstore/apps/icons/e1e2a9c2-b502-43ee-8501-52fed01c275a.svg";
import imgMicSelectIcon from "@/assets/icon-mic-select.svg";

// EHR field options shown in the mapping dropdown (ICD/CPT handled separately)
type EhrFieldOption = { label: string; section: string; field: string };

const ALL_EHR_OPTIONS: EhrFieldOption[] = [
  { label: "Subjective – Chief Complaint", section: "subjective", field: "chiefComplaintNotes" },
  { label: "Subjective – General", section: "subjective", field: "generalNotes" },
  { label: "Subjective – History of Present Illness", section: "subjective", field: "historyOfPresentIllnessNotes" },
  { label: "Subjective – Review of Systems", section: "subjective", field: "reviewOfSystemsNotes" },
  { label: "Objective – General", section: "objective", field: "generalNotes" },
  { label: "Objective – Physical examination", section: "objective", field: "physicalExamNotes" },
  { label: "Assessment – General", section: "assessment", field: "generalNotes" },
  { label: "Plan – General", section: "plan", field: "generalNotes" },
  { label: "General Encounter Notes", section: "encounterNotes", field: "generalNotes" },
  { label: "Patient Instructions", section: "patientInstructions", field: "generalNotes" },
];

// Structured code entry
type CodeEntry = { code: string; description: string; notes: string };

const MOCK_ICD_CODES: CodeEntry[] = [
  {
    code: "R10.30",
    description: "Lower abdominal pain, unspecified",
    notes: "Pain localized to the lower abdomen without a definitive etiology at time of visit. Bilateral lower abdominal pain ×2 days, intermittent and cramping. Exam with mild lower quadrant tenderness. Vitals stable.",
  },
  {
    code: "K52.9",
    description: "Noninfective gastroenteritis and colitis, unspecified",
    notes: "Abdominal cramping and tenderness without fever or systemic symptoms. Gastroenteritis considered. Conservative management advised.",
  },
];

const MOCK_CPT_CODES: CodeEntry[] = [
  {
    code: "99214",
    description: "Office or other outpatient visit, established patient",
    notes: "Moderate complexity visit involving detailed history, examination, and medical decision-making.",
  },
  {
    code: "81025",
    description: "Urine pregnancy test (if clinically indicated)",
    notes: "Performed or reviewed to rule out pregnancy-related causes of abdominal pain.",
  },
];

// Text sections (have editable textarea + EHR field mapping dropdown)
const TEXT_SECTIONS = [
  { key: "subjectiveChiefComplaint", title: "Subjective – Chief Complaint" },
  { key: "subjectiveGeneral", title: "Subjective – General" },
  { key: "subjectiveHpi", title: "Subjective – History of Present Illness" },
  { key: "subjectiveRos", title: "Subjective – Review of Systems" },
  { key: "objectiveGeneral", title: "Objective – General" },
  { key: "objectivePhysicalExam", title: "Objective – Physical Examination" },
  { key: "assessmentGeneral", title: "Assessment – General" },
  { key: "planGeneral", title: "Plan – General" },
  { key: "generalEncounterNotes", title: "General Encounter Notes" },
  { key: "patientInstructions", title: "Patient Instructions" },
] as const;

type TextSectionKey = (typeof TEXT_SECTIONS)[number]["key"];

interface NotesScreenProps {
  patientName: string | null;
  onStartNewRecording: () => void;
  hasCurrentNote: boolean;
  onTabChange: (tab: "record" | "notes" | "user") => void;
}

export const NotesScreen = ({
  onTabChange,
}: NotesScreenProps) => {
  const vimOS = useVimOsContext();
  const patientNameFromHook = usePatientName();
  const dateOfBirth = usePatientDob();
  const { watch, register } = useNoteFormContext();
  const currentNote = watch();
  const [pushedCodes, setPushedCodes] = useState<Set<string>>(new Set());
  const [ehrDiagnosisCodes, setEhrDiagnosisCodes] = useState<Set<string>>(new Set());

  // Per-section EHR field mapping
  const [mappings, setMappings] = useState<Record<TextSectionKey, EhrFieldOption | null>>({
    subjectiveChiefComplaint: null,
    subjectiveGeneral: null,
    subjectiveHpi: null,
    subjectiveRos: null,
    objectiveGeneral: null,
    objectivePhysicalExam: null,
    assessmentGeneral: null,
    planGeneral: null,
    generalEncounterNotes: null,
    patientInstructions: null,
  });

  const [openDropdown, setOpenDropdown] = useState<TextSectionKey | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Available EHR fields — filtered by canUpdateEncounter, fall back to all
  const [availableFields, setAvailableFields] = useState<EhrFieldOption[]>(ALL_EHR_OPTIONS);

  useEffect(() => {
    const computeAvailable = () => {
      try {
        const canUpdateResult = vimOS.ehr.resourceUpdater.canUpdateEncounter({
          subjective: { generalNotes: true, chiefComplaintNotes: true, historyOfPresentIllnessNotes: true, reviewOfSystemsNotes: true, medicalHistoryNotes: true, surgicalHistoryNotes: true, hospitalizationNotes: true, familyHistoryNotes: true, socialHistoryNotes: true } as never,
          objective: { generalNotes: true, physicalExamNotes: true } as never,
          assessment: { generalNotes: true } as never,
          plan: { generalNotes: true, nextAppointmentFollowUpNotes: true } as never,
          encounterNotes: { generalNotes: true } as never,
          patientInstructions: { generalNotes: true } as never,
        });
        const { details } = canUpdateResult;
        const available = ALL_EHR_OPTIONS.filter((opt) => {
          const sec = (details as Record<string, Record<string, boolean>>)[opt.section];
          return sec?.[opt.field] === true;
        });
        // Fall back to all options if none are writable (demo/sandbox context)
        setAvailableFields(available.length > 0 ? available : ALL_EHR_OPTIONS);
      } catch {
        setAvailableFields(ALL_EHR_OPTIONS);
      }
    };

    computeAvailable();
    vimOS.ehr.resourceUpdater.subscribe("encounter", computeAvailable);
    return () => vimOS.ehr.resourceUpdater.unsubscribe("encounter", computeAvailable);
  }, [vimOS.ehr.resourceUpdater]);

  useEffect(() => {
    const onEncounterChange = (encounter: { assessment?: { diagnosisCodes?: { code: string }[] } } | undefined) => {
      const codes = encounter?.assessment?.diagnosisCodes?.map((d) => d.code) ?? [];
      setEhrDiagnosisCodes(new Set(codes));
    };
    const current = vimOS.ehr.ehrState?.encounter;
    onEncounterChange(current as never);
    vimOS.ehr.subscribe("encounter", onEncounterChange as never);
    return () => vimOS.ehr.unsubscribe("encounter", onEncounterChange as never);
  }, [vimOS.ehr]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectField = (key: TextSectionKey, option: EhrFieldOption) => {
    setMappings((prev) => ({ ...prev, [key]: option }));
    setOpenDropdown(null);
  };

  const handlePushToEhr = async () => {
    const payload: Record<string, Record<string, string>> = {};
    (Object.entries(mappings) as [TextSectionKey, EhrFieldOption | null][]).forEach(([key, opt]) => {
      if (!opt) return;
      const content = currentNote[key] ?? "";
      if (!payload[opt.section]) payload[opt.section] = {};
      payload[opt.section][opt.field] = content;
    });
    if (Object.keys(payload).length === 0) return;
    try {
      await vimOS.ehr.resourceUpdater.updateEncounter(payload as never);
    } catch (error) {
      console.error("Failed to push notes to EHR", error);
    }
  };

  const handlePushCode = async (type: "icd" | "cpt", entry: CodeEntry) => {
    try {
      if (type === "icd") {
        await vimOS.ehr.resourceUpdater.updateEncounter({
          assessment: { diagnosisCodes: [{ code: entry.code, description: entry.description }] } as never,
        });
      } else {
        await vimOS.ehr.resourceUpdater.updateEncounter({
          billingInformation: { procedureCodes: [{ code: entry.code, description: entry.description }] } as never,
        });
      }
      setPushedCodes((prev) => new Set(prev).add(entry.code));
    } catch (error) {
      console.error(`Failed to push ${type.toUpperCase()} code`, error);
    }
  };

  const hasMappings = Object.values(mappings).some(Boolean);

  return (
    <div className="flex flex-col w-full h-full rounded-tl-[20px] overflow-hidden shadow-[-5px_0px_10px_0px_rgba(8,58,107,0.15)]">
      {/* Compact green header */}
      <div className="bg-[#5ec16a] flex items-center justify-between px-4 py-3 w-full shrink-0">
        <div className="flex items-center gap-2 shrink-0">
          <img src={imgDemoMic} alt="" className="w-5 h-5 shrink-0" style={{ filter: "brightness(0) invert(1)" }} />
          <span className="text-white text-[14px] font-semibold leading-tight">Ai Scribe Demo</span>
        </div>
        <div className="bg-[#f5fdf7] flex items-center gap-1 px-2 py-1 rounded flex-1 mx-3 min-w-0">
          <UserCircle className="w-3.5 h-3.5 shrink-0 text-[#001c36]" />
          <p className="text-[#001c36] text-[12px] overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="font-bold">{patientNameFromHook || "No patient selected"}</span>
            {dateOfBirth && (
              <span className="font-normal">
                {" /  "}{formatDob(dateOfBirth)}{"  /  "}{calculateAge(dateOfBirth)}{" yr"}
              </span>
            )}
          </p>
        </div>
        <div className="bg-white flex items-center gap-1 px-2 py-1 mr-1 shrink-0">
          <div className="w-4 h-4 relative shrink-0">
            <img src={imgMicSelectIcon} alt="" className="absolute" style={{ top: "15.63%", left: "25%", right: "23.72%", bottom: "15.63%", width: "100%", height: "100%" }} />
          </div>
          <div className="w-[25px] h-[12px] relative shrink-0">
            <div className="absolute bg-[#d0d0d0] rounded-full" style={{ left: "44.21%", right: "44.31%", top: 0, bottom: 0 }} />
            <div className="absolute bg-[#d0d0d0] rounded-full" style={{ left: "65.54%", right: "22.36%", top: "14.29%", bottom: "8.79%" }} />
            <div className="absolute bg-[#d0d0d0] rounded-full" style={{ left: "22.4%", right: "65.49%", top: "13.58%", bottom: "9.5%" }} />
            <div className="absolute bg-[#d0d0d0] rounded-full" style={{ left: "87.89%", right: "0", top: "26.92%", bottom: "21.43%" }} />
            <div className="absolute bg-[#d0d0d0] rounded-full" style={{ left: "0", right: "87.89%", top: "26.92%", bottom: "21.43%" }} />
          </div>
        </div>
      </div>

      {/* Accent bar */}
      <div className="bg-[rgba(94,193,106,0.5)] h-[5px] w-full shrink-0" />

      {/* Scrollable content */}
      <div className="bg-white flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-5 relative" ref={dropdownRef}>

        {/* Text sections with editable textarea + EHR mapping */}
        {TEXT_SECTIONS.map(({ key, title }) => {
          const content = currentNote[key] ?? "";
          const mapping = mappings[key];
          const isOpen = openDropdown === key;

          return (
            <div key={key} className="flex flex-col gap-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[#001c36] text-[15px] font-bold">{title}</span>
                <div className="flex items-center gap-1 ml-2 shrink-0">
                  {mapping && (
                    <button
                      onClick={() => setMappings((prev) => ({ ...prev, [key]: null }))}
                      className="text-[#828282] hover:text-[#e53935] transition-colors"
                      title="Remove mapping"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => setOpenDropdown(isOpen ? null : key)}
                    className="flex items-center gap-1 text-[#828282] text-[12px] hover:text-[#001c36] transition-colors"
                  >
                    <span className="truncate max-w-[140px]">{mapping ? mapping.label : "No section linked"}</span>
                    <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="absolute right-0 top-7 z-20 bg-white rounded-[10px] shadow-[0px_4px_20px_0px_rgba(94,193,106,0.4)] border border-[rgba(94,193,106,0.2)] w-[270px] py-1 max-h-[260px] overflow-y-auto">
                  {availableFields.map((opt) => (
                    <button
                      key={`${opt.section}-${opt.field}-${opt.label}`}
                      onClick={() => handleSelectField(key, opt)}
                      className={`w-full text-left px-3 py-2 text-[13px] text-[#001c36] hover:bg-[rgba(94,193,106,0.1)] transition-colors ${
                        mapping?.label === opt.label ? "bg-[rgba(94,193,106,0.15)] font-bold" : ""
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              <textarea
                {...register(key)}
                rows={key === "subjectiveChiefComplaint" ? 1 : Math.max(3, Math.min(12, (content.match(/\n/g) || []).length + Math.ceil(content.length / 60)))}
                className="w-full border border-[rgba(94,193,106,0.5)] rounded-[10px] p-3 text-[14px] text-[#001c36] leading-[1.6] resize-none focus:outline-none focus:border-[#5ec16a] focus:ring-1 focus:ring-[rgba(94,193,106,0.3)]"
                placeholder={`Enter ${title.toLowerCase()} notes...`}
              />
            </div>
          );
        })}

        {/* ICD Codes — structured, no mapping dropdown */}
        <div className="flex flex-col gap-3">
          <span className="text-[#001c36] text-[15px] font-bold">Assessments – ICD Codes</span>
          {MOCK_ICD_CODES.map((entry) => {
            const pushed = pushedCodes.has(entry.code);
            const alreadyInEhr = ehrDiagnosisCodes.has(entry.code);
            return (
              <div key={entry.code} className={`border rounded-[10px] p-3 flex flex-col gap-2 transition-colors ${pushed || alreadyInEhr ? "border-[#5ec16a] bg-[rgba(94,193,106,0.05)]" : "border-[rgba(94,193,106,0.4)]"}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="bg-[#5ec16a] text-white text-[12px] font-bold px-2 py-0.5 rounded-full shrink-0">
                    {entry.code}
                  </span>
                  {alreadyInEhr ? (
                    <span className="flex items-center gap-1 text-[#5ec16a] text-[11px] font-semibold shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                      Already documented
                    </span>
                  ) : pushed ? (
                    <span className="flex items-center gap-1 text-[#5ec16a] text-[11px] font-semibold shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                      Sent
                    </span>
                  ) : (
                    <button
                      onClick={() => handlePushCode("icd", entry)}
                      title="Push to EHR"
                      className="p-1 text-[#5ec16a] hover:text-[#4aab56] transition-colors shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-[#001c36] text-[13px] font-semibold leading-[1.4]">{entry.description}</p>
                <p className="text-[#828282] text-[12px] leading-[1.5]">{entry.notes}</p>
              </div>
            );
          })}
        </div>

        {/* CPT Codes — structured, no mapping dropdown */}
        <div className="flex flex-col gap-3">
          <span className="text-[#001c36] text-[15px] font-bold">Billing – CPT Codes</span>
          {MOCK_CPT_CODES.map((entry) => {
            const pushed = pushedCodes.has(entry.code);
            return (
              <div key={entry.code} className={`border rounded-[10px] p-3 flex flex-col gap-2 transition-colors ${pushed ? "border-[#5ec16a] bg-[rgba(94,193,106,0.05)]" : "border-[rgba(94,193,106,0.4)]"}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="bg-[#5ec16a] text-white text-[12px] font-bold px-2 py-0.5 rounded-full shrink-0">
                    {entry.code}
                  </span>
                  {pushed ? (
                    <span className="flex items-center gap-1 text-[#5ec16a] text-[11px] font-semibold shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                      Sent
                    </span>
                  ) : (
                    <button
                      onClick={() => handlePushCode("cpt", entry)}
                      title="Push to EHR"
                      className="p-1 text-[#5ec16a] hover:text-[#4aab56] transition-colors shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-[#001c36] text-[13px] font-semibold leading-[1.4]">{entry.description}</p>
                <p className="text-[#828282] text-[12px] leading-[1.5]">{entry.notes}</p>
              </div>
            );
          })}
        </div>

      </div>

      {/* Push to EHR — sticky */}
      <div className="bg-white px-3 py-2 shrink-0">
        <button
          onClick={handlePushToEhr}
          disabled={!hasMappings}
          className={`flex items-center justify-center gap-2 w-full h-[50px] rounded-[80px] text-[16px] font-bold transition-colors ${
            hasMappings
              ? "bg-[#5ec16a] text-white hover:bg-[#4aab56]"
              : "bg-[rgba(94,193,106,0.3)] text-white cursor-not-allowed"
          }`}
        >
          <Send className="w-5 h-5" />
          Push to EHR
        </button>
      </div>

      {/* Tab progress bar — 2nd segment active */}
      <div className="flex w-full shrink-0">
        <div className="flex-1 h-[5px] bg-[rgba(94,193,106,0.25)]" />
        <div className="flex-1 h-[5px] bg-[rgba(94,193,106,0.5)]" />
        <div className="flex-1 h-[5px] bg-[rgba(94,193,106,0.25)]" />
      </div>

      {/* Bottom navigation */}
      <div className="bg-[#f5fdf7] h-[50px] flex items-center justify-center w-full shrink-0">
        <div className="flex items-center justify-between w-[272px]">
          <button onClick={() => onTabChange("record")} className="p-2 transition-opacity opacity-40 text-[#001c36]">
            <Mic className="w-6 h-6" />
          </button>
          <button className="p-2 transition-opacity opacity-100 text-[#5ec16a]">
            <ClipboardList className="w-6 h-6" />
          </button>
          <button onClick={() => onTabChange("user")} className="p-2 transition-opacity opacity-40 text-[#001c36]">
            <User className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
