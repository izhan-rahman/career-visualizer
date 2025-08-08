import React, { useState } from "react";

export default function ManualCareerInput({ onCareerSubmit }) {
  const [career, setCareer] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (career.trim()) {
      onCareerSubmit(career);
      setCareer("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
      <input
        type="text"
        value={career}
        onChange={(e) => setCareer(e.target.value)}
        placeholder="Enter your career..."
        className="border rounded p-2 w-full"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Submit
      </button>
    </form>
  );
}
