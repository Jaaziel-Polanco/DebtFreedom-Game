# API Documentation - Question Game System

Base URL: `https://your-domain.com/api`

## Authentication
Currently, no authentication is required for these endpoints. They are designed to be consumed by a WhatsApp client.

---

## Users

### Get User by Phone
\`\`\`http
GET /api/users?phone={phone_number}
\`\`\`

**Query Parameters:**
- `phone` (required): User's phone number

**Response (200):**
\`\`\`json
{
  "id": "uuid",
  "name": "John Doe",
  "phone": "+1234567890",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
\`\`\`

**Response (404):**
\`\`\`json
{
  "error": "User not found"
}
\`\`\`

---

### Create or Update User
\`\`\`http
POST /api/users
\`\`\`

**Request Body:**
\`\`\`json
{
  "name": "John Doe",
  "phone": "+1234567890"
}
\`\`\`

**Response (201 or 200):**
\`\`\`json
{
  "id": "uuid",
  "name": "John Doe",
  "phone": "+1234567890",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
\`\`\`

---

## Sessions

### Create New Game Session
\`\`\`http
POST /api/sessions
\`\`\`

**Request Body:**
\`\`\`json
{
  "user_id": "uuid",
  "participant_id": "uuid" // optional
}
\`\`\`

**Response (201):**
\`\`\`json
{
  "session": {
    "id": "uuid",
    "user_id": "uuid",
    "participant_id": "uuid",
    "created_at": "2024-01-01T00:00:00Z",
    "completed_at": null
  },
  "questions": [
    {
      "id": "uuid",
      "text": "What is the capital of France?",
      "display_order": 1,
      "answers": [
        {
          "id": "uuid",
          "text": "Paris",
          "is_correct": true
        },
        {
          "id": "uuid",
          "text": "London",
          "is_correct": false
        }
      ]
    },
    {
      "id": "uuid",
      "text": "What is the capital of Spain?",
      "display_order": 2,
      "answers": [
        {
          "id": "uuid",
          "text": "Madrid",
          "is_correct": true
        },
        {
          "id": "uuid",
          "text": "Barcelona",
          "is_correct": false
        }
      ]
    }
  ]
}
\`\`\`

**Note:** Las preguntas se devuelven ordenadas por el campo `display_order` en orden ascendente. Este orden puede ser configurado en el panel de administración.

---

### Get Session Details
\`\`\`http
GET /api/sessions?session_id={session_id}
\`\`\`

**Query Parameters:**
- `session_id` (required): Session UUID

**Response (200):**
\`\`\`json
{
  "id": "uuid",
  "user_id": "uuid",
  "participant_id": "uuid",
  "created_at": "2024-01-01T00:00:00Z",
  "completed_at": null,
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "phone": "+1234567890"
  },
  "participant": {
    "id": "uuid",
    "name": "Participant Name",
    "points": 10
  },
  "session_questions": [
    {
      "id": "uuid",
      "session_id": "uuid",
      "question_id": "uuid",
      "answer_id": "uuid",
      "answered_at": "2024-01-01T00:00:00Z",
      "question": { ... },
      "answer": { ... }
    }
  ]
}
\`\`\`

---

### Submit Answer
\`\`\`http
POST /api/sessions/{sessionId}/answer
\`\`\`

**Request Body:**
\`\`\`json
{
  "question_id": "uuid",
  "answer_id": "uuid"
}
\`\`\`

**Response (200):**
\`\`\`json
{
  "success": true,
  "is_correct": true,
  "session_question": {
    "id": "uuid",
    "session_id": "uuid",
    "question_id": "uuid",
    "answer_id": "uuid",
    "answered_at": "2024-01-01T00:00:00Z",
    "answer": {
      "id": "uuid",
      "text": "Paris",
      "is_correct": true
    }
  }
}
\`\`\`

---

### Complete Session
\`\`\`http
POST /api/sessions/{sessionId}/complete
\`\`\`

**Response (200):**
\`\`\`json
{
  "success": true,
  "message": "Session completed and points awarded",
  "points_awarded": 1
}
\`\`\`

---

## Participants

### Get All Participants
\`\`\`http
GET /api/participants
\`\`\`

**Response (200):**
\`\`\`json
[
  {
    "id": "uuid",
    "name": "Participant Name",
    "phone": "+1234567890",
    "points": 15,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
\`\`\`

---

## Typical Flow for WhatsApp Client

1. **User starts game:**
   - POST `/api/users` with name and phone
   - GET `/api/participants` to show list of participants
   - User selects a participant

2. **Create session:**
   - POST `/api/sessions` with user_id and participant_id
   - Receive all active questions ordered by `display_order`

3. **Answer questions:**
   - For each question (in the order they were received), POST `/api/sessions/{sessionId}/answer`
   - Receive immediate feedback if answer is correct

4. **Complete session:**
   - POST `/api/sessions/{sessionId}/complete`
   - Points are awarded to the selected participant

5. **View results:**
   - GET `/api/participants` to see updated points
