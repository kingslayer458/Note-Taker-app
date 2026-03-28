# NoteTaker API Documentation

Base URL: `http://localhost:8000`

Authentication for all `/api/notes/*` endpoints:

- Header: `x-api-key`
- Value: backend `API_KEY` environment variable

---

## 📋 Table of Contents

1. [Health Check](#health-check)
2. [Get All Notes](#get-all-notes)
3. [Get Single Note](#get-single-note)
4. [Create Note](#create-note)
5. [Update Note](#update-note)
6. [Delete Note](#delete-note)
7. [Sync Notes](#sync-notes)
8. [Delete All Notes](#delete-all-notes)

---

## Health Check

Check if the API server is running and connected to MongoDB.

**Endpoint:** `GET /health`

**Request:**
```bash
curl -X GET http://localhost:8000/health
```

**Response:**
```json
{
  "status": "healthy",
  "database": "connected"
}
```

---

## Get All Notes

Retrieve all notes from the database.

**Endpoint:** `GET /api/notes`

**Request:**
```bash
curl -X GET http://localhost:8000/api/notes \
  -H "x-api-key: "
```

**Response:**
```json
[
  {
    "id": "1706284800000",
    "title": "My First Note",
    "content": "This is the content of my first note.",
    "color": "#6366f1",
    "createdAt": "2026-01-26T12:00:00.000Z"
  },
  {
    "id": "1706284900000",
    "title": "Shopping List",
    "content": "- Milk\n- Eggs\n- Bread",
    "color": "#22c55e",
    "createdAt": "2026-01-26T12:01:40.000Z"
  }
]
```

---

## Get Single Note

Retrieve a specific note by ID.

**Endpoint:** `GET /api/notes/{note_id}`

**Request:**
```bash
curl -X GET http://localhost:8000/api/notes/1706284800000 \
  -H "x-api-key: generated api key here"
```

**Response (Success - 200):**
```json
{
  "id": "1706284800000",
  "title": "My First Note",
  "content": "This is the content of my first note.",
  "color": "#6366f1",
  "createdAt": "2026-01-26T12:00:00.000Z"
}
```

**Response (Not Found - 404):**
```json
{
  "detail": "Note with id 1706284800000 not found"
}
```

---

## Create Note

Create a new note.

**Endpoint:** `POST /api/notes`

**Headers:**
```
Content-Type: application/json
x-api-key:generated api key here
```

**Request Body:**
```json
{
  "id": "1706285000000",
  "title": "Meeting Notes",
  "content": "Discuss project timeline\n- Phase 1: Design\n- Phase 2: Development\n- Phase 3: Testing",
  "color": "#8b5cf6",
  "createdAt": "2026-01-26T12:03:20.000Z"
}
```

**Request (curl):**
```bash
curl -X POST http://localhost:8000/api/notes \
  -H "x-api-key: generated api key here" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "1706285000000",
    "title": "Meeting Notes",
    "content": "Discuss project timeline\n- Phase 1: Design\n- Phase 2: Development\n- Phase 3: Testing",
    "color": "#8b5cf6",
    "createdAt": "2026-01-26T12:03:20.000Z"
  }'
```

**Response (Success - 201):**
```json
{
  "id": "1706285000000",
  "title": "Meeting Notes",
  "content": "Discuss project timeline\n- Phase 1: Design\n- Phase 2: Development\n- Phase 3: Testing",
  "color": "#8b5cf6",
  "createdAt": "2026-01-26T12:03:20.000Z"
}
```

**Response (Conflict - 409):**
```json
{
  "detail": "Note with id 1706285000000 already exists"
}
```

---

## Update Note

Update an existing note.

**Endpoint:** `PUT /api/notes/{note_id}`

**Headers:**
```
Content-Type: application/json
x-api-key: generated api key here
```

**Request Body:** (all fields are optional)
```json
{
  "title": "Updated Meeting Notes",
  "content": "Updated content here...",
  "color": "#ec4899"
}
```

**Request (curl):**
```bash
curl -X PUT http://localhost:8000/api/notes/1706285000000 \
  -H "x-api-key: generated api key here" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Meeting Notes",
    "content": "Updated content with new information",
    "color": "#ec4899"
  }'
```

**Response (Success - 200):**
```json
{
  "id": "1706285000000",
  "title": "Updated Meeting Notes",
  "content": "Updated content with new information",
  "color": "#ec4899",
  "createdAt": "2026-01-26T12:03:20.000Z"
}
```

**Response (Not Found - 404):**
```json
{
  "detail": "Note with id 1706285000000 not found"
}
```

---

## Delete Note

Delete a specific note by ID.

**Endpoint:** `DELETE /api/notes/{note_id}`

**Request:**
```bash
curl -X DELETE http://localhost:8000/api/notes/1706285000000 \
  -H "x-api-key: generated api key here"
```

**Response (Success - 204):**
No content returned.

**Response (Not Found - 404):**
```json
{
  "detail": "Note with id 1706285000000 not found"
}
```

---

## Sync Notes

Bulk sync/upsert multiple notes from client localStorage to MongoDB.
This will insert new notes and update existing ones.

**Endpoint:** `POST /api/notes/sync`

**Headers:**
```
Content-Type: application/json
x-api-key: generated api key here
```

**Request Body:**
```json
{
  "notes": [
    {
      "id": "1706284800000",
      "title": "Note 1",
      "content": "Content for note 1",
      "color": "#6366f1",
      "createdAt": "2026-01-26T12:00:00.000Z"
    },
    {
      "id": "1706284900000",
      "title": "Note 2",
      "content": "Content for note 2",
      "color": "#22c55e",
      "createdAt": "2026-01-26T12:01:40.000Z"
    },
    {
      "id": "1706285000000",
      "title": "Note 3",
      "content": "Content for note 3",
      "color": "#ef4444",
      "createdAt": "2026-01-26T12:03:20.000Z"
    }
  ]
}
```

**Request (curl):**
```bash
curl -X POST http://localhost:8000/api/notes/sync \
  -H "x-api-key: generated api key here" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": [
      {
        "id": "1706284800000",
        "title": "Note 1",
        "content": "Content for note 1",
        "color": "#6366f1",
        "createdAt": "2026-01-26T12:00:00.000Z"
      },
      {
        "id": "1706284900000",
        "title": "Note 2",
        "content": "Content for note 2",
        "color": "#22c55e",
        "createdAt": "2026-01-26T12:01:40.000Z"
      }
    ]
  }'
```

**Response (Success - 200):**
```json
{
  "success": true,
  "synced_count": 2,
  "notes": [
    {
      "id": "1706284800000",
      "title": "Note 1",
      "content": "Content for note 1",
      "color": "#6366f1",
      "createdAt": "2026-01-26T12:00:00.000Z"
    },
    {
      "id": "1706284900000",
      "title": "Note 2",
      "content": "Content for note 2",
      "color": "#22c55e",
      "createdAt": "2026-01-26T12:01:40.000Z"
    }
  ],
  "message": "Successfully synced 2 notes"
}
```

---

## Delete All Notes

Delete all notes from the database. **Use with caution!**

**Endpoint:** `DELETE /api/notes`

**Request:**
```bash
curl -X DELETE http://localhost:8000/api/notes
```

**Response (Success - 200):**
```json
{
  "deleted_count": 5,
  "message": "All notes deleted"
}
```

---

## 🎨 Available Note Colors

| Color | Hex Code |
|-------|----------|
| Indigo | `#6366f1` |
| Purple | `#8b5cf6` |
| Pink | `#ec4899` |
| Red | `#ef4444` |
| Orange | `#f97316` |
| Green | `#22c55e` |

---

## 🧪 Testing with Postman

### Import Collection

1. Open Postman
2. Click "Import"
3. Use this raw JSON:

```json
{
  "info": {
    "name": "NoteTaker API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "http://localhost:8000/health"
      }
    },
    {
      "name": "Get All Notes",
      "request": {
        "method": "GET",
        "url": "http://localhost:8000/api/notes"
      }
    },
    {
      "name": "Create Note",
      "request": {
        "method": "POST",
        "url": "http://localhost:8000/api/notes",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"id\": \"{{$timestamp}}\",\n  \"title\": \"Test Note\",\n  \"content\": \"This is a test note created from Postman\",\n  \"color\": \"#6366f1\",\n  \"createdAt\": \"{{$isoTimestamp}}\"\n}"
        }
      }
    },
    {
      "name": "Sync Notes",
      "request": {
        "method": "POST",
        "url": "http://localhost:8000/api/notes/sync",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"notes\": [\n    {\n      \"id\": \"test-1\",\n      \"title\": \"Synced Note 1\",\n      \"content\": \"Content 1\",\n      \"color\": \"#6366f1\",\n      \"createdAt\": \"2026-01-26T12:00:00.000Z\"\n    },\n    {\n      \"id\": \"test-2\",\n      \"title\": \"Synced Note 2\",\n      \"content\": \"Content 2\",\n      \"color\": \"#22c55e\",\n      \"createdAt\": \"2026-01-26T12:01:00.000Z\"\n    }\n  ]\n}"
        }
      }
    }
  ]
}
```

---

## 🔗 Interactive API Docs

Once the server is running, visit:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## 📝 Sample Test Script (Python)

```python
import requests

BASE_URL = "http://localhost:8000"

# 1. Health check
response = requests.get(f"{BASE_URL}/health")
print("Health:", response.json())

# 2. Create a note
new_note = {
    "id": "python-test-1",
    "title": "Python Test Note",
    "content": "Created from Python script",
    "color": "#6366f1",
    "createdAt": "2026-01-26T12:00:00.000Z"
}
response = requests.post(f"{BASE_URL}/api/notes", json=new_note)
print("Created:", response.json())

# 3. Get all notes
response = requests.get(f"{BASE_URL}/api/notes")
print("All notes:", response.json())

# 4. Update the note
update_data = {"title": "Updated Python Note", "color": "#ec4899"}
response = requests.put(f"{BASE_URL}/api/notes/python-test-1", json=update_data)
print("Updated:", response.json())

# 5. Delete the note
response = requests.delete(f"{BASE_URL}/api/notes/python-test-1")
print("Deleted:", response.status_code)
```

---

## 📝 Sample Test Script (JavaScript/Node.js)

```javascript
const BASE_URL = "http://localhost:8000";

async function testAPI() {
  // 1. Health check
  let response = await fetch(`${BASE_URL}/health`);
  console.log("Health:", await response.json());

  // 2. Create a note
  const newNote = {
    id: "js-test-1",
    title: "JavaScript Test Note",
    content: "Created from JavaScript",
    color: "#6366f1",
    createdAt: new Date().toISOString()
  };
  
  response = await fetch(`${BASE_URL}/api/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newNote)
  });
  console.log("Created:", await response.json());

  // 3. Get all notes
  response = await fetch(`${BASE_URL}/api/notes`);
  console.log("All notes:", await response.json());

  // 4. Update the note
  response = await fetch(`${BASE_URL}/api/notes/js-test-1`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Updated JS Note" })
  });
  console.log("Updated:", await response.json());

  // 5. Delete the note
  response = await fetch(`${BASE_URL}/api/notes/js-test-1`, {
    method: "DELETE"
  });
  console.log("Deleted:", response.status);
}

testAPI();
```

---

## ⚠️ Error Responses

All error responses follow this format:

```json
{
  "detail": "Error message here"
}
```

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (successful delete) |
| 404 | Not Found |
| 409 | Conflict (duplicate ID) |
| 422 | Validation Error |
| 500 | Internal Server Error |
