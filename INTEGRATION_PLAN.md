# AI Healthcare API - Integration Guide

## Base URL
```
Demo (ngrok): https://injectable-laraine-nonreverentially.ngrok-free.dev
```

---

## Overview

Two main functionalities:
1. **Consultation Insights** - Extract clinical info from audio + compare with doctor's input
2. **Medical History Summarization** - Generate patient overview from past checkups

---

## API Endpoints

### 1. GET /api/health
**Purpose**: Check if API service is ready

**Response:**
```json
{
  "status": "ok",
  "whisper_loaded": true,
  "medgemma_ready": true
}
```

---

## Consultation Insights APIs

### 2. POST /api/transcribe
**Purpose**: Extract clinical info from audio consultation + compare with doctor's manual input

**Takes**: ~2-3 minutes (includes Whisper transcription)

**Request:**
```http
POST /api/transcribe
Content-Type: multipart/form-data
audio: <file> (MP3/WAV/WEBM/M4A, max 100MB)
checkup: <JSON string> (see structure below)
```

**Checkup Input Structure:**
```json
{
  "checkupId": 0,
  "date": "2024-01-20",
  "department": "General Medicine",
  "bloodPressure": "140/90",
  "temperature": "101F",
  "heartRate": "",
  "bloodSugar": "",
  "symptoms": "Fever, body pain",
  "diagnosis": "",
  "notes": "",
  "medications": [
    {
      "name": "Paracetamol",
      "formula": "500mg",
      "dosePerIntake": "1 tablet",
      "timesPerDay": 3,
      "totalDays": 5,
      "instructions": "After meals"
    }
  ],
  "additionalMedications": "",
  "recommendedTests": [
    {
      "name": "CBC",
      "department": "Laboratory"
    }
  ],
  "additionalTests": ""
}
```

**Response:**
```json
{
  "success": true,
  "transcription": "[Original Urdu transcription of the consultation audio]",
  "extracted_info": {
    "patientDemographics": null,
    "symptoms": "Fever for 5 days, body pain, throat pain with difficulty breathing, dry cough, tiredness, headache",
    "durationOfSymptoms": "Fever: 5 days, other symptoms: not specified",
    "medicalHistory": "No diabetes, no bile pressure, no chronic problems",
    "currentMedications": null,
    "allergies": null,
    "clinicalExamination": null,
    "diagnosis": "Possible viral or bacterial infection, likely upper respiratory tract infection",
    "testsOrdered": "CBC test, Typhoid test",
    "prescription": "Paracetamol 500mg three times a day for fever and body pain, Erythromycin 500mg once a day for three days if infection confirmed",
    "adviceInstructions": "Drink more water, rest, avoid oily and spicy food",
    "followUpInstructions": "Return immediately if fever goes above 102F or if breathing difficulty"
  },
  "gap_analysis": "Through the conversation, we found these additional details: Heart rate (88 bpm) and blood sugar levels were documented. Additional symptoms noted include throat pain, dry cough, tiredness, and headache. The diagnosis identifies this as a possible viral or bacterial infection (upper respiratory tract infection). Erythromycin 500mg was also prescribed pending infection confirmation, and a Typhoid test was recommended in addition to CBC."
}
```

---

### 3. POST /api/transcribe-demo
**Purpose**: Demo consultation insights using hardcoded audio text (no Whisper, faster)

**Takes**: ~1-2 minutes

**Request:**
```http
POST /api/transcribe-demo
```

**Response:** Same structure as `/api/transcribe` above

---

## Medical History Summarization APIs

### 4. POST /api/summarize-history
**Purpose**: Generate concise patient history summary from past checkups

**Takes**: ~30-60 seconds

**Request:**
```http
POST /api/summarize-history
Content-Type: application/json
```

