import { Mic, ClipboardList, User, FileText, Stethoscope } from "lucide-react";
import { ScreenHeader } from "./ScreenHeader";

interface TranscribingScreenProps {
  hasCurrentNote: boolean;
  onTabChange: (tab: "record" | "notes" | "user") => void;
}

export const TranscribingScreen = ({
  hasCurrentNote,
  onTabChange,
}: TranscribingScreenProps) => {
  return (
    <div className="flex flex-col w-full h-full rounded-tl-[20px] overflow-hidden shadow-[-5px_0px_10px_0px_rgba(8,58,107,0.15)]">
      <ScreenHeader />

      {/* Accent bar */}
      <div className="bg-[rgba(94,193,106,0.5)] h-[5px] w-full shrink-0" />

      {/* Main content */}
      <div className="bg-white flex-1 flex flex-col items-center justify-center gap-[68px] px-3 py-6 w-full">
        {/* Top section: icon + text */}
        <div className="flex flex-col items-center gap-2 w-full">
          {/* Animated concentric circles */}
          <div className="animate-ring-pulse relative w-[100px] h-[100px] flex items-center justify-center">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-[2.5px] border-[#001c36]" />
            {/* Middle ring */}
            <div className="absolute rounded-full border-[2.5px] border-[#001c36]" style={{ inset: "12.5%" }} />
            {/* Inner ring */}
            <div className="absolute rounded-full border-[2.5px] border-[#001c36]" style={{ inset: "25%" }} />
          </div>

          {/* Text */}
          <div className="flex flex-col items-center gap-1 w-full">
            <p className="text-[#001c36] text-[18px] font-bold text-center w-[340px] leading-[1.5]">
              Transcribing audio...
            </p>
            <p className="text-[#479150] text-[14px] text-center w-full leading-[1.5]">
              This usually takes about 30 seconds
            </p>
          </div>
        </div>

        {/* Bottom section: info cards */}
        <div className="flex flex-col items-center gap-2 w-full">
          <p className="text-[#001c36] text-[14px] font-bold text-center w-[340px] leading-[1.5]">
            While we process your recording
          </p>

          {/* Card 1 */}
          <div className="bg-[rgba(94,193,106,0.1)] flex items-center gap-1.5 px-2 py-2 w-[300px] min-h-[38px]">
            <FileText className="w-3.5 h-3.5 shrink-0 text-[#001c36]" />
            <p className="text-[#001c36] text-[12px] leading-[1.2] flex-1">
              Your note is being transcribed and formatted into your selected template
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[rgba(94,193,106,0.1)] flex items-center gap-1.5 px-2 py-2 w-[300px] min-h-[38px]">
            <Stethoscope className="w-3.5 h-3.5 shrink-0 text-[#001c36]" />
            <p className="text-[#001c36] text-[12px] leading-[1.2] flex-1">
              Medical terms are being identified and linked to ICD and CPT codes
            </p>
          </div>
        </div>
      </div>

      {/* Tab progress bar — 1st segment active */}
      <div className="flex w-full shrink-0">
        <div className="flex-1 h-[5px] bg-[rgba(94,193,106,0.5)]" />
        <div className="flex-1 h-[5px] bg-[rgba(94,193,106,0.25)]" />
        <div className="flex-1 h-[5px] bg-[rgba(94,193,106,0.25)]" />
      </div>

      {/* Bottom navigation */}
      <div className="bg-[#f5fdf7] h-[50px] flex items-center justify-center w-full shrink-0">
        <div className="flex items-center justify-between w-[272px]">
          <button className="p-2 transition-opacity opacity-100 text-[#5ec16a]">
            <Mic className="w-6 h-6" />
          </button>
          <button
            onClick={() => hasCurrentNote && onTabChange("notes")}
            disabled={!hasCurrentNote}
            className={`p-2 transition-opacity ${
              !hasCurrentNote
                ? "opacity-20 cursor-not-allowed text-[#001c36]"
                : "opacity-40 text-[#001c36]"
            }`}
          >
            <ClipboardList className="w-6 h-6" />
          </button>
          <button
            onClick={() => onTabChange("user")}
            className="p-2 transition-opacity opacity-40 text-[#001c36]"
          >
            <User className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
