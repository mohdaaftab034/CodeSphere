# Backend API Documentation (`reademe`)

This file documents all currently available backend API endpoints in this project.

- Base URL (local): `http://localhost:5000`
- API Prefix: `/api`
- Content-Type: `application/json` (except multipart uploads)

---

## 1) Authentication & Access

### Authorization Header
For protected endpoints, pass JWT in header:

```http
Authorization: Bearer <token>
```

### Access Types
- **Public**: No token required
- **Protected**: Valid JWT required (`protect` middleware)
- **Admin**: Valid JWT + `role=admin` (`protect + adminOnly`)
- **Paid**: Valid JWT + `isPaid=true` (`protect + paidOnly`)

### Common Error Responses
- `400` Bad request / validation failed
- `401` Not authenticated / invalid token
- `403` Forbidden (admin or paid required)
- `404` Resource not found
- `500` Internal server error

---

## 2) System

### GET `/`
- **Access**: Public
- **Purpose**: API root status message
- **Response (200)**
```json
{
  "message": "CodeSphere API is online",
  "version": "1.0.0",
  "status": "healthy",
  "endpoints": {
    "health": "/api/health",
    "auth": "/api/auth",
    "notes": "/api/notes"
  }
}
```

### GET `/api/health`
- **Access**: Public
- **Purpose**: Health check
- **Response (200)**
```json
{
  "status": "UP",
  "timestamp": "2026-02-24T00:00:00.000Z",
  "environment": "development"
}
```

---

## 3) Auth API (`/api/auth`)

### POST `/api/auth/login`
- **Access**: Public
- **Body**
```json
{ "email": "user@example.com", "password": "123456" }
```
- **Validation**
  - `email`: required, valid email
  - `password`: required, min 6 chars
- **Response (200)**
```json
{
  "success": true,
  "message": "OTP sent to your email. Please verify to complete login.",
  "userId": "...",
  "email": "user@example.com",
  "isNewUser": false
}
```

### POST `/api/auth/verify-otp`
- **Access**: Public
- **Body**
```json
{ "userId": "<mongoId>", "otp": "123456" }
```
- **Response (200)**
```json
{
  "success": true,
  "token": "<jwt>",
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "role": "user",
    "avatar": "...",
    "authProvider": "local",
    "isPaid": false,
    "subscriptionExpiresAt": null
  }
}
```

### GET `/api/auth/profile`
- **Access**: Protected
- **Response (200)**
```json
{ "success": true, "user": { "_id": "...", "email": "..." } }
```

### GET `/api/auth/google`
- **Access**: Public
- **Purpose**: Starts Google OAuth flow
- **Response**: Redirects to Google, or
```json
{ "message": "Google OAuth is not configured" }
```

### GET `/api/auth/google/callback`
- **Access**: Public (OAuth callback)
- **Purpose**: Completes OAuth and redirects to frontend
- **Success**: Redirect to frontend callback with token/user payload in query string
- **Failure**: Redirect to frontend login with error query param

---

## 4) Notes API (`/api/notes`)

### GET `/api/notes`
- **Access**: Public
- **Query Params (optional)**: `category`, `chapter`, `chapterId`, `difficulty`, `isPremium`
- **Response (200)**
```json
{ "success": true, "count": 10, "notes": [ ... ] }
```

### GET `/api/notes/slug/:slug`
- **Access**: Public
- **Params**: `slug`
- **Response (200)**
```json
{ "success": true, "note": { ... } }
```

### GET `/api/notes/:id`
- **Access**: Public
- **Params**: `id` (note id)
- **Response (200)**
```json
{ "success": true, "note": { ... } }
```

### GET `/api/notes/:id/download-pdf`
- **Access**: Public
- **Params**: `id`
- **Response**: PDF stream (`application/pdf`)
- **Error (500)**
```json
{ "message": "Failed to generate PDF", "error": "..." }
```

### GET `/api/notes/admin/all`
- **Access**: Admin
- **Query Params (optional)**: `category`, `status`
- **Response (200)**
```json
{ "success": true, "count": 20, "notes": [ ... ] }
```

