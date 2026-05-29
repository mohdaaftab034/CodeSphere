# CodeSphere - Backend API

Node.js + Express + MongoDB backend for the CodeSphere platform.

## 🎉 New: Google OAuth Authentication

The platform now supports Google OAuth 2.0 for passwordless sign-in! See the **[Google OAuth Setup](#google-oauth-setup)** section below.

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file with the following:

```
MONGO_URI=mongodb://localhost:27017/codenotes
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
GROQ_API_KEY=your_groq_api_key

The AI Doubt Solver uses Groq and allows 10 free messages per user before requiring an active subscription. The backend also applies request rate limiting on the AI endpoint.
```

### 3. Start MongoDB

Make sure MongoDB is running locally or update `MONGO_URI` to your MongoDB connection string.

### 4. Run the Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server will run on `http://localhost:5000`

## API Documentation

### Authentication

#### Login / Register
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "user" // or "admin"
  }
}
```

**Special Admin Login:**
- Email: `admin@codesphere.com`
- Password: `admin123`
- Role: `admin` (automatic)

#### Get Profile
```
GET /api/auth/profile
Authorization: Bearer {token}

Response:
{
  "success": true,
  "user": { ... }
}
```

---

### Notes APIs

#### Create Note (Admin Only)
```
POST /api/notes
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "title": "Understanding React Hooks",
  "slug": "understanding-react-hooks",
  "category": "React",
  "chapter": "Advanced Concepts",
  "difficulty": "Intermediate",
  "excerpt": "Learn how React hooks work internally",
  "author": "Admin",
  "readingTime": "8 min",
  "blocks": [
    {
      "id": "b-1",
      "type": "text",
      "content": "React hooks allow you to use state in functional components..."
    },
    {
      "id": "b-2",
      "type": "code",
      "language": "javascript",
      "content": "const [count, setCount] = useState(0);"
    },
    {
      "id": "b-3",
      "type": "tip",
      "content": "Always put hooks at the top level of your function"
    }
  ],
  "isPremium": false,
  "status": "Published"
}

Response:
{
  "success": true,
  "message": "Note created successfully",
  "note": { ... }
}
```

#### Get All Published Notes (User)
```
GET /api/notes
GET /api/notes?category=React
GET /api/notes?chapter=Advanced
GET /api/notes?difficulty=Intermediate
GET /api/notes?isPremium=true

Response:
{
  "success": true,
  "count": 5,
  "notes": [ ... ]
}
```

#### Get Note by ID
```
GET /api/notes/:id

Response:
{
  "success": true,
  "note": { ... }
}
```

#### Get Note by Slug
```
GET /api/notes/slug/understanding-react-hooks

Response:
{
  "success": true,
  "note": { ... }
}
```

#### Update Note (Admin Only)
```
PUT /api/notes/:id
Authorization: Bearer {admin_token}
Content-Type: application/json

Body: Same as create note
Response: Updated note
```

#### Delete Note (Admin Only)
```
DELETE /api/notes/:id
Authorization: Bearer {admin_token}

Response:
{
  "success": true,
  "message": "Note deleted successfully"
}
```

#### Get All Notes Including Drafts (Admin Only)
```
GET /api/notes/admin/all
Authorization: Bearer {admin_token}
GET /api/notes/admin/all?category=React
GET /api/notes/admin/all?status=Draft

Response:
{
  "success": true,
  "count": 10,
  "notes": [ ... ]
}
```

---

### Interview Questions APIs

#### Create Interview Question (Admin Only)
```
POST /api/interview-questions
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "question": "Explain the Virtual DOM in React",
  "description": "Explain how React uses Virtual DOM for performance optimization",
  "answer": "The Virtual DOM is a lightweight copy of the actual DOM...",
  "difficulty": "Intermediate",
  "roles": ["Frontend Developer", "Full Stack Developer"],
  "topics": ["React", "Performance"],
  "codeBlocks": [
    {
      "id": "cb-1",
      "language": "javascript",
      "code": "const vdom = React.createElement('div', null, 'Hello');"
    }
  ]
}

