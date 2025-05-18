import { Mic, User } from "lucide-react";
import { Button } from "../../atoms/Button";
import { useProviderName } from "../ai-scribe-demo/useProviderName";

export const RecordingTab = ({
  patientName,
  simulateRecording,
}: {
  patientName: string;
  simulateRecording: () => void;
}) => {
  const providerName = useProviderName();

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-between space-y-2">
        <div>Hi there, {providerName}</div>
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Start New Recording
          </h2>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div>{patientName}</div>

        <Button
          onClick={simulateRecording}
          disabled={!patientName.trim()}
          fullWidth
          className="mt-4 py-4"
        >
          <Mic className="h-5 w-5 mr-2" />
          {patientName ? "Start Recording" : "Waiting for patient"}
        </Button>
      </div>
    </div>
  );
};
