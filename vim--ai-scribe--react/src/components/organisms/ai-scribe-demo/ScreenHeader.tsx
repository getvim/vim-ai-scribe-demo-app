import { UserCircle } from "lucide-react";
import { usePatientName } from "@/vimOs/usePatientName";
import { usePatientDob, formatDob, calculateAge } from "@/vimOs/usePatientDob";

const imgDemoMic = "https://static.getvim.com/prod/vim-os-appstore/apps/icons/e1e2a9c2-b502-43ee-8501-52fed01c275a.svg";
import imgMicSelectIcon from "@/assets/icon-mic-select.svg";

interface ScreenHeaderProps {
  /** Optional action buttons rendered below the patient info row */
  children?: React.ReactNode;
  /** When true, the wave bars animate (recording in progress) */
  animateBars?: boolean;
  /** When true, renders a compact single-row layout (used in NotesScreen) */
  compact?: boolean;
}

function MicSelector({ animateBars }: { animateBars?: boolean }) {
  return (
    <div className="bg-white flex items-center gap-1 px-2 py-1 mr-1 shrink-0">
      <div className="w-4 h-4 relative shrink-0">
        <img
          src={imgMicSelectIcon}
          alt=""
          className="absolute"
          style={{ top: "15.63%", left: "25%", right: "23.72%", bottom: "15.63%", width: "100%", height: "100%" }}
        />
      </div>
      {animateBars ? (
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
              className="w-[3px] rounded-full origin-bottom animate-audio-bar"
              style={{ height: bar.height, backgroundColor: "#5ec16a", animationDelay: bar.delay }}
            />
          ))}
        </div>
      ) : (
        <div className="w-[25px] h-[12px] relative shrink-0">
          <div className="absolute bg-[#d0d0d0] rounded-full" style={{ left: "44.21%", right: "44.31%", top: 0, bottom: 0 }} />
          <div className="absolute bg-[#d0d0d0] rounded-full" style={{ left: "65.54%", right: "22.36%", top: "14.29%", bottom: "8.79%" }} />
          <div className="absolute bg-[#d0d0d0] rounded-full" style={{ left: "22.4%", right: "65.49%", top: "13.58%", bottom: "9.5%" }} />
          <div className="absolute bg-[#d0d0d0] rounded-full" style={{ left: "87.89%", right: "0", top: "26.92%", bottom: "21.43%" }} />
          <div className="absolute bg-[#d0d0d0] rounded-full" style={{ left: "0", right: "87.89%", top: "26.92%", bottom: "21.43%" }} />
        </div>
      )}
    </div>
  );
}

export function ScreenHeader({ children, animateBars, compact }: ScreenHeaderProps) {
  const patientName = usePatientName();
  const dateOfBirth = usePatientDob();

  if (compact) {
    return (
      <div className="bg-[#5ec16a] flex items-center justify-between px-4 py-3 w-full shrink-0">
        <div className="flex items-center gap-2 shrink-0">
          <img
            src={imgDemoMic}
            alt=""
            className="w-5 h-5 shrink-0"
            style={{ filter: "brightness(0) invert(1)" }}
          />
          <span className="text-white text-[14px] font-semibold leading-tight">Ai Scribe Demo</span>
        </div>
        <div className="bg-[#f5fdf7] flex items-center gap-1 px-2 py-1 rounded flex-1 mx-3 min-w-0">
          <UserCircle className="w-3.5 h-3.5 shrink-0 text-[#001c36]" />
          <p className="text-[#001c36] text-[12px] overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="font-bold">{patientName || "No patient selected"}</span>
            {dateOfBirth && (
              <span className="font-normal">
                {" /  "}{formatDob(dateOfBirth)}{"  /  "}{calculateAge(dateOfBirth)}{" yr"}
              </span>
            )}
          </p>
        </div>
        <MicSelector />
      </div>
    );
  }

  return (
    <div className="bg-[#5ec16a] flex flex-col gap-4 px-5 py-5 w-full shrink-0">
      {/* Title row */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <img
            src={imgDemoMic}
            alt=""
            className="w-6 h-6 shrink-0"
            style={{ filter: "brightness(0) invert(1)" }}
          />
          <span className="text-white text-[16px] font-semibold leading-[19px]">
            Ai Scribe Demo
          </span>
        </div>
        <MicSelector animateBars={animateBars} />
      </div>

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

      {/* Optional action buttons */}
      {children}
    </div>
  );
}
