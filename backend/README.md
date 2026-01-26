# NoteTaker Backend API

FastAPI backend server for NoteTaker app with MongoDB integration.

## Features

- 📝 Full CRUD operations for notes
- 🔄 Sync endpoint to bulk upload notes from localStorage
- 🗄️ MongoDB storage (local or cloud Atlas)
- 🔒 CORS configured for frontend
- 📚 Auto-generated API docs

## Setup

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Install MongoDB

**Option A: Local MongoDB**
- Download and install from [mongodb.com](https://www.mongodb.com/try/download/community)
- Start MongoDB service

**Option B: MongoDB Atlas (Cloud)**
- Create free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
- Create a cluster and get connection string
- Update `.env` with your Atlas connection string

### 3. Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Edit `.env`:
```env
# For local MongoDB:
MONGODB_URL=mongodb://localhost:27017

# For MongoDB Atlas:
# MONGODB_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority

DATABASE_NAME=notetaker
```

### 4. Run the Server

```bash
# Development mode (with auto-reload)
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| GET | `/health` | Health check |
| GET | `/api/notes` | Get all notes |
| GET | `/api/notes/{id}` | Get single note |
| POST | `/api/notes` | Create note |
| PUT | `/api/notes/{id}` | Update note |
| DELETE | `/api/notes/{id}` | Delete note |
| POST | `/api/notes/sync` | Sync all notes from localStorage |
| DELETE | `/api/notes` | Delete all notes |

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Example: Sync Notes

```bash
curl -X POST http://localhost:8000/api/notes/sync \
  -H "Content-Type: application/json" \
  -d '{
    "notes": [
      {
        "id": "1234567890",
        "title": "My Note",
        "content": "Note content here",
        "color": "#6366f1",
        "createdAt": "2024-01-26T12:00:00.000Z"
      }
    ]
  }'
```

## Frontend Integration

Update your Next.js frontend to sync with this backend. See the `lib/storage.ts` file for API integration.
