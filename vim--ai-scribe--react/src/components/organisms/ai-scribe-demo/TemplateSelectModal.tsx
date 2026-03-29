import { FileText, Plus, X } from "lucide-react";

export const TEMPLATES = [
  "SOAP Note (Including ICD & CPT)",
  "SOAP Note (Including CPT)",
  "SOAP Note (Including ICD)",
  "SOAP Note",
  "Walk-In / Urgent Care Visit Note",
  "Annual Wellness Visit Summary",
  "Chronic Disease Management Summary",
  "Follow-Up Visit Note",
  "New Patient Intake Note",
  "Medication Review & Reconciliation Note",
  "Preventive Care & Screening Summary",
  "Care Plan & Treatment Summary",
  "Referral & Care Coordination Note",
  "Behavioral Health Visit Note",
  "Telehealth Encounter Note",
];

interface TemplateSelectModalProps {
  onSelect: (template: string) => void;
  onClose: () => void;
}

export const TemplateSelectModal = ({
  onSelect,
  onClose,
}: TemplateSelectModalProps) => {
  return (
    /* Overlay backdrop */
    <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10 rounded-tl-[20px]">
      {/* Modal card */}
      <div className="bg-white rounded-[20px] shadow-[0px_4px_24px_0px_rgba(94,193,106,0.25)] p-5 w-[324px] flex flex-col gap-[10px] max-h-[85%]">
        {/* Header */}
        <div className="bg-[rgba(94,193,106,0.1)] flex items-center justify-between px-2 py-2 h-[30px] w-full shrink-0">
          <span className="text-[#001c36] text-[14px] font-bold leading-none">
            Select a template
          </span>
          <button onClick={onClose} className="text-[#001c36] hover:opacity-60 transition-opacity">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Template list — scrollable */}
        <div className="flex flex-col gap-3 overflow-y-auto">
          {TEMPLATES.map((template) => (
            <button
              key={template}
              onClick={() => onSelect(template)}
              className="flex items-center gap-[5px] w-full text-left hover:bg-[rgba(94,193,106,0.08)] rounded px-1 py-0.5 transition-colors"
            >
              <FileText className="w-[21px] h-[21px] shrink-0 text-[#001c36]" strokeWidth={1.5} />
              <span className="text-[#001c36] text-[14px] leading-[1.5]">
                {template}
              </span>
            </button>
          ))}

          {/* Disabled — template creation is not yet implemented */}
          <div className="relative group mt-1 border-t border-[rgba(94,193,106,0.2)] pt-3">
            <button
              disabled
              className="flex items-center gap-[5px] w-full text-left opacity-40 cursor-not-allowed rounded px-1 py-0.5"
            >
              <Plus className="w-[21px] h-[21px] shrink-0 text-[#001c36]" strokeWidth={1.5} />
              <span className="text-[#001c36] text-[14px] leading-[1.5]">
                Create your own template
              </span>
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:block bg-[#001c36] text-white text-[11px] rounded px-2 py-1 whitespace-nowrap pointer-events-none z-10">
              Coming soon
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
