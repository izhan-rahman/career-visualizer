import express from "express";
import cors from "cors";
import path from "path";
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// --- FIX for 'assert' error ---
// We will read the file manually instead of importing it
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const credsRaw = fs.readFileSync(path.join(__dirname, 'google-creds.json'));
const creds = JSON.parse(credsRaw);
// --- END FIX ---


const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

const jwt = new JWT({
  email: creds.client_email,
  key: creds.private_key,
  scopes: SCOPES,
});

// --- !! PASTE YOUR SHEET ID HERE !! ---
// (This is the ID from your URL: 1rRWk0sSMs2N-Jc1WiaLO544p1KLUcN0ctRezN6lZjq8)
const YOUR_SHEET_ID = '1rRWk0sSMs2N-Jc1WiaLO544p1KLUcN0ctRezN6lZjq8';
// ------------------------------------


const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Your user database
const USERS = [
  { email: 'admin@suhail.com', password: '12345678', role: 'admin' },
  { email: 'teacher1@school.com', password: 'user123', role: 'user' },
  { email: 'teacher2@school.com', password: 'user123', role: 'user' },
  { email: 'teacher3@school.com', password: 'user123', role: 'user' },
];

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = USERS.find(u => u.email === email && u.password === password);
  if (user) {
    res.json({ success: true, role: user.role });
  } else {
    res.json({ success: false, message: 'Invalid credentials' });
  }
});

// --- This endpoint now writes to Google Sheets ---
app.post('/record', async (req, res) => {
  const { name, career } = req.body;
  if (!name || !career) {
    return res.status(400).json({ success: false, message: 'Missing name or career' });
  }

  try {
    // Connect to the Google Sheet
    const doc = new GoogleSpreadsheet(YOUR_SHEET_ID, jwt);
    await doc.loadInfo(); // Loads document properties and worksheets
    
    // Get the first sheet (Sheet1)
    const sheet = doc.sheetsByIndex[0]; 

    // Get current date, formatted for India (DD-MM-YYYY)
    const date = new Date().toLocaleDateString("en-IN", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    // Add the new row (matching your headers)
    await sheet.addRow({
      "Student Name": name,
      "Profession": career,
      "Date": date,
    });

    console.log('Record saved to Google Sheet:', { name, career, date });
    res.json({ success: true, message: 'Record saved' });

  } catch (error) {
    console.error('Failed to write to Google Sheet:', error);
    res.status(500).json({ success: false, message: 'Failed to save record' });
  }
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));

