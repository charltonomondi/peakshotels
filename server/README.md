# Peaks Hotel Booking API Server

Backend server for handling booking confirmations and sending emails via SMTP.

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:3001`

## API Endpoints

### POST `/api/send-booking-email`
Sends booking confirmation email to guest and hotel.

**Request:**
- FormData with booking details and passport/ID images

**Response:**
```json
{
  "success": true,
  "message": "Booking confirmation email sent successfully"
}
```

### GET `/api/health`
Health check endpoint.

## Email Configuration

- **SMTP Service:** Gmail
- **From Email:** charltonoomondi@gmail.com
- **App Password:** Configured in server.js

## Notes

- Passport/ID images are attached to both guest and hotel emails
- Email template includes hotel branding and all booking details
- Server uses CORS to allow requests from frontend
