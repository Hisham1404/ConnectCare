# ElevenLabs Conversational Agent Edge Function

This Supabase Edge Function creates ElevenLabs conversational agents via the Pica Passthrough API for ConnectCare AI's voice-powered health check-ins.

## Overview

The function creates specialized medical conversational agents that can:
- Conduct empathetic daily health check-ins
- Gather patient health data through natural conversation
- Provide supportive, professional interactions
- Maintain medical privacy and compliance standards

## Environment Variables Required

Set these in your Supabase project settings:

```bash
PICA_SECRET_KEY=your_pica_secret_key_here
PICA_ELEVENLABS_CONNECTION_KEY=your_elevenlabs_connection_key_here
```

## API Usage

### Endpoint
```
POST /functions/v1/create-conversational-agent
```

### Request Body
```json
{
  "patientId": "patient-uuid",
  "patientName": "John Doe",
  "medicalCondition": "post-cardiac surgery",
  "customPrompt": "Optional custom medical prompt",
  "voiceId": "cjVigY5qzO86Huf0OWal",
  "language": "en"
}
```

### Response
```json
{
  "success": true,
  "agent_id": "agent_uuid",
  "patient_id": "patient-uuid",
  "patient_name": "John Doe",
  "voice_id": "cjVigY5qzO86Huf0OWal",
  "language": "en",
  "created_at": "2024-01-01T00:00:00.000Z",
  "message": "Conversational agent created successfully for ConnectCare AI"
}
```

## Features

### Medical-Focused Prompts
- Specialized prompts for healthcare conversations
- Empathetic, professional tone
- Structured health data collection
- Safety guidelines for medical interactions

### Privacy & Compliance
- Configurable data retention policies
- Medical record integration
- HIPAA-conscious design
- Secure conversation handling

### Voice Optimization
- High-quality speech recognition
- Natural, caring voice synthesis
- Optimized for medical conversations
- Real-time conversation flow

## Integration with ConnectCare AI

The function integrates seamlessly with:
- Patient dashboard daily check-ins
- Health data collection workflows
- Medical team communication
- Recovery progress tracking

## Error Handling

The function includes comprehensive error handling for:
- Missing environment variables
- Pica API failures
- Invalid request parameters
- Network connectivity issues

## Monitoring & Logging

All agent creations are logged with:
- Patient ID and name
- Agent ID for tracking
- Creation timestamp
- Success/failure status

## Security Considerations

- Environment variables are securely managed
- Patient data is handled according to medical privacy standards
- API keys are never exposed in responses
- All communications are encrypted

## Testing

Test the function with:

```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/create-conversational-agent' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "patientId": "test-patient-123",
    "patientName": "Test Patient",
    "medicalCondition": "post-surgery recovery"
  }'
```

## Related Functions

- `start-conversation` - Initiates conversations with created agents
- `end-conversation` - Ends conversations and saves health data
- Patient dashboard integration for seamless user experience