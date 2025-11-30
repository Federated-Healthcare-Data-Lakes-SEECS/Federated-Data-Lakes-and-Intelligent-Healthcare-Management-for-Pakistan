const express = require('express');
const multer = require('multer');

const app = express();
const PORT = 3003;

// Configure multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json({ limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Audio mock server is running' });
});

// Main audio analysis endpoint
app.post('/analyze', upload.single('audio'), (req, res) => {
  console.log('\n========== AUDIO ANALYSIS REQUEST RECEIVED ==========');
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

  // Log context data
  if (req.body.context) {
    try {
      const context = JSON.parse(req.body.context);
      console.log('\n📋 Context Data:');
      console.log('  - Patient ID:', context.patientId);
      console.log('  - Patient Name:', context.patientName);
      console.log('  - Symptoms:', context.symptoms?.substring(0, 100) + (context.symptoms?.length > 100 ? '...' : ''));
      console.log('  - Diagnosis:', context.diagnosis?.substring(0, 100) + (context.diagnosis?.length > 100 ? '...' : ''));
    } catch (e) {
      console.log('  Raw context:', req.body.context);
    }
  }

  console.log('\n====================================================\n');

  // Simulate some processing delay (1-2 seconds)
  const delay = 1000 + Math.random() * 1000;
  
  setTimeout(() => {
    // Return dummy insights
    res.json({
      success: true,
      insights: `[AI Analysis - Mock Response]

Based on the audio recording of the doctor-patient consultation:

**Key Observations:**
- Patient presented with symptoms as documented
- Consultation appeared thorough and professional
- Treatment plan discussed with patient

**Recommendations:**
- Follow prescribed medication schedule
- Schedule follow-up appointment as advised
- Monitor symptoms and report any changes

**Note:** This is a mock response from the test server. In production, this would contain actual AI-generated insights from Whisper transcription and MedGemma analysis.

Generated at: ${new Date().toISOString()}`,
      transcription: '[Mock transcription would appear here in production]',
      processingTime: delay.toFixed(0) + 'ms'
    });
  }, delay);
});

// Medical history generation endpoint
app.post('/generate-medical-history', (req, res) => {
  console.log('\n========== MEDICAL HISTORY GENERATION REQUEST ==========');
  console.log('Timestamp:', new Date().toISOString());
  
  const { patient, checkups } = req.body;
  
  if (!patient) {
    console.log('⚠️ No patient data received');
    return res.status(400).json({ error: 'Patient data is required' });
  }

  console.log('\n👤 Patient Info:');
  console.log('  - Name:', patient.name);
  console.log('  - Gender:', patient.gender);
  console.log('  - Age:', patient.age);
  console.log('  - Blood Group:', patient.bloodGroup);
  
  console.log('\n📋 Checkups:', checkups?.length || 0, 'records');
  
  if (checkups && checkups.length > 0) {
    checkups.forEach((checkup, index) => {
      console.log(`\n  Checkup ${index + 1}:`);
      console.log('    - Date:', checkup.date);
      console.log('    - Department:', checkup.department);
      console.log('    - Diagnosis:', checkup.diagnosis?.substring(0, 50) + (checkup.diagnosis?.length > 50 ? '...' : ''));
      console.log('    - Medications:', checkup.medications?.length || 0);
      console.log('    - Recommended Tests:', checkup.recommendedTests?.length || 0);
    });
  }

  console.log('\n=========================================================\n');

  // Simulate processing delay
  const delay = 500 + Math.random() * 500;

  setTimeout(() => {
    // Generate mock medical history summary based on the checkups
    const diagnoses = checkups?.map(c => c.diagnosis).filter(Boolean) || [];
    const allMedications = checkups?.flatMap(c => c.medications || []) || [];
    const allTests = checkups?.flatMap(c => c.recommendedTests || []) || [];
    
    const medicalHistory = generateMockMedicalHistory(patient, checkups || []);

    res.json({
      success: true,
      medicalHistory,
      summary: {
        totalCheckups: checkups?.length || 0,
        uniqueDiagnoses: [...new Set(diagnoses)].length,
        totalMedicationsPrescribed: allMedications.length,
        totalTestsRecommended: allTests.length
      },
      generatedAt: new Date().toISOString()
    });
  }, delay);
});

function generateMockMedicalHistory(patient, checkups) {
  if (!checkups || checkups.length === 0) {
    return `No medical checkup records available for ${patient.name || 'this patient'}.`;
  }

  const diagnoses = [...new Set(checkups.map(c => c.diagnosis).filter(Boolean))];
  const departments = [...new Set(checkups.map(c => c.department).filter(Boolean))];
  const medications = checkups.flatMap(c => c.medications || []);
  const uniqueMedNames = [...new Set(medications.map(m => m.name).filter(Boolean))];
  
  // Build a comprehensive medical history summary
  let history = `## Medical History Summary for ${patient.name || 'Patient'}

### Patient Demographics
- **Age:** ${patient.age || 'Unknown'} years
- **Gender:** ${patient.gender || 'Unknown'}
- **Blood Group:** ${patient.bloodGroup || 'Unknown'}
${patient.allergies ? `- **Known Allergies:** ${patient.allergies}` : ''}
${patient.familyHistory ? `- **Family History:** ${patient.familyHistory}` : ''}

### Clinical History Overview
**Total Visits:** ${checkups.length} recorded checkup(s)
**Departments Visited:** ${departments.join(', ') || 'Not specified'}

### Diagnoses History
${diagnoses.length > 0 ? diagnoses.map((d, i) => `${i + 1}. ${d}`).join('\n') : 'No diagnoses recorded'}

### Medication History
${uniqueMedNames.length > 0 ? `Patient has been prescribed the following medications: ${uniqueMedNames.join(', ')}.` : 'No medications recorded'}

### Recent Checkups Summary
`;

  // Add summary of last 3 checkups
  const recentCheckups = checkups.slice(-3).reverse();
  recentCheckups.forEach((checkup, index) => {
    history += `
#### Visit ${index + 1} - ${checkup.date || 'Date unknown'}
- **Department:** ${checkup.department || 'Not specified'}
- **Chief Complaints:** ${checkup.symptoms || 'Not recorded'}
- **Diagnosis:** ${checkup.diagnosis || 'Not recorded'}
- **Vitals:** BP: ${checkup.bloodPressure || 'N/A'}, Temp: ${checkup.temperature || 'N/A'}, HR: ${checkup.heartRate || 'N/A'}
${checkup.notes ? `- **Notes:** ${checkup.notes}` : ''}
`;
  });

  history += `
### AI-Generated Insights
Based on the patient's medical history, the following patterns and recommendations are noted:
1. Regular follow-up visits are recommended to monitor ongoing conditions
2. Medication adherence should be verified at each visit
3. Lifestyle modifications may benefit overall health outcomes

---
*This medical history was automatically generated on ${new Date().toISOString()}*
*Note: This is a mock response. In production, this would be generated by MedGemma AI.*
`;

  return history;
}

app.listen(PORT, () => {
  console.log(`\n🎤 Audio & Medical History Mock Server running on http://localhost:${PORT}`);
  console.log(`   - Health check:            GET  http://localhost:${PORT}/health`);
  console.log(`   - Audio Analysis:          POST http://localhost:${PORT}/analyze`);
  console.log(`   - Medical History Gen:     POST http://localhost:${PORT}/generate-medical-history`);
  console.log('\nWaiting for requests...\n');
});
