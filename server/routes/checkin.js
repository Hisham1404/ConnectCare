const express = require('express');
const router = express.Router();
const { fetchPatientContext, analyzeTranscript, saveCheckinToDatabase } = require('../services/AnalysisService');

// POST /api/checkin endpoint
router.post('/', async (req, res) => {
  try {
    const { patientId, transcript } = req.body;

    // Validate required fields
    if (!patientId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'patientId is required'
      });
    }

    if (!transcript) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'transcript is required'
      });
    }

    // Validate patientId format (should be a non-empty string)
    if (typeof patientId !== 'string' || patientId.trim() === '') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'patientId must be a non-empty string'
      });
    }

    // Validate transcript format (should be a non-empty string)
    if (typeof transcript !== 'string' || transcript.trim() === '') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'transcript must be a non-empty string'
      });
    }

    // Log the received data to console
    console.log('=== Patient Check-in Received ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Patient ID:', patientId);
    console.log('Transcript:', transcript);
    console.log('Request IP:', req.ip || req.connection.remoteAddress);
    console.log('User Agent:', req.get('User-Agent') || 'Unknown');
    console.log('================================');

    // Step 1: Fetch patient context from Supabase
    console.log('🔍 Fetching patient context...');
    const patientContext = await fetchPatientContext(patientId);
    
    if (patientContext) {
      console.log('✅ Patient context retrieved successfully');
    } else {
      console.log('⚠️ Patient context not available - proceeding with basic analysis');
    }

    // Step 2: Analyze the transcript with context
    console.log('🤖 Analyzing transcript...');
    const analysisResult = await analyzeTranscript(transcript, patientContext);
    console.log('✅ Transcript analysis completed - Status:', analysisResult.status);

    // Step 3: Save check-in data to Supabase
    console.log('💾 Saving check-in to database...');
    const savedCheckin = await saveCheckinToDatabase(patientId, transcript, analysisResult);
    
    if (savedCheckin) {
      console.log('✅ Check-in saved successfully with ID:', savedCheckin.id);
    } else {
      console.log('⚠️ Failed to save check-in to database');
    }

    // Return comprehensive response
    res.status(200).json({
      success: true,
      message: 'Check-in processed successfully',
      data: {
        patientId: patientId.trim(),
        transcript: transcript.trim(),
        receivedAt: new Date().toISOString(),
        analysis: {
          status: analysisResult.status,
          confidence: analysisResult.confidence,
          riskScore: analysisResult.riskScore,
          insights: analysisResult.insights,
          recommendations: analysisResult.recommendations
        },
        checkinId: savedCheckin?.id || null,
        databaseSaved: !!savedCheckin
      }
    });

  } catch (error) {
    console.error('❌ Error processing check-in:', error);
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while processing the check-in data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;