## 6. Feature Flows (Step-by-Step)

### 6.1 Login & Authentication Flow

**What happens when you click "Login":**

Think of logging in like entering a theme park. The server is the ticket booth, and it gives you two special tickets:
1. A **JWT (JSON Web Token)** — a signed ticket that proves who you are. It's like a wristband with your name, role, and ID printed on it, plus a signature that proves the park gave it to you. The server signs it with a secret key (HS256 algorithm) so nobody can fake it.
2. A **Refresh Token** — a backup ticket you use to get a new wristband when the first one expires.

Both tickets are stored in **HttpOnly cookies** — these are special cookies that JavaScript cannot read. Think of them as locked boxes that only your browser can open and send to the server. This protects your login from malicious scripts trying to steal your tickets.

**The complete login journey:**

```
User enters email + password
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  Frontend sends: POST /api/Auth/login                       │
│  { email: "teacher@school.com", password: "mypassword" }    │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  AuthService.LoginAsync() starts working                    │
│                                                             │
│  Step 1: Search for this email in Teachers table           │
│    ├─ If found: check if it's this user                     │
│    └─ If not found: search Students table                   │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  PasswordHasher.VerifyHashedPassword()                      │
│                                                             │
│  Compares the entered password against the stored hash.     │
│  The password is NEVER stored as plain text — only a        │
│  one-way mathematical hash (like a fingerprint of the       │
│  password). If the fingerprints match → correct password.   │
└─────────────────────────────────────────────────────────────┘
         │
         ▼  Password correct!
┌─────────────────────────────────────────────────────────────┐
│  JwtTokenService.GenerateAccessToken()                      │
│                                                             │
│  Creates a JWT containing:                                  │
│    • User ID (Guid)                                         │
│    • Full Name                                              │
│    • Email                                                  │
│    • Role (Admin/Teacher/Student)                           │
│                                                             │
│  Signed with HS256 (secret key from appsettings.json)       │
│  Expiration: 1 hour from now                                │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  JwtTokenService.GenerateRefreshTokenValue()                │
│                                                             │
│  Generates a cryptographically secure random 64-byte        │
│  base64 string (looks like: "aB3d9F2k..." — 88 chars)       │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  Save RefreshToken to database:                             │
│    • Token: the random string                               │
│    • TeacherId or StudentId: links to the user              │
│    • ExpiresAt: 7 days from now                             │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  Response sets TWO HttpOnly cookies:                        │
│                                                             │
│  Cookie 1: "token"                                          │
│    • Value: the JWT                                         │
│    • HttpOnly: true (JavaScript cannot read it)             │
│    • Secure: true (HTTPS only)                              │
│    • SameSite: None (allows cross-origin in dev)            │
│                                                             │
│  Cookie 2: "refreshToken"                                   │
│    • Value: the refresh token string                        │
│    • Same security flags as above                           │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  Response body returns user object:                         │
│  {                                                          │
│    id: "abc-123-...",                                       │
│    fullName: "John Doe",                                    │
│    email: "john@school.com",                                │
│    role: "Teacher",                                         │
│    profile: "profile-uuid.jpg",                             │
│    emailVerified: true                                      │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  React Router redirects based on role:                      │
│    • Admin    →  /AdminIndex                                │
│    • Teacher  →  /TeacherIndex                              │
│    • Student  →  /StudentIndex                              │
└─────────────────────────────────────────────────────────────┘
```

**What happens after 1 hour (when JWT expires):**

```
User clicks a button → API call is made
         │
         ▼
Server checks JWT → "This token expired!"
         │
         ▼
Server responds: 401 Unauthorized
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  baseQueryWithReauth.ts (wraps EVERY API call)              │
│                                                             │
│  Detects the 401 error                                      │
│  Checks if a refresh is already in progress                 │
│    └─ If yes: waits for that one (prevents duplicate calls) │
│    └─ If no: starts a new refresh                           │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  POST /api/Auth/refresh                                     │
│  (sends the "refreshToken" cookie automatically)            │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  AuthService.RefreshAsync()                                 │
│                                                             │
│  Step 1: Find the refresh token in the database             │
│  Step 2: Check it hasn't expired (< 7 days old)             │
│  Step 3: SECURITY — Token Rotation                          │
│    ├─ Delete the old refresh token from database            │
│    ├─ Generate a BRAND NEW refresh token                    │
│    └─ Save the new one to database                          │
│                                                             │
│  Why rotate? If someone steals your refresh token, it can   │
│  only be used ONCE. The real user and the attacker will     │
│  both try to use it, and the system will detect the theft.  │
│                                                             │
│  Step 4: Generate a fresh JWT (new 1-hour expiry)           │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  Response sets new cookies:                                 │
│    • New JWT in "token" cookie                              │
│    • New refresh token in "refreshToken" cookie             │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  baseQueryWithReauth.ts retries the ORIGINAL request        │
│  with the fresh JWT → request succeeds!                     │
│                                                             │
│  User never noticed anything — seamless experience          │
└─────────────────────────────────────────────────────────────┘
```

**If refresh fails (refresh token also expired or invalid):**

```
Refresh call returns error
         │
         ▼
baseQueryWithReauth.ts dispatches: auth/resetStore
         │
         ▼
Redux store cleared (all cached data wiped)
         │
         ▼
Redirect to /Login page
         │
         ▼
User must log in again
```

**The smart wrapper — baseQueryWithReauth.ts:**

This file wraps every single API call made by RTK Query. Here's what makes it smart:

- It keeps a single shared `refreshPromise` variable.
- When the first API call gets a 401, it creates a refresh promise and stores it.
- If 10 other API calls ALSO get 401s at the same moment (common when loading a page), they all wait for the SAME refresh promise instead of making 10 duplicate refresh calls.
- After refresh succeeds, all 10 original requests are retried with the new token.
- This prevents a "refresh storm" and makes token renewal efficient.