### POST `/api/notes`
- **Access**: Admin
- **Body**
```json
{
  "title": "...",
  "slug": "optional-slug",
  "category": "JavaScript",
  "chapter": "Arrays",
  "chapterId": "optional",
  "content": "# markdown",
  "difficulty": "Beginner",
  "excerpt": "...",
  "author": "Admin",
  "readingTime": "5 min",
  "isPremium": false,
  "status": "Draft"
}
```
- **Response (201)**
```json
{ "success": true, "message": "Note created successfully", "note": { ... } }
```

### PUT `/api/notes/:id`
- **Access**: Admin
- **Params**: `id`
- **Body**: Same structure as create note
- **Response (200)**
```json
{ "success": true, "message": "Note updated successfully", "note": { ... } }
```

### DELETE `/api/notes/:id`
- **Access**: Admin
- **Params**: `id`
- **Response (200)**
```json
{ "success": true, "message": "Note deleted successfully" }
```

---

## 5) Chapters API (`/api/chapters`)

### GET `/api/chapters`
- **Access**: Public
- **Response (200)**
```json
{ "success": true, "count": 5, "chapters": [ ... ] }
```

### GET `/api/chapters/slug/:slug`
- **Access**: Public
- **Params**: `slug`
- **Response (200)**
```json
{ "success": true, "chapter": { ... } }
```

### POST `/api/chapters`
- **Access**: Admin
- **Body**
```json
{
  "title": "MERN",
  "slug": "mern",
  "description": "...",
  "icon": "BookOpen",
  "gradient": "from-gray-500/80 to-gray-600/80",
  "level": "Intermediate",
  "parentId": null,
  "hasSubChapters": false,
  "navPath": ""
}
```
- **Response (201)**
```json
{ "success": true, "chapter": { ... } }
```

### PUT `/api/chapters/:id`
- **Access**: Admin
- **Params**: `id`
- **Body**: Partial chapter fields
- **Response (200)**
```json
{ "success": true, "chapter": { ... } }
```

### DELETE `/api/chapters/:id`
- **Access**: Admin
- **Params**: `id`
- **Response (200)**
```json
{ "success": true, "message": "Chapter deleted" }
```

---

## 6) Interview Questions API (`/api/interview-questions`)

### GET `/api/interview-questions/meta`
- **Access**: Public
- **Response (200)**
```json
{
  "success": true,
  "meta": {
    "roles": ["Frontend Developer"],
    "topics": ["React"],
    "companies": ["Google"],
    "difficulties": ["Easy", "Medium", "Hard"]
  }
}
```

### GET `/api/interview-questions`
- **Access**: Public
- **Query Params (optional)**: `role`, `difficulty`, `subject`
- **Response (200)**
```json
{ "success": true, "count": 12, "questions": [ ... ] }
```

### GET `/api/interview-questions/all`
- **Access**: Public
- **Query Params (optional)**: `subject`, `difficulty`, `role`
- **Response (200)**
```json
{ "success": true, "count": 12, "questions": [ ... ] }
```

### GET `/api/interview-questions/:id`
- **Access**: Public
- **Params**: `id`
- **Response (200)**
```json
{ "success": true, "question": { ... } }
```

### GET `/api/interview-questions/topic/:slug`
### GET `/api/interview-questions/company/:slug`
### GET `/api/interview-questions/role/:slug`
### GET `/api/interview-questions/difficulty/:slug`
- **Access**: Public
- **Params**: `slug`
- **Response (200)**
```json
{ "success": true, "count": 8, "questions": [ ... ] }
```

### GET `/api/interview-questions/pdf/:role`
- **Access**: Protected
- **Params**: `role`
- **Response**: PDF stream (`application/pdf`)

### GET `/api/interview-questions/pdf/:type/:slug`
- **Access**: Protected
- **Params**: `type` in (`topic|company|role|difficulty`), `slug`
- **Response**: PDF stream (`application/pdf`)

### GET `/api/interview-questions/admin/all`
- **Access**: Admin
- **Query Params (optional)**: `role`, `difficulty`
- **Response (200)**
```json
{ "success": true, "count": 25, "questions": [ ... ] }
```

