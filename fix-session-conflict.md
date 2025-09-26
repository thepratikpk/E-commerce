# Fix Session Conflict Issue

## Problem Identified ✅

The issue is **session conflict between admin panel and frontend user**:

1. **Shared Backend**: Both admin and frontend use the same authentication system
2. **Cookie Overwrite**: When you login to admin, it overwrites the frontend user's cookies
3. **Session Confusion**: Frontend sees admin user instead of original user after refresh

## Root Cause

When you:
1. Login as User A in frontend (sets cookies)
2. Login as Admin in admin panel (overwrites same cookies)
3. Refresh frontend → sees Admin user instead of User A

## Solutions

### Solution 1: Use Different Cookie Names (Recommended)

Modify admin to use different cookie names:

**Backend Changes:**
```javascript
// In user.controllers.js - Add admin login endpoint
const adminLogin = asyncHandler(async (req, res) => {
    // Same logic as loginUser but use different cookie names
    return res
        .status(200)
        .cookie("adminAccessToken", accessToken, options)  // Different name
        .cookie("adminRefreshToken", refreshToken, options) // Different name
        .json(new ApiResponse(200, { user: loggedUser, accessToken }, "Admin logged in Successfully"))
});
```

**Admin Frontend Changes:**
```javascript
// Use different cookie names for admin
document.cookie = "adminAccessToken=...";
```

### Solution 2: Use Only Bearer Tokens for Admin (Current Implementation)

The current fix separates admin and user authentication:
- **Users**: Use cookies (as before)
- **Admin**: Use Authorization headers only (no cookies)

### Solution 3: Use Different Subdomains

- Frontend: `app.yourdomain.com`
- Admin: `admin.yourdomain.com`

## Current Fix Applied

I've implemented **Solution 2** with these changes:

1. **Enhanced Authentication Middleware**: Detects admin vs user requests
2. **Request Logging**: Shows which type of request is being made
3. **Separate Token Handling**: Admin uses Bearer tokens, users use cookies

## Testing the Fix

### Step 1: Clear All Sessions
```javascript
// In browser console (both admin and frontend)
localStorage.clear();
document.cookie.split(";").forEach(c => {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
```

### Step 2: Test Flow
1. Login to frontend as User A
2. Check orders page works
3. Login to admin panel
4. Change order status
5. Go back to frontend and refresh
6. Check if User A is still logged in

### Step 3: Check Debug Logs

Look for these messages:
```
🌐 Request: { path: '/api/v1/order/userorders', isAdmin: false }
🔐 User request with cookie token
🔐 Authenticated user: { id: 'USER_ID', requestType: 'User' }
```

## If Issue Persists

If the problem continues, we'll implement **Solution 1** with separate cookie names for complete isolation.

## Quick Test Command

Run this in browser console to check current cookies:
```javascript
console.log('Cookies:', document.cookie);
console.log('LocalStorage:', localStorage.getItem('token'));
```

This will show if there are conflicting authentication tokens.