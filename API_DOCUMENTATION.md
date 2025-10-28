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
    "participant_id": null,
    "status": "in_progress",
    "total_questions": 0,
    "correct_answers": 0,
    "points_donated": 0,
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
  "status": "in_progress",
  "total_questions": 10,
  "correct_answers": 7,
  "points_donated": 0,
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

**Request Body:**
\`\`\`json
{
  "participant_id": "uuid"
}
\`\`\`

**Description:**
Completes a session and evaluates if the user passed the quiz:
- **Pass (≥70% correct)**: Awards 1 point to the selected participant and marks session as `completed`
- **Fail (<70% correct)**: No points awarded and marks session as `failed`

The calculation and point donation is handled automatically by database triggers.

**Response (200) - Passed:**
\`\`\`json
{
  "success": true,
  "session": {
    "id": "uuid",
    "status": "completed",
    "total_questions": 10,
    "correct_answers": 8,
    "success_rate": "80.00",
    "points_donated": 1,
    "completed_at": "2024-01-01T00:00:00Z"
  },
  "participant": {
    "id": "uuid",
    "name": "John Doe",
    "points": 16
  },
  "message": "¡Felicidades! Pasaste con 80.0%. Se donó 1 punto a John Doe"
}
\`\`\`

**Response (200) - Failed:**
\`\`\`json
{
  "success": true,
  "session": {
    "id": "uuid",
    "status": "failed",
    "total_questions": 10,
    "correct_answers": 6,
    "success_rate": "60.00",
    "points_donated": 0,
    "completed_at": null
  },
  "participant": {
    "id": "uuid",
    "name": "John Doe",
    "points": 15
  },
  "message": "Lo siento, necesitas al menos 70% para aprobar. Obtuviste 60.0%"
}
\`\`\`

**Response (400) - Errors:**
\`\`\`json
{
  "error": "participant_id is required to donate points"
}
\`\`\`
or
\`\`\`json
{
  "error": "Session already completed"
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

1. **User Registration:**
   - POST `/api/users` with name and phone
   - Receive user_id for future sessions

2. **Create Session:**
   - POST `/api/sessions` with user_id (participant_id is optional, can be set later)
   - Receive session_id and all active questions ordered by `display_order`

3. **Answer Questions:**
   - For each question (in the order they were received), POST `/api/sessions/{sessionId}/answer`
   - Receive immediate feedback if answer is correct
   - Track progress through all questions

4. **Select Beneficiary & Complete:**
   - GET `/api/participants` to show list of participants
   - User selects which participant to donate points to
   - POST `/api/sessions/{sessionId}/complete` with selected participant_id
   - System automatically:
     - Calculates correct answers percentage
     - If ≥70% correct: awards 1 point to participant and marks as "completed"
     - If <70% correct: no points awarded and marks as "failed"

5. **View Results:**
   - Receive immediate feedback with:
     - Final score (percentage)
     - Whether they passed or failed
     - Points donated (1 or 0)
     - Updated participant points
   - GET `/api/participants` to see updated leaderboard

## Important Rules

- **Passing Threshold**: User must answer at least 70% of questions correctly to pass
- **Point Donation**: Only successful sessions (≥70%) donate 1 point to the selected participant
- **Failed Sessions**: Sessions with <70% correct are marked as "failed" and don't donate points
- **One-Time Completion**: Sessions can only be completed once (status transitions from "in_progress" to "completed" or "failed")
- **Automatic Calculation**: All score calculation and point donation is handled by database triggers
