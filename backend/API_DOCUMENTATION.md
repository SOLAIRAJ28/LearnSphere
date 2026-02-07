# E-Learning API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Auth Endpoints

### 1. Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "admin" // optional, defaults to "user"
}
```

**Response:** (201 Created)
```json
{
  "success": true,
  "data": {
    "_id": "65abc123...",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "admin",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2. Login User
**POST** `/auth/login`

Authenticate a user and get a JWT token.

**Request Body:**
```json
{
  "email": "admin@elearning.com",
  "password": "admin123"
}
```

**Response:** (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "65abc123...",
    "username": "admin",
    "email": "admin@elearning.com",
    "role": "admin",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. Get Current User
**GET** `/auth/me`

Get the currently authenticated user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "65abc123...",
    "username": "admin",
    "email": "admin@elearning.com",
    "role": "admin"
  }
}
```

---

## Course Endpoints

### 1. Get All Courses
**GET** `/courses`

Retrieve all courses. Supports search by title.

**Query Parameters:**
- `search` (optional) - Search courses by title

**Example:**
```
GET /courses
GET /courses?search=odoo
```

**Response:** (200 OK)
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "65abc123...",
      "title": "Introduction to Odoo AI",
      "tags": ["tag1", "tag2", "tag3"],
      "viewsCount": 5,
      "lessonsCount": 15,
      "totalDuration": 1530,
      "isPublished": true,
      "shareLink": "http://localhost:5173/course/65abc123...",
      "createdAt": "2026-02-07T10:00:00.000Z",
      "updatedAt": "2026-02-07T10:00:00.000Z"
    },
    ...
  ]
}
```

---

### 2. Get Single Course
**GET** `/courses/:id`

Retrieve a specific course by ID.

**Example:**
```
GET /courses/65abc123...
```

**Response:** (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "65abc123...",
    "title": "Introduction to Odoo AI",
    "tags": ["tag1", "tag2", "tag3"],
    "viewsCount": 5,
    "lessonsCount": 15,
    "totalDuration": 1530,
    "isPublished": true,
    "shareLink": "http://localhost:5173/course/65abc123...",
    "createdAt": "2026-02-07T10:00:00.000Z",
    "updatedAt": "2026-02-07T10:00:00.000Z"
  }
}
```

---

### 3. Create Course
**POST** `/courses`

Create a new course. **Requires Admin Role**

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Advanced JavaScript Course",
  "tags": ["javascript", "advanced"],
  "lessonsCount": 25,
  "totalDuration": 3000,
  "isPublished": false
}
```

**Response:** (201 Created)
```json
{
  "success": true,
  "message": "Course created successfully",
  "data": {
    "_id": "65abc456...",
    "title": "Advanced JavaScript Course",
    "tags": ["javascript", "advanced"],
    "viewsCount": 0,
    "lessonsCount": 25,
    "totalDuration": 3000,
    "isPublished": false,
    "shareLink": null,
    "createdAt": "2026-02-07T11:00:00.000Z",
    "updatedAt": "2026-02-07T11:00:00.000Z"
  }
}
```

---

### 4. Update Course
**PUT** `/courses/:id`

Update an existing course. **Requires Admin Role**

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Course Title",
  "tags": ["new", "tags"],
  "lessonsCount": 30,
  "totalDuration": 3600,
  "isPublished": true
}
```

**Response:** (200 OK)
```json
{
  "success": true,
  "message": "Course updated successfully",
  "data": {
    "_id": "65abc123...",
    "title": "Updated Course Title",
    ...
  }
}
```

---

### 5. Delete Course
**DELETE** `/courses/:id`

Delete a course. **Requires Admin Role**

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** (200 OK)
```json
{
  "success": true,
  "message": "Course deleted successfully"
}
```

---

### 6. Update Course Tags
**PUT** `/courses/:id/tags`

Add or remove a tag from a course. **Requires Admin Role**

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "tag": "javascript",
  "action": "add" // or "remove"
}
```

**Response:** (200 OK)
```json
{
  "success": true,
  "message": "Tags updated successfully",
  "data": {
    "_id": "65abc123...",
    "title": "Course Title",
    "tags": ["javascript", "tag1", "tag2"],
    ...
  }
}
```

---

### 7. Toggle Publish Status
**PUT** `/courses/:id/publish`

Publish or unpublish a course. **Requires Admin Role**

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** (200 OK)
```json
{
  "success": true,
  "message": "Course published successfully", // or "unpublished"
  "data": {
    "_id": "65abc123...",
    "title": "Course Title",
    "isPublished": true,
    ...
  }
}
```

---

### 8. Generate Share Link
**POST** `/courses/:id/share`

Generate a shareable link for a course. **Requires Admin Role**

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** (200 OK)
```json
{
  "success": true,
  "message": "Share link generated successfully",
  "data": {
    "shareLink": "http://localhost:5173/course/65abc123..."
  }
}
```

---

## Error Responses

All error responses follow this format:

**400 Bad Request** (Validation Error)
```json
{
  "success": false,
  "errors": [
    {
      "msg": "Course title is required",
      "param": "title",
      "location": "body"
    }
  ]
}
```

**401 Unauthorized** (Authentication Error)
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

**403 Forbidden** (Authorization Error)
```json
{
  "success": false,
  "message": "Not authorized as admin"
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Course not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "message": "Error fetching courses",
  "error": "Detailed error message"
}
```

---

## Data Models

### Course Model
```typescript
{
  _id: ObjectId,
  title: string (required, max 200 chars),
  tags: string[] (default: []),
  viewsCount: number (default: 0, min: 0),
  lessonsCount: number (default: 0, min: 0),
  totalDuration: number (in minutes, default: 0, min: 0),
  isPublished: boolean (default: false),
  shareLink: string | null,
  createdAt: Date,
  updatedAt: Date
}
```

### User Model
```typescript
{
  _id: ObjectId,
  username: string (required, unique, min 3 chars),
  email: string (required, unique),
  password: string (hashed, min 6 chars),
  role: 'admin' | 'user' (default: 'user'),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Testing with cURL

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@elearning.com",
    "password": "admin123"
  }'
```

### Get All Courses
```bash
curl http://localhost:5000/api/courses
```

### Create Course (with auth)
```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "New Course Title"
  }'
```

### Search Courses
```bash
curl "http://localhost:5000/api/courses?search=odoo"
```

---

## Rate Limiting

Currently, there are no rate limits implemented. Consider adding rate limiting middleware for production use.

## CORS

CORS is enabled for the frontend URL specified in the `.env` file (default: `http://localhost:5173`).

---

**Last Updated:** February 7, 2026
