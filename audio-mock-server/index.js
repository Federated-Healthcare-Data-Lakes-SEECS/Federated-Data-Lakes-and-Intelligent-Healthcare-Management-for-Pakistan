const express = require('express');
const multer = require('multer');

const app = express();
const PORT = 3003;

// Configure multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json({ limit: '50mb' }));

// ============================================================================
// API 1: Health Check
// GET /api/health
// ============================================================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    whisper_loaded: true,
    medgemma_ready: true
  });
});

// Legacy health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Audio mock server is running' });
});

// ============================================================================
// API 2: POST /api/transcribe
// Purpose: Extract clinical info from audio consultation + compare with doctor's manual input
// Takes: ~2-3 minutes (we'll simulate with 2-5 seconds)
// ============================================================================
app.post('/api/transcribe', upload.single('audio'), (req, res) => {
  console.log('\n========== API 2: /api/transcribe REQUEST ==========');
  console.log('Timestamp:', new Date().toISOString());
  
  // Log audio file info
  if (req.file) {
    console.log('\n📁 Audio File:');
    console.log('  - Original name:', req.file.originalname);
    console.log('  - MIME type:', req.file.mimetype);
    console.log('  - Size:', (req.file.size / 1024).toFixed(2), 'KB');
  } else {
    console.log('\n⚠️ No audio file received');
  }

  // Log checkup data
  if (req.body.checkup) {
    try {
      const checkup = JSON.parse(req.body.checkup);
      console.log('\n📋 Checkup Data:');
      console.log('  - Checkup ID:', checkup.checkupId);
      console.log('  - Date:', checkup.date);
      console.log('  - Department:', checkup.department);
      console.log('  - Symptoms:', checkup.symptoms?.substring(0, 100) + (checkup.symptoms?.length > 100 ? '...' : ''));
      console.log('  - Diagnosis:', checkup.diagnosis?.substring(0, 100) + (checkup.diagnosis?.length > 100 ? '...' : ''));
      console.log('  - Medications:', checkup.medications?.length || 0);
      console.log('  - Recommended Tests:', checkup.recommendedTests?.length || 0);
    } catch (e) {
      console.log('  Raw checkup:', req.body.checkup);
    }
  }

  console.log('\n====================================================\n');

  // Simulate processing delay (2-5 seconds to mimic AI processing)
  const delay = 2000 + Math.random() * 3000;
  
  setTimeout(() => {
    // Return response matching API 2 format from INTEGRATION_PLAN.md
    res.json({
      success: true,
      transcription: `[Mock Urdu Transcription]
ڈاکٹر: آسلام علیکم، کیسے ہیں آپ؟
مریض: وعلیکم السلام ڈاکٹر صاحب، میں ٹھیک نہیں ہوں۔ پانچ دن سے بخار ہے۔
ڈاکٹر: اور کیا تکلیف ہے؟
مریض: جسم میں درد ہے، گلے میں بھی درد ہے، اور کھانسی بھی ہے۔
ڈاکٹر: کوئی اور بیماری ہے؟ شوگر یا بلڈ پریشر؟
مریض: نہیں ڈاکٹر صاحب، کوئی بیماری نہیں ہے۔
ڈاکٹر: ٹھیک ہے، میں آپ کو پیراسیٹامول اور اینٹی بائیوٹک دے رہا ہوں۔ CBC ٹیسٹ بھی کروا لیں۔

[Mock Response - In production, this would be actual Whisper transcription]`,
      extracted_info: {
        patientDemographics: null,
        symptoms: "Fever for 5 days, body pain, throat pain with difficulty breathing, dry cough, tiredness, headache",
        durationOfSymptoms: "Fever: 5 days, other symptoms: not specified",
        medicalHistory: "No diabetes, no blood pressure issues, no chronic problems",
        currentMedications: null,
        allergies: null,
        clinicalExamination: null,
        diagnosis: "Possible viral or bacterial infection, likely upper respiratory tract infection",
        testsOrdered: "CBC test, Typhoid test",
        prescription: "Paracetamol 500mg three times a day for fever and body pain, Erythromycin 500mg once a day for three days if infection confirmed",
        adviceInstructions: "Drink more water, rest, avoid oily and spicy food",
        followUpInstructions: "Return immediately if fever goes above 102F or if breathing difficulty worsens"
      },
      gap_analysis: "Through the conversation, we found these additional details: The patient mentioned throat pain and dry cough which were not in the original symptoms. Additional symptoms noted include tiredness and headache. The diagnosis identifies this as a possible viral or bacterial infection (upper respiratory tract infection). Erythromycin 500mg was also prescribed pending infection confirmation, and a Typhoid test was recommended in addition to CBC. The doctor advised the patient to drink more water, rest, and avoid oily/spicy food."
    });
  }, delay);
});

