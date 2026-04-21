# Note-Taker Proxy API Guide

```javascript
// Example: Fetching all notes from the frontend React code
const response = await fetch('/api/notes', {
  method: 'GET',
  // No API Key or Authorization headers required! 
  // The browser attaches the auth_token cookie automatically.
});

const notes = await response.json();
```

**Example using cURL (passing the cookie manually):**
```bash
# Fetch all notes using the auth_token cookie
curl -X GET http://localhost:3000/api/notes \
  -H "Cookie: auth_token=eae0242c30255505..."
```

**Example using Python (passing the cookie manually):**
```python
import requests

url = "http://localhost:3000/api/notes"
cookies = {
    "auth_token": "eae0242c30255505..."
}

response = requests.get(url, cookies=cookies)
print(response.json())

**Example using Postman (adding the auth_token cookie)**
1. Open Postman and select the request you want to test (e.g., GET http://localhost:3000/api/notes).
2. Click the **Headers** tab and add a new header:
   - **Key:** `Cookie`
   - **Value:** `auth_token=YOUR_AUTH_TOKEN_VALUE`
   Replace `YOUR_AUTH_TOKEN_VALUE` with the actual cookie value you receive after logging in.
3. Send the request. If the cookie is valid, you will get a `200 OK` response with the notes payload.

*Tip:* You can also use the **Cookies** manager in Postman (under the **Cookies** button near the URL bar) to add a cookie for the `localhost:3000` domain. Just click **Add Cookie**, set **Name** to `auth_token` and **Value** to the token string, then press **Save**.

```

---

### Method 2: Programmatic Access (API Key)
*Best for: cURL, Postman, automated scripts, or mobile apps*

If you are accessing the API from outside the browser (where cookies aren't automatically managed or available), you must provide the Master API Key via the `x-api-key` HTTP header.

> **⚠️ Security Warning:** Never use this method inside public-facing frontend JavaScript code. Doing so will expose your Master API Key in the browser's Network tab.

**How to make a request:**
Manually attach the `x-api-key` header to your HTTP request.

**Example using cURL:**
```bash
# Fetch all notes
curl -X GET http://localhost:3000/api/notes \
  -H "x-api-key: ntk_YOUR_SECRET_KEY_HERE"

# Create a note
curl -X POST http://localhost:3000/api/notes \
  -H "x-api-key: ntk_YOUR_SECRET_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{"id": "123", "title": "Hello", "content": "World", "color": "#fff"}'
```

**Example using Python (Requests):**
```python
import requests

url = "http://localhost:3000/api/notes"
headers = {
    "x-api-key": "ntk_YOUR_SECRET_KEY_HERE"
}

response = requests.get(url, headers=headers)
print(response.json())
```

---

## How the Proxy Works 

1. **Interception:** A request hits `http://localhost:3000/api/notes`.
2. **Validation:** `middleware.ts` intercepts the request and checks for either a valid `auth_token` cookie OR a valid `x-api-key` header.
    - If neither is present (or if they are invalid), it instantly rejects the request with `401 Unauthorized - Vault locked`.
3. **Proxy Forwarding:** If the middleware validates the request, it is allowed to proceed to `app/api/notes/route.ts`.
4. **Backend Injection:** The Next.js proxy securely reads the `API_KEY` from the server's hidden `.env` file, attaches it to a new outgoing request, and forwards it to the private Python backend.
5. **Response:** The Python backend processes the request and returns the data to the proxy, which then safely passes it back to the client.
