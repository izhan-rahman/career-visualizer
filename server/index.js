import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.post("/generate", (req, res) => {
  const { image, career } = req.body;
  console.log("Received career:", career);
  console.log("Received image length:", image?.length);

  // Fake response for demo
  res.json({
    success: true,
    message: "API key missing — demo mode only",
    receivedCareer: career,
  });
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
