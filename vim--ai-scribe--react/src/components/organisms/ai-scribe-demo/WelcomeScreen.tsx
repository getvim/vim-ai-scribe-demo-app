import { Mic, ClipboardList, User, UserCircle } from "lucide-react";
import { usePatientName } from "@/vimOs/usePatientName";
import { usePatientDob, formatDob, calculateAge } from "@/vimOs/usePatientDob";

const imgDemoMic = "https://static.getvim.com/prod/vim-os-appstore/apps/icons/e1e2a9c2-b502-43ee-8501-52fed01c275a.svg";
import imgMicSelectIcon from "@/assets/icon-mic-select.svg";

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
  const patientName = usePatientName();
  const dateOfBirth = usePatientDob();

  return (
    <div className="flex flex-col w-full h-full rounded-tl-[20px] overflow-hidden shadow-[-5px_0px_10px_0px_rgba(8,58,107,0.15)]">
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
            {/* Sound lines */}
            <div className="w-[25px] h-[12px] relative shrink-0">
              <div
                className="absolute bg-[#d0d0d0] rounded-full"
                style={{ left: "44.21%", right: "44.31%", top: 0, bottom: 0 }}
              />
              <div
                className="absolute bg-[#d0d0d0] rounded-full"
                style={{
                  left: "65.54%",
                  right: "22.36%",
                  top: "14.29%",
                  bottom: "8.79%",
                }}
              />
              <div
                className="absolute bg-[#d0d0d0] rounded-full"
                style={{
                  left: "22.4%",
                  right: "65.49%",
                  top: "13.58%",
                  bottom: "9.5%",
                }}
              />
              <div
                className="absolute bg-[#d0d0d0] rounded-full"
                style={{
                  left: "87.89%",
                  right: "0",
                  top: "26.92%",
                  bottom: "21.43%",
                }}
              />
              <div
                className="absolute bg-[#d0d0d0] rounded-full"
                style={{
                  left: "0",
                  right: "87.89%",
                  top: "26.92%",
                  bottom: "21.43%",
                }}
              />
            </div>
          </div>
        </div>

        {/* Patient info + start visit */}
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
        </div>
      </div>

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
