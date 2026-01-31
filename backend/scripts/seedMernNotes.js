import mongoose from "mongoose"
import dotenv from "dotenv"
import Note from "../src/models/Note.js"

dotenv.config()

const mernNotes = [
  {
    title: "MongoDB Basics",
    slug: "mongodb-basics",
    category: "MERN",
    chapter: "MongoDB",
    difficulty: "Beginner",
    excerpt: "Learn the fundamentals of MongoDB, a NoSQL database",
    content: `# MongoDB Basics

MongoDB is a popular NoSQL database that stores data in flexible, JSON-like documents.

## Key Features

- **Flexible Schema**: Unlike traditional SQL databases, MongoDB allows flexible document structures
- **Scalability**: Built-in sharding for horizontal scaling
- **High Performance**: Optimized for fast read and write operations
- **Rich Query Language**: Supports complex queries and aggregations

## Document Structure

\`\`\`json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30
}
\`\`\`

## Collections

Collections are like tables in SQL databases. They contain documents.

\`\`\`javascript
// Connect and create a collection
const db = client.db("myDatabase");
const collection = db.collection("users");
\`\`\`

## Basic Operations

### Create (Insert)
\`\`\`javascript
const result = await collection.insertOne({
  name: "Jane Doe",
  email: "jane@example.com"
});
\`\`\`

### Read (Find)
\`\`\`javascript
const user = await collection.findOne({ email: "jane@example.com" });
const allUsers = await collection.find({}).toArray();
\`\`\`

### Update
\`\`\`javascript
const result = await collection.updateOne(
  { _id: ObjectId("507f1f77bcf86cd799439011") },
  { $set: { age: 31 } }
);
\`\`\`

### Delete
\`\`\`javascript
const result = await collection.deleteOne({ _id: ObjectId("507f1f77bcf86cd799439011") });
\`\`\``,
    author: "Admin",
    readingTime: "8 min",
    isPremium: false,
    status: "Published",
  },
  {
    title: "Express.js Server Setup",
    slug: "express-server-setup",
    category: "MERN",
    chapter: "Express.js",
    difficulty: "Beginner",
    excerpt: "Set up a basic Express.js server for your backend",
    content: `# Express.js Server Setup

Express.js is a minimal and flexible Node.js web application framework.

## Installation

\`\`\`bash
npm init -y
npm install express
\`\`\`

## Basic Server

\`\`\`javascript
const express = require('express');
const app = express();

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  res.status(201).json({ id: 1, name, email });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
\`\`\`

## Middleware

Middleware functions have access to the request and response objects.

\`\`\`javascript
// Custom middleware
app.use((req, res, next) => {
  console.log(\`\${req.method} \${req.path}\`);
  next();
});
\`\`\`

## Routing

\`\`\`javascript
app.get('/api/products', (req, res) => {
  // Handle GET
});

app.post('/api/products', (req, res) => {
  // Handle POST
});

app.put('/api/products/:id', (req, res) => {
  // Handle PUT
});

app.delete('/api/products/:id', (req, res) => {
  // Handle DELETE
});
\`\`\`

## Error Handling

\`\`\`javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
\`\`\``,
    author: "Admin",
    readingTime: "10 min",
    isPremium: false,
    status: "Published",
  },
  {
    title: "React Components & Hooks",
    slug: "react-components-hooks",
    category: "MERN",
    chapter: "React.js",
    difficulty: "Intermediate",
    excerpt: "Master React components and hooks for building UIs",
    content: `# React Components & Hooks

React is a JavaScript library for building user interfaces with components.

## Functional Components

\`\`\`javascript
function Welcome({ name }) {
  return <h1>Hello, {name}!</h1>;
}
\`\`\`

## useState Hook

\`\`\`javascript
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
\`\`\`

## useEffect Hook

\`\`\`javascript
import { useEffect, useState } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(\`/api/users/\${userId}\`)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <p>Loading...</p>;
  return <div>{user?.name}</div>;
}
\`\`\`

## Custom Hooks

\`\`\`javascript
function useFetch(url) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [url]);

  return { data, error, loading };
}
\`\`\`

## Context API

\`\`\`javascript
const ThemeContext = React.createContext();

function App() {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Content />
    </ThemeContext.Provider>
  );
}

function Content() {
  const { theme } = useContext(ThemeContext);
  return <div className={theme}>Content</div>;
}
\`\`\``,
    author: "Admin",
    readingTime: "12 min",
    isPremium: false,
    status: "Published",
  },
  {
    title: "Node.js Fundamentals",
    slug: "nodejs-fundamentals",
    category: "MERN",
    chapter: "Node.js",
    difficulty: "Beginner",
    excerpt: "Learn the fundamentals of Node.js runtime",
    content: `# Node.js Fundamentals

Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine.

## Installation

Download from https://nodejs.org/ and install the LTS version.

\`\`\`bash
node --version
npm --version
\`\`\`

## Creating a Node.js Project

\`\`\`bash
mkdir my-project
cd my-project
npm init -y
\`\`\`

## Module System

### CommonJS

\`\`\`javascript
// math.js
module.exports = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b
};

// main.js
const math = require('./math');
console.log(math.add(5, 3)); // 8
\`\`\`

### ES Modules

\`\`\`javascript
// math.js
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;

// main.js
import { add, subtract } from './math.js';
console.log(add(5, 3)); // 8
\`\`\`

## Built-in Modules

\`\`\`javascript
// File System
const fs = require('fs');
const data = fs.readFileSync('file.txt', 'utf8');

// Path
const path = require('path');
const filePath = path.join(__dirname, 'file.txt');

// Events
const EventEmitter = require('events');
const emitter = new EventEmitter();
emitter.on('greet', () => console.log('Hello!'));
emitter.emit('greet');
\`\`\`

## npm Packages

\`\`\`bash
# Install a package
npm install lodash

# Install as dev dependency
npm install --save-dev nodemon

# Use in code
const _ = require('lodash');
const arr = [1, 2, 3, 4, 5];
console.log(_.chunk(arr, 2));
\`\`\``,
    author: "Admin",
    readingTime: "10 min",
    isPremium: false,
    status: "Published",
  },
  {
    title: "REST API Design",
    slug: "rest-api-design",
    category: "MERN",
    chapter: "REST APIs",
    difficulty: "Intermediate",
    excerpt: "Design and implement RESTful APIs",
    content: `# REST API Design

REST (Representational State Transfer) is an architectural style for designing networked applications.

## HTTP Methods

- **GET**: Retrieve data
- **POST**: Create new data
- **PUT**: Replace existing data
- **PATCH**: Partially update data
- **DELETE**: Remove data

## Resource-Based URLs

\`\`\`
GET    /api/users          # Get all users
GET    /api/users/:id      # Get specific user
POST   /api/users          # Create user
PUT    /api/users/:id      # Update user
DELETE /api/users/:id      # Delete user
\`\`\`

## Status Codes

- **200**: OK - Request succeeded
- **201**: Created - Resource created successfully
- **400**: Bad Request - Invalid input
- **401**: Unauthorized - Authentication required
- **404**: Not Found - Resource not found
- **500**: Server Error

## Example API with Express

\`\`\`javascript
const express = require('express');
const app = express();

app.use(express.json());

let users = [
  { id: 1, name: 'John', email: 'john@example.com' }
];

// Get all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Get user by ID
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// Create user
app.post('/api/users', (req, res) => {
  const newUser = {
    id: users.length + 1,
    ...req.body
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

// Update user
app.put('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  Object.assign(user, req.body);
  res.json(user);
});

// Delete user
app.delete('/api/users/:id', (req, res) => {
  users = users.filter(u => u.id !== parseInt(req.params.id));
  res.json({ message: 'User deleted' });
});

app.listen(5000, () => console.log('Server running on port 5000'));
\`\`\`

## Best Practices

1. Use nouns for resources: \`/api/users\`, not \`/api/getUsers\`
2. Use HTTP methods for actions
3. Return appropriate status codes
4. Use consistent naming conventions
5. Version your API: \`/api/v1/users\`
6. Implement pagination for large datasets
7. Add proper error handling`,
    author: "Admin",
    readingTime: "11 min",
    isPremium: false,
    status: "Published",
  },
  {
    title: "Authentication with JWT",
    slug: "authentication-jwt",
    category: "MERN",
    chapter: "Authentication & Security",
    difficulty: "Intermediate",
    excerpt: "Implement secure authentication using JWT tokens",
    content: `# Authentication with JWT

JWT (JSON Web Token) is a secure way to transmit information between parties.

## JWT Structure

JWT consists of three parts separated by dots:

\`\`\`
header.payload.signature
\`\`\`

### Header

\`\`\`json
{
  "alg": "HS256",
  "typ": "JWT"
}
\`\`\`

### Payload

\`\`\`json
{
  "userId": "12345",
  "email": "user@example.com",
  "iat": 1516239022
}
\`\`\`

## Implementation with Node.js

\`\`\`bash
npm install jsonwebtoken bcryptjs
\`\`\`

### Generate Token

\`\`\`javascript
const jwt = require('jsonwebtoken');

function generateToken(userId) {
  return jwt.sign(
    { userId, email: 'user@example.com' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
}

const token = generateToken('12345');
console.log(token);
\`\`\`

### Verify Token

\`\`\`javascript
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}
\`\`\`

### Authentication Middleware

\`\`\`javascript
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.user = decoded;
  next();
}

app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: 'This is protected', user: req.user });
});
\`\`\`

### Password Hashing

\`\`\`javascript
const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function comparePasswords(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

// Usage
const hashedPassword = await hashPassword('mySecurePassword');
const isMatch = await comparePasswords('mySecurePassword', hashedPassword);
\`\`\`

## Security Best Practices

1. Store JWT_SECRET in environment variables
2. Use HTTPS in production
3. Set appropriate token expiration times
4. Hash passwords before storing
5. Implement refresh tokens for extended sessions
6. Use secure headers (CORS, CSP)
7. Validate and sanitize input`,
    author: "Admin",
    readingTime: "13 min",
    isPremium: false,
    status: "Published",
  },
]

async function seedMernNotes() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("Connected to MongoDB")

    let addedCount = 0
    for (const note of mernNotes) {
      const existing = await Note.findOne({ slug: note.slug })
      if (!existing) {
        await Note.create(note)
        addedCount++
        console.log(`✅ Added: ${note.title}`)
      } else {
        console.log(`⏭️  Skipped: ${note.title} (already exists)`)
      }
    }

    console.log(`\n📚 Seeding complete! Added ${addedCount} new notes.`)
    process.exit(0)
  } catch (error) {
    console.error("Error seeding notes:", error)
    process.exit(1)
  }
}

seedMernNotes()
