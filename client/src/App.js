import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function App() {
  const videoRef = useRef(null);
  const [stage, setStage] = useState("start");
  const [name, setName] = useState("");
  const [career, setCareer] = useState("");
  const [careerImage, setCareerImage] = useState(null);
  const [listening, setListening] = useState(false);
  const [micAttempts, setMicAttempts] = useState(0);

  // Large career library
  const careerImages = {
    doctor: "/images/doctor.jpeg",
    engineer: "/images/engineer.jpeg",
    teacher: "/images/teacher.jpeg",
    lawyer: "/images/lawyer.jpeg",
    artist: "/images/artist.jpeg",
    chef: "/images/chef.jpeg",
    astronaut: "/images/astronaut.jpeg",
    dancer: "/images/dancer.jpeg",
    pilot: "/images/pilot.jpeg",
    scientist: "/images/scientist.jpeg",
    musician: "/images/musician.jpeg",
    soldier: "/images/soldier.jpeg",
    photographer: "/images/photographer.jpeg",
    gamer: "/images/gamer.jpeg",
    entrepreneur: "/images/entrepreneur.jpeg",
    farmer: "/images/farmer.jpeg",
    police: "/images/police.jpeg",
    writer: "/images/writer.jpeg",
    actor: "/images/actor.jpeg",
    architect: "/images/architect.jpeg",
    nurse: "/images/nurse.jpeg",
    softwareengineer: "/images/software_engineer.jpeg",
    fashiondesigner: "/images/fashion_designer.jpeg",
    cricketer: "/images/cricketer.jpeg",
    footballer: "/images/cricketer.jpeg",
  };

  const startCamera = useCallback(async () => {
    setStage("camera");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error("Camera error:", error);
    }
  }, []);

  const capturePhoto = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setMicAttempts(0);
    setStage("listen");
    startVoiceRecognition();
  };

  const extractNameAndCareer = (text) => {
    let detectedName = "";
    let detectedCareer = "";

    const namePatterns = [
      /my\s*name\s*is\s+([a-z\s]+)/i,
      /i\s*am\s+([a-z\s]+)/i,
      /this\s*is\s+([a-z\s]+)/i,
    ];

    const careerPatterns = [
      /i\s*want\s*to\s*be\s*a[n]*\s+([a-z\s]+)/i,
      /i\s*will\s*be\s*a[n]*\s+([a-z\s]+)/i,
      /i\s*would\s*like\s*to\s*be\s*a[n]*\s+([a-z\s]+)/i,
      /become\s*a[n]*\s+([a-z\s]+)/i,
    ];

    for (let pattern of namePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        detectedName = match[1].trim();
        break;
      }
    }

    for (let pattern of careerPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        detectedCareer = match[1].trim();
        break;
      }
    }

    return {
      name: detectedName || "Student",
      career: detectedCareer || null,
    };
  };

  const startVoiceRecognition = () => {
    if (!("webkitSpeechRecognition" in window)) {
      console.warn("Speech Recognition not supported");
      setStage("manual");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    setListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log("Voice detected:", transcript);
      const { name: detectedName, career: detectedCareer } = extractNameAndCareer(transcript);

      if (detectedCareer) {
        setName(detectedName);
        setCareer(detectedCareer);
        const key = detectedCareer.replace(/\s+/g, "").toLowerCase();
        setCareerImage({
          title: `${detectedName} is a ${detectedCareer}`,
          src: careerImages[key] || "/images/placeholder.jpg",
        });
        setStage("result");
      } else {
        retryMicOrManual(detectedName);
      }
    };

    recognition.onerror = () => {
      retryMicOrManual();
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
    setTimeout(() => recognition.stop(), 5000);
  };

  const retryMicOrManual = (detectedName = "Student") => {
    setMicAttempts((prev) => {
      if (prev < 2) {
        setTimeout(startVoiceRecognition, 500);
        return prev + 1;
      } else {
        setName(detectedName);
        setStage("manual");
        return prev;
      }
    });
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const key = career.replace(/\s+/g, "").toLowerCase();
    setCareerImage({
      title: `${name || "Student"} is a ${career}`,
      src: careerImages[key] || "/images/placeholder.jpg",
    });
    setStage("result");
  };

  const goBackToStart = () => {
    setStage("start");
    setName("");
    setCareer("");
    setCareerImage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white flex flex-col items-center justify-center p-6">
      <h1 className="text-5xl font-extrabold text-gray-800 mb-10 text-center">
        Career Visualizer <span className="text-purple-600">AI</span>
        <div className="text-sm text-gray-500 mt-2">(Step Into Your Future)</div>
      </h1>

      <AnimatePresence mode="wait">
        {stage === "start" && (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center"
          >
            <button
              onClick={startCamera}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg shadow hover:bg-blue-700"
            >
              📷 Open Camera
            </button>
          </motion.div>
        )}

        {stage === "camera" && (
          <motion.div
            key="camera"
            className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center"
          >
            <video ref={videoRef} autoPlay playsInline className="rounded-lg shadow-lg mb-4" />
            <button
              onClick={capturePhoto}
              className="bg-green-600 text-white px-8 py-3 rounded-lg shadow hover:bg-green-700"
            >
              📸 Capture
            </button>
          </motion.div>
        )}

        {stage === "listen" && (
          <motion.div
            key="listen"
            className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center"
          >
            <p className="text-lg font-medium mb-4">🎤 Listening... Please say your name and career</p>
            {listening && <p className="text-sm text-gray-500">Mic is on... attempt {micAttempts + 1}/3</p>}
          </motion.div>
        )}

        {stage === "manual" && (
          <motion.form
            key="manual"
            onSubmit={handleManualSubmit}
            className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-3"
          >
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="px-4 py-3 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Enter career"
              value={career}
              onChange={(e) => setCareer(e.target.value)}
              required
              className="px-4 py-3 border rounded-lg"
            />
            <button type="submit" className="bg-purple-600 text-white px-5 py-3 rounded-lg">
              Generate
            </button>
          </motion.form>
        )}

        {stage === "result" && careerImage && (
          <motion.div
            key="result"
            className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center"
          >
            <h2 className="text-2xl font-semibold mb-4">{careerImage.title}</h2>
            <img
              src={careerImage.src}
              alt={careerImage.title}
              className="rounded-lg shadow-lg w-full h-auto object-cover mb-6"
            />
            <button
              onClick={goBackToStart}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg"
            >
              ⬅ Back to Start
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
