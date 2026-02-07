# Course Edit Page - Setup Complete

## What's New

A complete Course Edit page has been added to the E-Learning application with full MongoDB integration.

## Features

### 1. Course Basic Information
- Edit course title
- Manage tags (comma-separated)
- Set responsible person
- Update course image URL
- Real-time preview of course image

### 2. Content Management Tab
- View all course contents in a table
- Add new content with:
  - Title
  - Category (Document, Video, Quiz, Article, Other)
  - Duration in minutes
- Edit existing content
- Delete content with confirmation
- Automatic updates to course totals (lessonsCount, totalDuration)

### 3. Description Tab
- Rich text area for course description
- Save description to MongoDB
- Retrieved when editing course

### 4. Options Tab
- Toggle publish/unpublish course status
- View course statistics:
  - Total Views
  - Total Lessons
  - Total Duration
- Real-time updates from database

### 5. Quiz Tab
- Placeholder for future quiz functionality

## Navigation

- From Dashboard: Click "Edit" button on any course card
- From Edit Page: Click "Back to Courses" to return to dashboard
- Routes:
  - Dashboard: `/`
  - Course Edit: `/courses/:id/edit`

## Technical Implementation

### Frontend
- **Component**: `src/components/CourseEdit.tsx`
- **Styles**: `src/styles/CourseEdit.css`
- **Routing**: React Router v6
- **State Management**: React useState hooks
- **API Integration**: Full CRUD operations via `contentAPI` and `courseAPI`

### Backend
- **Content Model**: `backend/models/Content.js`
  - Links to Course via courseId
  - Tracks order for sorting
  - Supports multiple content categories
  
- **Content Controller**: `backend/controllers/contentController.js`
  - `getCourseContents`: Get all contents for a course (sorted by order)
  - `createContent`: Add new content, auto-increment order
  - `updateContent`: Modify existing content
  - `deleteContent`: Remove content and update course totals
  - `reorderContents`: Batch update content ordering

- **Content Routes**: `backend/routes/contentRoutes.js`
  - `GET /api/courses/:courseId/contents`
  - `POST /api/courses/:courseId/contents`
  - `PUT /api/contents/:id`
  - `DELETE /api/contents/:id`
  - `PUT /api/courses/:courseId/contents/reorder`

### Database
- **Content Collection**: Stores course materials
- **Automatic Updates**: Course lessonsCount and totalDuration calculated automatically
- **Indexing**: Compound index on courseId + order for efficient queries

## Usage

### Running the Application

1. **Start Backend** (if not running):
```bash
cd c:\SNS_Hackathon\Elearning\backend
npm run dev
```

2. **Start Frontend** (if not running):
```bash
cd c:\SNS_Hackathon\Elearning
npm run dev
```

3. **Access Application**:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Testing the Edit Page

1. Open Dashboard at http://localhost:5173
2. Click "Edit" button on any course
3. Try the following:
   - Update course title and save
   - Add tags (comma-separated)
   - Add a new content item
   - Edit content details
   - Delete a content item
   - Switch between tabs
   - Edit description
   - Toggle publish status
   - Check updated course statistics

## Data Flow

```
User Action → CourseEdit Component → API Call → Backend Controller → MongoDB
                                                                        ↓
User sees updated data ← Component State ← API Response ← Query Results ←
```

## API Endpoints Used

- `GET /api/courses/:id` - Get course details
- `PUT /api/courses/:id` - Update course
- `GET /api/courses/:id/contents` - Get course contents
- `POST /api/courses/:id/contents` - Create content
- `PUT /api/contents/:id` - Update content
- `DELETE /api/contents/:id` - Delete content
- `PUT /api/courses/:id/publish` - Toggle publish status

## Notes

- All changes are saved to MongoDB in real-time
- Content order is automatically managed
- Course statistics (lessons count, total duration) update automatically
- Authentication is temporarily disabled for demo purposes
- Image upload currently uses URL input (can be upgraded to file upload later)

## Future Enhancements

- Drag-and-drop content reordering UI
- File upload for course images
- Rich text editor for description (currently textarea)
- Quiz builder functionality
- Content URL/file upload
- Bulk content operations
- Preview course as student view