// ============================================================================
// API 3: POST /api/transcribe-demo
// Purpose: Demo consultation insights using hardcoded audio text (no Whisper, faster)
// Takes: ~1-2 minutes (we'll simulate with 1-2 seconds)
// ============================================================================
app.post('/api/transcribe-demo', (req, res) => {
  console.log('\n========== API 3: /api/transcribe-demo REQUEST ==========');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Using hardcoded demo data (no audio input needed)');
  console.log('=========================================================\n');

  // Simulate shorter processing delay
  const delay = 1000 + Math.random() * 1000;
  
  setTimeout(() => {
    res.json({
      success: true,
      transcription: `[Demo Transcription - Hardcoded]
Doctor: Assalam o Alaikum, how are you?
Patient: Walaikum Assalam Doctor, I am not feeling well. I have had fever for 5 days.
Doctor: What other problems do you have?
Patient: Body pain, throat pain, and cough.
Doctor: Any other diseases? Diabetes or blood pressure?
Patient: No doctor, no diseases.
Doctor: Okay, I am prescribing Paracetamol and antibiotics. Also get a CBC test done.`,
      extracted_info: {
        patientDemographics: null,
        symptoms: "Fever for 5 days, body pain, throat pain, dry cough",
        durationOfSymptoms: "5 days",
        medicalHistory: "No diabetes, no blood pressure, no chronic conditions",
        currentMedications: null,
        allergies: null,
        clinicalExamination: null,
        diagnosis: "Upper respiratory tract infection (viral/bacterial)",
        testsOrdered: "CBC test",
        prescription: "Paracetamol 500mg TDS, Antibiotics",
        adviceInstructions: "Rest, drink fluids, avoid cold drinks",
        followUpInstructions: "Return if fever persists beyond 3 days"
      },
      gap_analysis: "Demo gap analysis: The conversation revealed additional symptoms (throat pain, cough) not initially documented. Patient confirmed no pre-existing conditions."
    });
  }, delay);
});

// ============================================================================
// API 4: POST /api/summarize-history
// Purpose: Generate concise patient history summary from past checkups
// Takes: ~30-60 seconds (we'll simulate with 1-3 seconds)
// ============================================================================
app.post('/api/summarize-history', (req, res) => {
  console.log('\n========== API 4: /api/summarize-history REQUEST ==========');
  console.log('Timestamp:', new Date().toISOString());
  
  const { patient, checkups } = req.body;
  
  if (!patient) {
    console.log('⚠️ No patient data received');
    return res.status(400).json({ 
      success: false, 
      error: 'Patient data is required' 
    });
  }

  console.log('\n👤 Patient Info:');
  console.log('  - Name:', patient.name);
  console.log('  - Gender:', patient.gender);
  console.log('  - Age:', patient.age);
  console.log('  - Blood Group:', patient.bloodGroup);
  console.log('  - Allergies:', patient.allergies || 'None');
  console.log('  - Medical History:', patient.medicalHistory || 'None');
  console.log('  - Family History:', patient.familyHistory || 'None');
  
  console.log('\n📋 Checkups:', checkups?.length || 0, 'records');
  
  if (checkups && checkups.length > 0) {
    checkups.forEach((checkup, index) => {
      console.log(`\n  Checkup ${index + 1}:`);
      console.log('    - Date:', checkup.date);
      console.log('    - Department:', checkup.department);
      console.log('    - Symptoms:', checkup.symptoms?.substring(0, 50) + (checkup.symptoms?.length > 50 ? '...' : ''));
      console.log('    - Diagnosis:', checkup.diagnosis?.substring(0, 50) + (checkup.diagnosis?.length > 50 ? '...' : ''));
      console.log('    - Medications:', checkup.medications?.length || 0);
      console.log('    - Recommended Tests:', checkup.recommendedTests?.length || 0);
    });
  }

  console.log('\n============================================================\n');

  // Simulate processing delay
  const delay = 1000 + Math.random() * 2000;

  setTimeout(() => {
    // Generate summary matching API 4 response format
    const summary = generatePatientSummary(patient, checkups || []);

    res.json({
      success: true,
      summary: summary
    });
  }, delay);
});