Response:
{
  "success": true,
  "message": "Interview question created successfully",
  "question": { ... }
}
```

#### Get Questions by Role (User)
```
GET /api/interview-questions?role=Frontend Developer
GET /api/interview-questions?role=Backend Developer&difficulty=Advanced

Response:
{
  "success": true,
  "count": 12,
  "questions": [ ... ]
}
```

#### Get All Questions (User)
```
GET /api/interview-questions/all

Response:
{
  "success": true,
  "count": 50,
  "questions": [ ... ]
}
```

#### Get Question by ID
```
GET /api/interview-questions/:id

Response:
{
  "success": true,
  "question": { ... }
}
```

#### Update Question (Admin Only)
```
PUT /api/interview-questions/:id
Authorization: Bearer {admin_token}
Content-Type: application/json

Body: Same as create
Response: Updated question
```

#### Delete Question (Admin Only)
```
DELETE /api/interview-questions/:id
Authorization: Bearer {admin_token}

Response:
{
  "success": true,
  "message": "Interview question deleted successfully"
}
```

#### Get All Questions (Admin Only)
```
GET /api/interview-questions/admin/all
Authorization: Bearer {admin_token}
GET /api/interview-questions/admin/all?role=Backend Developer

Response:
{
  "success": true,
  "count": 50,
  "questions": [ ... ]
}
```

---

### Handwritten PDFs APIs

#### Create PDF (Admin Only)
```
POST /api/pdfs
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "title": "JavaScript Fundamentals Notes",
  "category": "JavaScript",
  "level": "Beginner",
  "pdfUrl": "https://storage.example.com/pdf-1.pdf",
  "description": "Handwritten notes on JavaScript basics",
  "isPremium": false
}

Response:
{
  "success": true,
  "message": "PDF created successfully",
  "pdf": { ... }
}
```

#### Get All PDFs (User)
```
GET /api/pdfs
GET /api/pdfs?category=JavaScript
GET /api/pdfs?level=Beginner
GET /api/pdfs?isPremium=true

Response:
{
  "success": true,
  "count": 8,
  "pdfs": [ ... ]
}
```

#### Get PDF by ID
```
GET /api/pdfs/:id

Response:
{
  "success": true,
  "pdf": { ... }
}
```

#### Update PDF (Admin Only)
```
PUT /api/pdfs/:id
Authorization: Bearer {admin_token}
Content-Type: application/json

Body: Same as create
Response: Updated PDF
```

#### Delete PDF (Admin Only)
```
DELETE /api/pdfs/:id
Authorization: Bearer {admin_token}

Response:
{
  "success": true,
  "message": "PDF deleted successfully"
}
```

#### Get All PDFs (Admin Only)
```
GET /api/pdfs/admin/all
Authorization: Bearer {admin_token}
GET /api/pdfs/admin/all?category=React

Response:
{
  "success": true,
  "count": 15,
  "pdfs": [ ... ]
}
```

---

## Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (admin | user),
  createdAt: Date,
  updatedAt: Date
}
```