### POST `/api/interview-questions`
- **Access**: Admin
- **Body**
```json
{
  "question": "...",
  "description": "optional",
  "answer": "...",
  "content": "optional markdown",
  "difficulty": "Medium",
  "subject": "JavaScript",
  "roles": ["Frontend Developer"],
  "topics": ["React", "Hooks"],
  "companies": ["Google"],
  "codeBlocks": [
    { "id": "1", "language": "javascript", "code": "console.log('hi')" }
  ]
}
```
- **Response (201)**
```json
{ "success": true, "message": "Interview question created successfully", "question": { ... } }
```

### PUT `/api/interview-questions/:id`
- **Access**: Admin
- **Params**: `id`
- **Body**: Same as create
- **Response (200)**
```json
{ "success": true, "message": "Interview question updated successfully", "question": { ... } }
```

### DELETE `/api/interview-questions/:id`
- **Access**: Admin
- **Params**: `id`
- **Response (200)**
```json
{ "success": true, "message": "Interview question deleted successfully" }
```

### POST `/api/interview-questions/admin/trigger-daily`
- **Access**: Admin
- **Body**: none
- **Response (200)**
```json
{
  "success": true,
  "message": "Daily interview question notification sent successfully",
  "question": { ... },
  "usersNotified": 100
}
```

---

## 7) PDFs API (`/api/pdfs`)

### GET `/api/pdfs`
- **Access**: Public
- **Query Params (optional)**: `category`, `level`, `isPremium`
- **Response (200)**
```json
{ "success": true, "count": 6, "pdfs": [ ... ] }
```

### GET `/api/pdfs/:id`
- **Access**: Public
- **Params**: `id`
- **Response (200)**
```json
{ "success": true, "pdf": { ... } }
```

### GET `/api/pdfs/:id/url`
- **Access**: Protected
- **Params**: `id`
- **Response (200)**
```json
{ "success": true, "url": "https://...", "fileId": "..." }
```

### GET `/api/pdfs/:id/stream`
- **Access**: Protected
- **Params**: `id`
- **Response**: PDF stream (`application/pdf`)

### POST `/api/pdfs/:id/download`
- **Access**: Protected
- **Params**: `id`
- **Response (200)**
```json
{
  "success": true,
  "message": "Download tracked",
  "downloads": 42,
  "pdfUrl": "https://..."
}
```

### GET `/api/pdfs/admin/all`
- **Access**: Admin
- **Query Params (optional)**: `category`, `level`
- **Response (200)**
```json
{ "success": true, "count": 10, "pdfs": [ ... ] }
```

### POST `/api/pdfs/upload`
- **Access**: Admin
- **Content-Type**: `multipart/form-data`
- **File Field**: `pdf`
- **Body Fields**: `title` (required), `category` (required), `level`, `description`, `isPremium`, `totalPages`, `tags`
- **Response (201)**
```json
{ "success": true, "message": "PDF uploaded successfully", "pdf": { ... } }
```

### POST `/api/pdfs`
- **Access**: Admin
- **Body**
```json
{
  "title": "...",
  "category": "JavaScript",
  "level": "Beginner",
  "pdfUrl": "https://...",
  "description": "...",
  "isPremium": false,
  "totalPages": 12,
  "tags": ["arrays"]
}
```
- **Validation**
  - `category` allowed: `JavaScript|React|MERN|DSA|System Design`
- **Response (201)**
```json
{ "success": true, "message": "PDF created successfully", "pdf": { ... } }
```

### PUT `/api/pdfs/:id`
- **Access**: Admin
- **Params**: `id`
- **Body**: Same as create
- **Response (200)**
```json
{ "success": true, "message": "PDF updated successfully", "pdf": { ... } }
```

### DELETE `/api/pdfs/:id`
- **Access**: Admin
- **Params**: `id`
- **Response (200)**
```json
{ "success": true, "message": "PDF deleted successfully" }
```

---

## 8) Users API (`/api/users`)

### GET `/api/users/dashboard`
- **Access**: Protected
- **Response (200)**
```json
{
  "success": true,
  "data": {
    "user": { "name": "...", "email": "...", "role": "user", "avatar": "..." },
    "savedNotes": [ ... ],
    "savedPDFs": [ ... ],
    "savedRoadmaps": [ ... ]
  }
}
```

### POST `/api/users/save-note/:noteId`
### DELETE `/api/users/save-note/:noteId`
- **Access**: Protected
- **Params**: `noteId`
- **Response (200)**
```json
{ "success": true, "message": "Note saved/unsaved successfully", "savedNotes": [ ... ] }
```

