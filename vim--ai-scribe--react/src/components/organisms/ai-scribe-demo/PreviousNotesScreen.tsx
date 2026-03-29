import { Mic, User, Calendar, Clock, FileText, ClipboardList } from "lucide-react";
import { ScreenHeader } from "./ScreenHeader";
import type { Note } from "./Note.interface";

interface PreviousNotesScreenProps {
  notes: Note[];
  onStartVisit: () => void;
  activeTab: "record" | "notes" | "user";
  onTabChange: (tab: "record" | "notes" | "user") => void;
  hasCurrentNote: boolean;
}

function parseTimestamp(timestamp: string): { date: string; time: string } {
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return { date: timestamp, time: "" };
  const date = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return { date, time };
}

function NoteCard({ note }: { note: Note }) {
  const { date, time } = parseTimestamp(note.timestamp);
  const visitReason = note.soap.assessment?.split(".")[0] ?? "Visit";

  return (
    <div className="border border-[rgba(94,193,106,0.25)] rounded-[10px] p-[14px] flex flex-col gap-[10px] w-full relative shrink-0">
      {/* Completed badge */}
      <div
        className="absolute top-[13px] right-[14px] border border-[#001c36] rounded-[42px] px-2 py-[3px] flex items-center"
        style={{ background: "rgba(94,193,106,0.25)" }}
      >
        <span className="text-[12px] text-[#001c36] leading-[12px]">
          Completed
        </span>
      </div>

      {/* Patient name */}
      <div className="flex items-center gap-2 h-[20px]">
        <User className="w-5 h-5 shrink-0 text-[#5ec16a]" />
        <span className="text-[#001c36] text-[14px] font-normal leading-[1.5]">
          {note.patientName}
        </span>
      </div>

      {/* Date */}
      <div className="flex items-center gap-2 h-[20px]">
        <Calendar className="w-5 h-5 shrink-0 text-[#5ec16a]" />
        <span className="text-[#001c36] text-[14px] font-normal leading-[1.5]">
          {date}
        </span>
      </div>

      {/* Time */}
      <div className="flex items-center gap-2 h-[20px]">
        <Clock className="w-5 h-5 shrink-0 text-[#5ec16a]" />
        <span className="text-[#001c36] text-[14px] font-normal leading-[1.5]">
          {time}
        </span>
      </div>

      {/* Visit reason */}
      <div className="flex items-center gap-2 h-[20px]">
        <FileText className="w-5 h-5 shrink-0 text-[#5ec16a]" />
        <span className="text-[#001c36] text-[14px] font-normal leading-[1.5] overflow-hidden text-ellipsis whitespace-nowrap">
          {visitReason}
        </span>
      </div>
    </div>
  );
}

export const PreviousNotesScreen = ({
  notes,
  onStartVisit,
  activeTab,
  onTabChange,
  hasCurrentNote,
}: PreviousNotesScreenProps) => {
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

      {/* Accent bar */}
      <div className="bg-[rgba(94,193,106,0.5)] h-[5px] w-full shrink-0" />

      {/* Note cards — scrollable */}
      <div className="bg-white flex-1 overflow-y-auto flex flex-col gap-2 px-3 py-3 w-full">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
            <FileText className="w-12 h-12" />
            <p className="text-sm">No saved notes yet</p>
          </div>
        ) : (
          notes.map((note) => <NoteCard key={note.id} note={note} />)
        )}
      </div>

      {/* Tab progress bar — 3rd segment active (user tab) */}
      <div className="flex w-full shrink-0">
        <div className="flex-1 h-[5px] bg-[rgba(94,193,106,0.25)]" />
        <div className="flex-1 h-[5px] bg-[rgba(94,193,106,0.25)]" />
        <div className="flex-1 h-[5px] bg-[rgba(94,193,106,0.5)]" />
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
