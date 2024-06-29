import { axiosClient } from "@/lib/axios";
import {
  AudioRecorder,
  type recorderControls,
} from "@repo/react-audio-voice-recorder";
import { useTranslation } from "react-i18next";
import { useToast } from "../ui/use-toast";

export default function VoiceRecorder({
  controls,
  websocket,
}: {
  controls: recorderControls;
  websocket: WebSocket | null;
}) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const sendAudio = async (blob: Blob) => {
    const formData = new FormData();
    formData.append("file", blob, "audio.wav");
    formData.append("type", "audio");

    try {
      const { data } = await axiosClient.post("/attachments/upload", formData);
      websocket?.send(
        "+" + `${import.meta.env.VITE_APP_URL}/?attachment=${data.id}`,
      );
    } catch (_) {
      toast({
        variant: "destructive",
        description: t("toast.error.base"),
      });
    }
  };

  return (
    <AudioRecorder
      onRecordingComplete={sendAudio}
      audioTrackConstraints={{
        noiseSuppression: true,
        echoCancellation: true,
      }}
      onNotAllowedOrFound={(err) => console.table(err)}
      downloadFileExtension="wav"
      mediaRecorderOptions={{
        audioBitsPerSecond: 128000,
      }}
      recorderControls={controls}
      showVisualizer={true}
      classes={{
        AudioRecorderClass:
          "!shadow-none !bg-primary !rounded-2xl" +
          (controls.isRecording || controls.isPaused ? " w-semifull" : ""),
        AudioRecorderStartSaveClass:
          "black-to-white" +
          (controls.isRecording || controls.isPaused ? " hidden" : ""),
        AudioRecorderDiscardClass: "black-to-white",
        AudioRecorderPauseResumeClass: "black-to-white",
        AudioRecorderStatusClass: "black-to-white",
        AudioRecorderTimerClass: "black-to-white",
      }}
    />
  );
}
