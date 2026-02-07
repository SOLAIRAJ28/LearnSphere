# Quick Start Guide - E-Learning Dashboard

Get the full-stack E-Learning Courses Dashboard up and running in minutes!

## Prerequisites

Before you begin, ensure you have:
- ✅ Node.js (v18 or higher) installed
- ✅ MongoDB installed locally OR MongoDB Atlas account
- ✅ Git (optional, for cloning)

---

## Step 1: Install MongoDB (if not installed)

### Option A: Local MongoDB
Download and install from: https://www.mongodb.com/try/download/community

Start MongoDB:
```bash
mongod
```

### Option B: MongoDB Atlas (Cloud)
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string
4. Update `backend/.env` with your connection string

---

## Step 2: Backend Setup

Open a terminal and navigate to the backend directory:

```bash
cd backend
```

Install dependencies:
```bash
npm install
```

The backend already has these packages configured:
- express
- mongoose
- cors
- dotenv
- jsonwebtoken
- bcryptjs
- express-validator
- nodemon (dev dependency)

Seed the database with sample data:
```bash
npm run seed
```

You should see:
```
MongoDB Connected
Cleared existing data
Admin user created
Login credentials:
Email: admin@elearning.com
Password: admin123
Sample courses created

Database seeded successfully!
```

Start the backend server:
```bash
npm run dev
```

✅ Backend is now running on **http://localhost:5000**

---

## Step 3: Frontend Setup

Open a **NEW terminal** and navigate to the root directory:

```bash
cd ..  # Go back to root if you're in backend folder
```

Install dependencies:
```bash
npm install
```

Start the frontend development server:
```bash
npm run dev
```

✅ Frontend is now running on **http://localhost:5173**

---

## Step 4: Access the Application

Open your browser and visit:
```
http://localhost:5173
```

You should see the E-Learning Dashboard with:
- 3 sample courses
- Search functionality
- Kanban and List view toggle
- Floating "+" button to create courses

---

## Step 5: Test the Features

### View Courses
The dashboard displays all courses from MongoDB in real-time.

### Search Courses
Type in the search bar to filter courses by title. The search queries MongoDB backend.

### Create a Course
1. Click the purple **"+"** button at the bottom right
2. Enter a course name (e.g., "Advanced Python")
3. Click "Create"
4. The new course appears instantly!

### Remove Tags
Click the **"×"** button on any tag to remove it from the course.

### Share Course
Click **"Share"** button to generate and copy a shareable link.

---

## Default Admin Credentials

**Email:** admin@elearning.com  
**Password:** admin123

(Note: Authentication UI is not yet implemented in the frontend, but the backend APIs support it)

---

## Verify Backend API

Test the health endpoint:
```bash
curl http://localhost:5000/api/health
```

Get all courses:
```bash
curl http://localhost:5000/api/courses
```

---

## Project URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api |
| Health Check | http://localhost:5000/api/health |
| Courses API | http://localhost:5000/api/courses |

---

## Troubleshooting

### MongoDB Connection Error
**Error:** `MongoServerError: connect ECONNREFUSED`

**Solution:**
1. Make sure MongoDB is running: `mongod`
2. Check the connection string in `backend/.env`
3. Default: `mongodb://localhost:27017/elearning`

### Port Already in Use
**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
1. Stop the process using port 5000
2. Or change the PORT in `backend/.env`

### CORS Error
**Error:** `Access to fetch has been blocked by CORS policy`

**Solution:**
1. Make sure backend is running
2. Check `FRONTEND_URL` in `backend/.env` matches your frontend URL
3. Default: `http://localhost:5173`

### No Courses Showing
**Solution:**
1. Check if backend is running: `curl http://localhost:5000/api/health`
2. Re-seed the database: `cd backend && npm run seed`
3. Check browser console for errors

---

## Next Steps

### Add Authentication UI
The backend supports JWT authentication. You can add login/register forms to the frontend.

### Implement Edit Course Form
Currently, the Edit button shows an alert. Create a form to update course details.

### Add Course Details Page
Implement a page to view full course details when clicking the course title.

### Deploy to Production
- Backend: Deploy to Heroku, Railway, or Render
- Frontend: Deploy to Vercel or Netlify
- Database: Use MongoDB Atlas

---

## File Structure Quick Reference

```
Elearning/
├── backend/
│   ├── config/db.js        # MongoDB connection
│   ├── models/             # Mongoose schemas
│   ├── controllers/        # Business logic
│   ├── routes/             # API routes
│   ├── middleware/         # Auth middleware
│   ├── server.js           # Express server
│   └── seed.js             # Database seeding
│
└── src/
    ├── components/         # React components
    ├── services/api.ts     # API integration
    ├── types/course.ts     # TypeScript types
    └── utils/helpers.ts    # Utility functions
```

---

## Support

For detailed API documentation, see: `backend/API_DOCUMENTATION.md`

For full project documentation, see: `README.md`

---

**🎉 Congratulations! Your E-Learning Dashboard is now running!**

Start building amazing courses! 🚀