---

### 6.2 Email Verification Flow

Every new account must verify their email before they can use certain features. Think of it like confirming your phone number when you sign up for a service — it proves you own that email address.

**Why verify emails?**
- Prevents typos (someone accidentally typing the wrong email)
- Prevents fake accounts
- Ensures the user can receive important notifications

**The verification journey:**

```
Step 1: User wants to verify email
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  User visits /VerifyEmail page                              │
│  Clicks "Send Verification Code" button                     │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  Frontend: POST /api/Auth/verification/send                 │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  AuthService.SendEmailVerificationAsync()                   │
│                                                             │
│  Step 1: Check cooldown                                     │
│    └─ Did this user request a code in the last 60 seconds?  │
│       If yes: return error "Please wait before resending"   │
│                                                             │
│  Step 2: Generate a secure 6-digit code                     │
│    └─ Uses RandomNumberGenerator.GetInt32(100000, 999999)  │
│       Example: 482910                                       │
│       This is cryptographically secure random (not Math.Random) │
│                                                             │
│  Step 3: Hash the code with SHA-256                         │
│    └─ Code "482910" becomes hash:                           │
│       "a3f5b8c2d1e4..." (64-character hex string)           │
│                                                             │
│  Step 4: Save to OtpCodes table                             │
│    • UserId: current user's ID                              │
│    • UserType: "Teacher" or "Student"                       │
│    • Purpose: "EmailVerification"                           │
│    • CodeHash: the SHA-256 hash (NOT the plain code!)       │
│    • CreatedAt: now                                         │
│    • ExpiresAt: now + 10 minutes                            │
│    • Attempts: 0                                            │
│    • ConsumedAt: null (not used yet)                        │
│                                                             │
│  Step 5: Send email via Gmail SMTP                          │
│    Subject: "Email Verification Code"                       │
│    Body: "Your verification code is: 482910"                │
│           "This code expires in 10 minutes."                │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  User receives email in their inbox                         │
│  Sees the 6-digit code: 482910                              │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  User enters code in the verification form                  │
│  Clicks "Verify"                                            │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  Frontend: POST /api/Auth/verification/confirm              │
│  { code: "482910" }                                         │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  AuthService.ConfirmEmailVerificationAsync()                │
│                                                             │
│  Step 1: Find the latest unconsumed OTP for this user       │
│    WHERE Purpose = EmailVerification                        │
│      AND ConsumedAt IS NULL                                 │
│    ORDER BY CreatedAt DESC                                  │
│                                                             │
│  Step 2: Security checks                                    │
│    ├─ Is the OTP expired? (CreatedAt + 10 min < now)        │
│    │   If yes: return "Code expired, request a new one"     │
│    │                                                        │
│    ├─ Too many attempts? (Attempts >= 5)                    │
│    │   If yes: return "Too many failed attempts"            │
│    │                                                        │
│    └─ Hash the submitted code with SHA-256                  │
│         Compare it to the stored CodeHash                   │
│         If they DON'T match:                                │
│           ├─ Increment Attempts by 1                        │
│           └─ Return "Invalid code"                          │
│                                                             │
│  Step 3: Code is correct! ✓                                 │
│    ├─ Mark OTP as consumed: ConsumedAt = now                │
│    ├─ Set user.EmailVerified = true                         │
│    └─ If user has a PendingEmail set:                       │
│         ├─ Move PendingEmail → Email                        │
│         └─ Clear PendingEmail field                         │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  Success! User's email is now verified                      │
│  Frontend shows: "Email verified successfully ✓"            │
└─────────────────────────────────────────────────────────────┘
```

**Why hash the OTP code?**

Imagine if someone breaks into the database. If OTP codes were stored as plain text ("482910"), the attacker could see them and use them immediately.

But since we only store the **hash** (a one-way mathematical scramble), the attacker sees "a3f5b8c2d1e4..." — which is useless. They can't reverse it back to "482910".

When you submit the code, the server hashes what you entered and compares the two hashes. If they match, the code was correct.

This is the exact same principle used for passwords — never store the real thing, only the fingerprint.

**Changing your email address:**

```
User realizes they entered the wrong email
         │
         ▼
Clicks "Use a different email" on /VerifyEmail page
         │
         ▼
Enters new email address → Clicks "Change Email"
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  POST /api/Auth/verification/change-email                   │
│  { newEmail: "correct@school.com" }                         │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  AuthService.ChangePendingEmailAsync()                      │
│                                                             │
│  Step 1: Store new email in PendingEmail field              │
│    (NOT in Email field yet — not verified!)                 │
│                                                             │
│  Step 2: Calls SendEmailVerificationAsync() internally      │
│    └─ Sends OTP to the NEW email address                    │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
User checks their NEW inbox → receives code → verifies
         │
         ▼
Only AFTER successful verification:
  PendingEmail ("correct@school.com") → Email
  PendingEmail field cleared
```

This two-step process ensures you cannot accidentally lock yourself out by changing to an email you don't own.

---

### 6.3 Forgot Password Flow

Forgot your password? This flow lets you reset it using an email verification code.

**Security features in this flow:**
- Never reveals whether an email exists in the system (prevents attackers from discovering valid accounts)
- Only sends codes to verified email addresses (prevents spam to random emails)
- Rate limited to prevent brute-force attacks

**The password reset journey:**

