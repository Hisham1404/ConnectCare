# ConnectCare AI Backend Service

Backend service for the ConnectCare AI remote patient monitoring application.

## Overview

This Express.js server provides the backend API for ConnectCare AI, enabling medical staff in India to monitor post-surgery and elderly patients remotely through conversational AI.

## Technology Stack

- **Runtime**: Node.js (>=18.0.0)
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT + Supabase Auth
- **External Integrations**: Pica Platform (Voice, Alerts, Chat/Video)

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager
- Supabase account and project
- Pica Platform API credentials

### Installation

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Update the `.env` file with your actual configuration values:
   - Supabase URL and keys
   - Pica Platform API credentials
   - JWT secret
   - Other required configuration

### Running the Server

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The server will start on the port specified in your `.env` file (default: 3000).

## API Endpoints

### Health Check
- **GET** `/` - Returns server status and basic information

### API Routes (Coming Soon)
- **API v1** `/api/v1/*` - Main API endpoints for ConnectCare AI features

## Project Structure

```
server/
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
├── .env.example       # Environment variables template
├── .env              # Environment variables (not in git)
├── .gitignore        # Git ignore rules
└── README.md         # This file
```

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: API request rate limiting (configurable)
- **Input Validation**: Request body size limits
- **Error Handling**: Comprehensive error handling middleware

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment mode | development |
| `FRONTEND_URL` | Frontend application URL | http://localhost:8081 |
| `SUPABASE_URL` | Supabase project URL | - |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | - |
| `PICA_API_KEY_PLACEHOLDER` | Pica Platform API key | - |
| `JWT_SECRET` | JWT signing secret | - |

## Development Guidelines

### Data Type Integrity
When querying the database with IDs (especially UUID columns), always validate that the ID variable is not null, undefined, or empty before executing queries to prevent `uuid = text` errors.

Example:
```javascript
// ✅ Good - Validate UUID before query
if (!patientId || typeof patientId !== 'string' || patientId.trim() === '') {
  return res.status(400).json({ error: 'Invalid patient ID' });
}

// Now safe to use in database query
const patient = await supabase
  .from('patients')
  .select('*')
  .eq('id', patientId)
  .single();
```

### External API Integration
All Pica Platform integrations use placeholder functions and environment variables. Update these with actual implementation details when API documentation is available.

## Deployment

This server is designed to work with:
- Traditional hosting providers (AWS, Google Cloud, Azure)
- Container platforms (Docker, Kubernetes)
- Serverless platforms (with appropriate modifications)

## Contributing

1. Follow the established code structure and patterns
2. Ensure all database queries include proper UUID validation
3. Use environment variables for all configuration
4. Maintain compatibility with the Expo frontend
5. Follow Git/GitHub workflow practices

## License

MIT License - See LICENSE file for details