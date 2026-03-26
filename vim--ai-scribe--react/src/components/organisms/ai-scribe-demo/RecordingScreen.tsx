import { Mic, ClipboardList, User, UserCircle, Pause, Play } from "lucide-react";
import { usePatientName } from "@/vimOs/usePatientName";
import { usePatientDob, formatDob, calculateAge } from "@/vimOs/usePatientDob";
import { TemplateSelectModal } from "./TemplateSelectModal";

const audioBarKeyframes = `
@keyframes audioBar {
  0%, 100% { transform: scaleY(0.3); }
  50% { transform: scaleY(1); }
}
`;

const imgDemoMic = "https://static.getvim.com/prod/vim-os-appstore/apps/icons/e1e2a9c2-b502-43ee-8501-52fed01c275a.svg";
import imgMicSelectIcon from "@/assets/icon-mic-select.svg";

interface RecordingScreenProps {
  isPaused: boolean;
  recordingTime: number;
  onPausePlay: () => void;
  onStopVisit: () => void;
  onTemplateSelected: (template: string) => void;
  showTemplateSelect: boolean;
  onCloseTemplateSelect: () => void;
  hasCurrentNote: boolean;
  onTabChange: (tab: "record" | "notes" | "user") => void;
}

function formatTimerHMS(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
}

export const RecordingScreen = ({
  isPaused,
  recordingTime,
  onPausePlay,
  onStopVisit,
  onTemplateSelected,
  showTemplateSelect,
  onCloseTemplateSelect,
  hasCurrentNote,
  onTabChange,
}: RecordingScreenProps) => {
  const patientName = usePatientName();
  const dateOfBirth = usePatientDob();

  return (
    <div className="relative flex flex-col w-full h-full rounded-tl-[20px] overflow-hidden shadow-[-5px_0px_10px_0px_rgba(8,58,107,0.15)]">
      {showTemplateSelect && (
        <TemplateSelectModal
          onSelect={onTemplateSelected}
          onClose={onCloseTemplateSelect}
        />
      )}
      <style>{audioBarKeyframes}</style>

      {/* Green header */}
      <div className="bg-[#5ec16a] flex flex-col gap-4 px-5 py-5 w-full shrink-0">
        {/* Title row */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <img src={imgDemoMic} alt="" className="w-6 h-6 shrink-0" style={{ filter: "brightness(0) invert(1)" }} />
            <span className="text-white text-[16px] font-semibold leading-[19px]">
              Ai Scribe Demo
            </span>
          </div>

          {/* Mic selector */}
          <div className="bg-white flex items-center gap-1 px-2 py-1 mr-1">
            <div className="w-4 h-4 relative shrink-0">
              <img
                src={imgMicSelectIcon}
                alt=""
                className="absolute"
                style={{
                  top: "15.63%",
                  left: "25%",
                  right: "23.72%",
                  bottom: "15.63%",
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>
            <div className="flex items-end gap-[2px] h-[12px] shrink-0">
              {[
                { delay: "0ms", height: "35%" },
                { delay: "120ms", height: "70%" },
                { delay: "240ms", height: "100%" },
                { delay: "120ms", height: "70%" },
                { delay: "0ms", height: "35%" },
              ].map((bar, i) => (
                <div
                  key={i}
                  className="w-[3px] rounded-full origin-bottom"
                  style={{
                    height: bar.height,
                    backgroundColor: isPaused ? "#d0d0d0" : "#5ec16a",
                    animation: isPaused
                      ? "none"
                      : `audioBar 0.8s ease-in-out ${bar.delay} infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Patient info + action buttons */}
        <div className="flex flex-col gap-4 w-full">
          {/* Patient info row */}
          <div className="bg-[#f5fdf7] flex items-center gap-1.5 px-2 py-2 h-[30px] w-full">
            <UserCircle className="w-3.5 h-3.5 shrink-0 text-[#001c36]" />
            <p className="text-[#001c36] text-[14px] overflow-hidden text-ellipsis whitespace-nowrap">
              <span className="font-bold">{patientName || "No patient selected"}</span>
              {dateOfBirth && (
                <span className="font-normal">
                  {" /  "}{formatDob(dateOfBirth)}{"  /  "}{calculateAge(dateOfBirth)}{" yr"}
                </span>
              )}
            </p>
          </div>

          {/* Action buttons row */}
          <div className="flex items-center gap-2 w-full">
            {/* Stop visit button */}
            <button
              onClick={onStopVisit}
              className="bg-[#f5fdf7] flex items-center justify-center gap-1.5 px-4 py-2 h-[50px] flex-1 rounded-[80px] hover:bg-red-50 transition-colors"
            >
              <div className="w-3 h-3 rounded-full bg-[#e53935] shrink-0" />
              <span className="text-[#001c36] text-[16px] font-bold">
                Stop visit
              </span>
            </button>

            {/* Pause/Resume button */}
            <button
              onClick={onPausePlay}
              className="bg-[#f5fdf7] flex items-center justify-center w-[50px] h-[50px] rounded-[80px] hover:bg-green-50 transition-colors shrink-0"
            >
              {isPaused ? (
                <Play className="w-5 h-5 text-[#001c36]" />
              ) : (
                <Pause className="w-5 h-5 text-[#001c36]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Accent bar */}
      <div className="bg-[#5ec16a] h-[5px] w-full shrink-0" />

      {/* Main content */}
      <div className="bg-white flex-1 flex flex-col items-center justify-center gap-3 px-6 py-6 w-full">
        {/* Mic icon */}
        <div className="w-[100px] h-[100px] flex items-center justify-center">
          <Mic className="w-[100px] h-[100px] text-[#001c36]" strokeWidth={1} />
        </div>

        {/* Timer */}
        <p className="text-[#001c36] text-[36px] font-bold leading-none tabular-nums">
          {formatTimerHMS(recordingTime)}
        </p>

        {/* Status heading */}
        <p className="text-[#001c36] text-[18px] font-bold text-center">
          {isPaused ? "Recording paused" : "Transcribing in progress"}
        </p>

        {/* Subtitle */}
        <p className="text-[#479150] text-[14px] text-center">
          You can close the app and multitask
        </p>

        {/* Body text */}
        <p className="text-[#001c36] text-[14px] text-center leading-[1.5] max-w-[280px]">
          We will keep recording until you click 'End Visit'.
        </p>

        {/* Link */}
        <a
          href="https://docs.getvim.com/"
          target="_blank"
          rel="noreferrer"
          className="text-[#001c36] text-[14px] underline mt-1"
        >
          How do I tell my patient about AI Scribe?
        </a>
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
          <button
            className="p-2 transition-opacity opacity-100 text-[#5ec16a]"
          >
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