**Request Body:**
```json
{
  "patient": {
    "name": "Ahmed Khan",
    "gender": "Male",
    "age": 45,
    "bloodGroup": "O+",
    "allergies": "Penicillin",
    "medicalHistory": "Hypertension",
    "familyHistory": "Father had diabetes"
  },
  "checkups": [
    {
      "checkupId": 1,
      "date": "2024-01-15",
      "department": "General Medicine",
      "bloodPressure": "140/90",
      "temperature": "101F",
      "heartRate": "88",
      "bloodSugar": "110",
      "symptoms": "Fever, body pain, throat pain, dry cough",
      "diagnosis": "Viral upper respiratory infection",
      "notes": "Patient reports symptoms for 5 days",
      "medications": [
        {
          "name": "Paracetamol",
          "formula": "500mg",
          "dosePerIntake": "1 tablet",
          "timesPerDay": 3,
          "totalDays": 5,
          "instructions": "Take after meals"
        }
      ],
      "additionalMedications": "Erythromycin 500mg if infection confirmed",
      "recommendedTests": [
        {
          "name": "CBC",
          "department": "Laboratory"
        }
      ],
      "additionalTests": ""
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "summary": "Ahmed Khan is a 45-year-old male with blood group O+ and a known allergy to Penicillin. He has a medical history of hypertension and family history of diabetes (father). His most recent visit on January 15, 2024, was for a viral upper respiratory infection presenting with fever, body pain, throat pain, and dry cough lasting 5 days. Vitals showed elevated blood pressure (140/90) and fever (101F). He was prescribed Paracetamol 500mg three times daily and Erythromycin pending test results. CBC and Typhoid tests were recommended. The patient's hypertension requires ongoing monitoring, and given his family history, periodic diabetes screening is advisable."
}
```

---

### 5. POST /api/summarize-history-demo
**Purpose**: Demo medical history summary using sample data (no input needed)

**Takes**: ~30-60 seconds

**Request:**
```http
POST /api/summarize-history-demo
```

**Response:** Same structure as `/api/summarize-history` above

---

## Key Integration Points

### For Consultation Insights:
**Input Required:**
- Audio file (MP3/WAV from recording)
- Checkup object (what doctor manually entered)

**Output Provided:**
- `transcription`: Original transcription of the audio consultation
- `extracted_info`: Structured JSON with 12 clinical fields extracted from audio (uses null for missing values)
- `gap_analysis`: Patient-friendly plain text highlighting additional details found in the conversation

**Use Case:** After doctor completes consultation and records audio, your system:
1. Sends audio + doctor's manual entry to API
2. Gets back transcription + AI-extracted data + gap analysis
3. Shows doctor the complete consultation record with additional details found

---

### For Medical History Summarization:
**Input Required:**
- Patient demographics
- Array of past checkups

**Output Provided:**
- Plain text summary (2-3 paragraphs) for quick patient overview

**Use Case:** Before consultation starts, your system:
1. Fetches patient + past checkups from database
2. Sends to API for summarization
3. Shows doctor the summary for context

---

## Error Responses

All endpoints return this format on error:
```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## Integration Example (JavaScript)

### 1. Consultation Insights with Audio
```javascript
async function getConsultationInsights(audioFile, checkupInput) {
  const formData = new FormData();
  formData.append('audio', audioFile);
  formData.append('checkup', JSON.stringify(checkupInput));
  
  const response = await fetch(`${API_BASE_URL}/api/transcribe`, {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  if (result.success) {
    console.log('Transcription:', result.transcription);
    console.log('Extracted Info:', result.extracted_info);
    console.log('Gap Analysis:', result.gap_analysis);
  }
  return result;
}
```

### 2. Medical History Summary
```javascript
async function getPatientSummary(patient, checkups) {
  const response = await fetch(`${API_BASE_URL}/api/summarize-history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patient, checkups })
  });
  
  const result = await response.json();
  if (result.success) {
    console.log('Summary:', result.summary);
  }
  return result;
}
```

### 3. Testing with Demo Endpoints
```javascript
// Quick test without real data
async function testConsultationInsights() {
  const response = await fetch(`${API_BASE_URL}/api/transcribe-demo`, {
    method: 'POST'
  });
  return await response.json();
}

async function testHistorySummary() {
  const response = await fetch(`${API_BASE_URL}/api/summarize-history-demo`, {
    method: 'POST'
  });
  return await response.json();
}
```

---

## Important Notes

### Postman Settings
- Set **Request Timeout** to `180000` ms (3 minutes)
- AI processing takes 1-3 minutes depending on endpoint

### ngrok URL
- Free ngrok URL changes every restart
- Copy new URL from terminal each time
- For production, use cloud deployment with static URL

### Demo vs Live Endpoints
- Demo endpoints: No input needed, use hardcoded data, faster testing
- Live endpoints: Require actual data (audio files, JSON payloads)

---

## Running the Service

```bash
# Terminal 1: Start Ollama
ollama serve

# Terminal 2: Start API
python api_service.py

# Terminal 3: Start ngrok (for public access)
ngrok http 5000
```

Service available at:
- Local: `http://localhost:5000`
- Public: ngrok URL (copy from terminal)
