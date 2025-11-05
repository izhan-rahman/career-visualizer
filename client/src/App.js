import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoginPage from './LoginPage';
import { Camera, Mic, Play, Send, User, Briefcase, LogOut } from 'lucide-react';

// Animation variants (unchanged)
const pageVariants = {
  initial: { opacity: 0, x: "-50vw", scale: 0.8 },
  in: { opacity: 1, x: 0, scale: 1 },
  out: { opacity: 0, x: "50vw", scale: 1.2 }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
};

function CareerVisualizerApp({ onLogout, role }) {
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);

  const [stage, setStage] = useState("start");
  const [name, setName] = useState("");
  const [career, setCareer] = useState("");
  const [careerImage, setCareerImage] = useState(null);
  const [listening, setListening] = useState(false);

  // Your image list (unchanged)
  const careerImages = {
    actor: "/images/actor.jpeg", architect: "/images/architect.jpeg", artist: "/images/artist.jpeg",
    astronaut: "/images/astronaut.jpeg", athlete: "/images/athlete.jpeg", animator: "/images/animator.jpeg",
    baker: "/images/baker.jpeg", badmintonplayer: "/images/badmintonplayer.jpeg", barber: "/images/barber.jpeg",
    busdriver: "/images/busdriver.jpeg", chef: "/images/chef.jpeg", chiefminister: "/images/chief_minister.jpeg",
    coach: "/images/coach.jpeg", constructionworker: "/images/constructionworker.jpeg", cricketer: "/images/cricketer.jpeg",
    dancer: "/images/dancer.jpeg", dentist: "/images/dentist.jpeg", detective: "/images/detective.jpeg",
    doctor: "/images/doctor.jpeg", electrician: "/images/electrician.jpeg", engineer: "/images/engineer.jpeg",
    entrepreneur: "/images/entrepreneur.jpeg", farmer: "/images/farmer.jpeg", fashiondesigner: "/images/fashiondesigner.jpeg",
    firefighter: "/images/firefighter.jpeg", florist: "/images/florist.jpeg", footballer: "/images/footballer.jpeg",
    gamer: "/images/gamer.jpeg", gamedeveloper: "/images/gamedeveloper.jpeg", gardener: "/images/gardener.jpeg",
    governor: "/images/governor.jpeg", graphicdesigner: "/images/graphicdesigner.jpeg", homeminister: "/images/home_minister.jpeg",
    judge: "/images/judge.jpeg", kabaddiplayer: "/images/kabaddiplayer.jpeg", lawyer: "/images/lawyer.jpeg",
    librarian: "/images/librarian.jpeg", mailcarrier: "/images/mailcarrier.jpeg", mayor: "/images/mayor.jpeg",
    mechanic: "/images/mechanic.jpeg", mla: "/images/mla.jpeg", mp: "/images/mp.jpeg",
    musician: "/images/musician.jpeg", nurse: "/images/nurse.jpeg", pharmacist: "/images/pharmacist.jpeg",
    photographer: "/images/photographer.jpeg", pilot: "/images/pilot.jpeg", plumber: "/images/plumber.jpeg",
    police: "/images/police.jpeg", president: "/images/president.jpeg", primeminister: "/images/prime_minister.jpeg",
    roboticsengineer: "/images/roboticsengineer.jpeg", scientist: "/images/scientist.jpeg",
    socialworker: "/images/socialworker.jpeg", softwareengineer: "/images/softwareengineer.jpeg",
    soldier: "/images/soldier.jpeg", teacher: "/images/teacher.jpeg", veterinarian: "/images/veterinarian.jpeg",
    writer: "/images/writer.jpeg", youtuber: "/images/youtuber.jpeg",
  };

  const getLocalImage = useCallback((career) => {
    const key = career.replace(/\s+/g, "").toLowerCase();
    return careerImages[key] || "/images/placeholder.jpg";
  }, []); // Note: This assumes careerImages is constant.

  const stableSaveRecord = useCallback(async (studentName, studentCareer) => {
    try {
      await fetch('http://localhost:5000/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: studentName, career: studentCareer }),
      });
      console.log('Record sent to server:', studentName, studentCareer);
    } catch (error) {
      console.error('Failed to send record:', error);
    }
  }, []);


  const extractNameAndCareer = useCallback((text) => {
    let n = "", c = "";
    const np = [/my\s*name\s*is\s+([a-z\s]+?)(?=\s+and|$)/i, /i\s*am\s+([a-z\s]+?)(?=\s+and|$)/i];
    const cp = [
      /i\s*want\s*to\s*be\s*a[n]?\s+([a-z\s]+?)(?=\s+in|\s+at|\s+with|$)/i,
      /i\s*will\s*be\s*a[n]?\s+([a-z\s]+?)(?=\s+in|\s+at|\s+with|$)/i,
      /become\s*a[n]?\s+([a-z\s]+?)(?=\s+in|\s+at|\s+with|$)/i
    ];
    for (const p of np) { const m = text.match(p); if (m && m[1]) { n = m[1].trim(); break; } }
    for (const p of cp) { const m = text.match(p); if (m && m[1]) { c = m[1].trim(); break; } }
    return { name: n || "Student", career: c || null };
  }, []);

  const processVoiceCommand = useCallback((transcript) => {
    const { name: dName, career: dCareer } = extractNameAndCareer(transcript);
    if (dCareer) {
      setName(dName); setCareer(dCareer);
      setCareerImage({ title: `${dName} wants to be a ${dCareer}`, src: getLocalImage(dCareer) });
      setStage("result");
      stableSaveRecord(dName, dCareer);
    } else {
      setName(dName); setStage("manual");
    }
  }, [extractNameAndCareer, getLocalImage, stableSaveRecord]);

  const startVoiceRecognition = useCallback(() => {
    if (!("webkitSpeechRecognition" in window)) { setStage("manual"); return; }
    const recognition = new window.webkitSpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    setListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      if (transcript) processVoiceCommand(transcript.toLowerCase());
    };
    recognition.onerror = () => setStage("manual");
    recognition.onend = () => setListening(false);
    recognition.start();
  }, [processVoiceCommand]);

  // --- NEW: AI Voice Function ---
  const speak = useCallback((text) => {
    if (!('speechSynthesis' in window)) {
      console.warn("Text-to-Speech not supported in this browser.");
      return;
    }
    
    // Cancel any previous speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN'; // Use Indian English voice
    utterance.rate = 0.9; // Speak slightly slower
    utterance.pitch = 1.1; // Make it sound slightly more cheerful

    // This function finds the best voice and speaks
    const setVoiceAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      let bestVoice = voices.find(v => v.lang === 'en-IN' && v.name.includes('Rishi')); // Google
      if (!bestVoice) {
        bestVoice = voices.find(v => v.lang === 'en-IN' && v.name.includes('Heera')); // Microsoft
      }
      if (!bestVoice) {
        bestVoice = voices.find(v => v.lang === 'en-IN'); // Any Indian English
      }

      if (bestVoice) {
        utterance.voice = bestVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    };

    // The voices list loads asynchronously. We must wait for it.
    if (window.speechSynthesis.getVoices().length > 0) {
      setVoiceAndSpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = setVoiceAndSpeak;
    }
  }, []); // This function is stable

  // --- NEW: This useEffect triggers the voice ---
  useEffect(() => {
    if (stage === 'result' && careerImage?.title) {
      speak(careerImage.title);
    }

    // Cleanup: Stop speaking if the stage changes
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [stage, careerImage, speak]); // Add 'speak' to dependencies

  // This useEffect handles the camera
  useEffect(() => {
    let stream = null;
    let timer = null;
    const startCameraAndTimer = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        timer = setTimeout(() => {
          if (stream) stream.getTracks().forEach(track => track.stop());
          setStage('listen');
          startVoiceRecognition();
        }, 3000);
      } catch (error) {
        console.error("Camera error:", error);
        alert("Could not access the camera. Please check permissions.");
        setStage("start");
      }
    };
    if (stage === 'camera_demo') startCameraAndTimer();
    return () => {
      clearTimeout(timer);
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [stage, startVoiceRecognition]);

  const goBackToStart = () => {
    setStage("start"); setName(""); setCareer(""); setCareerImage(null);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const studentName = name || "Student";
    const studentCareer = career;
    setCareerImage({ title: `${studentName} wants to be a ${studentCareer}`, src: getLocalImage(studentCareer) });
    setStage("result");
    stableSaveRecord(studentName, studentCareer);
  };

  // --- JSX (Unchanged from last time) ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 via-indigo-900 to-blue-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Buttons Container */}
      <div className="absolute top-4 right-4 flex items-center gap-4 z-10">
        {role === 'admin' && (
           <p className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-md">ADMIN</p>
        )}
        <motion.button
          onClick={onLogout}
          className="flex items-center gap-1 bg-white bg-opacity-10 text-white text-sm px-4 py-2 rounded-xl shadow-md hover:bg-opacity-20 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LogOut size={16} /> Logout
        </motion.button>
      </div>

      {/* Main Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">
          Career Visualizer <span className="text-purple-300">AI</span>
        </h1>
        <div className="text-sm text-white text-opacity-70 mt-2">✨ See Your Future Self! ✨</div>
      </div>

      {/* Main Content Card */}
      <div className="w-full max-w-md relative">
        {listening && (
          <motion.div
            className="absolute -inset-4 bg-purple-500 rounded-full blur-2xl opacity-50 pointer-events-none"
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
           />
        )}

        <div className="relative bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-3xl shadow-xl border border-white border-opacity-20 overflow-hidden">
          <AnimatePresence mode="wait">

            {stage === "start" && (
              <motion.div
                key="start"
                className="p-8 text-center flex flex-col items-center gap-4"
                variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}
              >
                <p className="text-xl text-white text-opacity-90">Ready for your future?</p>
                <motion.button
                  onClick={() => setStage("camera_demo")}
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xl font-semibold py-3 rounded-xl shadow-lg mt-4"
                  whileHover={{ scale: 1.05, boxShadow: "0px 8px 20px rgba(0,0,0,0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Camera size={24} /> Open Camera
                </motion.button>
              </motion.div>
            )}

            {stage === "camera_demo" && (
              <motion.div
                key="camera_demo"
                className="p-6 text-center"
                 variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}
              >
                  <p className="text-xl font-semibold mb-4 text-white text-opacity-90">Hello! Smile!</p>
                  <video ref={videoRef} autoPlay playsInline muted className="rounded-lg shadow-lg w-full" />
              </motion.div>
            )}

            {stage === "listen" && (
               <motion.div
                key="listen"
                className="p-8 text-center"
                 variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}
               >
                  <p className="text-xl font-medium mb-2 text-white text-opacity-90 flex items-center justify-center gap-2"><Mic size={24}/> What do you want to be?</p>
                  <p className="text-sm text-white text-opacity-70 mb-4">e.g., "I want to be a doctor"</p>
                  {listening && (
                     <div className="flex justify-center items-center my-4">
                       <motion.div
                         className="bg-red-500 w-8 h-8 rounded-full shadow-lg"
                         animate={{ scale: [1, 1.2, 1]}}
                         transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut"}}
                       />
                       <p className="ml-3 text-red-400 font-semibold">Listening...</p>
                     </div>
                  )}
              </motion.div>
            )}

            {stage === "manual" && (
              <motion.form
                key="manual"
                onSubmit={handleManualSubmit}
                className="p-6 flex flex-col gap-6"
                 variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}
              >
                  <p className="text-center text-white text-opacity-90">Oops! Please type your career.</p>
                  <div className="relative w-full flex items-center border-b-2 border-white border-opacity-30 focus-within:border-purple-400 transition-colors">
                    <User size={20} className="text-white text-opacity-70 mr-3" />
                    <input type="text" placeholder="Your name (optional)" value={name} onChange={(e) => setName(e.target.value)} className="appearance-none w-full bg-transparent text-white placeholder-white placeholder-opacity-70 py-2 focus:outline-none text-lg" />
                  </div>
                  <div className="relative w-full flex items-center border-b-2 border-white border-opacity-30 focus-within:border-purple-400 transition-colors">
                     <Briefcase size={20} className="text-white text-opacity-70 mr-3" />
                     <input type="text" placeholder="Your dream career" value={career} onChange={(e) => setCareer(e.target.value)} required className="appearance-none w-full bg-transparent text-white placeholder-white placeholder-opacity-70 py-2 focus:outline-none text-lg" />
                  </div>
                  <motion.button
                    type="submit"
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xl font-semibold py-3 rounded-xl shadow-lg mt-4"
                    whileHover={{ scale: 1.05, boxShadow: "0px 8px 20px rgba(0,0,0,0.3)" }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Send size={20} /> Visualize!
                  </motion.button>
              </motion.form>
            )}

            {stage === "result" && careerImage && (
              <motion.div
                key="result"
                className="p-6 text-center"
                 variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}
              >
                <h2 className="text-3xl font-bold mb-4 text-white text-opacity-90 drop-shadow-md">{careerImage.title}</h2>
                <motion.img
                  src={careerImage.src}
                  alt={careerImage.title}
                  className="rounded-lg shadow-lg w-full h-auto object-cover mb-6"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                />
                <motion.button
                  onClick={goBackToStart}
                  className="flex items-center justify-center gap-2 bg-white bg-opacity-20 text-white px-6 py-2 rounded-lg hover:bg-opacity-30 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play size={18} /> Play Again
                </motion.button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}


// Main App component (handles login state)
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem('isLoggedIn')
  );
  const [userRole, setUserRole] = useState(
    () => localStorage.getItem('userRole') || null
  );

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    setIsLoggedIn(false);
    setUserRole(null);
  };

  const handleLogin = (role) => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', role);
    setIsLoggedIn(true);
    setUserRole(role);
  };

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLogin} />;
  }

  return <CareerVisualizerApp onLogout={handleLogout} role={userRole} />;
}

