# ElevenLabs Conversational Agent Edge Function

This Supabase Edge Function creates a conversational agent using ElevenLabs API via the Pica Passthrough service, specifically designed for ConnectCare AI's post-operative patient monitoring.

## Overview

The function creates an AI-powered conversational agent that conducts daily health check-ins with post-surgery patients. The agent uses Gemini 2.0 Flash for natural language processing and ElevenLabs for high-quality text-to-speech.

## Environment Variables Required

Set these in your Supabase project settings:

```bash
PICA_SECRET_KEY=your_pica_secret_key_here
PICA_ELEVENLABS_CONNECTION_KEY=your_elevenlabs_connection_key_here
```

## Usage

### Endpoint
```
POST https://your-project.supabase.co/functions/v1/create-agent
```

### Request Body
```json
{
  "patient_name": "John Doe",
  "surgery_type": "Cardiac Bypass",
  "surgery_date": "2024-12-01",
  "custom_prompt": "Optional custom prompt override"
}
```

### Response
```json
{
  "success": true,
  "agent_id": "agent_12345",
  "message": "Conversational agent created successfully",
  "patient_info": {
    "name": "John Doe",
    "surgery_type": "Cardiac Bypass",
    "surgery_date": "2024-12-01"
  }
}
```

## Features

### AI Agent Capabilities
- **Personalized Interactions**: Uses patient name and surgery details for contextual conversations
- **Medical Focus**: Specialized in post-operative care monitoring
- **Multi-modal**: Supports both voice and text interactions
- **Safety First**: Built-in escalation protocols for concerning symptoms
- **Cultural Sensitivity**: Designed for diverse patient populations in India

### Health Monitoring Questions
The agent conducts structured check-ins covering:
1. Overall well-being assessment
2. Pain level monitoring (1-10 scale)
3. Mobility and movement evaluation
4. Surgical site inspection
5. Symptom tracking (nausea, dizziness, fatigue)
6. Appetite and nutrition status
7. Medication compliance
8. Digestive health
9. Open-ended concerns

### Technical Specifications
- **LLM**: Gemini 2.0 Flash Experimental
- **Voice**: ElevenLabs high-quality TTS
- **Audio Format**: PCM 16kHz
- **Max Duration**: 10 minutes per session
- **Daily Limit**: 50 conversations per agent
- **Retention**: 30 days for compliance and quality

### Safety & Compliance
- **Medical Guardrails**: No diagnosis or prescription capabilities
- **Emergency Escalation**: Automatic flagging of critical symptoms
- **Privacy Protection**: HIPAA-compliant data handling
- **Cultural Awareness**: Respectful of diverse health beliefs

## Integration with ConnectCare AI

### Mobile App Integration
```typescript
// Example usage in React Native
const createAgent = async (patientData) => {
  const response = await fetch('/functions/v1/create-agent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseToken}`
    },
    body: JSON.stringify({
      patient_name: patientData.name,
      surgery_type: patientData.surgeryType,
      surgery_date: patientData.surgeryDate
    })
  });
  
  const result = await response.json();
  return result.agent_id;
};
```

### Dashboard Integration
The agent data integrates with:
- Patient health metrics tracking
- Recovery progress monitoring
- Doctor notification systems
- Medication compliance tracking

## Error Handling

The function includes comprehensive error handling for:
- Missing environment variables
- Invalid API responses
- Network connectivity issues
- Malformed request data

## Security

- CORS enabled for ConnectCare AI domains
- Environment variable validation
- Request sanitization
- Secure API key management through Pica

## Monitoring

The function logs:
- Agent creation events
- Error conditions
- Performance metrics
- Usage statistics

## Deployment

Deploy using Supabase CLI:
```bash
supabase functions deploy create-agent
```

Set environment variables:
```bash
supabase secrets set PICA_SECRET_KEY=your_key
supabase secrets set PICA_ELEVENLABS_CONNECTION_KEY=your_key
```

## Support

For issues or questions:
1. Check Supabase function logs
2. Verify environment variables
3. Test Pica API connectivity
4. Review ElevenLabs API status