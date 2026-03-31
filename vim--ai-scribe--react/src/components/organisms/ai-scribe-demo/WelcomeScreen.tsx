import { Mic, ClipboardList, User } from "lucide-react";
import { ScreenHeader } from "./ScreenHeader";

interface WelcomeScreenProps {
  onStartVisit: () => void;
  activeTab: "record" | "notes" | "user";
  onTabChange: (tab: "record" | "notes" | "user") => void;
  hasCurrentNote: boolean;
}

export const WelcomeScreen = ({
  onStartVisit,
  activeTab,
  onTabChange,
  hasCurrentNote,
}: WelcomeScreenProps) => {
  return (
    <div className="flex flex-col w-full h-full rounded-tl-[20px] overflow-hidden shadow-[-5px_0px_10px_0px_rgba(8,58,107,0.15)]">
      <ScreenHeader>
        {/* Start new visit button */}
        <button
          onClick={onStartVisit}
          className="bg-[#f5fdf7] flex items-center justify-center gap-1.5 px-2 py-2 h-[50px] w-full rounded-[80px] hover:bg-green-50 transition-colors"
        >
          <Mic className="w-6 h-6 shrink-0 text-[#001c36]" />
          <span className="text-[#001c36] text-[18px] font-bold">
            Start new visit
          </span>
        </button>
      </ScreenHeader>

      {/* Top accent bar */}
      <div className="bg-[#5ec16a] h-[5px] w-full shrink-0" />

      {/* Main content — empty state */}
      <div className="bg-white flex-1 flex flex-col items-center justify-center gap-1 px-3 py-3 w-full">
        <p className="text-[#001c36] text-[18px] font-bold text-center w-[340px] leading-[1.5]">
          Session not started.{" "}
        </p>
        <p className="text-[#479150] text-[14px] text-center w-full leading-[1.5]">
          Your note will appear here once your session is completed.
        </p>
      </div>

      {/* Tab progress bar */}
      <div className="flex w-full shrink-0">
        <div className="flex-1 h-[5px] bg-[rgba(94,193,106,0.5)]" />
        <div className="flex-1 h-[5px] bg-[rgba(94,193,106,0.25)]" />
        <div className="flex-1 h-[5px] bg-[rgba(94,193,106,0.25)]" />
      </div>

      {/* Bottom navigation */}
      <div className="bg-[#f5fdf7] h-[50px] flex items-center justify-center w-full shrink-0">
        <div className="flex items-center justify-between w-[272px]">
          <button
            onClick={() => onTabChange("record")}
            className={`p-2 transition-opacity ${activeTab === "record" ? "opacity-100 text-[#5ec16a]" : "opacity-40 text-[#001c36]"}`}
          >
            <Mic className="w-6 h-6" />
          </button>
          <button
            onClick={() => hasCurrentNote && onTabChange("notes")}
            disabled={!hasCurrentNote}
            className={`p-2 transition-opacity ${
              !hasCurrentNote
                ? "opacity-20 cursor-not-allowed text-[#001c36]"
                : activeTab === "notes"
                  ? "opacity-100 text-[#5ec16a]"
                  : "opacity-40 text-[#001c36]"
            }`}
          >
            <ClipboardList className="w-6 h-6" />
          </button>
          <button
            onClick={() => onTabChange("user")}
            className={`p-2 transition-opacity ${activeTab === "user" ? "opacity-100 text-[#5ec16a]" : "opacity-40 text-[#001c36]"}`}
          >
            <User className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
