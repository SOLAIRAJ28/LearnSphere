# E-Learning Courses Dashboard - Full Stack Application

A complete full-stack E-Learning Courses Dashboard with MongoDB, Express, React, and TypeScript.

## 🚀 Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- Modern CSS for responsive UI
- Real-time search and filtering

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose ODM
- **JWT** authentication
- RESTful API architecture

## 📁 Project Structure

```
Elearning/
├── backend/                    # Backend API server
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   └── courseController.js # Course CRUD operations
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT authentication
│   ├── models/
│   │   ├── Course.js          # Course schema
│   │   └── User.js            # User schema
│   ├── routes/
│   │   ├── authRoutes.js      # Auth endpoints
│   │   └── courseRoutes.js    # Course endpoints
│   ├── .env                   # Environment variables
│   ├── package.json
│   ├── seed.js                # Database seeding script
│   └── server.js              # Express server entry
│
├── src/                       # Frontend React app
│   ├── components/
│   │   ├── CourseCard.tsx     # Kanban view card
│   │   ├── CourseList.tsx     # List view table
│   │   ├── CreateCourseModal.tsx
│   │   ├── Dashboard.tsx      # Main dashboard
│   │   ├── Header.tsx
│   │   └── SearchAndControls.tsx
│   ├── services/
│   │   └── api.ts             # API integration
│   ├── types/
│   │   └── course.ts          # TypeScript interfaces
│   ├── utils/
│   │   └── helpers.ts         # Utility functions
│   ├── App.tsx
│   └── main.tsx
│
└── package.json
```

## 🗄️ Database Schema

### Course Model
```javascript
{
  title: String (required),
  tags: [String],
  viewsCount: Number (default: 0),
  lessonsCount: Number (default: 0),
  totalDuration: Number (in minutes),
  isPublished: Boolean (default: false),
  shareLink: String,
  createdAt: Date,
  updatedAt: Date
}
```

### User Model
```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (hashed),
  role: String (admin/user),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses?search=query` - Search courses by title
- `GET /api/courses/:id` - Get single course
- `POST /api/courses` - Create course (Admin only)
- `PUT /api/courses/:id` - Update course (Admin only)
- `DELETE /api/courses/:id` - Delete course (Admin only)
- `PUT /api/courses/:id/tags` - Add/remove tags (Admin only)
- `PUT /api/courses/:id/publish` - Toggle publish status (Admin only)
- `POST /api/courses/:id/share` - Generate share link (Admin only)

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### 1. Clone the Repository
```bash
cd Elearning
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
# Edit .env file with your MongoDB URI
PORT=5000
MONGODB_URI=mongodb://localhost:27017/elearning
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Seed the database with sample data
npm run seed

# Start the backend server
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to root directory
cd ..

# Install dependencies
npm install

# Start the frontend development server
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🔐 Default Admin Credentials

After running the seed script:
- **Email:** admin@elearning.com
- **Password:** admin123

## 📝 Features

### Dashboard Features
✅ **View Modes**
- Kanban View (cards)
- List View (table)

✅ **Course Management**
- Create new courses
- Edit course details
- Delete courses
- Add/remove tags
- Toggle publish status
- Generate shareable links

✅ **Search & Filter**
- Real-time search by course title
- Backend-powered search queries

✅ **Course Display**
- Course title
- Tags with remove functionality
- Views count
- Lessons count
- Duration (HH:MM format)
- Published badge

### API Features
✅ **Authentication**
- JWT-based authentication
- Role-based access control (Admin/User)
- Protected routes

✅ **Data Validation**
- Input validation using express-validator
- Error handling middleware
- Mongoose schema validation

✅ **CORS Support**
- Configured for frontend-backend communication

## 🔄 API Request/Response Examples

### Create Course
```bash
POST /api/courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Advanced JavaScript Course"
}

Response:
{
  "success": true,
  "message": "Course created successfully",
  "data": {
    "_id": "...",
    "title": "Advanced JavaScript Course",
    "tags": [],
    "viewsCount": 0,
    "lessonsCount": 0,
    "totalDuration": 0,
    "isPublished": false,
    "createdAt": "2026-02-07T...",
    "updatedAt": "2026-02-07T..."
  }
}
```

### Get All Courses
```bash
GET /api/courses?search=odoo

Response:
{
  "success": true,
  "count": 3,
  "data": [...]
}
```

### Update Tags
```bash
PUT /api/courses/:id/tags
Authorization: Bearer <token>
Content-Type: application/json

{
  "tag": "JavaScript",
  "action": "add"
}
```

### Generate Share Link
```bash
POST /api/courses/:id/share
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Share link generated successfully",
  "data": {
    "shareLink": "http://localhost:5173/course/..."
  }
}
```

## 🧪 Testing the Application

1. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

2. **Seed the database**:
   ```bash
   cd backend
   npm run seed
   ```

3. **Start backend**:
   ```bash
   npm run dev
   ```

4. **Start frontend** (in a new terminal):
   ```bash
   cd ..
   npm run dev
   ```

5. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/elearning
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📦 Dependencies

### Backend
- express - Web framework
- mongoose - MongoDB ODM
- jsonwebtoken - JWT authentication
- bcryptjs - Password hashing
- cors - CORS middleware
- dotenv - Environment variables
- express-validator - Input validation

### Frontend
- react - UI library
- typescript - Type safety
- vite - Build tool

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas for production database
2. Update environment variables
3. Deploy to services like:
   - Heroku
   - Railway
   - Render
   - AWS EC2

### Frontend Deployment
1. Build the frontend:
   ```bash
   npm run build
   ```
2. Deploy to:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront

## 📄 License

ISC

## 👥 Support

For questions or issues, please create an issue in the repository.

---

**Built with ❤️ using MongoDB, Express, React, and TypeScript**


```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