```
Step 1: User clicks "Forgot Password?" on login page
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  User enters their email address                            │
│  Clicks "Send Reset Code"                                   │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  Frontend: POST /api/Auth/password/forgot                   │
│  { email: "teacher@school.com" }                            │
│                                                             │
│  Rate Limited: 5 requests per IP address per minute         │
│  If exceeded: returns HTTP 429 (Too Many Requests)          │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  AuthService.RequestPasswordResetAsync()                    │
│                                                             │
│  Step 1: Search for email                                   │
│    ├─ Check Teachers table                                  │
│    └─ If not found: check Students table                    │
│                                                             │
│  Step 2: SECURITY — Never reveal if account exists          │
│    If email NOT found:                                      │
│      └─ Still return "OK" status                            │
│          (makes attackers think code was sent)              │
│      └─ But actually do nothing                             │
│                                                             │
│  Step 3: If email found BUT not verified:                   │
│    └─ Silently do nothing (don't send code)                 │
│       (prevents spam to unverified/fake emails)             │
│                                                             │
│  Step 4: Enforce 60-second cooldown (same as verification)  │
│    If a code was sent < 60 seconds ago: silently do nothing │
│                                                             │
│  Step 5: If all checks pass — send the code                 │
│    ├─ Generate secure 6-digit code (RandomNumberGenerator)  │
│    ├─ SHA-256 hash it                                       │
│    ├─ Save to OtpCodes table:                               │
│    │   • Purpose: "PasswordReset"                           │
│    │   • ExpiresAt: now + 10 minutes                        │
│    │   • Attempts: 0                                        │
│    └─ Send email via SMTP:                                  │
│        "Your password reset code is: 381029"                │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  User receives email (if account exists and is verified)    │
│                                                             │
│  Frontend always shows:                                     │
│  "If this email exists, a reset code has been sent"         │
│  (never says "email not found" — prevents account discovery)│
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  User enters:                                               │
│    • The 6-digit code from email                            │
│    • A new password (minimum 6 characters)                  │
│  Clicks "Reset Password"                                    │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  Frontend: POST /api/Auth/password/reset                    │
│  { email, code, newPassword }                               │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  AuthService.ResetPasswordAsync()                           │
│                                                             │
│  Step 1: Find the user by email (Teachers then Students)    │
│                                                             │
│  Step 2: Find latest unconsumed OTP                         │
│    WHERE UserId = user.Id                                   │
│      AND Purpose = PasswordReset                            │
│      AND ConsumedAt IS NULL                                 │
│                                                             │
│  Step 3: Same validation as email verification              │
│    ├─ Check not expired (< 10 minutes old)                  │
│    ├─ Check attempts < 5                                    │
│    └─ Hash submitted code, compare to stored hash           │
│        If wrong: increment attempts, return error           │
│                                                             │
│  Step 4: Code is correct! Reset the password                │
│    ├─ Validate new password (minimum 6 characters)          │
│    ├─ Hash the new password using PasswordHasher            │
│    │   (PBKDF2 with HMAC-SHA512, 128-bit salt, 100k+ iter) │
│    ├─ Save the hashed password to user.Password             │
│    └─ Mark OTP as consumed: ConsumedAt = now                │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  Success! Password has been reset                           │
│  Frontend redirects to /Login                               │
│  User can now log in with the new password                  │
└─────────────────────────────────────────────────────────────┘
```

**Why does it always say "If this email exists..."?**

Imagine if the system said "Email not found" when you entered a wrong email. An attacker could use this to discover which emails have accounts in the system:

- Try "admin@school.com" → "Email not found" → no account
- Try "john@school.com" → "Code sent" → account exists!

