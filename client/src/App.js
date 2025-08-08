import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function App() {
  const videoRef = useRef(null);
  const [stage, setStage] = useState("start"); // start → camera → careerInput → result
  const [career, setCareer] = useState("");
  const [careerImage, setCareerImage] = useState(null);

  // Local demo images
  const demoImages = {
    doctor: "/images/doctor.jpg",
    engineer: "/images/engineer.jpg",
    teacher: "/images/teacher.jpg",
    lawyer: "/images/lawyer.jpg",
    artist: "/images/artist.jpg",
    chef: "/images/chef.jpg",
  };

  const startCamera = async () => {
    setStage("camera");
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  };

  const capturePhoto = () => {
    const stream = videoRef.current.srcObject;
    if (stream) stream.getTracks().forEach((track) => track.stop());
    setStage("careerInput");
  };

  const handleCareerSubmit = (e) => {
    e.preventDefault();
    const lowerCareer = career.toLowerCase();
    setCareerImage({
      title: career,
      src: demoImages[lowerCareer] || "/images/placeholder.jpg",
    });
    setCareer("");
    setStage("result");
  };

  const goBackToStart = () => {
    setStage("start");
    setCareer("");
    setCareerImage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white flex flex-col items-center justify-center p-6">
      <h1 className="text-5xl font-extrabold text-gray-800 mb-10 text-center">
        Career Visualizer <span className="text-purple-600">AI</span>
        <div className="text-sm text-gray-500 mt-2">(Demo Mode)</div>
      </h1>

      <AnimatePresence mode="wait">
        {stage === "start" && (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center"
          >
            <button
              onClick={startCamera}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg shadow hover:bg-blue-700 transition transform hover:scale-105"
            >
              📷 Open Camera
            </button>
          </motion.div>
        )}

        {stage === "camera" && (
          <motion.div
            key="camera"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center"
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="rounded-lg shadow-lg mb-4"
            />
            <button
              onClick={capturePhoto}
              className="bg-green-600 text-white px-8 py-3 rounded-lg shadow hover:bg-green-700 transition transform hover:scale-105"
            >
              📸 Capture
            </button>
          </motion.div>
        )}

        {stage === "careerInput" && (
          <motion.form
            key="careerInput"
            onSubmit={handleCareerSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md flex gap-2"
          >
            <input
              type="text"
              placeholder="Type a career (e.g., Doctor)"
              value={career}
              onChange={(e) => setCareer(e.target.value)}
              className="flex-grow px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 text-lg"
              required
            />
            <button
              type="submit"
              className="bg-purple-600 text-white px-5 py-3 rounded-lg shadow hover:bg-purple-700 transition transform hover:scale-105"
            >
              Go
            </button>
          </motion.form>
        )}

        {stage === "result" && careerImage && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
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
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              ⬅ Back to Start
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