### Note
```javascript
{
  title: String,
  slug: String (unique),
  category: String,
  chapter: String,
  difficulty: String (Beginner | Intermediate | Advanced),
  excerpt: String,
  author: String,
  readingTime: String,
  blocks: [
    {
      id: String,
      type: String (text | code | tip | warning),
      content: String,
      language: String (only for code blocks)
    }
  ],
  isPremium: Boolean,
  status: String (Draft | Published),
  views: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### InterviewQuestion
```javascript
{
  question: String,
  description: String,
  answer: String,
  difficulty: String (Beginner | Intermediate | Advanced),
  roles: [String], // Multiple roles like "Frontend Developer", "Backend Developer"
  topics: [String],
  codeBlocks: [
    {
      id: String,
      language: String,
      code: String
    }
  ],
  views: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### HandwrittenPDF
```javascript
{
  title: String,
  category: String,
  level: String (Beginner | Intermediate | Advanced),
  pdfUrl: String,
  description: String,
  isPremium: Boolean,
  downloads: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Architecture

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Auth logic
│   │   ├── noteController.js     # Note CRUD
│   │   ├── interviewController.js # Interview Q&A
│   │   └── pdfController.js      # PDF management
│   ├── middleware/
│   │   ├── auth.js               # JWT protection
│   │   └── validation.js         # Input validation (Joi)
│   ├── models/
│   │   ├── User.js
│   │   ├── Note.js
│   │   ├── InterviewQuestion.js
│   │   └── HandwrittenPDF.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── noteRoutes.js
│   │   ├── interviewRoutes.js
│   │   └── pdfRoutes.js
│   ├── utils/
│   │   └── helpers.js            # Utility functions
│   └── server.js                 # Express app entry point
├── .env                          # Environment variables
├── package.json
└── README.md
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Status codes:
- `200` - Success
- `201` - Created
- `400` - Bad request (validation error)
- `401` - Unauthorized
- `403` - Forbidden (admin access required)
- `404` - Not found
- `500` - Server error

---

## Security Features

✅ JWT-based authentication
✅ Password hashing with bcryptjs
✅ Admin-only protected routes
✅ Input validation with Joi
✅ CORS enabled
✅ Role-based access control

---

## Frontend Integration

### Example: Fetch Notes with React

```javascript
// Get published notes
fetch('http://localhost:5000/api/notes?category=React')
  .then(res => res.json())
  .then(data => console.log(data.notes))

// Get note by slug
fetch('http://localhost:5000/api/notes/slug/understanding-react-hooks')
  .then(res => res.json())
  .then(data => console.log(data.note))

// Create note (admin)
const token = localStorage.getItem('token')
fetch('http://localhost:5000/api/notes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: "New Note",
    category: "React",
    chapter: "Hooks",
    difficulty: "Intermediate",
    blocks: [...]
  })
})
```

---

## Google OAuth Setup

### Overview

The backend now supports Google OAuth 2.0 authentication, allowing users to sign in with their Google account.

### Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Configure OAuth consent screen
6. Create Web application credentials
7. Add authorized origins:
   ```
   http://localhost:5173
   http://localhost:5000
   ```
8. Add redirect URI:
   ```
   http://localhost:5000/api/auth/google/callback
   ```
9. Copy Client ID and Client Secret

### Environment Variables

Add these to your `.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

### OAuth Endpoints

#### Initiate Google OAuth
```
GET /api/auth/google
```
Redirects user to Google's OAuth consent screen.

#### OAuth Callback
```
GET /api/auth/google/callback
```
Handles Google's OAuth response, creates/updates user, and redirects to frontend with JWT token.

### How It Works

1. Frontend redirects user to `/api/auth/google`
2. User authorizes with Google
3. Google redirects to `/api/auth/google/callback`
4. Backend validates OAuth response
5. Backend creates or updates user in database
6. Backend generates JWT token
7. Backend redirects to frontend with token and user data
8. Frontend stores credentials and logs user in

### User Model Changes

Users authenticated via Google have these additional fields:
- `googleId` - Unique Google account identifier
- `avatar` - Profile picture URL from Google
- `authProvider` - 'local' or 'google'

Password is optional for OAuth users.

### Account Linking

If a user signs in with Google using an email that already exists in the database, the accounts are automatically linked.

### Files Added/Modified

- ✅ `src/config/passport.js` - Passport.js Google OAuth configuration
- ✅ `src/models/User.js` - Updated with OAuth fields
- ✅ `src/controllers/authController.js` - Added OAuth callback handler
- ✅ `src/routes/authRoutes.js` - Added OAuth routes
- ✅ `src/server.js` - Initialized Passport middleware

### Dependencies Installed

- `passport` - Authentication middleware
- `passport-google-oauth20` - Google OAuth 2.0 strategy  
- `express-session` - Session support

---

## Next Steps

1. Install MongoDB locally or use MongoDB Atlas
2. Install dependencies: `npm install`
3. Update `.env` with your MongoDB URI and Google OAuth credentials
4. Run: `npm run dev`
5. Test endpoints with Postman or cURL
6. Connect React frontend to these APIs

---

Made with ❤️ for CodeSphere