// ============================================================================
// API 5: POST /api/summarize-history-demo
// Purpose: Demo medical history summary using sample data (no input needed)
// Takes: ~30-60 seconds (we'll simulate with 1-2 seconds)
// ============================================================================
app.post('/api/summarize-history-demo', (req, res) => {
  console.log('\n========== API 5: /api/summarize-history-demo REQUEST ==========');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Using hardcoded demo data (no input needed)');
  console.log('================================================================\n');

  const delay = 1000 + Math.random() * 1000;

  setTimeout(() => {
    res.json({
      success: true,
      summary: "Ahmed Khan is a 45-year-old male with blood group O+ and a known allergy to Penicillin. He has a medical history of hypertension and family history of diabetes (father). His most recent visit on January 15, 2024, was for a viral upper respiratory infection presenting with fever, body pain, throat pain, and dry cough lasting 5 days. Vitals showed elevated blood pressure (140/90) and fever (101F). He was prescribed Paracetamol 500mg three times daily and Erythromycin pending test results. CBC and Typhoid tests were recommended. The patient's hypertension requires ongoing monitoring, and given his family history, periodic diabetes screening is advisable."
    });
  }, delay);
});

// ============================================================================
// Legacy endpoints (for backward compatibility)
// ============================================================================

// Legacy audio analysis endpoint
app.post('/analyze', upload.single('audio'), (req, res) => {
  console.log('\n⚠️ Legacy /analyze endpoint called - redirecting to /api/transcribe format');
  
  // Forward to the new format handler logic
  const delay = 2000 + Math.random() * 3000;
  
  setTimeout(() => {
    res.json({
      success: true,
      transcription: "[Legacy endpoint - Mock transcription]",
      extracted_info: {
        patientDemographics: null,
        symptoms: "Symptoms extracted from audio",
        durationOfSymptoms: "Duration noted",
        medicalHistory: null,
        currentMedications: null,
        allergies: null,
        clinicalExamination: null,
        diagnosis: "Diagnosis from conversation",
        testsOrdered: null,
        prescription: null,
        adviceInstructions: null,
        followUpInstructions: null
      },
      gap_analysis: "Legacy endpoint response - additional details from conversation"
    });
  }, delay);
});

// Legacy medical history generation endpoint
app.post('/generate-medical-history', (req, res) => {
  console.log('\n⚠️ Legacy /generate-medical-history endpoint called - using new format');
  
  const { patient, checkups } = req.body;
  const delay = 1000 + Math.random() * 1000;

  setTimeout(() => {
    const summary = generatePatientSummary(patient || {}, checkups || []);
    res.json({
      success: true,
      summary: summary
    });
  }, delay);
});