### POST `/api/users/save-pdf/:pdfId`
### DELETE `/api/users/save-pdf/:pdfId`
- **Access**: Protected
- **Params**: `pdfId`
- **Response (200)**
```json
{ "success": true, "message": "PDF saved/unsaved successfully", "savedPDFs": [ ... ] }
```

### POST `/api/users/save-roadmap/:roadmapId`
### DELETE `/api/users/save-roadmap/:roadmapId`
- **Access**: Protected
- **Params**: `roadmapId`
- **Response (200)**
```json
{ "success": true, "message": "Roadmap saved/unsaved successfully", "savedRoadmaps": [ ... ] }
```

### POST `/api/users/check-saved`
- **Access**: Protected
- **Body**
```json
{ "noteIds": ["id1"], "pdfIds": ["id2"] }
```
- **Response (200)**
```json
{
  "success": true,
  "savedNotes": { "id1": true },
  "savedPDFs": { "id2": false }
}
```

### PUT `/api/users/profile`
- **Access**: Protected
- **Body**
```json
{ "name": "New Name", "avatar": "https://..." }
```
- **Response (200)**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "...",
    "email": "...",
    "role": "user",
    "avatar": "..."
  }
}
```

### POST `/api/users/profile/avatar`
- **Access**: Protected
- **Content-Type**: `multipart/form-data`
- **File Field**: `avatar`
- **Response (200)**
```json
{ "success": true, "data": { "avatar": "https://...", "fileId": "..." } }
```

### GET `/api/users/admin/all`
- **Access**: Admin
- **Query Params (optional)**: `role`, `status`
- **Response (200)**
```json
{ "success": true, "count": 100, "data": [ ... ] }
```

### GET `/api/users/admin/stats`
- **Access**: Admin
- **Response (200)**
```json
{
  "success": true,
  "data": {
    "totalUsers": 100,
    "totalNotes": 50,
    "totalQuestions": 80,
    "totalPDFs": 20,
    "growthRate": "+25%",
    "recentUsers": 12
  }
}
```

### PUT `/api/users/admin/:id`
- **Access**: Admin
- **Params**: `id`
- **Body**
```json
{ "name": "...", "email": "...", "role": "admin" }
```
- **Response (200)**
```json
{ "success": true, "data": { ... } }
```

### DELETE `/api/users/admin/:id`
- **Access**: Admin
- **Params**: `id`
- **Response (200)**
```json
{ "success": true, "message": "User deleted successfully" }
```

---

## 9) Contact API (`/api/contact`)

### POST `/api/contact/send`
- **Access**: Protected
- **Body**
```json
{ "subject": "optional", "message": "Your message" }
```
- **Response (200)**
```json
{ "success": true, "message": "Message sent successfully! We'll be in touch soon." }
```

### POST `/api/contact/feedback`
- **Access**: Protected
- **Body**
```json
{
  "feedbackType": "Bug",
  "subject": "UI issue",
  "details": "There is a layout issue on mobile"
}
```
- **Response (200)**
```json
{ "success": true, "message": "Thank you for your feedback!" }
```

---

## 10) Subscription API (`/api/subscription`)

### POST `/api/subscription/create-order`
- **Access**: Protected
- **Body**
```json
{ "planType": "monthly" }
```
- **Plan Values**
  - `monthly` => 299 INR
  - `yearly` => 1899 INR
- **Response (200)**
```json
{ "success": true, "order": { "id": "order_xxx", "amount": 29900, "currency": "INR" } }
```

### POST `/api/subscription/verify-payment`
- **Access**: Protected
- **Body**
```json
{
  "razorpay_order_id": "...",
  "razorpay_payment_id": "...",
  "razorpay_signature": "..."
}
```
- **Response (200)**
```json
{ "success": true, "message": "Payment verified successfully" }
```
- **Failure (400)**
```json
{ "success": false, "message": "Invalid signature, payment verification failed" }
```

### GET `/api/subscription/status`
- **Access**: Protected
- **Response (200)**
```json
{
  "success": true,
  "isPaid": true,
  "subscriptionExpiresAt": "2026-03-26T00:00:00.000Z"
}
```

---

## 11) Roadmaps API (`/api/roadmaps`)

### GET `/api/roadmaps`
- **Access**: Public
- **Query Params (optional)**: `status` (`published|draft|all`)
- **Response (200)**: array of roadmap objects

### GET `/api/roadmaps/:id`
- **Access**: Public
- **Params**: `id`
- **Response (200)**: roadmap object

### POST `/api/roadmaps`
- **Access**: Admin
- **Body**
```json
{
  "title": "Frontend Roadmap",
  "description": "...",
  "slug": "frontend-roadmap",
  "icon": "...",
  "color": "...",
  "status": "draft"
}
```
- **Response (201)**: created roadmap object

### PUT `/api/roadmaps/:id`
- **Access**: Admin
- **Params**: `id`
- **Body**: partial roadmap fields (`title`, `description`, `slug`, `icon`, `color`, `status`)
- **Response (200)**: updated roadmap object

### DELETE `/api/roadmaps/:id`
- **Access**: Admin
- **Params**: `id`
- **Response (200)**
```json
{ "message": "Roadmap and nodes removed" }
```

### POST `/api/roadmaps/publish-drafts`
- **Access**: Admin
- **Body**: none
- **Response (200)**
```json
{
  "message": "Draft roadmaps and nodes published",
  "roadmapsPublished": 2,
  "nodesPublished": 15
}
```

### GET `/api/roadmaps/:id/nodes`
- **Access**: Public
- **Params**: `id` (roadmapId)
- **Query Params (optional)**: `status`
- **Response (200)**: array of node objects

### POST `/api/roadmaps/:id/nodes/reorder`
- **Access**: Admin
- **Params**: `id` (roadmapId)
- **Body**
```json
{
  "nodes": [
    { "id": "node1", "parentId": null, "order": 0 },
    { "id": "node2", "parentId": "node1", "order": 1 }
  ]
}
```
- **Response (200)**
```json
{ "message": "Reordered successfully" }
```

### POST `/api/roadmaps/nodes`
- **Access**: Admin
- **Body**
```json
{
  "roadmapId": "...",
  "parentId": null,
  "title": "Learn HTML",
  "description": "...",
  "order": 0,
  "status": "draft",
  "resourceLink": "https://..."
}
```
- **Response (201)**: created node object

### PUT `/api/roadmaps/nodes/:id`
- **Access**: Admin
- **Params**: `id` (node id)
- **Body**: partial node fields (`title`, `description`, `parentId`, `order`, `status`, `resourceLink`)
- **Response (200)**: updated node object

### DELETE `/api/roadmaps/nodes/:id`
- **Access**: Admin
- **Params**: `id`
- **Response (200)**
```json
{ "message": "Node and children removed" }
```

### GET `/api/roadmaps/:id/download-pdf`
- **Access**: Protected
- **Params**: `id`
- **Response**: PDF stream (`application/pdf`)

---

## 12) AI API (`/api/ai`)

### POST `/api/ai/ask`
- **Access**: Paid (`protect + paidOnly`)
- **Body**
```json
{
  "noteTitle": "What is closure?",
  "noteContent": "...note markdown...",
  "question": "Can you explain closure in simple terms?"
}
```
- **Validation**
  - `question` required
  - `noteContent` required
- **Response (200)**
```json
{ "success": true, "answer": "...AI generated answer..." }
```
- **Error (500)**
```json
{
  "success": false,
  "message": "AI failed to generate a response",
  "error": "..."
}
```

---

## 13) Notes for Frontend Integration

1. For protected endpoints, always send bearer token in `Authorization` header.
2. For upload endpoints (`/api/pdfs/upload`, `/api/users/profile/avatar`), use `multipart/form-data`.
3. PDF endpoints may return binary stream; handle as blob/file in frontend.
4. Some modules return object wrappers (`{ success, data }`), while roadmaps mostly return raw objects/arrays.
5. Admin and paid access failures return `403` with message from middleware.

---

## 14) Suggested cURL Quick Tests

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"123456"}'
```

### Get Notes
```bash
curl http://localhost:5000/api/notes
```

### Get Profile (Protected)
```bash
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer <token>"
```

### AI Ask (Paid)
```bash
curl -X POST http://localhost:5000/api/ai/ask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"noteTitle":"JS","noteContent":"...","question":"Explain hoisting"}'
```
