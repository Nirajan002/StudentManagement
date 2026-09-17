# StudentGrid — Complete Project Documentation

> A full-stack Student Management System built for schools and educational institutions.
> Teachers manage groups, post assignments and notices; students receive and submit work; admins oversee everything.

---

## Table of Contents

1. [What Is This Project?](#1-what-is-this-project)
2. [Technology Stack — Plain English](#2-technology-stack--plain-english)
3. [How to Run the Project](#3-how-to-run-the-project)
4. [User Roles & What Each Can Do](#4-user-roles--what-each-can-do)
5. [Database Design & Relationships](#5-database-design--relationships)
6. [Feature Flows (Step-by-Step)](#6-feature-flows-step-by-step)
   - 6.1 [Login & Authentication Flow](#61-login--authentication-flow)
   - 6.2 [Email Verification Flow](#62-email-verification-flow)
   - 6.3 [Forgot Password Flow](#63-forgot-password-flow)
   - 6.4 [Notification Bell Flow](#64-notification-bell-flow)
   - 6.5 [Global Announcements Flow](#65-global-announcements-flow)
   - 6.6 [Group Management Flow](#66-group-management-flow)
   - 6.7 [Assignment Flow (Full Lifecycle)](#67-assignment-flow-full-lifecycle)
   - 6.8 [Online Assignment Submission Flow](#68-online-assignment-submission-flow)
   - 6.9 [Dashboard Flow](#69-dashboard-flow)
7. [Backend — Every File Explained](#7-backend--every-file-explained)
   - 7.1 [Data Models (Modules)](#71-data-models-modules)
   - 7.2 [Services](#72-services)
   - 7.3 [Controllers (API Endpoints)](#73-controllers-api-endpoints)
   - 7.4 [DTOs (Data Transfer Objects)](#74-dtos-data-transfer-objects)
   - 7.5 [Program.cs — Application Startup](#75-programcs--application-startup)
8. [Frontend — Every File Explained](#8-frontend--every-file-explained)
   - 8.1 [App.tsx — Routes](#81-apptsx--routes)
   - 8.2 [Redux Store & API Slices](#82-redux-store--api-slices)
   - 8.3 [Pages](#83-pages)
   - 8.4 [Components](#84-components)
9. [Security — How It Works](#9-security--how-it-works)
10. [File Upload System](#10-file-upload-system)
11. [Auto-Delete Feature](#11-auto-delete-feature)
12. [Frequently Asked Questions](#12-frequently-asked-questions)

---

## 1. What Is This Project?

**StudentGrid** is a web application for schools. It replaces paper-based notice boards, physical assignment tracking, and scattered communication with a single digital platform.

**The core idea:**
- The **Admin** sets up the system, registers teachers, and adds students.
- **Teachers** create class groups, add students, post assignments and notices to those groups.
- **Students** log in, see their groups, view assignments, and submit their work.
- Everyone gets **notifications** when new notices or assignments are posted.

Think of it like a simplified Google Classroom, built entirely from scratch.

---

## 2. Technology Stack — Plain English

### Backend (Server Side)
| Technology | What It Is | Why It's Used |
|---|---|---|
| **ASP.NET Core 10** | Microsoft's web framework | Runs the server, handles API requests |
| **C#** | Programming language | Writes the backend logic |
| **Entity Framework Core** | Database toolkit | Talks to the database without writing raw SQL |
| **SQL Server (LocalDB)** | Database | Stores all data (users, groups, assignments, etc.) |
| **JWT (JSON Web Tokens)** | Authentication standard | Keeps users logged in securely |
| **SMTP (Gmail)** | Email protocol | Sends OTP codes for verification |

### Frontend (Client Side / What Users See)
| Technology | What It Is | Why It's Used |
|---|---|---|
| **React 19** | JavaScript UI library | Builds the interactive pages |
| **TypeScript** | Typed JavaScript | Prevents bugs through type safety |
| **Vite** | Build tool | Makes development fast |
| **Redux Toolkit (RTK Query)** | State/data management | Fetches data from the server and caches it |
| **Tailwind CSS v4** | CSS framework | Styles the UI quickly |
| **shadcn/ui** | UI component library | Ready-made accessible buttons, dialogs, etc. |
| **React Router v7** | URL routing | Navigates between pages |
| **lucide-react** | Icon library | Icons throughout the UI |

---

## 3. How to Run the Project

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)
- [SQL Server LocalDB](https://learn.microsoft.com/en-us/sql/database-engine/configure-windows/sql-server-express-localdb) (comes with Visual Studio)

### Backend Setup
```bash
# Navigate to the backend project
cd backend/backend

# Restore NuGet packages
dotnet restore

# Apply all database migrations (creates the database automatically)
dotnet ef database update

# Run the server (listens on https://localhost:7014)
dotnet run
```

On first run, the server automatically creates a default **Admin** account:
- **Email:** `admin@example.com`
- **Password:** `admin123`

> Change this password immediately in a production environment.

### Frontend Setup
```bash
# Navigate to the frontend
cd frontend

# Install dependencies
npm install

# Start the development server (opens at http://localhost:5173)
npm run dev
```

### Configuration
Backend settings are in `backend/backend/appsettings.json`:
- **Database connection** — `ConnectionStrings:ManagementDbConnection`
- **JWT secret** — `Jwt:Key` (change this in production!)
- **Email (SMTP)** — `Smtp:*` section (currently configured for Gmail)

---

## 4. User Roles & What Each Can Do

The system has three roles. Every user is exactly one of these.

### Admin
The administrator of the whole system. There is only one Admin (or a small team).

**Can do everything a Teacher can, plus:**
- See all groups (not just their own)
- Register new teachers
- Add new students
- Edit or delete any teacher/student account
- Post global announcements to every user
- Delete any group, post, or content regardless of who created it
- See full admin dashboard with system-wide statistics

### Teacher
A teacher who manages one or more class groups.

**Can:**
- Create groups and add students to them
- Add other teachers as co-managers to their groups
- Post notices (text announcements) to a group
- Post assignments (with files, due dates, submission settings)
- Track which students submitted assignments physically
- View online submissions uploaded by students
- See their own dashboard with their groups and assignments
- View any teacher's or student's profile

**Cannot:**
- Access groups they don't own or co-manage
- See other teachers' online submissions list
- Post global announcements (Admin only)

### Student
A student enrolled in one or more class groups.

**Can:**
- Log in and see their own dashboard
- View groups they are a member of
- See notices and open assignments in their groups
- Upload their assignment online (if allowed)
- Download assignment files
- View their own submission status
- Update their own profile

**Cannot:**
- See groups they are not a member of
- Post content of any kind
- See other students' submissions

---

## 5. Database Design & Relationships

Below is every database table and how they connect to each other.

```
┌─────────────┐        ┌──────────────────┐        ┌─────────────┐
│   Teacher   │        │      Group       │        │   Student   │
│─────────────│        │──────────────────│        │─────────────│
│ Id (PK)     │◄───────│ CreatedById (FK) │        │ Id (PK)     │
│ FullName    │        │ Id (PK)          │        │ FullName    │
│ Email       │        │ Name             │        │ Email       │
│ Password    │        │ Description      │        │ Password    │
│ Role        │        │ IsActive         │        │ Role        │
│ Gender      │        │ CreatedAt        │        │ Gender      │
│ Number      │        └──────────────────┘        │ Class       │
│ Address     │                │                   │ Section     │
│ Profile     │                │ has many           │ EmailVer.   │
│ EmailVerif. │                ▼                   └─────────────┘
│ PendingEmail│        ┌──────────────────┐               │
│ CreatedAt   │        │   GroupMember    │◄──────────────┘
└─────────────┘        │──────────────────│  StudentId (FK)
       │               │ Id (PK)          │
       │               │ GroupId (FK)     │
       │               │ StudentId (FK)   │
       │               │ AddedById (FK)   │──────► Teacher
       │               │ AddedAt          │
       │               │ RemovedAt        │  (null = still active member)
       │               └──────────────────┘
       │
       │               ┌──────────────────┐
       └──────────────►│  GroupManager    │  (co-teachers)
                       │──────────────────│
                       │ Id (PK)          │
                       │ GroupId (FK)     │──► Group
                       │ UserId (FK)      │──► Teacher
                       │ AssignedAt       │
                       └──────────────────┘

       ┌──────────────────────────────────────────────┐
       │                  GroupPost                   │
       │──────────────────────────────────────────────│
       │ Id (PK)                                      │
       │ GroupId (FK)  ──────────────────────► Group  │
       │ PostedById (FK) ────────────────────► Teacher│
       │ Type          ("Notice" or "Assignment")     │
       │ Title                                        │
       │ Content       (text body for notices)        │
       │ FileName      (stored file name on disk)     │
       │ OriginalFileName (shown to user on download) │
       │ DueDate       (assignments only)             │
       │ AutoDeleteAt  (optional auto-expiry)         │
       │ SubmissionMode (Physical/Online/Both)        │
       │ PostedAt                                     │
       └──────────────────────────────────────────────┘
                              │
                              │ one assignment has many submissions
                              ▼
       ┌──────────────────────────────────────────────┐
       │             AssignmentSubmission             │
       │──────────────────────────────────────────────│
       │ Id (PK)                                      │
       │ GroupPostId (FK) ──────────────► GroupPost   │
       │ StudentId (FK)  ───────────────► Student     │
       │ Status          (Submitted/NotSubmitted)     │
       │ SubmittedAt     (physical — set by teacher)  │
       │ FileName        (online — student upload)    │
       │ OriginalFileName                             │
       │ OnlineSubmittedAt                            │
       └──────────────────────────────────────────────┘

       ┌──────────────────────────────────────────────┐
       │               GlobalNotice                  │
       │──────────────────────────────────────────────│
       │ Id (PK)                                      │
       │ PostedById (FK) ────────────────► Teacher    │
       │ Title                                        │
       │ Content                                      │
       │ FileName        (optional attachment)        │
       │ AutoDeleteAt                                 │
       │ PostedAt                                     │
       └──────────────────────────────────────────────┘

       ┌──────────────────────────────────────────────┐
       │                 ReadState                    │
       │  (tracks when a user last viewed a channel)  │
       │──────────────────────────────────────────────│
       │ Id (PK)                                      │
       │ UserId          (Teacher or Student)         │
       │ ChannelType     (GlobalNotices / Group)      │
       │ GroupId         (null for GlobalNotices)     │
       │ LastReadAt                                   │
       └──────────────────────────────────────────────┘

       ┌──────────────────────────────────────────────┐
       │                  OtpCode                    │
       │  (stores email verification/password reset) │
       │──────────────────────────────────────────────│
       │ Id (PK)                                      │
       │ UserId                                       │
       │ UserType        ("Teacher" or "Student")     │
       │ Purpose         (EmailVerification / PasswordReset) │
       │ CodeHash        (SHA-256 hash, never plain)  │
       │ CreatedAt / ExpiresAt / ConsumedAt           │
       │ Attempts        (max 5 tries allowed)        │
       └──────────────────────────────────────────────┘

       ┌──────────────────────────────────────────────┐
       │               RefreshToken                  │
       │──────────────────────────────────────────────│
       │ Id (PK)                                      │
       │ Token           (random secure string)       │
       │ TeacherId (FK)  (one of these is set)        │
       │ StudentId (FK)  (the other is null)          │
       │ ExpiresAt                                    │
       └──────────────────────────────────────────────┘
```

### Key Rules in the Database
- A student **cannot be added twice** to the same group (unique index on GroupId + StudentId when RemovedAt is null).
- Each user can only have **one ReadState per channel** (unique index on UserId + ChannelType + GroupId).
- Each student has **one submission record per assignment** (unique index on GroupPostId + StudentId).
- Soft deletion is used for group membership — `RemovedAt` is set instead of actually deleting the row. This preserves audit history.
- Groups are soft-deleted too — `IsActive = false` instead of actual deletion.

---

## 6. Feature Flows (Step-by-Step)

### 6.1 Login & Authentication Flow

**What happens when you click "Login":**

```
User enters email + password
         │
         ▼
Frontend sends POST /api/Auth/login
         │
         ▼
AuthService.LoginAsync()
  ├─ Searches Teachers table for the email
  ├─ If found: verifies the hashed password
  │    └─ If correct: creates JWT access token + refresh token
  │         ├─ JWT stored in HttpOnly cookie "token" (expires in 1 hour)
  │         └─ Refresh token stored in HttpOnly cookie "refreshToken"
  │              └─ Refresh token saved to RefreshTokens table (expires in 1 hour)
  │
  └─ If not found in Teachers: searches Students table
       └─ Same process as above
         │
         ▼
Frontend receives { user: { id, fullName, email, role, profile, emailVerified } }
         │
         ▼
React Router redirects based on role:
  ├─ Admin → /AdminIndex
  ├─ Teacher → /TeacherIndex
  └─ Student → /StudentIndex
```

**What is an HttpOnly cookie?**
A cookie that JavaScript cannot read. This protects the login token from being stolen by malicious scripts (XSS attacks). Only the browser sends it automatically with every request.

**What is a JWT (JSON Web Token)?**
A digitally signed string that contains the user's ID, name, email, and role. The server can verify it was genuine without checking the database every time.

**Token refresh:**
When the 1-hour JWT expires, the frontend automatically calls `POST /api/Auth/refresh` using the refresh token cookie. This gets a fresh JWT without forcing the user to log in again. If the refresh token is also expired, the user is redirected to the login page.

---

### 6.2 Email Verification Flow

Every new account must verify their email before certain features are fully unlocked.

```
User goes to /VerifyEmail page
         │
         ▼
Clicks "Send Code" button
  → Frontend: POST /api/Auth/verification/send
         │
         ▼
AuthService.SendEmailVerificationAsync()
  ├─ Checks 60-second cooldown (can't spam "send" button)
  ├─ Generates a 6-digit random code (e.g. "482910")
  ├─ SHA-256 hashes the code → stores ONLY the hash in OtpCodes table
  ├─ Sets expiry to 10 minutes from now
  └─ Sends email via Gmail SMTP: "Your code is 482910"
         │
         ▼
User receives email, enters the code
  → Frontend: POST /api/Auth/verification/confirm { code: "482910" }
         │
         ▼
AuthService.ConfirmEmailVerificationAsync()
  ├─ Finds the latest unconsumed OTP for this user
  ├─ Checks it hasn't expired
  ├─ Checks attempts < 5 (brute-force protection)
  ├─ Hashes the submitted code and compares to stored hash
  ├─ If match: marks OTP as consumed, sets EmailVerified = true
  └─ If the user had a PendingEmail set: moves it to Email field
```

**Why hash the OTP code?**
If the database is ever stolen, attackers cannot see the actual codes — only their hashes. This is the same principle as password hashing.

**Changing email during verification:**
If a user entered the wrong email, they can click "Use a different email". This stores the new address in `PendingEmail` and sends a fresh code there. Only after successful verification does `PendingEmail` become the real `Email`.

---

### 6.3 Forgot Password Flow

```
User clicks "Forgot Password" on the login page
         │
         ▼
Enters email → POST /api/Auth/password/forgot
         │
         ▼
AuthService.RequestPasswordResetAsync()
  ├─ Looks up email in Teachers and Students tables
  ├─ If not found: returns "OK" anyway (doesn't reveal if account exists)
  ├─ If found but email not verified: silently does nothing
  ├─ Enforces 60-second cooldown
  ├─ Generates 6-digit code, hashes it, saves to OtpCodes
  └─ Sends email: "Your password reset code is 123456"
         │
         ▼
User enters code + new password → POST /api/Auth/password/reset
         │
         ▼
AuthService.ResetPasswordAsync()
  ├─ Verifies email + code match (same hashing check as above)
  ├─ Checks max 5 attempts
  └─ Re-hashes and saves the new password
```

---

### 6.4 Notification Bell Flow

The bell icon in the top navigation bar shows a red badge with unread notice count.

```
┌─────────────────────────────────────────────────────────────────┐
│                      NOTIFICATION BELL                         │
│                                                                 │
│  On every page render, NotificationBell.tsx fetches:           │
│  ├─ GET /api/Groups/notices       → recent group notices        │
│  ├─ GET /api/Groups/last-viewed   → when user last viewed each  │
│  │                                   group (map of groupId→time)│
│  ├─ GET /api/GlobalNotices        → all global announcements    │
│  └─ GET /api/GlobalNotices/last-viewed → when user last saw them│
│                                                                 │
│  Two utility functions compare timestamps:                      │
│  ├─ getUnreadNotices(groupNotices, lastViewedMap)               │
│  │    For each group notice: if notice.postedAt > lastViewedAt  │
│  │    for that group → it is "unread"                           │
│  │                                                              │
│  └─ getUnreadGlobalNotices(globalNotices, globalLastViewed)     │
│       If notice.postedAt > globalLastViewed → unread            │
│                                                                 │
│  Total unread = unread group notices + unread global notices    │
│  Badge shows this number (capped at "9+")                       │
└─────────────────────────────────────────────────────────────────┘

User clicks the bell:
  → Popover opens showing all unread notices
  → Each notice is clickable

User clicks a GROUP notice:
  → Navigates to /groups/{groupId}
  → On arrival, GroupDetail page calls POST /api/Groups/{id}/mark-viewed
  → ReadStateService.MarkViewedAsync() saves LastReadAt = now for that group
  → Next time bell loads, those notices are no longer "unread"

User clicks a GLOBAL notice:
  → markGlobalViewed() called immediately
  → POST /api/GlobalNotices/mark-viewed
  → ReadStateService.MarkViewedAsync() saves LastReadAt for GlobalNotices channel
  → Navigates to /GlobalNotices page
```

**The smart part:** The system doesn't track individual notices as "read". Instead it just remembers *when* you last visited a channel. Any notice posted *after* that time is "unread". This is simpler, faster, and scales to any number of notices.

---

### 6.5 Global Announcements Flow

Global Notices are announcements sent to ALL users in the system, regardless of which group they are in.

```
ADMIN CREATES ANNOUNCEMENT:
  Admin fills form: Title, Message, optional file, optional auto-delete date
         │
         ▼
  POST /api/GlobalNotices (FormData with title, content, file, autoDeleteAt)
         │
         ▼
  GlobalNoticeService.CreateNoticeAsync()
    ├─ Validates title is not empty
    ├─ Validates content or file is present (can't post completely empty notice)
    ├─ Validates autoDeleteAt is in the future (if set)
    ├─ Saves file to disk (wwwroot/uploads/)
    └─ Inserts GlobalNotice record into database

EVERYONE SEES THE ANNOUNCEMENT:
  Any logged-in user visits /GlobalNotices
    → GET /api/GlobalNotices
    → Returns all notices ordered newest-first
    → Expired notices are automatically deleted at query time (RemoveExpiredAsync)
    → If there's an attachment: Download link points to
      GET /api/GlobalNotices/{id}/download

ADMIN DELETES ANNOUNCEMENT:
  → DELETE /api/GlobalNotices/{id}
  → Deletes file from disk + removes record from database
```

---

### 6.6 Group Management Flow

Groups are the core unit of organization. Each group is like a classroom.

```
CREATING A GROUP:
  Teacher fills form: name, description, optional initial student list
         │
         ▼
  POST /api/Groups  { name, description, studentIds[] }
         │
         ▼
  GroupService.CreateGroupAsync()
    ├─ Creates Group record (CreatedById = current teacher)
    └─ For each studentId in the list:
         Creates GroupMember record (AddedById = current teacher)

WHAT DIFFERENT USERS SEE WHEN LISTING GROUPS (GET /api/Groups):
  ├─ Admin → sees ALL active groups
  ├─ Teacher → sees groups where they are creator OR co-manager
  └─ Student → sees groups where they are an active member (RemovedAt = null)

ADDING STUDENTS TO A GROUP:
  Teacher searches for students → selects them → POST /api/Groups/{id}/members
  GroupService.AddMembersAsync()
    ├─ Checks teacher has permission to manage this group
    ├─ Checks which selected students are already active members (skips them)
    └─ Adds new GroupMember records for the rest

REMOVING A STUDENT:
  DELETE /api/Groups/{id}/members/{studentId}
  → Sets GroupMember.RemovedAt = now (soft delete, record kept for audit)
  → Student immediately loses access to the group

ADDING A CO-TEACHER (GROUP MANAGER):
  Group creator searches for teachers → POST /api/Groups/{id}/managers
  → Creates GroupManager records
  → Co-teacher can now post content to the group

DELETING A GROUP:
  → Sets Group.IsActive = false (soft delete)
  → The group disappears for all users but data is preserved
```

---

### 6.7 Assignment Flow (Full Lifecycle)

This is the most complex feature. It covers the entire journey from a teacher creating an assignment to tracking who submitted it.

```
STEP 1 — TEACHER POSTS AN ASSIGNMENT:
  In a group's detail page → clicks "New Post" → selects "Assignment" type
  Fills in: Title, file (required), due date, submission mode, auto-delete

  Submission Mode options:
  ├─ Physical  → students bring physical copy to class; teacher marks it done
  ├─ Online    → students upload a digital file through the app
  └─ Both      → supports both methods simultaneously

  POST /api/Groups/{id}/posts (multipart form data)
         │
         ▼
  GroupPostService.CreatePostAsync()
    ├─ Validates teacher can manage this group
    ├─ Validates title is provided
    ├─ Validates a file is attached (required for assignments)
    ├─ Parses submission mode string → converts to enum value
    ├─ Saves uploaded file to wwwroot/uploads/ with a UUID filename
    └─ Creates GroupPost record with Type = "Assignment"

STEP 2 — STUDENT SEES THE ASSIGNMENT:
  GET /api/Groups/{id}/posts
  GroupPostService.GetPostsAsync()
    ├─ Students only see assignments where DueDate is in the future (or null)
    ├─ Each post includes HasSubmitted = true/false (for this student)
    └─ Returns assignment details including SubmissionMode
  
  Student clicks "Download" to get the assignment file
  GET /api/Groups/{id}/posts/{postId}/download
    └─ Blocked for students if assignment is past due

STEP 3A — PHYSICAL SUBMISSION TRACKING (Teacher marks as submitted):
  Teacher opens "My Assignments" page → finds the assignment → opens Submission Tracker
  GET /api/Groups/{id}/posts/{postId}/submissions
    └─ Returns list of all group members with their submission status

  When a student physically hands in their work:
  Teacher clicks the toggle next to that student's name
  PUT /api/Groups/{id}/posts/{postId}/submissions/{studentId}  { submitted: true }
         │
         ▼
  AssignmentSubmissionService.SetSubmissionStatusAsync()
    ├─ Finds or creates AssignmentSubmission record
    ├─ Sets Status = Submitted, SubmittedAt = now
    └─ Returns updated status

STEP 3B — ONLINE SUBMISSION (Student uploads file):
  Student sees assignment → clicks "Submit Online" → chooses file
  POST /api/Groups/{id}/posts/{postId}/submissions/online
         │
         ▼
  AssignmentSubmissionService.SubmitOnlineWorkAsync()
    ├─ Validates assignment allows online submission
    ├─ Validates student is a group member
    ├─ Deletes previous submission file if student is re-submitting
    ├─ Saves new file to disk
    └─ Updates AssignmentSubmission.FileName + OnlineSubmittedAt

  Teacher views online submissions:
  GET /api/Groups/{id}/posts/{postId}/online-submissions
    ├─ Only the teacher who POSTED the assignment can see this list
    ├─ (Co-teachers cannot; only the original poster)
    └─ Returns list with HasSubmitted, filename, submission time

  Teacher downloads a student's submission:
  GET /api/Groups/{id}/posts/{postId}/online-submissions/{studentId}/download

STEP 4 — PROGRESS TRACKING:
  "My Assignments" page (GET /api/Groups/my-assignments) shows:
    ├─ Each assignment the teacher posted
    ├─ Progress bar: X of Y students submitted
    └─ Divides into "Current" (due date in future) and "Past" tabs

STEP 5 — AUTO EXPIRY:
  When any call to GetPostsAsync() or GetMyAssignmentsAsync() runs:
  RemoveExpiredAsync() checks for posts where AutoDeleteAt <= now
  → Deletes the file from disk
  → Deletes the GroupPost from the database
```

---

### 6.8 Online Assignment Submission Flow

A detailed breakdown of what happens when a student submits work online:

```
Student opens group → sees assignment card with "Submit Online" button
           │
           ▼
Student selects a file from their computer → clicks Submit
           │
           ▼
Frontend builds FormData { File: selectedFile }
POST /api/Groups/{groupId}/posts/{postId}/submissions/online
           │
           ▼
GroupController.SubmitOnlineWork()
  → Calls AssignmentSubmissionService.SubmitOnlineWorkAsync(postId, studentId, file)
           │
           ▼
Service checks:
  1. Does this post exist and is it an Assignment? (not a Notice)
  2. Does this assignment have SubmissionMode = Online or Both?
     └─ If Physical only: returns 400 "This assignment does not accept online submissions"
  3. Is this student currently an active member of the group?
     └─ If not: returns 403 Forbidden
  4. Is a file actually provided? (not empty)
           │
           ▼
Service looks up existing AssignmentSubmission for this student + post:
  ├─ If student is RE-submitting (already submitted before):
  │    → Deletes old file from disk
  │    → Replaces with new file
  └─ If first submission:
       → Creates new AssignmentSubmission record
           │
           ▼
FileStorageService.SaveAsync(file, FileCategory.Document)
  ├─ Validates file type (document category rules)
  ├─ Generates UUID filename (e.g. "a1b2c3d4.pdf")
  └─ Saves to wwwroot/uploads/a1b2c3d4.pdf
           │
           ▼
Saves: FileName = "a1b2c3d4.pdf", OriginalFileName = "homework.pdf", 
       OnlineSubmittedAt = now
           │
           ▼
Returns: { originalFileName: "homework.pdf", onlineSubmittedAt: "..." }
           │
           ▼
Frontend shows "Submitted ✓" state on the assignment card
```

---

### 6.9 Dashboard Flow

Each role gets a custom dashboard when they log in.

**Admin Dashboard** (`GET /api/Dashboard/admin`):
Shows system-wide overview: total teachers, students, groups, posts, gender breakdown of students, groups with no co-teacher, average group size, recent activity, and upcoming assignments.

**Teacher Dashboard** (`GET /api/Dashboard/teacher`):
Shows: groups owned vs co-managed, total unique students across their groups, total notices and assignments posted, upcoming due assignments, recent activity.

**Student Dashboard** (`GET /api/Dashboard/student`):
Shows: groups enrolled in, pending assignments (open + not yet submitted), total notices visible to them, recent activity, upcoming assignment deadlines.

All three dashboards also show a "recent activity" list — the 8 most recent posts from relevant groups.

---

## 7. Backend — Every File Explained

### 7.1 Data Models (Modules)

These are the blueprints for database tables. Each class = one table.

#### `Student.cs`
Represents a student account.
| Field | Type | Purpose |
|---|---|---|
| `Id` | Guid (UUID) | Unique identifier |
| `FullName` | string | Student's name |
| `Email` | string | Login email |
| `Password` | string | **Hashed** password (never stored plain) |
| `Profile` | string? | Filename of profile picture |
| `Gender` | string? | Optional gender field |
| `Class` | string? | Class name (e.g. "Grade 10") |
| `Section` | string? | Section (e.g. "A") |
| `Number` | long? | Phone number |
| `Addresh` | string? | Address (note: typo in original code) |
| `Role` | string | Always "Student" |
| `EmailVerified` | bool | Whether email was confirmed |
| `PendingEmail` | string? | New email waiting to be verified |
| `CreatedAt` | DateTime | When account was created |

#### `Teacher.cs`
Represents a teacher or admin account.
- Same fields as Student, plus `RefreshToken` / `RefreshTokenExpiry` (older fields, now handled in RefreshToken table)
- `Role` is either "Teacher" or "Admin"

#### `Group.cs`
A class group created by a teacher.
- `CreatedById` → links to the Teacher who owns this group
- `IsActive` → false means soft-deleted
- Has a collection of `Members` (GroupMember) and `Managers` (GroupManager)

#### `GroupMember.cs`
The relationship between a Student and a Group.
- `RemovedAt` being null = student is currently active in the group
- `RemovedAt` having a date = student was removed (but row is kept for history)
- `AddedById` → which teacher added this student

#### `GroupManager.cs`
A Teacher assigned as co-manager to a group they did not create.
- Allows the co-teacher to post content and manage members

#### `GroupPost.cs`
A post in a group — either a Notice or an Assignment.
- `Type` is literally the string "Notice" or "Assignment"
- `FileName` = UUID-based name stored on disk (e.g. "abc123.pdf")
- `OriginalFileName` = what the user sees (e.g. "Chapter5_homework.pdf")
- `DueDate` = deadline for assignments
- `AutoDeleteAt` = when to automatically delete this post
- `SubmissionMode` = Physical, Online, or Both (null for legacy assignments)

#### `AssignmentSubmission.cs`
One row per (student, assignment) pair. Tracks submission status.
- `Status` = 0 (NotSubmitted) or 1 (Submitted) — the physical tracking field
- `SubmittedAt` = when teacher clicked "submitted" for physical copy
- `FileName` = student's uploaded file (online submission)
- `OnlineSubmittedAt` = when student uploaded their file

#### `GlobalNotice.cs`
A system-wide announcement visible to all users. Only Admins can create these.

#### `ReadState.cs`
Tracks "last time user visited channel X". Used for the unread notifications badge.
- `ChannelType` = 0 (GlobalNotices) or 1 (Group)
- `GroupId` = null for GlobalNotices channel; the group's ID for a group channel
- `LastReadAt` = the timestamp used for "unread" comparison

#### `OtpCode.cs`
A one-time password code for email verification or password reset.
- `CodeHash` = SHA-256 hash of the 6-digit code (stored securely)
- `ConsumedAt` = when it was successfully used (null = not yet used)
- `Attempts` = incremented on each wrong guess; locked out at 5 attempts

#### `RefreshToken.cs`
A long-lived token used to get a new JWT without re-logging in.
- Either `TeacherId` or `StudentId` is set (not both)
- Stored in an HttpOnly cookie on the browser

---

### 7.2 Services

Services contain all the **business logic** — the rules, the decisions, the real work. Controllers just receive requests and call services.

#### `AuthService.cs`
Handles everything related to user identity.

| Method | What It Does |
|---|---|
| `RegisterTeacherAsync` | Creates a new Teacher account. Hashes password with ASP.NET Identity PasswordHasher. |
| `AddStudentAsync` | Creates a new Student account (Admin only). |
| `LoginAsync` | Checks email+password, creates JWT + refresh token, returns user info. |
| `LogoutAsync` | Deletes the refresh token from the database. |
| `RefreshAsync` | Validates refresh token, issues a new JWT. |
| `SendEmailVerificationAsync` | Generates a 6-digit OTP, hashes it, saves to DB, emails it. |
| `ChangePendingEmailAsync` | Saves a new email as `PendingEmail`, then calls SendEmailVerificationAsync. |
| `ConfirmEmailVerificationAsync` | Verifies entered OTP against hash, marks email verified, promotes PendingEmail. |
| `RequestPasswordResetAsync` | Same OTP flow but for password reset. Never reveals if email exists. |
| `ResetPasswordAsync` | Verifies OTP, then rehashes and saves new password. |
| `HashCode` | Private helper: SHA-256 hashes a string. |
| `GenerateNumericCode` | Private helper: generates a cryptographically secure 6-digit number. |
| `EnforceResendCooldownAsync` | Private helper: checks if a new OTP was sent less than 60 seconds ago. |
| `MaskEmail` | Private helper: turns "john@gmail.com" into "j***@gmail.com" for display. |

#### `GroupService.cs`
Handles creating and managing groups.

| Method | What It Does |
|---|---|
| `CreateGroupAsync` | Creates a Group, optionally adds initial members. |
| `GetGroupsAsync` | Returns groups filtered by user role (Admin = all, Teacher = own/managed, Student = enrolled). |
| `GetGroupAsync` | Returns full group details including members and managers list. |
| `CanViewGroupAsync` | Returns true/false: does this user have permission to see this group? |
| `CanManageGroupAsync` | Returns true/false: can this user post/edit content in this group? |
| `AddMembersAsync` | Adds students to a group, skipping those already in it. |
| `RemoveMemberAsync` | Soft-removes a student (sets RemovedAt). |
| `DeleteGroupAsync` | Soft-deletes a group (sets IsActive = false). |
| `AddManagersAsync` | Adds co-teachers to a group. Only group creator or Admin can do this. |
| `RemoveManagerAsync` | Removes a co-teacher from a group. |
| `GetGroupsForStudentAsync` | Returns all groups a specific student belongs to. |

#### `GroupPostService.cs`
Handles posts (notices and assignments) inside groups.

| Method | What It Does |
|---|---|
| `CreatePostAsync` | Creates a Notice or Assignment post, saves any attached file, sets submission mode. |
| `GetPostsAsync` | Returns posts for a group. Students don't see past-due assignments. |
| `DeletePostAsync` | Deletes a post and its attached file from disk. |
| `DownloadPostAsync` | Returns the file bytes for download. Students can't download past-due assignment files. |
| `GetRecentNoticesAsync` | Returns the 50 most recent notices across all relevant groups (for notification bell). |
| `GetMyAssignmentsAsync` | Returns all assignments a teacher posted, with submission counts. |
| `RemoveExpiredAsync` | Private: deletes posts whose AutoDeleteAt has passed. Called automatically. |

#### `AssignmentSubmissionService.cs`
Handles assignment submission tracking.

| Method | What It Does |
|---|---|
| `GetSubmissionsAsync` | Returns all students in a group with their physical submission status for an assignment. |
| `SetSubmissionStatusAsync` | Teacher marks a student as submitted or not-submitted (physical). |
| `GetMySubmissionAsync` | Student checks their own submission status for an assignment. |
| `SubmitOnlineWorkAsync` | Student uploads their work file. Replaces previous if re-submitting. |
| `DownloadMyOnlineSubmissionAsync` | Student downloads their own submitted file. |
| `GetOnlineSubmissionsAsync` | Teacher (ONLY the original poster) sees all online submissions for an assignment. |
| `DownloadOnlineSubmissionAsync` | Teacher downloads a specific student's online submission. |
| `GetAssignmentAsync` | Private: fetches a GroupPost and validates it's an Assignment. |
| `IsGroupMemberAsync` | Private: checks if a student is actively in a group. |
| `AllowsOnline` | Private: checks if assignment's SubmissionMode allows online uploads. |

#### `GlobalNoticeService.cs`
Handles system-wide announcements.

| Method | What It Does |
|---|---|
| `GetNoticesAsync` | Returns all notices, newest first. Triggers cleanup of expired notices. |
| `CreateNoticeAsync` | Creates a global notice with optional file attachment. |
| `DeleteNoticeAsync` | Deletes a notice and its file from disk. |
| `DownloadNoticeAsync` | Returns file bytes for a notice attachment. |
| `RemoveExpiredAsync` | Private: deletes notices past their AutoDeleteAt date. |

#### `DashboardService.cs`
Provides data for the three dashboards.

| Method | What It Does |
|---|---|
| `GetAdminDashboardAsync` | System-wide stats: user counts, group stats, gender breakdown, recent activity. |
| `GetTeacherDashboardAsync` | Stats for one teacher: their groups, students, assignment counts, upcoming deadlines. |
| `GetStudentDashboardAsync` | Stats for one student: enrolled groups, pending assignments, notices, upcoming deadlines. |

#### `ReadStateService.cs`
Tracks when users last viewed notification channels.

| Method | What It Does |
|---|---|
| `GetLastViewedAsync` | Returns the timestamp when a user last viewed a channel (or null if never). |
| `MarkViewedAsync` | Updates (or creates) the LastReadAt for a channel to right now. |
| `GetAllGroupLastViewedAsync` | Returns a dictionary of { groupId: lastViewedTime } for all groups a user has viewed. |

#### `JwtTokenService.cs`
Handles JWT creation.

| Method | What It Does |
|---|---|
| `GenerateAccessToken(Teacher)` | Creates a signed JWT for a Teacher/Admin. |
| `GenerateAccessToken(Student)` | Creates a signed JWT for a Student. |
| `GenerateRefreshTokenValue` | Creates a cryptographically secure random string (64 bytes, base64). |
| `GenerateToken` (private) | Core JWT logic: builds claims (id, name, email, role), signs with HS256, sets 1-hour expiry. |

#### `EmailService.cs`
Sends emails via SMTP (Gmail).

| Method | What It Does |
|---|---|
| `SendAsync` | Sends an HTML email. If SMTP is not configured (local dev), logs the email content to console instead of sending. |

#### `FileStorageService.cs`
Saves and manages files on the server disk.

| Method | What It Does |
|---|---|
| `SaveAsync(file)` | Validates the file, generates a UUID filename, saves to `wwwroot/uploads/`. Returns the stored filename. |
| `SaveAsync(file, category)` | Same as above but with category-specific validation (Image vs Document). |
| `Delete(storedFileName)` | Deletes a file from disk. Does nothing if filename is null or file doesn't exist. |
| `ReadAsync(storedFileName)` | Reads a file from disk and returns it as a byte array. |

#### `FileValidation.cs`
Validates uploaded files before saving.
- Checks file size limits
- Checks allowed file extensions based on category (Image or Document)
- Prevents malicious file uploads

#### `TeacherService.cs`
Manages teacher records (admin functions).

| Method | What It Does |
|---|---|
| `GetCurrentAsync` | Returns the logged-in teacher's profile data. |
| `UpdateProfileAsync` | Updates teacher's own profile info and/or profile picture. |
| `GetPaged` | Returns paginated list of all teachers (10 per page). |
| `GetById` | Returns one teacher's data by ID. |
| `UpdateAsync` | Admin updates any teacher's data including role. |
| `DeleteAsync` | Admin deletes a teacher account. |
| `Search` | Returns teachers matching a name search (for dropdowns). |

#### `StudentService.cs`
Manages student records.

| Method | What It Does |
|---|---|
| `GetPaged` | Returns paginated list of all students (10 per page). |
| `GetByIdAsync` | Returns one student's data. |
| `UpdateAsync` | Admin updates a student's data. |
| `DeleteAsync` | Admin deletes a student account. |
| `UpdateProfileAsync` | Student updates their own profile. |
| `Search` | Returns students matching a name search. |

---

### 7.3 Controllers (API Endpoints)

Controllers are the "door" — they receive HTTP requests and pass them to services.

#### `AuthController.cs` — Route: `/api/Auth`
| Endpoint | Method | Role | What It Does |
|---|---|---|---|
| `/me` | GET | Any logged in | Returns current user's profile |
| `/TeacherRegister` | POST | Public | Register new teacher account |
| `/AddStudent` | POST | Admin | Add a new student |
| `/login` | POST | Public | Log in, sets cookies |
| `/logout` | POST | Any | Clears session cookies |
| `/refresh` | POST | Any | Refreshes JWT using refresh token cookie |
| `/verification/send` | POST | Any | Send email verification OTP |
| `/verification/change-email` | POST | Any | Change email (stores as PendingEmail, sends OTP) |
| `/verification/confirm` | POST | Any | Submit OTP to verify email |
| `/password/forgot` | POST | Public | Request password reset OTP |
| `/password/reset` | POST | Public | Submit OTP + new password |

#### `GroupsController.cs` — Route: `/api/Groups`
| Endpoint | Method | Role | What It Does |
|---|---|---|---|
| `/` | GET | Any | List groups (filtered by role) |
| `/` | POST | Admin/Teacher | Create new group |
| `/{id}` | GET | Any | Get group details |
| `/{id}` | DELETE | Admin/Teacher | Soft-delete a group |
| `/{id}/members` | POST | Admin/Teacher | Add students to group |
| `/{id}/members/{studentId}` | DELETE | Admin/Teacher | Remove student |
| `/{id}/managers` | POST | Admin/Teacher | Add co-teachers |
| `/{id}/managers/{teacherId}` | DELETE | Admin/Teacher | Remove co-teacher |
| `/student/{studentId}` | GET | Admin/Teacher | Groups for a student |
| `/{id}/posts` | GET | Any | List posts in a group |
| `/{id}/posts` | POST | Admin/Teacher | Create post/assignment |
| `/{id}/posts/{postId}` | DELETE | Admin/Teacher | Delete a post |
| `/{id}/posts/{postId}/download` | GET | Any | Download post file |
| `/notices` | GET | Any | Recent notices (for bell) |
| `/{id}/last-viewed` | GET | Any | When user last viewed this group |
| `/{id}/mark-viewed` | POST | Any | Mark group as "seen now" |
| `/last-viewed` | GET | Any | All group last-viewed timestamps |
| `/{id}/posts/{postId}/submissions` | GET | Admin/Teacher | Physical submission list |
| `/{id}/posts/{postId}/submissions/{studentId}` | PUT | Admin/Teacher | Toggle submission status |
| `/{id}/posts/{postId}/submissions/me` | GET | Student | My submission status |
| `/{id}/posts/{postId}/submissions/online` | POST | Student | Upload work file |
| `/{id}/posts/{postId}/submissions/online/download` | GET | Student | Download own submission |
| `/{id}/posts/{postId}/online-submissions` | GET | Admin/Teacher | All online submissions |
| `/{id}/posts/{postId}/online-submissions/{studentId}/download` | GET | Admin/Teacher | Download student's file |
| `/my-assignments` | GET | Admin/Teacher | My posted assignments with stats |

#### `GlobalNoticesController.cs` — Route: `/api/GlobalNotices`
| Endpoint | Method | Role | What It Does |
|---|---|---|---|
| `/` | GET | Any | List all announcements |
| `/` | POST | Admin | Create announcement |
| `/{id}` | DELETE | Admin | Delete announcement |
| `/{id}/download` | GET | Any | Download attachment |
| `/last-viewed` | GET | Any | When user last viewed announcements |
| `/mark-viewed` | POST | Any | Mark as seen now |

#### `TeacherController.cs` — Route: `/api/Teacher`
Handles teacher profile management and admin CRUD operations.

#### `StudentController.cs` — Route: `/api/Student`
Handles student profile management and admin CRUD operations.

#### `DashboardController.cs` — Route: `/api/Dashboard`
| Endpoint | Method | Role | What It Does |
|---|---|---|---|
| `/admin` | GET | Admin | Admin statistics |
| `/teacher` | GET | Teacher | Teacher statistics |
| `/student` | GET | Student | Student statistics |

---

### 7.4 DTOs (Data Transfer Objects)

DTOs are simple classes that define exactly what data comes in from the client (request body). They prevent extra fields from being accidentally accepted.

| DTO File | Used For |
|---|---|
| `TeacherRegister.cs` | Registering a teacher: `FullName`, `Email`, `Password` |
| `TeacherLogin.cs` | Logging in: `Email`, `Password` |
| `TeacherProfileUpdate.cs` | Teacher updating their own profile |
| `UpdateTeacher.cs` | Admin updating a teacher (includes `Role`) |
| `AddStudent.cs` | Adding a student: `FullName`, `Email`, `Password` |
| `StudentProfileUpdate.cs` | Student updating their own profile |
| `UpdateStudent.cs` | Admin updating a student |
| `CreateGroupRequest.cs` | Creating a group: `Name`, `Description`, optional `StudentIds[]` |
| `CreateGroupPostRequest.cs` | Creating a post: `Title`, `Type`, `Content`, `File`, `DueDate`, `SubmissionMode`, `AutoDeleteAt` |
| `CreateGlobalNoticeRequest.cs` | Creating an announcement: `Title`, `Content`, `File`, `AutoDeleteAt` |
| `AssignmentSubmission.cs` | Setting submission status: `Submitted` (bool) |
| `AuthExtra.cs` | Extra auth DTOs: `ChangePendingEmailRequest`, `VerifyEmailCodeRequest`, `ForgotPasswordRequest`, `ResetPasswordRequest` |

---

### 7.5 Program.cs — Application Startup

This file configures and starts the entire backend. Here's what it does in order:

1. **FormOptions / Kestrel limits** — Sets a 30 MB maximum file upload size.
2. **Swagger** — Enables the API documentation UI at `/swagger` (development only).
3. **Database** — Connects to SQL Server using the connection string from `appsettings.json`.
4. **CORS Policy** — Allows the React frontend (`http://localhost:5173`) to make API calls.
5. **Dependency Injection** — Registers all services (FileStorage, JWT, Auth, etc.) so they can be injected where needed.
6. **JWT Authentication** — Configures the server to read JWT from the `token` HttpOnly cookie and validate it using the secret key.
7. **Admin Seeding** — On startup, checks if an Admin user exists. If not, creates `admin@example.com` with password `admin123`.
8. **Middleware Pipeline** — Sets up the request processing order: HTTPS redirect → CORS → Static files → Auth → Controllers.

---

## 8. Frontend — Every File Explained

### 8.1 App.tsx — Routes

This is the root of the React app. It defines all URL routes and which component to show for each.

**Route protection wrappers:**
- `AdminRoute` — Only allows users with role "Admin". Redirects others to login.
- `TeacherRout` — Only allows role "Teacher". (Note: typo "Rout" instead of "Route" in original code.)
- `StudentRoute` — Only allows role "Student".
- `RoleRoute` — Allows multiple roles (e.g. `["Admin", "Teacher"]`).

All these wrappers check the current user's role and either render the page or redirect to `/Login`.

**Route Table:**

| URL | Component | Who Can Access |
|---|---|---|
| `/Login` | Login | Everyone (public) |
| `/VerifyEmail` | VerifyEmail | Logged-in users |
| `/ForgotPassword` | ForgotPassword | Public |
| `/AdminIndex` | AdminIndex | Admin only |
| `/TeacherIndex` | TeacherIndex | Teacher only |
| `/StudentIndex` | StudentIndex | Student only |
| `/GroupsList` | GroupsList | All logged-in |
| `/groups/:id` | GroupDetail | All logged-in |
| `/CreateGroup` | CreateGroup | Admin, Teacher |
| `/MyAssignments` | MyAssignments | Admin, Teacher |
| `/GlobalNotices` | GlobalNotices | All logged-in |
| `/StudentView` | StudentView | Admin, Teacher |
| `/Teachers` | Teachers | Admin, Teacher |
| `/RegisterTeacher` | RegisterTeacher | Admin only |
| `/AddStudents` | AddStudents | Admin only |
| `/EditStudent/:id` | EditStudent | Admin only |
| `/EditTeacher/:id` | EditTeacher | Admin only |
| `/UpdateTeacherProfile/:id` | UpdateTeacherProfile | Any logged-in |
| `/UpdateStudentProfile/:id` | UpdateStudentProfile | Any logged-in |
| `/Student/:id` | StudentDetail | Any logged-in |
| `/Teacher/:id` | TeacherDetail | Any logged-in |
| `*` | NotFound | Everyone |

---

### 8.2 Redux Store & API Slices

#### `store.ts`
The central data store. Combines all API slices into one.

- On `auth/resetStore` action: clears ALL cached data (used on logout to clear everything).
- Sets up `setupListeners` — enables automatic refetching when the browser tab regains focus.

#### API Slices (in `src/api/`)

Each file creates an RTK Query API slice — a combination of API calls and automatic cache management.

**`AuthApi.ts`**
Handles authentication. All requests go to `/api/Auth`.
- `useLoginMutation` — logs in and sets cookies
- `useLogoutMutation` — clears session
- `useGetCurrentUserQuery` — "who am I?" called on every page load
- `useRefreshTokenMutation` — gets new JWT silently
- `useSendVerificationEmailMutation` — sends OTP to email
- `useConfirmEmailVerificationMutation` — submits OTP code
- `useForgotPasswordMutation` / `useResetPasswordMutation` — password reset

**`GroupApi.ts`**
The largest API file — handles groups, posts, submissions, and notifications.
- Tag types `Group`, `GroupPost`, `Submission`, `OnlineSubmission`, `GroupReadState` allow precise cache invalidation.
- When you delete a group post, RTK automatically refetches the posts list.
- `useGetRecentNoticesQuery` and `useGetAllGroupsLastViewedQuery` power the notification bell.

**`GlobalNoticeApi.ts`**
Handles global announcements.
- `useGetGlobalNoticesQuery` — fetches all notices
- `useCreateGlobalNoticeMutation` — Admin posts a notice
- `useMarkGlobalNoticesViewedMutation` — marks all global notices as read

**`StudentApi.ts`** / **`TeacherApi.ts`**
CRUD operations for managing users (admin functions).

**`DashboardApi.ts`**
Fetches dashboard data for each role.

**`baseQueryWithReauth.ts`**
This is the most important background piece. It wraps every single API call with:
1. Make the API request
2. If server returns 401 (Unauthorized / expired JWT):
   - Automatically call `/api/Auth/refresh` to get a new JWT
   - Retry the original request with the fresh token
   - If refresh also fails: dispatch `auth/resetStore` to clear everything and redirect to login

This means users almost never see a "session expired" error — it happens silently.

---

### 8.3 Pages

#### Authentication Pages (`src/pages/Auth/`)
- **`Login.tsx`** — Email/password form. On success, redirects by role.
- **`RegisterTeacher.tsx`** — Form for Admin to create teacher accounts.
- **`AddStudents.tsx`** — Form for Admin to add student accounts.
- **`VerifyEmail.tsx`** — Shows OTP input. "Send Code" → enter code → verified.
- **`ForgotPassword.tsx`** — Two-step form: enter email → get code → enter code + new password.

#### Dashboard Pages
- **`AdminIndex.tsx`** — Admin home page with system statistics cards.
- **`TeacherIndex.tsx`** — Teacher home page with their groups and assignments.
- **`StudentIndex.tsx`** — Student home page with their groups and pending work.

#### Group Pages (`src/pages/Group/`)
- **`GroupsList.tsx`** — Lists all accessible groups with member counts and last post time.
- **`CreateGroup.tsx`** — Form to create a new group (name, description, initial students).
- **`GroupDetail.tsx`** — The most complex page: shows all posts in a group, allows posting (teachers), submission tracking, online submission upload, file downloads.

#### Assignment Pages (`src/pages/Assignment/`)
- **`MyAssignments.tsx`** — Teachers see all their posted assignments. Each shows a progress bar (X/Y submitted), submission tracker panel, and online submissions viewer.

#### Other Pages
- **`GlobalNotices.tsx`** — Lists all announcements. Admins see a "New Announcement" button. Marks all as read when page opens.
- **`NotFound.tsx`** — 404 page for unrecognized URLs.

#### Profile Pages (`src/pages/Student/`, `src/pages/Teacher/`)
- `StudentDetail.tsx` — View a student's profile (read-only).
- `StudentView.tsx` — Table of all students (Admin/Teacher can see).
- `EditStudent.tsx` — Admin edits a student's data.
- `UpdateStudentProfile.tsx` — Student updates their own profile.
- `TeacherDetail.tsx` — View a teacher's profile.
- `Teachers.tsx` — Table of all teachers.
- `EditTeacher.tsx` — Admin edits a teacher's data.
- `ViewYourProfile.tsx` — Teacher views their own profile.
- `UpdateTeacherProfile.tsx` — Teacher updates their own profile.

---

### 8.4 Components

#### `NavBar.tsx`
The top navigation bar shown on every page.
- Shows app logo/name
- Shows current user's name and profile picture
- Contains the NotificationBell
- Has a hamburger menu for mobile

#### `SlideMenu.tsx`
The side navigation drawer (mobile or collapsed desktop).
- Shows navigation links based on user role

#### `NotificationBell.tsx`
The bell icon with unread count badge. See Section 6.4 for full flow.
- Combines unread group notices + unread global notices
- Clicking an item navigates to the relevant page

#### `components/Routes/`
Route protection wrappers: `AdminRoute`, `TeacherRout`, `StudentRoute`, `RoleRoute`.

#### `components/layouts/`
- `DashboardLayout.tsx` — Wraps pages with NavBar + SlideMenu + main content area.

#### `components/group/`
- `SubmissionTracker` — Table showing all students with checkboxes for physical submission tracking.
- `OnlineSubmissionsViewer` — Shows list of online submissions; teachers can download each file.

#### `components/form/`
Reusable form components.

#### `components/utils/`
Utility functions:
- `groupActivity.ts` — `getUnreadNotices()`: compares notice timestamps to last-viewed map.
- `globalNoticeActivity.ts` — `getUnreadGlobalNotices()`: compares notice timestamps to global last-viewed.

#### `components/ui/`
shadcn/ui components: `Button`, `Card`, `Dialog`, `Input`, `Label`, `Popover`, `Select`, `Textarea`, etc.

#### `hooks/useCurrentUser.ts`
A custom React hook that wraps `useGetCurrentUserQuery` and returns the current user object. Used throughout the app to check user role and permissions.

#### `lib/utils.ts`
The `cn()` function — merges Tailwind CSS class names intelligently.

---

## 9. Security — How It Works

### Password Security
- Passwords are **never stored in plain text**.
- ASP.NET's `PasswordHasher<T>` is used, which implements PBKDF2 with HMAC-SHA512, a 128-bit salt, and 100,000+ iterations.
- Passwords are one-way hashed — they cannot be "decoded".

### Session Security (JWT + Cookies)
- JWT tokens are stored in **HttpOnly cookies** — JavaScript cannot access them.
- Cookies use `Secure = true` (HTTPS only) and `SameSite = None`.
- JWT expires in **1 hour**.
- A refresh token (also HttpOnly cookie) silently renews the JWT before it expires.

### OTP Security
- OTP codes are **never stored in the database as plain text**.
- Only their **SHA-256 hash** is stored.
- Maximum **5 attempts** per code before it's locked.
- Codes expire after **10 minutes**.
- A **60-second cooldown** prevents spam-requesting codes.
- Forgot password never reveals whether an account exists (prevents email enumeration).

### Route Authorization
- Every API endpoint has `[Authorize]` — unauthenticated requests get 401.
- Role-specific routes use `[Authorize(Roles = "Admin")]` etc.
- Frontend route wrappers prevent even navigating to a URL without the right role.

### File Upload Security
- `FileValidation.cs` validates file types and sizes before saving.
- Files are stored with UUID names (not original names) to prevent path traversal.
- Original filenames are stored separately for display purposes only.
- Maximum upload size is **30 MB**.

---

## 10. File Upload System

All uploaded files (assignment files, profile pictures, notice attachments, online submissions) are stored in `backend/backend/wwwroot/uploads/`.

**How a file is saved:**
1. File arrives as multipart form data
2. `FileValidation.ValidateAsync()` checks type and size
3. A `Guid.NewGuid()` is generated (e.g. `a3f7b921-...`)
4. Original extension is kept (e.g. `.pdf`)
5. Final filename: `a3f7b921-xxxx-xxxx-xxxx-xxxxxxxxxxxx.pdf`
6. Saved to `wwwroot/uploads/a3f7b921....pdf`
7. The UUID filename is stored in the database
8. The original filename (e.g. `homework_chapter5.pdf`) is stored separately for display

**How a file is downloaded:**
1. Client requests `/api/Groups/{id}/posts/{postId}/download`
2. Server checks permissions (is user in this group?)
3. `FileStorageService.ReadAsync()` reads the file by UUID name
4. Returns `File(bytes, "application/octet-stream", originalFileName)` — browser sees the original name

**File categories:**
- `Image` — for profile pictures (JPEG, PNG, etc.)
- `Document` — for assignment files and notice attachments

---

## 11. Auto-Delete Feature

Posts (both Group Posts and Global Notices) can be set to auto-delete at a specified date/time.

**How it works:**
- When creating a post, an optional `AutoDeleteAt` datetime can be specified.
- The frontend offers presets: 1 day, 3 days, 1 week, 2 weeks, 1 month, or a custom date.
- The date is stored in the database on the post record.
- **There is no background job or scheduled task.** Instead, cleanup happens lazily:
  - Every time `GetPostsAsync()` or `GetNoticesAsync()` is called, `RemoveExpiredAsync()` runs first.
  - It queries for posts where `AutoDeleteAt <= now` and deletes them (including their files).
- This means a post may survive slightly past its auto-delete time (until someone next fetches the list), but in practice this is fine for a school system.

---

## 12. Frequently Asked Questions

**Q: Can a student be in multiple groups?**
Yes. A student can be added to as many groups as needed. They will see all their groups on their dashboard.

**Q: Can a teacher co-manage a group they didn't create?**
Yes. The group creator (or Admin) can add other teachers as managers. Managers can post notices and assignments but cannot add/remove other managers.

**Q: What happens when a student is removed from a group?**
They immediately lose access to that group and its content. The removal is soft (RemovedAt is set), so the history is preserved. If re-added later, a new GroupMember record is created.

**Q: Can a student submit an assignment after the due date?**
No. If an assignment has a due date, students cannot view or download it after that date, and online submission would also be blocked. Teachers and Admins can still see everything.

**Q: Can a student resubmit an assignment?**
Yes. For online submissions, submitting again replaces the previous file. The old file is deleted from disk.

**Q: Who can see online submissions?**
Only the specific teacher who originally posted the assignment. Co-teachers and Admins cannot see the online submission list. (This is intentional — see `GetOnlineSubmissionsAsync`: `if (post.PostedById != actingUserId) throw new ForbiddenException()`)

**Q: What's the difference between a Notice and an Assignment in a group?**
- A **Notice** is text-only (with optional attachment). It has no due date or submission tracking.
- An **Assignment** requires a file attachment, has an optional due date, and supports submission tracking (physical and/or online).

**Q: What's a Global Notice vs a Group Notice?**
- **Group Notice** — posted in a specific group, only members of that group see it.
- **Global Notice (Announcement)** — posted by Admin, seen by every single user in the system regardless of group membership.

**Q: How does the notification bell know what's unread?**
It doesn't track individual items. Instead, it stores "when did this user last look at this channel?". Anything posted after that timestamp is considered unread. When you visit a group page, the timestamp is updated to now.

**Q: Are deleted groups/members recoverable?**
Groups and members are soft-deleted (IsActive flag / RemovedAt field). The data remains in the database. A developer or database admin could recover them, but there's no built-in UI for it.

**Q: What file types can be uploaded?**
Controlled by `FileValidation.cs` based on category:
- Images: for profile pictures
- Documents: for assignments and notices (PDFs, Word docs, etc.)
Up to 30 MB per file.

**Q: What happens if the email server (SMTP) is not configured?**
The `EmailService` detects if SMTP host is not set. Instead of sending, it logs the email content to the server console. This lets developers test the OTP flow locally without an email server.

**Q: Can there be multiple Admins?**
Yes. The `Role` field is just a string. An Admin can change any teacher's role to "Admin" using the Edit Teacher feature. The seeded account is just the first one.

**Q: What is the default Admin account?**
Email: `admin@example.com`, Password: `admin123`. Created automatically on first run if no Admin exists. **Change this immediately in production.**

**Q: Why does the Student model have a field called `Addresh` instead of `Address`?**
This is a typo in the original source code that propagated through the database migrations. It works identically — it just has a spelling mistake. The API normalizes it to `address` when returning data.

**Q: How are all dates handled?**
All dates are stored and communicated as **UTC** (Coordinated Universal Time). The database has a value converter that ensures all `DateTime` values read from SQL Server are marked as UTC kind. The frontend receives ISO 8601 strings and converts to local time using `new Date(...).toLocaleString()`.

**Q: Can I deploy this to production?**
Yes, but before doing so:
1. Change the JWT secret key in `appsettings.json`
2. Change the default Admin password
3. Update the CORS policy to your production frontend URL
4. Use a proper production SQL Server (not LocalDB)
5. Consider using environment variables or Azure Key Vault for secrets instead of appsettings.json

---

*This README was generated on 2026-09-17 from the actual source code of the StudentGrid project.*