// ============================================================================
// Helper function to generate patient summary
// ============================================================================
function generatePatientSummary(patient, checkups) {
  if (!checkups || checkups.length === 0) {
    return `${patient.name || 'The patient'} is a ${patient.age || 'unknown age'}-year-old ${patient.gender || 'individual'}${patient.bloodGroup ? ` with blood group ${patient.bloodGroup}` : ''}. ${patient.allergies ? `Known allergies include ${patient.allergies}. ` : ''}${patient.medicalHistory ? `Medical history includes ${patient.medicalHistory}. ` : ''}${patient.familyHistory ? `Family history notes ${patient.familyHistory}. ` : ''}No recent checkup records are available for comprehensive analysis.`;
  }

  const recentCheckup = checkups[checkups.length - 1];
  const diagnoses = [...new Set(checkups.map(c => c.diagnosis).filter(Boolean))];
  const allMedications = checkups.flatMap(c => c.medications || []);
  const uniqueMeds = [...new Set(allMedications.map(m => m.name).filter(Boolean))];
  const allTests = checkups.flatMap(c => c.recommendedTests || []);
  const uniqueTests = [...new Set(allTests.map(t => t.name).filter(Boolean))];

  let summary = `${patient.name || 'The patient'} is a ${patient.age || 'unknown age'}-year-old ${patient.gender || 'individual'}`;
  
  if (patient.bloodGroup) {
    summary += ` with blood group ${patient.bloodGroup}`;
  }
  
  if (patient.allergies) {
    summary += ` and a known allergy to ${patient.allergies}`;
  }
  
  summary += '. ';
  
  if (patient.medicalHistory) {
    summary += `The patient has a medical history of ${patient.medicalHistory}. `;
  }
  
  if (patient.familyHistory) {
    summary += `Family history includes ${patient.familyHistory}. `;
  }

  // Recent visit info
  if (recentCheckup) {
    summary += `The most recent visit on ${recentCheckup.date || 'an unspecified date'}`;
    
    if (recentCheckup.department) {
      summary += ` to ${recentCheckup.department}`;
    }
    
    summary += ` was for ${recentCheckup.diagnosis || recentCheckup.symptoms || 'a medical consultation'}`;
    
    if (recentCheckup.symptoms && recentCheckup.diagnosis) {
      summary += ` presenting with ${recentCheckup.symptoms}`;
    }
    
    summary += '. ';
    
    // Vitals
    const vitals = [];
    if (recentCheckup.bloodPressure) vitals.push(`blood pressure ${recentCheckup.bloodPressure}`);
    if (recentCheckup.temperature) vitals.push(`temperature ${recentCheckup.temperature}`);
    if (recentCheckup.heartRate) vitals.push(`heart rate ${recentCheckup.heartRate}`);
    if (recentCheckup.bloodSugar) vitals.push(`blood sugar ${recentCheckup.bloodSugar}`);
    
    if (vitals.length > 0) {
      summary += `Vitals showed ${vitals.join(', ')}. `;
    }
  }

  // Medications
  if (uniqueMeds.length > 0) {
    summary += `Medications prescribed include ${uniqueMeds.slice(0, 3).join(', ')}${uniqueMeds.length > 3 ? ' and others' : ''}. `;
  }

  // Tests
  if (uniqueTests.length > 0) {
    summary += `Recommended tests include ${uniqueTests.join(', ')}. `;
  }

  // Overall assessment
  if (checkups.length > 1) {
    summary += `Over ${checkups.length} visits, the patient has been monitored for ${diagnoses.slice(0, 2).join(' and ') || 'various conditions'}. `;
  }

  summary += 'Regular follow-up visits are recommended to monitor ongoing health status.';

  return summary;
}

// ============================================================================
// Start server
// ============================================================================
app.listen(PORT, () => {
  console.log(`\n🎤 Audio & Medical History Mock Server running on http://localhost:${PORT}`);
  console.log('\n📡 API Endpoints (matching INTEGRATION_PLAN.md):');
  console.log(`   - Health Check:              GET  http://localhost:${PORT}/api/health`);
  console.log(`   - Transcribe Audio:          POST http://localhost:${PORT}/api/transcribe`);
  console.log(`   - Transcribe Demo:           POST http://localhost:${PORT}/api/transcribe-demo`);
  console.log(`   - Summarize History:         POST http://localhost:${PORT}/api/summarize-history`);
  console.log(`   - Summarize History Demo:    POST http://localhost:${PORT}/api/summarize-history-demo`);
  console.log('\n📡 Legacy Endpoints (backward compatibility):');
  console.log(`   - Legacy Health:             GET  http://localhost:${PORT}/health`);
  console.log(`   - Legacy Analyze:            POST http://localhost:${PORT}/analyze`);
  console.log(`   - Legacy Medical History:    POST http://localhost:${PORT}/generate-medical-history`);
  console.log('\nWaiting for requests...\n');
});