By ALWAYS saying "code sent" (even when it wasn't), attackers cannot tell which emails are registered.

---

### 6.4 Rate Limiting

Rate limiting is like a bouncer at a club — it limits how many times you can do something in a short period. This stops attackers from:
- Trying thousands of passwords (brute-force attacks)
- Spamming the "forgot password" feature
- Overwhelming the server with requests

**How it works in StudentGrid:**

```
Program.cs configures a rate limiter named "auth":
┌─────────────────────────────────────────────────────────────┐
│  builder.Services.AddRateLimiter(options => {               │
│    options.AddFixedWindowLimiter("auth", opt => {           │
│      opt.PermitLimit = 5;          // Max 5 requests         │
│      opt.Window = TimeSpan.FromMinutes(1);  // Per 1 minute  │
│      opt.QueueLimit = 0;           // Don't queue extras     │
│    });                                                       │
│  });                                                         │
└─────────────────────────────────────────────────────────────┘

Applied to these endpoints:
  • POST /api/Auth/login
  • POST /api/Auth/password/forgot
  • POST /api/Auth/password/reset

Example:
  User at IP 192.168.1.100 tries to log in:
    Attempt 1 → ✓ Allowed
    Attempt 2 → ✓ Allowed
    Attempt 3 → ✓ Allowed
    Attempt 4 → ✓ Allowed
    Attempt 5 → ✓ Allowed
    Attempt 6 → ✗ BLOCKED — HTTP 429 "Too Many Requests"
    
  After 1 minute passes:
    Counter resets to 0 → user can try again
```

**Fixed Window** means the time is divided into fixed 1-minute blocks. If you use all 5 attempts in the first 10 seconds, you must wait the full minute for the window to reset.

**QueueLimit = 0** means excess requests are immediately rejected (not placed in a waiting queue). This prevents attackers from flooding the queue.


---

### 6.5 Real-Time Notifications (SignalR)

SignalR is like a **walkie-talkie between the browser and server**.

Normally, the browser asks the server questions (like "do I have new messages?"). The server only answers when asked.

With SignalR, the SERVER can push messages to the browser **without being asked**. The moment something happens (a new assignment is posted, a teacher gives feedback), the server shouts it through the walkie-talkie, and your browser hears it instantly.

**How it's built — Backend:**

```
NotificationHub.cs
  ├─ Extends Hub (SignalR's base class)
  ├─ Has [Authorize] attribute
  │   └─ Only logged-in users can connect
  └─ No custom methods needed — it's just a connection point
     (SignalR handles identifying each connected user by their
      JWT claim — each browser tab is a "connection")

Program.cs registers it:
  builder.Services.AddSignalR();
  app.MapHub<NotificationHub>("/hubs/notifications");

RealtimeNotifier.cs (the message-sending service)
  Injected with IHubContext<NotificationHub>
  (think of this as the walkie-talkie transmitter)
```

**Four notification methods in RealtimeNotifier.cs:**

```
┌─────────────────────────────────────────────────────────────┐
│  1. NotifyGlobalNoticeAsync(notice)                         │
│                                                             │
│     Who hears it: hub.Clients.All                           │
│     = Every single connected browser in the system          │
│                                                             │
│     Event name sent: "globalNotice"                         │
│     Payload: { id, title, postedAt, postedByName }          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  2. NotifyGroupPostAsync(groupId, recipientUserIds, post)   │
│                                                             │
│     Who hears it: hub.Clients.Users(recipientUserIds)       │
│     = Only the specified user IDs                           │
│       (group members + managers of that group)              │
│       The poster is excluded from the recipient list        │
│                                                             │
│     Event name sent: "groupPost"                            │
│     Payload: { groupId, post details }                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  3. NotifyAssignmentFeedbackAsync(studentId, payload)       │
│                                                             │
│     Who hears it: hub.Clients.User(studentId)               │
│     = Only that one specific student                        │
│                                                             │
│     Event name sent: "assignmentFeedback"                   │
│     Payload: { studentId, assignmentTitle, groupId,         │
│               feedback text, timestamp }                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  4. NotifyAssignmentSubmissionAsync(teacherIds, payload)    │
│                                                             │
│     Who hears it: hub.Clients.Users(teacherIds)             │
│     = All teachers managing this group                      │
│       (sent when a student submits work)                    │
│                                                             │
│     Event name sent: "assignmentSubmission"                 │
│     Payload: { studentName, assignmentTitle, groupId,       │
│               submittedAt }                                 │
└─────────────────────────────────────────────────────────────┘
```

**How it's built — Frontend:**

```
lib/signalr.ts creates the HubConnection:
  ┌─────────────────────────────────────────────────────────┐
  │  new HubConnectionBuilder()                             │
  │    .withUrl("/hubs/notifications", {                    │
  │      withCredentials: true  ← sends JWT cookie          │
  │    })                                                   │
  │    .withAutomaticReconnect()  ← reconnects if dropped   │
  │    .build()                                             │
  └─────────────────────────────────────────────────────────┘

NotificationsProvider.tsx wraps the entire app (in main.tsx,
inside <Provider> and <BrowserRouter>):
  ├─ Starts the connection when the user is logged in
  ├─ Stops and disconnects on logout
  └─ Listens for four events:
```

```
Event 1: "globalNotice"
  When received:
    └─ dispatch(globalNoticeApi.util.invalidateTags(['GlobalNotice']))
       Forces RTK Query to refetch the global notices list
       → Any open /GlobalNotices page updates automatically

Event 2: "groupPost"
  When received:
    └─ dispatch(groupApi.util.invalidateTags([
         { type: 'GroupPost', id: data.groupId }
       ]))
       Forces RTK Query to refetch posts for that specific group
       → If you have that group's page open, new post appears

Event 3: "assignmentFeedback"
  When received:
    ├─ Invalidates Submission cache (refetches submission status)
    └─ Adds to realtimeNotifications local state:
         { id, message, groupId, timestamp, read: false }
       → Bell badge count increases immediately

Event 4: "assignmentSubmission"
  When received:
    ├─ Invalidates Submission cache
    └─ Adds to realtimeNotifications local state
       → Teacher's bell badge count increases immediately
```

NotificationBell.tsx combines **three sources** of unread items:
1. Unread group posts — from REST API, compared against last-viewed timestamps
2. Unread global notices — from REST API, compared against last-viewed timestamp
3. Real-time notifications — from SignalR events stored in memory by NotificationsProvider

---

### 6.6 Notification Bell Flow (REST Polling + Real-Time Combined)

The notification bell in the top navigation bar shows a red badge with the number of things you haven't seen yet. It gets its data from two places: the REST API (for history) and SignalR (for live events).

**On every page load, the bell fetches four things:**

```
NotificationBell.tsx mounts
         │
         ├──► GET /api/Groups/notices
         │      Returns: recent GroupPosts (notices + assignments)
         │      from all groups the user belongs to
         │
         ├──► GET /api/Groups/last-viewed
         │      Returns: { groupId1: "2026-09-20T10:00Z",
         │                  groupId2: "2026-09-19T08:30Z", ... }
         │      (a map of: when did I last visit each group?)
         │
         ├──► GET /api/GlobalNotices
         │      Returns: all global announcements
         │
         └──► GET /api/GlobalNotices/last-viewed
                Returns: "2026-09-21T14:00Z"
                (when did I last visit the announcements page?)
```

**How "unread" is calculated:**

```
┌─────────────────────────────────────────────────────────────┐
│  getUnreadNotices(groupNotices, lastViewedMap)               │
│                                                             │
│  For each group notice in the list:                         │
│    Look up: lastViewedMap[notice.groupId]                   │
│      ├─ If no entry for this group → notice is UNREAD       │
│          (you've never visited that group page)             │
│      └─ If entry exists:                                    │
│           notice.postedAt > lastViewedTime → UNREAD         │
│           notice.postedAt ≤ lastViewedTime → already seen   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  getUnreadGlobalNotices(globalNotices, globalLastViewed)     │
│                                                             │
│  For each global notice:                                    │
│    If globalLastViewed is null → ALL notices are UNREAD     │
│    Otherwise:                                               │
│      notice.postedAt > globalLastViewed → UNREAD            │
│      notice.postedAt ≤ globalLastViewed → already seen      │
└─────────────────────────────────────────────────────────────┘

Total unread = unreadGroupNotices.length
             + unreadGlobalNotices.length
             + realtimeNotifications.filter(n => !n.read).length

Badge displays:
  0       → no badge shown
  1–9     → shows the number
  10+     → shows "9+"
```

**What happens when you click the bell:**

```
Bell icon clicked → Popover opens
         │
         ├── Shows unread GROUP notices
         │     User clicks one:
         │       └─ navigate("/groups/abc-123")
         │
         │     GroupDetail page loads:
         │       └─ POST /api/Groups/abc-123/mark-viewed
         │            ReadStateService.MarkViewedAsync()
         │            Saves: LastReadAt = now  (for this group)
         │
         │     Next time bell recalculates:
         │       all notices from this group posted before "now"
         │       are no longer unread ✓
         │
         ├── Shows unread GLOBAL notices
         │     User clicks one:
         │       ├─ markGlobalViewed() called IMMEDIATELY
         │       │   POST /api/GlobalNotices/mark-viewed
         │       │   Saves: LastReadAt = now (for global channel)
         │       └─ navigate("/GlobalNotices")
         │
         └── Shows REAL-TIME notifications (SignalR)
               User clicks one:
                 ├─ markRealtimeRead(notification.id)
                 │   Marks it read in local state
                 │   (no server call needed — in-memory only)
                 └─ If groupId present: navigate("/groups/groupId")
```

**The smart part:** The system never tracks individual notices as read/unread. It just remembers *when you last looked at a channel*. Any post made after that timestamp is "unread". This is simpler, faster, and works no matter how many notices there are.

---

### 6.7 Group Background Images

Groups can have a custom banner image — like a classroom photo or a subject-themed picture. Think of it as the "cover photo" of your group page.

**Setting an image when creating a group:**

```
POST /api/Groups  [multipart/form-data]
  Fields:
    • Name: "Grade 10 Mathematics"
    • Description: "..."
    • StudentIds: [id1, id2, ...]
    • BackgroundImage: (image file)  ← optional
         │
         ▼
GroupService.CreateGroupAsync()
  If BackgroundImage is provided:
    └─ fileStorage.SaveAsync(file, FileCategory.Image)
         ├─ Validates it's an image type (JPEG, PNG, etc.)
         ├─ Generates UUID filename: "d4e5f6a7-....jpg"
         └─ Saves to wwwroot/uploads/d4e5f6a7-....jpg

    └─ Stores "d4e5f6a7-....jpg" in Group.BackgroundImage
```

**Changing or removing the image later:**

```
EditGroup page → PUT /api/Groups/{id}  [multipart/form-data]
  UpdateGroupRequest contains:
    • Name / Description (optional changes)
    • BackgroundImage: new image file (optional)
    • RemoveBackgroundImage: true/false (optional)

Three scenarios:
  ┌─────────────────────────────────────────────────────────┐
  │  Scenario A: Uploading a NEW image                      │
  │    BackgroundImage = new file                           │
  │    RemoveBackgroundImage = false (or not sent)          │
  │                                                         │
  │    → Delete old image file from disk (if any)           │
  │    → Save new image file with new UUID name             │
  │    → Update Group.BackgroundImage = new UUID filename   │
  └─────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────┐
  │  Scenario B: Removing the image entirely                │
  │    BackgroundImage = null (nothing sent)                │
  │    RemoveBackgroundImage = true                         │
  │                                                         │
  │    → Delete old image file from disk                    │
  │    → Set Group.BackgroundImage = null                   │
  └─────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────┐
  │  Scenario C: Keeping existing image                     │
  │    BackgroundImage = null (nothing sent)                │
  │    RemoveBackgroundImage = false (or not sent)          │
  │                                                         │
  │    → Do nothing — image stays exactly as it was         │
  └─────────────────────────────────────────────────────────┘
```

The stored UUID filename is included in all group list (`GET /api/Groups`) and group detail (`GET /api/Groups/{id}`) responses. The frontend GroupsList and GroupDetail pages use this filename to display the image as a full-width banner at the top of the group card/page.

---

### 6.8 Group Management Flow

Groups are the heart of the system — they are the "classrooms". Here is everything you can do with groups and how each action works.

**Creating a group:**

```
Teacher/Admin fills in:
  • Group name (e.g. "Grade 10 Science")
  • Description (optional)
  • Initial student list (optional — can add later)
  • Background image (optional)
         │
         ▼
POST /api/Groups
         │
         ▼
GroupService.CreateGroupAsync()
  ├─ Creates Group record:
  │    • Name, Description
  │    • CreatedById = current teacher's ID
  │    • IsActive = true
  │    • CreatedAt = now
  │    • BackgroundImage = UUID filename (or null)
  └─ For each studentId in the initial list:
       Creates GroupMember record:
         • GroupId, StudentId
         • AddedById = current teacher
         • AddedAt = now
         • RemovedAt = null (active)
```

**What different users see when listing groups:**

```
GET /api/Groups
         │
         ▼
GroupService.GetGroupsAsync()
  ├─ User is Admin:
  │    → Return ALL active groups (IsActive = true)
  │
  ├─ User is Teacher:
  │    → Return groups WHERE:
  │         CreatedById = this teacher  (their own groups)
  │      OR GroupManagers has UserId = this teacher (co-managed)
  │
  └─ User is Student:
       → Return groups WHERE:
            GroupMembers has StudentId = this student
            AND RemovedAt IS NULL  (still an active member)
```

**Adding students to a group:**

```
Teacher selects students → POST /api/Groups/{id}/members
  { studentIds: [id1, id2, id3] }
         │
         ▼
GroupService.AddMembersAsync()
  Step 1: Check teacher has permission to manage this group
  Step 2: For each submitted studentId:
    ├─ Is there already an active GroupMember record?
    │   (GroupId = this group AND StudentId = this student
    │    AND RemovedAt IS NULL)
    │   If yes: SKIP — already in group
    │
    └─ If not: create new GroupMember record (AddedAt = now)

  Returns: { added: 2, skipped: 1 }
  (so the teacher knows which were new vs already members)
```

**Removing a student:**

```
DELETE /api/Groups/{id}/members/{studentId}
         │
         ▼
GroupService.RemoveMemberAsync()
  Sets GroupMember.RemovedAt = now  ← SOFT DELETE

  The record is NOT deleted from the database.
  This preserves the history: "this student was in this group
  from May 1 until September 10."

  Student immediately loses access to the group and its content.
  If re-added later: a brand new GroupMember record is created.
```

**Adding a co-teacher (group manager):**

```
Group creator/Admin selects a teacher
  → POST /api/Groups/{id}/managers
    { teacherIds: [teacherId] }
         │
         ▼
GroupService.AddManagersAsync()
  Check: only group creator OR Admin can add managers
  Check: cannot add the group creator again (already the owner)
  Creates GroupManager record:
    • GroupId, UserId (the co-teacher), AssignedAt = now

Co-teacher can now:
  ✓ Post notices and assignments to this group
  ✓ Add/remove students
  ✗ Cannot add/remove other managers (only creator/Admin can)
```

**Removing a co-teacher:**

```
DELETE /api/Groups/{id}/managers/{teacherId}
  → Deletes the GroupManager record
  → Co-teacher immediately loses posting access
```

**Deleting a group:**

```
DELETE /api/Groups/{id}
         │
         ▼
GroupService.DeleteGroupAsync()
  Sets Group.IsActive = false  ← SOFT DELETE

  Data is preserved in the database.
  Group disappears from all users' lists immediately.
  (No UI to restore it — only a developer/DB admin could)
```

**Editing a group:**

```
PUT /api/Groups/{id}  [multipart/form-data]
  Can update: Name, Description, BackgroundImage
  (see Section 6.7 for image handling details)
```

---

### 6.9 Assignment Flow (Full Lifecycle)

This is the most complex feature. It follows an assignment from the moment a teacher creates it all the way to feedback being sent to a student.

**Step 1 — Teacher posts an assignment:**

```
Teacher is inside a group's detail page
  Clicks "New Post" → selects "Assignment" type
  Fills in:
    • Title (required)
    • File attachment (required for assignments)
    • Due Date (optional)
    • Submission Mode:
        Physical  → students bring paper copies; teacher ticks
        Online    → students upload files through the app
        Both      → both methods accepted simultaneously
    • Auto-Delete Date (optional)
         │
         ▼
POST /api/Groups/{id}/posts  [multipart/form-data]
         │
         ▼
GroupPostService.CreatePostAsync()
  ├─ Check: does this teacher have permission to post here?
  │   (must be creator, co-manager, or Admin)
  ├─ Check: title is not empty
  ├─ Check: file is attached (required for Assignment type)
  ├─ Parse SubmissionMode string → enum value
  │   ("Physical" → 0, "Online" → 1, "Both" → 2)
  ├─ Save file: fileStorage.SaveAsync(file, FileCategory.Document)
  │   → Validates file type + size
  │   → Generates UUID filename
  │   → Saves to wwwroot/uploads/
  └─ Creates GroupPost record:
       • Type = "Assignment"
       • Title, FileName, OriginalFileName
       • DueDate, AutoDeleteAt, SubmissionMode
       • PostedById = current teacher
       • PostedAt = now
         │
         ▼
After saving:
  Fetches all group member IDs + manager IDs + creator ID
  Excludes the poster from the list
         │
         ▼
RealtimeNotifier.NotifyGroupPostAsync(groupId, recipientIds, post)
  → SignalR pushes "groupPost" event to all recipients
  → Their browsers receive the event immediately
  → RTK Query cache invalidated → post list refreshes
```

**Step 2 — Students see the assignment:**

```
Student opens the group page
         │
         ▼
GET /api/Groups/{id}/posts
         │
         ▼
GroupPostService.GetPostsAsync()
  Students see ALL assignments — including past-due ones.
  (Changed from old behavior where past-due were hidden)
  
  BUT: submission is blocked server-side if due date has passed.
  Students can read the assignment details but cannot submit.

  Each post in the response includes:
    HasSubmitted: true/false
    → true ONLY if the teacher has physically ticked "submitted"
    → uploading a file online does NOT set this to true
    → this is the official "handed in" marker
```

**Step 3A — Physical submission tracking (teacher side):**

```
Teacher opens the submissions dialog for an assignment
         │
         ▼
GET /api/Groups/{id}/posts/{postId}/submissions
         │
         ▼
AssignmentSubmissionService.GetSubmissionsAsync()
  Returns ALL current group members with:
    • StudentId, FullName, Profile picture
    • Status: Submitted / NotSubmitted
    • SubmittedAt: when teacher ticked it (or null)
    • FileName: online submission file (or null)
    • OnlineSubmittedAt: when student uploaded (or null)
    • Feedback: any text feedback from teacher (or null)

Teacher sees a student handed in their paper homework
Clicks the checkbox next to that student's name
         │
         ▼
PUT /api/Groups/{id}/posts/{postId}/submissions/{studentId}
  { submitted: true }
         │
         ▼
AssignmentSubmissionService.SetSubmissionStatusAsync()
  ├─ Look for existing AssignmentSubmission record
  │   (GroupPostId = postId AND StudentId = studentId)
  ├─ If not found: create a new record
  └─ Set Status = Submitted, SubmittedAt = now
     (or Status = NotSubmitted, SubmittedAt = null if unticking)
```

**Step 3B — Online submission (student side):**

```
Student sees the assignment card with "Submit Online" button
Selects a file from their computer
Clicks "Submit"
         │
         ▼
POST /api/Groups/{id}/posts/{postId}/submissions/online
  [multipart/form-data: File = selected file]
         │
         ▼
AssignmentSubmissionService.SubmitOnlineWorkAsync()
  ├─ Check 1: Does this post exist and is it an Assignment?
  ├─ Check 2: Does SubmissionMode allow online?
  │   If Physical only: return 400 "No online submissions allowed"
  ├─ Check 3: Is due date already passed?
  │   If yes: return 400 "Submission deadline has passed"
  ├─ Check 4: Is this student an active group member?
  │   If not: return 403 Forbidden
  ├─ Check 5: Is a file actually provided?
  │
  ├─ Look up existing submission record for this student
  │   If student is RE-submitting:
  │     └─ Delete old file from disk
  │   If first submission:
  │     └─ Create new AssignmentSubmission record
  │
  └─ Save new file to disk (UUID filename)
     Update record:
       • FileName = new UUID filename
       • OriginalFileName = "homework.pdf"
       • OnlineSubmittedAt = now
       • (Status is NOT changed — uploading ≠ physically submitted)
         │
         ▼
After saving:
  RealtimeNotifier.NotifyAssignmentSubmissionAsync(teacherIds, payload)
  → All teachers of this group get a bell notification immediately
  → "John Doe submitted: Math Chapter 5 Assignment"
         │
         ▼
Response returns:
  { originalFileName: "homework.pdf", onlineSubmittedAt: "..." }
         │
         ▼
Frontend shows "Submitted ✓" state on the assignment card
```

**Important distinction:**

```
HasSubmitted (in GET posts response) = true
  ONLY when teacher clicks the checkbox in the submission tracker.
  This is the "official" submitted marker.

Student uploads a file online
  → FileName + OnlineSubmittedAt are recorded
  → BUT HasSubmitted remains false until teacher ticks it
  
Why? The teacher still needs to verify and acknowledge
the submission. Online upload is just "sent to teacher".
```

**Step 4 — Teacher gives feedback:**

```
Teacher is in the submissions dialog
Sees a student's submission
Clicks "Add feedback" → inline textarea appears
Types feedback → clicks Save
         │
         ▼
PUT /api/Groups/{id}/posts/{postId}/submissions/{studentId}/feedback
  { feedback: "Good work! Fix the calculation on page 2." }
         │
         ▼
AssignmentSubmissionService.SetSubmissionFeedbackAsync()
  ├─ Find or create AssignmentSubmission record
  └─ Save feedback text to Feedback field
         │
         ▼
If feedback text is not empty:
  RealtimeNotifier.NotifyAssignmentFeedbackAsync(studentId, payload)
  → That one student gets a bell notification immediately
  → "Your teacher left feedback on: Math Chapter 5 Assignment"
         │
         ▼
Student reads their feedback:
  GET /api/Groups/{id}/posts/{postId}/submissions/me
  Returns their own submission status + feedback text
```

**Step 5 — Auto expiry:**

```
When any of these endpoints are called:
  • GET /api/Groups/{id}/posts
  • GET /api/Groups/my-assignments

GroupPostService.RemoveExpiredAsync() runs automatically:
  SELECT * FROM GroupPosts WHERE AutoDeleteAt <= NOW()
    For each expired post:
      ├─ Delete the attached file from wwwroot/uploads/
      └─ Delete the GroupPost record from database

There is no background timer or scheduled job.
Cleanup happens lazily — the next time someone fetches posts.
A post might live a few minutes past its expiry time, but in
practice this is invisible and unimportant.
```

---

### 6.10 Dashboard Flow — How Data Is Shown

Each role gets a personalized dashboard when they log in. Think of it as a "summary board" showing the most important numbers and recent activity for that person.

**Admin Dashboard — `GET /api/Dashboard/admin`:**

```
The admin sees the whole school at a glance:

┌───────────────────────────────────────────────────────────┐
│  COUNTS & STATS                                           │
│                                                           │
│  totalTeachers: COUNT(Teachers WHERE Role != 'Admin')     │
│  totalAdmins:   COUNT(Teachers WHERE Role = 'Admin')      │
│  totalStudents: COUNT(all Students)                       │
│  activeGroups:  COUNT(Groups WHERE IsActive = true)       │
│  inactiveGroups: COUNT(Groups WHERE IsActive = false)     │
│  totalNotices:    COUNT(GroupPosts WHERE Type = 'Notice') │
│  totalAssignments: COUNT(GroupPosts WHERE Type = 'Assignment') │
│  newStudentsThisWeek: COUNT(Students created in last 7d)  │
│  newTeachersThisWeek: COUNT(Teachers created in last 7d)  │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│  INSIGHTS                                                 │
│                                                           │
│  genderBreakdown:                                         │
│    GROUP BY Gender on Students table                      │
│    e.g. [{ gender: "Male", count: 45 },                   │
│           { gender: "Female", count: 38 },                │
│           { gender: null, count: 12 }]                    │
│                                                           │
│  groupsMissingCoTeacher:                                  │
│    Active groups with zero GroupManager records           │
│    (so admin knows which groups have no backup teacher)   │
│                                                           │
│  averageGroupSize:                                        │
│    Total active GroupMember records (RemovedAt IS NULL)   │
│    ÷ Total active groups                                  │
│    e.g. 127 memberships / 8 groups = 15.9 avg             │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│  RECENT ACTIVITY                                          │
│                                                           │
│  recentActivity: 8 most recent GroupPosts                 │
│    across ALL groups in the system                        │
│    ORDER BY PostedAt DESC LIMIT 8                         │
│                                                           │
│  upcomingAssignments: next 5 assignments                  │
│    WHERE DueDate >= NOW()                                 │
│    ORDER BY DueDate ASC LIMIT 5                           │
└───────────────────────────────────────────────────────────┘
```

**Teacher Dashboard — `GET /api/Dashboard/teacher`:**

```
The teacher sees only their own world:

┌───────────────────────────────────────────────────────────┐
│  COUNTS & STATS                                           │
│                                                           │
│  totalGroups:   groups where teacher is creator           │
│                 OR co-manager                             │
│  ownedGroups:   groups where CreatedById = this teacher   │
│  coManagedGroups: groups in GroupManagers for this teacher │
│                                                           │
│  totalStudents: DISTINCT student IDs across ALL their     │
│    groups (using UNION of member IDs)                     │
│    If student X is in 2 of your groups → counts as 1     │
│                                                           │
│  totalNotices: GroupPosts WHERE Type = 'Notice'           │
│    in groups they manage                                  │
│                                                           │
│  totalAssignmentsPosted: GroupPosts WHERE                 │
│    PostedById = this teacher (only their own posts)       │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│  RECENT ACTIVITY                                          │
│                                                           │
│  recentActivity: 8 most recent posts from groups          │
│    this teacher manages                                   │
│                                                           │
│  upcomingAssignments: their assignments with              │
│    DueDate >= NOW() (future deadlines)                    │
│                                                           │
│  myGroups: up to 6 of their groups, each with:           │
│    • member count                                         │
│    • isOwner: true (they created it) or false (co-manage)│
└───────────────────────────────────────────────────────────┘
```

**Student Dashboard — `GET /api/Dashboard/student`:**

```
The student sees what they need to do:

┌───────────────────────────────────────────────────────────┐
│  COUNTS & STATS                                           │
│                                                           │
│  totalGroups: active GroupMember records for this student │
│                                                           │
│  totalAssignments: PENDING assignments — this means:      │
│    • Assignments in the student's groups                  │
│    • NOT past due (DueDate >= NOW() OR DueDate IS NULL)   │
│    • Student has NOT submitted yet                        │
│        (no AssignmentSubmission record with               │
│         Status = Submitted for this student)              │
│    This is the "things I still need to hand in" count     │
│                                                           │
│  totalNotices: GroupPosts WHERE Type = 'Notice'           │
│    from the student's groups                              │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│  RECENT ACTIVITY                                          │
│                                                           │
│  recentActivity: 8 most recent posts from their groups    │
│    Filtered to exclude:                                   │
│      • Assignments the student has already submitted      │
│      • Assignments that are past their due date           │
│    (shows relevant, actionable items only)                │
│                                                           │
│  upcomingAssignments: pending assignments with the        │
│    soonest due dates (the most urgent ones first)         │
│                                                           │
│  myGroups: up to 6 of their enrolled groups               │
└───────────────────────────────────────────────────────────┘
```

---

### 6.11 Global Announcements Flow

Global Notices are messages sent to **every single user** in the system — not just one group. Think of it as the school intercom: when the principal makes an announcement, everyone hears it.

Only Admins can post global announcements.

**Admin creates an announcement:**

```
Admin fills in the form:
  • Title (required)
  • Message / Content (optional — but content OR file is required)
  • File attachment (optional)
  • Auto-Delete Date (optional — announcement expires automatically)
         │
         ▼
POST /api/GlobalNotices  [multipart/form-data]
         │
         ▼
GlobalNoticeService.CreateNoticeAsync()
  ├─ Validate: title is not empty
  ├─ Validate: at least content or a file must be present
  │   (can't post a completely empty announcement)
  ├─ Validate: if autoDeleteAt is set, it must be in the future
  │
  ├─ If file attached:
  │   fileStorage.SaveAsync(file, FileCategory.Document)
  │   → UUID filename saved to GlobalNotice.FileName
  │   → Original name saved to OriginalFileName
  │
  └─ Creates GlobalNotice record in database:
       • Title, Content, FileName, OriginalFileName
       • PostedById = Admin's ID
       • AutoDeleteAt (if set)
       • PostedAt = now
         │
         ▼
RealtimeNotifier.NotifyGlobalNoticeAsync(notice)
  → hub.Clients.All.SendAsync("globalNotice", payload)
  → Every browser connected to SignalR receives this instantly
  → Their RTK Query global notice cache is invalidated
  → If /GlobalNotices page is open anywhere: auto-refreshes
```

**Everyone views announcements:**

```
Any logged-in user visits /GlobalNotices
         │
         ▼
GET /api/GlobalNotices
         │
         ▼
GlobalNoticeService.GetNoticesAsync()
  ├─ Step 1: RemoveExpiredAsync() runs first
  │   Checks: WHERE AutoDeleteAt <= NOW()
  │   Deletes expired notices (file from disk + DB record)
  │
  └─ Step 2: Return all remaining notices
       ORDER BY PostedAt DESC (newest first)
```

**Admin deletes an announcement:**

```
Admin clicks "Delete" on an announcement
         │
         ▼
DELETE /api/GlobalNotices/{id}
         │
         ▼
GlobalNoticeService.DeleteNoticeAsync()
  ├─ fileStorage.Delete(notice.FileName)  ← removes file from disk
  └─ Remove GlobalNotice record from database
```

**Downloading an attachment:**

```
User clicks the download link on an announcement
         │
         ▼
GET /api/GlobalNotices/{id}/download
         │
         ▼
GlobalNoticeService.DownloadNoticeAsync()
  ├─ fileStorage.ReadAsync(notice.FileName)  ← reads file bytes
  └─ Returns: File(bytes, "application/octet-stream",
                    notice.OriginalFileName)
     Browser saves the file with the original name
     (e.g. "School_Holiday_Schedule.pdf")
```

**Auto-delete works the same way as group posts** — there's no background timer. Expired announcements are cleaned up the next time anyone fetches the announcements list. This is simple, reliable, and requires no extra infrastructure.
