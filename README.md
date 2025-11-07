Cache Me If You Can Group Project:

.env file

- In the server directory create a .env file with these fields and values
  specific to your local machine

  ```
  DB_HOST=localhost
  DB_USER=root
  DB_PASS={REPLACE_ME}
  DB_NAME=cache_me_if_you_can_db
  PORT=5050
  GOOGLE_MAPS_API_KEY={REPLACE_ME}
  JWT_SECRET={REPLACE_ME}
  ```

- In the client directory create .env file with these fields and google maps api key

```
REACT_APP_GOOGLE_MAPS_API_KEY={REPLACE ME}
JWT_SECRET={REPLACE ME}
```

Server

- You can start the backend by running node index.js in the server directory

Client

- You can start the frontend by running npm start in the client directory

## Authentication System

This application uses **JWT (JSON Web Token) authentication with HTTP-only cookies** for secure user authentication.

### Overview

- **JWT Tokens**: Contain user data (runner object) and are signed with a secret key
- **HTTP-only Cookies**: Store JWT tokens securely (inaccessible to JavaScript)
- **Stateless**: Server doesn't need session storage - all user data is in the token

### Authentication Flow

1. **User Signs In** (`POST /login`)

   - Client sends email and password
   - Server validates credentials
   - Server generates JWT token containing full runner object
   - Server sets HTTP-only cookie with the token
   - Server returns user object in response

2. **Authenticated Requests**

   - Browser automatically sends cookie with each request
   - Server reads token from cookie
   - Server verifies token and extracts user data
   - No database lookup needed - user data is in the token

3. **Getting Current User** (`GET /api/me`)

   - Client calls `/api/me` with `credentials: 'include'`
   - Server reads cookie, verifies token, returns user data

4. **Logout** (`POST /api/logout`)
   - Server clears the HTTP-only cookie
   - Client clears user state

### Server-Side Implementation

#### Authentication Middleware (`server/auth.js`)

- `generateJWT(runner)`: Creates JWT token with full runner object
- `verifyToken`: Middleware that verifies JWT from cookie and attaches user to `req.user`

#### Protected Routes Example

```javascript
// Require authentication
router.get("/api/me", verifyToken, (req, res) => {
  res.json(req.user); // req.user contains full runner object
});
```

#### Cookie Security Settings

Cookies are set with these security options:

- `httpOnly: true` - Prevents JavaScript access (XSS protection)
- `secure: false` (local dev), `secure: true` (production) - HTTPS only in production
- `sameSite: "lax"` (local dev), `sameSite: "strict"` (production) - CSRF protection
- `maxAge: 7 days` - Auto-expiration

### Client-Side Implementation

#### AuthContext (`client/src/context/AuthContext.js`)

The app is wrapped in `<AuthProvider>` which provides these to all components:

- `user`: Current user object (or null)
- `loading`: Authentication check status
- `login(email, password)`: Sign in function
- `logout()`: Sign out function
- `authFetch(url, options)`: Helper for authenticated API calls
- `isAuthenticated`: Boolean if user is logged in
- `isLeader`: Boolean if user is a leader
