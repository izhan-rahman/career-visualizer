import React from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

export default function VoiceInput({ onCareerSubmit }) {
  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  const handleStop = () => {
    SpeechRecognition.stopListening();
    if (transcript.trim()) {
      onCareerSubmit(transcript);
      resetTranscript();
    }
  };

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return <p>Your browser does not support voice input.</p>;
  }

  return (
    <div className="mt-4">
      <button
        onClick={() => SpeechRecognition.startListening({ continuous: false })}
        className="bg-green-600 text-white px-4 py-2 rounded mr-2"
      >
        🎤 Start
      </button>
      <button
        onClick={handleStop}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        ⏹ Stop
      </button>
      <p className="mt-2 italic">{listening ? "Listening..." : transcript}</p>
    </div>
  );
}
