# StudentGrid — Student Management System

A full-stack school management platform built with **ASP.NET Core 10** (backend) and **React 19 + TypeScript** (frontend). The system handles three distinct user roles — **Admin**, **Teacher**, and **Student** — and covers everything from authentication to real-time notifications, attendance tracking, group-based assignment management, and more.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [Project Structure](#project-structure)
4. [Backend Deep Dive](#backend-deep-dive)
   - [Entry Point — Program.cs](#entry-point--programcs)
   - [Database — StudentManagement DbContext](#database--studentmanagement-dbcontext)
   - [Domain Models (Modules)](#domain-models-modules)
   - [DTOs](#dtos)
   - [Services Layer](#services-layer)
   - [Controllers Layer](#controllers-layer)
   - [SignalR Hub](#signalr-hub)
5. [Frontend Deep Dive](#frontend-deep-dive)
   - [Entry Point — main.tsx](#entry-point--maintsx)
   - [Routing — App.tsx](#routing--apptsx)
   - [Redux Store — store.ts](#redux-store--storets)
   - [API Layer (RTK Query)](#api-layer-rtk-query)
   - [Key Components](#key-components)
   - [Hooks & Utilities](#hooks--utilities)
6. [Authentication & Security Flow](#authentication--security-flow)
7. [Feature Flows](#feature-flows)
   - [User Registration & Login](#user-registration--login)
   - [Email Verification & Password Reset (OTP)](#email-verification--password-reset-otp)
   - [Group & Post Management](#group--post-management)
   - [Assignment Submission](#assignment-submission)
   - [Attendance System](#attendance-system)
   - [Real-Time Notifications](#real-time-notifications)
   - [Global Notices](#global-notices)
   - [Dashboard](#dashboard)
8. [Role-Based Access Control](#role-based-access-control)
9. [File Storage & Validation](#file-storage--validation)
10. [Key Design Decisions & Patterns](#key-design-decisions--patterns)
11. [Configuration & Setup](#configuration--setup)
12. [API Reference](#api-reference)

---

## Project Overview

StudentGrid is a school/institution management system designed for three roles:

| Role | Capabilities |
|---|---|
| **Admin** | Full system access — manage teachers, students, groups, notices, class sections, attendance, dashboard |
| **Teacher** | Manage own groups, post assignments/notices, track submissions, take attendance for assigned classes |
| **Student** | View groups they belong to, submit assignments, view notices, view own attendance |

---

## Architecture & Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Framework | ASP.NET Core 10 (.NET 10) |
| ORM | Entity Framework Core 10 with SQL Server |
| Authentication | JWT Bearer tokens (stored in HttpOnly cookies) + Refresh Token rotation |
| Real-Time | SignalR |
| Email | SMTP via `System.Net.Mail` |
| Password Hashing | `Microsoft.AspNetCore.Identity.PasswordHasher<T>` |
| API Docs | Swagger / Swashbuckle |
| Rate Limiting | ASP.NET Core built-in rate limiter (`AddRateLimiter`) |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| State / Data Fetching | Redux Toolkit + RTK Query |
| Routing | React Router v7 |
| Styling | Tailwind CSS v4 + shadcn/ui components |
| Real-Time | `@microsoft/signalr` |
| Forms | react-hook-form |
| Toasts | react-hot-toast |
| Animations | motion (Framer Motion v11) |
| Icons | lucide-react + react-icons |

---

## Project Structure

```
StudentManagement/
├── backend/
│   └── backend/
│       ├── Program.cs                  # App bootstrap, DI, middleware pipeline
│       ├── appsettings.json            # Configuration (DB, JWT, SMTP)
│       ├── backend.csproj              # .NET project file / NuGet packages
│       ├── Controllers/                # HTTP endpoints (thin layer, delegates to services)
│       │   ├── AuthController.cs
│       │   ├── StudentController.cs
│       │   ├── TeacherController.cs
│       │   ├── GroupController.cs
│       │   ├── AttendanceController.cs
│       │   ├── ClassSectionsController.cs
│       │   ├── DashboardController.cs
│       │   └── GlobalNoticesController.cs
│       ├── Services/                   # Business logic
│       │   ├── AuthService.cs
│       │   ├── JwtTokenService.cs
│       │   ├── StudentService.cs
│       │   ├── TeacherService.cs
│       │   ├── GroupService.cs
│       │   ├── GroupPostService.cs
│       │   ├── AssignmentSubmissionService.cs
│       │   ├── AttendanceService.cs
│       │   ├── ClassSectionService.cs
│       │   ├── GlobalNoticeService.cs
│       │   ├── DashboardService.cs
│       │   ├── RealtimeNotifier.cs
│       │   ├── EmailService.cs
│       │   ├── FileStorageService.cs
│       │   ├── FileValidation.cs
│       │   ├── ReadStateService.cs
│       │   ├── StudentPlacement.cs
│       │   ├── Interfaces/             # Service interfaces (for DI)
│       │   └── Exceptions/             # Custom exception types
│       ├── Data/
│       │   └── StudentManagement.cs    # EF Core DbContext
│       ├── Modules/                    # EF Core entity models
│       ├── DTOs/                       # Request/response shape contracts
│       ├── Hubs/
│       │   └── NotificationHub.cs      # SignalR hub
│       ├── Migrations/                 # EF Core auto-generated migrations
│       └── wwwroot/uploads/            # File storage directory
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── main.tsx                    # React app entry point
        ├── App.tsx                     # Route definitions
        ├── store.ts                    # Redux store configuration
        ├── index.css                   # Global styles
        ├── api/                        # RTK Query API slices
        │   ├── baseQueryWithReauth.ts  # Shared base query with token refresh logic
        │   ├── AuthApi.ts
        │   ├── StudentApi.ts
        │   ├── TeacherApi.ts
        │   ├── GroupApi.ts
        │   ├── AttendanceApi.ts
        │   ├── ClassSectionApi.ts
        │   ├── DashboardApi.ts
        │   └── GlobalNoticeApi.ts
        ├── components/                 # Reusable React components
        │   ├── NavBar.tsx
        │   ├── SlideMenu.tsx
        │   ├── NotificationsProvider.tsx
        │   ├── NotificationBell.tsx
        │   ├── ThemeProvider.tsx
        │   ├── ThemeToggle.tsx
        │   ├── Routes/                 # Route guard components
        │   ├── ui/                     # shadcn/ui base components
        │   ├── layouts/
        │   ├── dashboard/
        │   ├── assignments/
        │   ├── group/
        │   ├── global-notice/
        │   ├── profile/
        │   ├── form/
        │   ├── auth/
        │   ├── transitions/
        │   └── utils/
        ├── pages/                      # Page-level components (one per route)
        │   ├── index.tsx               # Landing page
        │   ├── Auth/
        │   ├── Student/
        │   ├── Teacher/
        │   ├── Group/
        │   ├── Assignment/
        │   ├── Attendance/
        │   ├── AdminIndex.tsx
        │   ├── TeacherIndex.tsx
        │   ├── StudentIndex.tsx
        │   ├── ClassSections.tsx
        │   ├── GlobalNotices.tsx
        │   └── NotFound.tsx
        ├── hooks/
        │   └── useCurrentUser.ts
        └── lib/
            ├── config.ts               # API base URL configuration
            ├── signalr.ts              # SignalR connection factory
            └── utils.ts                # Tailwind class merging utility
```

---

## Backend Deep Dive

### Entry Point — `Program.cs`

This is where the entire backend is bootstrapped. Every service, middleware, and configuration is wired here.

#### What it does and why each part exists:

**`WebApplication.CreateBuilder(args)`**
Creates the host builder. This is the standard ASP.NET Core application setup entry point — it reads `appsettings.json`, environment variables, and command-line args.

**`FormOptions.MultipartBodyLengthLimit` + `Kestrel MaxRequestBodySize` (both set to 30 MB)**
By default, ASP.NET Core limits request body sizes. Since teachers upload assignment files and profile images, the limit is raised to 30 MB. Setting it on both `FormOptions` (for multipart form parsing) and Kestrel (the web server) is necessary — one without the other would still block large uploads at a different layer.

**`AddSwaggerGen()` / `UseSwagger()` / `UseSwaggerUI()`**
Generates interactive API documentation. Only enabled in the Development environment so the docs are never exposed in production.

**`AddDbContext<StudentManagement>(...UseSqlServer(...))`**
Registers the EF Core database context as a scoped service. The connection string is read from `appsettings.json` under `ConnectionStrings:ManagementDbConnection`. The `StudentManagement` class (the DbContext) is the gateway to all database operations.

**`AddCors("ReactPolicy")`**
The frontend runs at `http://localhost:5173` (Vite dev server) while the backend runs at `https://localhost:7014`. Without CORS, browsers would block all cross-origin API requests. `AllowCredentials()` is required because the app uses cookies (not Bearer headers) for tokens — browsers only send cookies cross-origin when the server explicitly allows credentials.

**`AddRateLimiter` with `AddFixedWindowLimiter("auth")`**
Protects the login, registration, and password reset endpoints against brute-force attacks. A fixed window limiter allows 5 requests per IP per minute. Any further requests get HTTP 429 (Too Many Requests). The name `"auth"` is applied to specific endpoints via `[EnableRateLimiting("auth")]`.

**Service Registration (`AddScoped<IInterface, Implementation>()`)**
Every service is registered as **scoped** — one instance per HTTP request. This matches the lifetime of the EF Core DbContext (also scoped), ensuring they share the same database transaction within a single request. The pattern used is **interface + implementation**, which enables dependency injection and makes each service independently unit-testable.

Services registered:
- `IFileStorageService` → `FileStorageService` — file save/delete/read
- `IJwtTokenService` → `JwtTokenService` — JWT generation
- `IAuthService` → `AuthService` — login, register, OTP, password reset
- `IStudentService` → `StudentService` — student CRUD
- `ITeacherService` → `TeacherService` — teacher CRUD
- `IReadStateService` → `ReadStateService` — "last viewed" tracking
- `IGroupService` → `GroupService` — group management
- `IGroupPostService` → `GroupPostService` — posts/assignments
- `IGlobalNoticeService` → `GlobalNoticeService` — school-wide notices
- `IDashboardService` → `DashboardService` — dashboard statistics
- `IEmailService` → `EmailService` — SMTP email sending
- `IAssignmentSubmissionService` → `AssignmentSubmissionService` — submission tracking
- `IRealtimeNotifier` → `RealtimeNotifier` — SignalR push notifications
- `IClassSectionService` → `ClassSectionService` — class/section management
- `IAttendanceService` → `AttendanceService` — attendance marking and reporting

**`AddSignalR()`**
Registers the SignalR runtime. SignalR is the real-time layer — it maintains persistent WebSocket connections between the server and each logged-in browser tab.

**JWT Bearer Authentication Configuration**
```csharp
options.Events = new JwtBearerEvents
{
    OnMessageReceived = context =>
    {
        if (context.Request.Cookies.ContainsKey("token"))
            context.Token = context.Request.Cookies["token"];
        return Task.CompletedTask;
    }
};
```
By default, ASP.NET reads JWTs from the `Authorization: Bearer ...` HTTP header. This override tells it to also check the `token` **HttpOnly cookie**. This matters because HttpOnly cookies are inaccessible to JavaScript, making them significantly harder to steal via XSS attacks compared to `localStorage` tokens.

**Admin Seeding Block**
On startup, the app checks whether any `Admin` role teacher exists in the database. If not, it creates one using credentials from configuration (user-secrets in dev, environment variables in production). Credentials are **never hardcoded**. Uses `PasswordHasher<Teacher>` to hash the password before storing.

**Middleware Pipeline Order (critical — wrong order breaks the app)**
```
UseHttpsRedirection → UseCors → UseStaticFiles → UseRateLimiter
→ UseAuthentication → UseAuthorization → MapControllers → MapHub
```
- `UseAuthentication` must come before `UseAuthorization` — you must identify the user before you can check their permissions.
- `UseCors` must come before `UseAuthentication` — preflight `OPTIONS` requests must receive CORS headers before the auth middleware rejects them.
- `UseStaticFiles` serves files from `wwwroot` (including uploaded files) without authentication — intentional, since file URLs are UUID-named and not guessable.

---

### Database — `StudentManagement` DbContext

**File:** `backend/Data/StudentManagement.cs`

The EF Core `DbContext` is the central database gateway. It exposes every table as a `DbSet<T>` property and configures all relationships, constraints, and indexes in `OnModelCreating`.

#### DbSet Properties (one per database table):
| Property | Entity | Description |
|---|---|---|
| `Teachers` | `Teacher` | Staff and admin users |
| `Students` | `Student` | Student accounts |
| `Groups` | `Group` | Learning/class groups |
| `GroupMembers` | `GroupMember` | Student-group membership (soft-deletable) |
| `GroupManagers` | `GroupManager` | Co-teacher assignments to groups |
| `GroupPosts` | `GroupPost` | Notices and assignments posted in groups |
| `GlobalNotices` | `GlobalNotice` | School-wide announcements |
| `ReadStates` | `ReadState` | "Last viewed" timestamps per user per channel |
| `OtpCodes` | `OtpCode` | OTP codes for email verification and password reset |
| `AssignmentSubmissions` | `AssignmentSubmission` | Submission records per student per assignment |
| `ClassSections` | `ClassSection` | Class + section combinations with assigned instructor |
| `AttendanceRecords` | `AttendanceRecord` | Daily attendance per student per class |
| `RefreshTokens` | `RefreshToken` | Single-use refresh tokens for JWT rotation |

#### Key Constraints configured in `OnModelCreating`:

**Unique filtered index on `GroupMember`:**
```csharp
.HasIndex(gm => new { gm.GroupId, gm.StudentId })
.HasFilter("[RemovedAt] IS NULL")
.IsUnique();
```
Prevents a student from being added to the same group twice while active, but allows re-adding them after removal (since the old membership has a non-null `RemovedAt`).

**Unique filtered index on `Student` (Class + Section + RollNumber):**
```csharp
.HasIndex(s => new { s.Class, s.Section, s.RollNumber })
.IsUnique()
.HasFilter("[Class] IS NOT NULL AND [Section] IS NOT NULL AND [RollNumber] IS NOT NULL");
```
No two students can share a roll number in the same class-section. Null values (students without a class) are excluded from the constraint.

**UTC DateTime converter applied globally:**
```csharp
var utcConverter = new ValueConverter<DateTime, DateTime>(
    v => v,
    v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
```
SQL Server stores dates without timezone info. When EF Core reads them back, they come as `DateTimeKind.Unspecified`. This converter marks all read-back dates as UTC, preventing silent timezone bugs when dates are serialized to JSON for the frontend.

**`DeleteBehavior.Restrict` on key relationships:**
Used on `Group.CreatedBy`, `GroupPost.PostedBy`, `GlobalNotice.PostedBy`, etc. Prevents accidental cascading deletes that would wipe group data when a teacher account is deleted.

**`GETUTCDATE()` as default value for `CreatedAt`:**
Applied to both `Teacher` and `Student`, so database-level inserts that bypass EF will still get a correct timestamp.

---

### Domain Models (Modules)

Every entity in the `Modules` folder maps to a database table via EF Core.

#### `Teacher`
Represents both admin and teacher accounts (distinguished by the `Role` property: `"Admin"` or `"Teacher"`).
- `Id` (Guid) — primary key, generated on creation
- `FullName`, `Email`, `Password` (hashed), `Gender`, `Number`, `Address`
- `Profile` — stored filename of profile picture
- `Role` — `"Teacher"` (default) or `"Admin"`
- `EmailVerified`, `PendingEmail` — OTP-based email verification workflow
- `CreatedAt` — defaults to UTC now

#### `Student`
- Same personal fields as Teacher
- `Class`, `Section`, `RollNumber` — school placement (all three must be set together)
- `Addresh` (typo in original code, intentionally preserved) — address field
- `Role` — always `"Student"`
- `EmailVerified`, `PendingEmail` — same OTP verification as teachers

#### `Group`
Represents a class group managed by a teacher.
- `Name`, `Description`, `BackgroundImage` — display properties
- `CreatedById` — foreign key to the Teacher who created it
- `IsActive` — soft-delete flag (groups are never hard-deleted)
- `Members` — navigation to `GroupMember` collection
- `Managers` — navigation to `GroupManager` (co-teachers)

#### `GroupPost`
A post (notice or assignment) inside a group.
- `Type` — `"Notice"` (text/file announcement) or `"Assignment"` (requires file, has due date)
- `FileName` — UUID-named stored file; `OriginalFileName` — original user-visible filename
- `DueDate`, `AutoDeleteAt` — assignment due date and auto-expiry timestamp
- `SubmissionMode` — enum: `Physical` (teacher marks manually), `Online` (students upload files), `Both`

#### `AttendanceRecord`
- `ClassSectionId` + `StudentId` + `Date` — composite unique key (one record per student per day per class)
- `Status` — enum: `Present (0)`, `Absent (1)`, `Late (2)`, `Excused (3)`
- `MarkedById` — teacher who recorded/updated this entry
- `UpdatedAt` — set when an existing record is modified

#### `ClassSection`
Links a `ClassName + Section` string pair to a teacher instructor.
- Auto-created by `StudentPlacement.EnsureClassSectionExistsAsync` whenever a student is assigned a class
- `InstructorId` — optional foreign key to a Teacher; `null` = unassigned

#### `AssignmentSubmission`
- One record per (student, assignment post) pair
- `Status` — `NotSubmitted` or `Submitted` — set only by the teacher, not the student
- `FileName`, `OriginalFileName`, `OnlineSubmittedAt` — online file submission
- `Feedback` — teacher's written feedback

#### `OtpCode`
- `UserId`, `UserType` (`"Student"` or `"Teacher"`), `Purpose` (`EmailVerification` or `PasswordReset`)
- `CodeHash` — SHA-256 hash of the 6-digit code (raw code never stored)
- `Attempts` — incremented on each wrong guess; locked after 5 attempts
- `ExpiresAt`, `ConsumedAt` — expiry and one-time use enforcement

#### `RefreshToken`
- `Token` — 64-byte cryptographically random Base64 value
- `TeacherId` or `StudentId` — which user it belongs to
- `ExpiresAt` — 7-day lifetime
- Removed (rotated) on every use — makes refresh tokens single-use

#### `ReadState`
- Tracks the last time a user viewed a particular channel (a group or the global notices feed)
- `ChannelType` — `Group` or `GlobalNotice`
- `GroupId` — nullable; the specific group (null for global notices)

---

### DTOs

DTOs (Data Transfer Objects) in the `DTOs` folder define the shape of incoming HTTP request bodies. They are used for model binding in controllers.

| DTO | Used In | Purpose |
|---|---|---|
| `TeacherRegister` | `AuthController.RegisterTeacher` | `FullName`, `Email`, `Password` for new teacher |
| `TeacherLogin` | `AuthController.Login` | `Email`, `Password` for login |
| `TeacherProfileUpdate` | `TeacherController.UpdateProfile` | Profile fields + optional profile image |
| `UpdateTeacher` | `TeacherController.Update` | Full teacher update (admin only, includes `Role`) |
| `AddStudent` | `AuthController.AddStudent` | Full student creation including class placement |
| `UpdateStudent` | `StudentController.Update` | Full student update |
| `StudentProfileUpdate` | `StudentController.UpdateProfile` | Self-service profile update for students |
| `StudentLogin` | Same as `TeacherLogin` (unified) | Email + Password |
| `CreateGroupRequest` | `GroupController.CreateGroup` | Group name, description, optional background image, student IDs |
| `CreateGroupPostRequest` | `GroupController.CreateGroupPost` | Post type, title, content, file, due date, submission mode |
| `AssignmentSubmission` DTOs | `GroupController` | Submission status, feedback, online file |
| `CreateGlobalNoticeRequest` | `GlobalNoticesController` | Title, content, optional file, auto-delete date |
| `AuthExtra` | Auth endpoints | OTP codes, email change, password reset |
| `Attendance` DTOs | `AttendanceController` | Mark requests, roster queries |
| `ClassSection` | `ClassSectionsController` | Instructor assignment |

---

### Services Layer

Services contain all business logic. Controllers are intentionally thin — they only handle HTTP concerns (extract parameters, call a service, return the right HTTP status). All decisions, validations, and database interactions happen in services.

---

#### `AuthService` ⭐ (Most critical service)

**File:** `Services/AuthService.cs`

Handles every aspect of identity: registration, login, logout, token refresh, email verification, and password reset.

**`RegisterTeacherAsync(TeacherRegister request)`**
- Checks for duplicate email (case-insensitive)
- Hashes the password using `PasswordHasher<Teacher>` (ASP.NET Identity's PBKDF2-based hasher)
- Creates and saves a new `Teacher` entity
- Returns safe user data (never returns the hashed password)

**`AddStudentAsync(AddStudent request)`**
- Checks for duplicate email
- Calls `StudentPlacement.Normalize()` to validate and normalize the class/section/roll
- Calls `StudentPlacement.EnsureRollNumberFreeAsync()` to check for roll number collisions
- Calls `StudentPlacement.EnsureClassSectionExistsAsync()` to auto-create a ClassSection row
- Wraps `SaveChangesAsync` in a try/catch for `DbUpdateException` to handle race conditions where two simultaneous requests claim the same roll number — only one will succeed; the other gets a `409 Conflict`

**`LoginAsync(TeacherLogin request)`**
- Tries to find a Teacher by email; if not found, tries Student (single login endpoint for all roles)
- Verifies the password hash using `PasswordHasher<T>.VerifyHashedPassword`
- On success: generates a JWT access token (1 hour) and a refresh token (7 days)
- Stores the refresh token in the `RefreshTokens` table
- Returns a `LoginResult` record with both tokens and safe user data

**`LogoutAsync(string? refreshToken)`**
- Finds and deletes the refresh token from the database
- This invalidates the session server-side — even if someone copies the token before logout, it won't work

**`RefreshAsync(string? refreshToken)`**
Implements **refresh token rotation** — the core security pattern:
1. Finds the stored refresh token (includes the associated Teacher or Student via `.Include()`)
2. Checks if it's expired
3. Issues a **brand-new** refresh token and deletes the old one in the same transaction
4. Issues a new access token
5. If the refresh token is not found (already used), returns failure — this protects against token replay attacks

**`SendEmailVerificationAsync(Guid userId, string role)`**
- Calls `EnforceResendCooldownAsync` — prevents spamming OTP requests (60-second cooldown)
- Generates a 6-digit random numeric code using `RandomNumberGenerator.GetInt32` (cryptographically secure)
- Stores a **SHA-256 hash** of the code (never the raw code) with a 10-minute expiry
- Sends the raw code to the user's email via `IEmailService`
- Returns a masked email address (`j***@example.com`) to confirm where the code was sent

**`ConfirmEmailVerificationAsync(Guid userId, string role, string code)`**
- Finds the latest unconsumed OTP for the user
- Checks expiry and attempt count (max 5 attempts)
- Hashes the submitted code and compares to the stored hash
- On match: marks the OTP consumed, sets `EmailVerified = true`, and promotes `PendingEmail` → `Email` (if the user was changing their email)
- Incrementing `Attempts` on failure and immediately saving prevents timing attacks

**`RequestPasswordResetAsync(string email)` / `ResetPasswordAsync(string email, string code, string newPassword)`**
- The request method is **deliberately silent** about whether the email exists — returning an error like "no account found" would let attackers enumerate valid emails
- OTP flow is identical to email verification but with `OtpPurpose.PasswordReset`
- Reset method enforces minimum password length (6 chars) and re-hashes the new password

**Private helpers:**
- `HashCode(string code)` — SHA-256 hash using `SHA256.HashData`
- `GenerateNumericCode()` — cryptographically secure 6-digit number via `RandomNumberGenerator.GetInt32(0, 1_000_000)`
- `MaskEmail(string email)` — masks middle characters before the `@`
- `EnforceResendCooldownAsync` — queries the most recent OTP and throws if a fresh one was sent within 60 seconds

---

#### `JwtTokenService`

**File:** `Services/JwtTokenService.cs`

**`GenerateAccessToken(Teacher user)` / `GenerateAccessToken(Student user)`**
Both call the private `GenerateToken(Guid id, string fullName, string email, string role)` method.

Claims embedded in the token:
- `ClaimTypes.NameIdentifier` → user's GUID (used throughout the app to identify the caller)
- `ClaimTypes.Name` → full name
- `ClaimTypes.Email` → email
- `ClaimTypes.Role` → `"Admin"`, `"Teacher"`, or `"Student"` (drives all `[Authorize(Roles = ...)]` checks)

Signs the token with `HmacSha256` using the configured `Jwt:Key`. Token lifetime is **1 hour**.

**`GenerateRefreshTokenValue()`**
Returns `Convert.ToBase64String(RandomNumberGenerator.GetBytes(64))` — 64 random bytes as Base64 = 512 bits of entropy. This is the stored refresh token string.

---

#### `StudentService`

**File:** `Services/StudentService.cs`

**`GetPaged(int page)`**
Returns 10 students per page, sorted by `Class.Length → Class → Section → RollNumber → FullName`. Sorting by `.Length` first ensures `"2"` comes before `"10"` in a text column (natural sort approximation).

**`GetByIdAsync(Guid id)`**
Simple find-by-ID returning a projection (anonymous object) to avoid exposing the password hash.

**`UpdateAsync(Guid id, UpdateStudent request)`**
- Calls `StudentPlacement.Normalize()` and `EnsureRollNumberFreeAsync()` (excluding the current student to allow saving without changes)
- Calls `EnsureClassSectionExistsAsync()` to auto-create a class section if needed
- Updates profile image via `IFileStorageService` (deletes old file, saves new one)
- Catches `DbUpdateException` for race-condition roll-number conflicts

**`Search(string search, int limit)`**
Case-insensitive `Contains` search on `FullName`. Returns only `Id`, `FullName`, `Profile` — minimal data for search dropdowns.

**`UpdateProfileAsync(Guid id, StudentProfileUpdate request)`**
Student self-service profile update — only `Gender`, `Number`, `Addresh`, and profile image. Students cannot change their own email, class, or roll number through this method.

---

#### `TeacherService`

**File:** `Services/TeacherService.cs`

Mirrors `StudentService` but for teacher accounts. Key difference: `UpdateAsync` also accepts a `Role` field — admins can promote teachers to admin or demote admins. All profile updates handle file storage cleanup (old profile image deleted before new one is saved).

---

#### `GroupService` ⭐

**File:** `Services/GroupService.cs`

The most complex service — manages groups, their members, and co-teachers (managers).

**`CreateGroupAsync(Guid creatorId, CreateGroupRequest request)`**
- Validates group name
- Saves optional background image via `IFileStorageService`
- Creates the `Group` entity
- If `StudentIds` are provided, validates they exist and creates `GroupMember` records
- Returns safe group data

**`UpdateGroupAsync(int groupId, Guid actingUserId, bool isAdmin, UpdateGroupRequest request)`**
- Authorization check: must be admin or the group's creator
- Handles background image updates: if `RemoveBackgroundImage = true`, deletes the file and nulls the field; if a new image is provided, deletes old and saves new

**`GetGroupsAsync(Guid userId, bool isAdmin, bool isStudent)`**
Role-based filtering:
- Admin: sees all active groups
- Student: sees only groups they are an active member of
- Teacher: sees groups they created or co-manage

Projects `LastPostAt` as a correlated subquery — shows when the group was last active.

**`CanViewGroupAsync` / `CanManageGroupAsync`**
Two authorization helpers called by multiple methods. Separating "can view" from "can manage" is important: students can view but not manage; teachers can manage their own groups.

**`AddMembersAsync`**
- Checks for existing active memberships to avoid duplicates
- Validates provided student IDs exist in the database (prevents adding phantom IDs)
- Returns `(Added, Skipped)` counts so the UI can report what happened

**`RemoveMemberAsync`**
Soft-delete: sets `RemovedAt = DateTime.UtcNow` rather than deleting the record. This preserves history and allows re-adding members later.

**`DeleteGroupAsync`**
Soft-delete: sets `IsActive = false`. All queries filter `g.IsActive` so the group disappears from all views without losing data.

**`AddManagersAsync` / `RemoveManagerAsync`**
Co-teacher management. The group's creator cannot be added as a manager (they already have full control).

---

#### `GroupPostService` ⭐

**File:** `Services/GroupPostService.cs`

Manages notices and assignments within groups.

**`CreatePostAsync(int groupId, Guid postedById, bool isAdmin, CreateGroupPostRequest request)`**
- Authorization: only group managers/creators/admins can post
- Validates: Notices require content; Assignments require a file
- Validates `AutoDeleteAt` is in the future
- Maps submission mode string to enum (`"online"` → `Online`, `"both"` → `Both`, anything else → `Physical`)
- Saves the attached file via `IFileStorageService`
- After saving, fetches member IDs and manager IDs, then calls `IRealtimeNotifier.NotifyGroupPostAsync` to push a real-time notification to everyone in the group except the poster

**`GetPostsAsync(int groupId, Guid userId, bool isAdmin, bool isStudent)`**
- Authorization check via `CanViewGroupAsync`
- Calls `RemoveExpiredAsync` first (lazy expiry cleanup)
- Returns posts with a computed `HasSubmitted` field — `true` only when the teacher has ticked `Status = Submitted`, not just because a file was uploaded

**`RemoveExpiredAsync(int? groupId)`**
Checks for posts whose `AutoDeleteAt` has passed, deletes their associated files from disk, then removes the database records. Called on every `GetPostsAsync` and `GetRecentNoticesAsync` invocation — lazy cleanup without a background job.

**`DownloadPostAsync`**
- Authorization check
- Prevents students from downloading assignment files after the due date (but they can still see the post in the list — only download is blocked)

**`GetMyAssignmentsAsync(Guid userId)`**
Returns all assignments created by the teacher, with a `SubmittedCount` and `TotalStudents` computed server-side in a single query (no N+1 problem).

---

#### `AssignmentSubmissionService` ⭐

**File:** `Services/AssignmentSubmissionService.cs`

Handles the full lifecycle of assignment submissions — both physical (teacher-marked) and online (student file upload).

**Key design decision:** Uploading a file and being marked as "submitted" are **separate operations**. A student uploads their file (`SubmitOnlineWorkAsync`), but the `Status` remains `NotSubmitted` until the teacher explicitly ticks it (`SetSubmissionStatusAsync`). This prevents students from marking themselves submitted.

**`GetSubmissionsAsync(int postId, Guid userId, bool isAdmin)`**
- Authorization: only group managers/admins
- Fetches all group members and joins them with submissions (left join behavior)
- Returns a full student-by-student breakdown including online file presence and feedback

**`SetSubmissionStatusAsync`**
- Creates a new submission record if one doesn't exist yet (upsert pattern)
- Sets `Status` and `SubmittedAt`

**`SetSubmissionFeedbackAsync`**
- Creates/updates feedback text on the submission
- Calls `IRealtimeNotifier.NotifyAssignmentFeedbackAsync` to push a real-time notification to the student

**`SubmitOnlineWorkAsync(int postId, Guid studentId, IFormFile file)`**
- Validates the post accepts online submissions (`AllowsOnline`)
- Rejects submissions after the due date
- Deletes the previous submission file if one exists (student can resubmit)
- Saves the new file as a `Document` category
- After saving, notifies the group's teachers (creator + managers) via SignalR that a new submission arrived

**`DownloadMyOnlineSubmissionAsync` / `DownloadOnlineSubmissionAsync`**
Two separate download methods: one for the student downloading their own work, one for teachers downloading any student's submission.

---

#### `AttendanceService` ⭐

**File:** `Services/AttendanceService.cs`

**`NormalizeDate(DateTime date)`** (private helper)
Strips the time component and marks the result as UTC: `DateTime.SpecifyKind(date.Date, DateTimeKind.Utc)`. All attendance is date-only, stored at UTC midnight. This prevents timezone ambiguity.

**`MarkAttendanceAsync(MarkAttendanceRequest request, Guid markedById, bool isAdmin)`**
- Fetches the class section; non-admin teachers must be the assigned instructor
- Fetches all `validStudentIds` for the class+section — only students actually in the class can be marked
- Bulk-fetches existing records for this date (avoids N+1)
- For each submitted entry: **upserts** (updates existing record or inserts new one)
- Invalid student IDs are counted as `skipped`, not errors
- Returns `{saved, skipped, date}` for UI feedback

**`GetRosterAsync(int classSectionId, DateTime date)`**
Returns the full student list for a class with their attendance status for a specific date (null if not yet marked). Used by the "Take Attendance" page.

**`GetAttendanceSheetAsync(int classSectionId, DateTime? from, DateTime? to)`**
Returns a grid:
- Rows = students (ordered by roll number)
- Columns = dates
- Each cell = status string

Also computes `PresentCount`, `TotalMarked`, `PercentPresent` per student. Both `Present` and `Late` count toward the attendance percentage (you were there — just late).

**`GetStudentAttendanceAsync(Guid studentId, DateTime? from, DateTime? to)`**
Returns all attendance records for a specific student across all their class sections, with aggregated counts and percentage. Used by both the student's own view and the teacher's per-student view.

---

#### `ClassSectionService`

**File:** `Services/ClassSectionService.cs`

**`GetAllAsync()`**
Returns all class sections with instructor info and student count. Results are ordered by numeric class name (length-first sort so "2" precedes "10").

**`AssignInstructorAsync(int classSectionId, Guid? teacherId)`**
Allows assigning or clearing (passing `null`) the instructor for a class section. Only admin can do this.

**`GetMineAsync(Guid teacherId)`**
Returns only the class sections where this teacher is the assigned instructor — used for the teacher's "Take Attendance" class picker.

---

#### `GlobalNoticeService`

**File:** `Services/GlobalNoticeService.cs`

School-wide announcements visible to everyone.

**`GetNoticesAsync()`**
Calls `RemoveExpiredAsync()` first (same lazy cleanup pattern as group posts), then returns all notices ordered by `PostedAt` descending.

**`CreateNoticeAsync(Guid postedById, CreateGlobalNoticeRequest request)`**
- Validates: title required; either content or file required
- Saves file if attached
- Calls `IRealtimeNotifier.NotifyGlobalNoticeAsync` to push the notice to **all connected users** (`hub.Clients.All`) — global notices are visible to everyone

**`RemoveExpiredAsync()`**
Same lazy-expiry pattern as group posts.

---

#### `DashboardService`

**File:** `Services/DashboardService.cs`

Returns role-specific statistics. All three dashboard methods (`GetAdminDashboardAsync`, `GetTeacherDashboardAsync`, `GetStudentDashboardAsync`) are fully separate — each returns only the data relevant to that role.

**Admin Dashboard includes:**
- `totalTeachers`, `totalAdmins`, `totalStudents` — counts
- `activeGroups`, `inactiveGroups` — group health
- `genderBreakdown` — grouped query: `GroupBy(s => s.Gender)` with counts
- `groupsMissingCoTeacher` — groups with no managers
- `averageGroupSize` — total active members / active group count
- `recentActivity` — last 8 posts across all groups
- `upcomingAssignments` — next 5 assignments with future due dates
- `newStudentsThisWeek`, `newTeachersThisWeek` — growth metrics

**Student Dashboard** filters out assignments that are past-due OR already submitted, so the dashboard shows only actionable items.

---

#### `RealtimeNotifier`

**File:** `Services/RealtimeNotifier.cs`

A thin wrapper over `IHubContext<NotificationHub>` that provides named push methods. SignalR's `IHubContext` is the server-side handle for pushing messages without an active connection.

| Method | SignalR Event | Recipients |
|---|---|---|
| `NotifyGlobalNoticeAsync` | `"globalNotice"` | `Clients.All` (every connected user) |
| `NotifyGroupPostAsync` | `"groupPost"` | `Clients.Users(ids)` (specific user IDs) |
| `NotifyAssignmentFeedbackAsync` | `"assignmentFeedback"` | `Clients.User(studentId)` (one student) |
| `NotifyAssignmentSubmissionAsync` | `"assignmentSubmission"` | `Clients.Users(teacherIds)` (group's teachers) |

`Clients.Users(ids)` uses string user IDs. SignalR's default `IUserIdProvider` maps user IDs from the `NameIdentifier` claim — matching the Guid stored in the JWT.

---

#### `FileStorageService` & `FileValidation`

**`FileStorageService`** (`Services/FileStorageService.cs`)
Stores files in `wwwroot/uploads/` on disk.

**`SaveAsync(IFormFile file, FileCategory category)`**
1. Calls `FileValidation.ValidateAsync` (throws if invalid)
2. Creates the directory if it doesn't exist
3. Generates a new filename: `Guid.NewGuid() + extension` — UUID naming prevents:
   - Filename collisions between users
   - Path traversal attacks (no user input in filename)
   - Guessing other users' files
4. Writes the file to disk using `FileStream` with `await file.CopyToAsync(stream)`

**`Delete(string? storedFileName)`**
Silently no-ops if filename is null or file doesn't exist — safe to call even when a record might not have had a file.

**`ReadAsync(string storedFileName)`**
Returns `byte[]?` — null if the file doesn't exist on disk (instead of throwing).

**`FileValidation`** (`Services/FileValidation.cs`)
Defense-in-depth file validation:

1. **Empty file check** — rejects zero-byte files
2. **Size limit** — Images: 5 MB, Documents: 25 MB
3. **Extension whitelist** — Images: `.jpg/.jpeg/.png/.gif/.webp`; Documents: same + `.pdf/.doc/.docx/.xls/.xlsx/.ppt/.pptx/.txt/.csv/.zip`
4. **Magic number (file signature) validation** — reads the first 8 bytes of the file and compares against known signatures. This catches files renamed to a different extension (e.g., an `.exe` renamed to `.jpg`). `.docx/.xlsx/.pptx` are ZIP containers, so they share the ZIP magic bytes `0x50 0x4B 0x03 0x04`.

---

#### `StudentPlacement`

**File:** `Services/StudentPlacement.cs`

A static utility class for all class/section/roll-number validation logic. Extracted from services because both `AuthService.AddStudentAsync` and `StudentService.UpdateAsync` need it.

**`Normalize(className, section, rollNumber, required)`**
- Normalizes class name (collapses whitespace) and section (trims + uppercases)
- Enforces "all or nothing" rule: you can't provide just a class without a section and roll number
- Validates length limits and roll number range (1–9999)
- Returns a `Result` record

**`EnsureRollNumberFreeAsync(dbContext, placement, excludeStudentId)`**
Queries the database to check if the roll number is already taken. `excludeStudentId` lets the update operation re-save the same student without triggering a conflict against themselves.

**`EnsureClassSectionExistsAsync(dbContext, placement)`**
If a student is placed in a class that doesn't yet have a `ClassSection` row, this creates one. This ensures the admin can always find and assign an instructor to any occupied class-section. The new `ClassSection` is added to the DbContext's change tracker but saved by the caller's `SaveChangesAsync` (same unit of work — no partial saves).

---

#### `ReadStateService`

**File:** `Services/ReadStateService.cs`

Tracks "last viewed" timestamps for notification badging (the red dot on group cards and the notification bell).

**`GetLastViewedAsync`** — returns when the user last opened a group or the global notices page
**`MarkViewedAsync`** — upserts: if no record exists, creates one; otherwise updates `LastReadAt` to now
**`GetAllGroupLastViewedAsync`** — returns a dictionary of `{groupId: lastViewedTimestamp}` — called on the groups list page to compute unread badges for all groups at once

---

#### `EmailService`

**File:** `Services/EmailService.cs`

**`SendAsync(string toEmail, string subject, string bodyHtml)`**
- If `Smtp:Host` is not configured (local dev), logs the email content to the console instead of sending — this lets developers see OTP codes without needing a real SMTP server
- Uses `SmtpClient` with `EnableSsl = true` (required by Gmail and most providers)
- HTML email body — allows styled verification emails

---

### Controllers Layer

Controllers are intentionally thin. They:
1. Extract the current user's ID and role from `ClaimsPrincipal` (the decoded JWT)
2. Call the appropriate service method
3. Map service exceptions to HTTP status codes

Common helper pattern (in most controllers):
```csharp
private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
private bool IsAdmin => User.IsInRole("Admin");
private bool IsStudent => User.IsInRole("Student");
```

These read from the JWT claims. `ClaimTypes.NameIdentifier` holds the user's GUID. The role claim drives both authorization attributes and service-level logic.

#### `AuthController`

**`GET /api/Auth/me`** `[Authorize]`
Returns the current logged-in user's data. Looks up the Teacher or Student by the GUID from the JWT. This is the first call made by the frontend on every page load to hydrate the user state.

**`POST /api/Auth/TeacherRegister`** `[EnableRateLimiting("auth")]`
Open registration for teachers. Rate-limited to 5 per IP per minute.

**`POST /api/Auth/AddStudent`** `[Authorize(Roles = "Admin")]`
Admin-only student creation.

**`POST /api/Auth/login`** `[EnableRateLimiting("auth")]`
Sets two HttpOnly cookies on success:
- `token` — JWT access token, 1-hour lifetime
- `refreshToken` — refresh token, 7-day lifetime

`SetCookie` helper uses `SameSite = None` (required for cross-origin cookies) + `Secure = true` (cookies only sent over HTTPS) + `HttpOnly = true` (inaccessible to JavaScript).

**`POST /api/Auth/logout`**
Deletes the refresh token from the database and clears both cookies.

**`POST /api/Auth/refresh`** `[EnableRateLimiting("auth")]`
Reads the `refreshToken` cookie, validates and rotates it, then sets new cookies.

**OTP routes** (`/verification/send`, `/verification/change-email`, `/verification/confirm`)
Email verification workflow — all require `[Authorize]` (user must be logged in).

**Password routes** (`/password/forgot`, `/password/reset`)
Rate-limited. The forgot-password route always returns the same success message regardless of whether the email exists.

#### `GroupsController`

The largest controller — handles groups, members, managers, posts, submissions, and read-state in one controller. All routes require `[Authorize]`. Role-based restrictions applied per endpoint:
- Creating/deleting groups: `Admin,Teacher`
- Viewing groups: all roles
- Assignment submissions: teachers manage, students submit

Submission download routes return `File(bytes, "application/octet-stream", filename)` — the browser downloads the file with the original filename.

#### `AttendanceController`

**`POST /mark`** `[Admin,Teacher]` — mark or update attendance
**`GET /roster`** `[Admin,Teacher]` — get today's student list with current status
**`GET /sheet`** `[Admin,Teacher]` — get full attendance grid for date range
**`GET /student/{id}`** — teacher/admin can view any student; students can only view themselves (enforced: `if (IsStudent && studentId != CurrentUserId) return Forbid()`)
**`GET /my`** `[Student]` — student's own attendance shortcut

#### `ClassSectionsController`

**`GET /`** `[Admin,Teacher]` — all sections with student counts and instructors
**`PUT /{id}/instructor`** `[Admin]` — assign/clear instructor
**`GET /mine`** `[Admin,Teacher]` — sections assigned to the caller (for the attendance class picker)

---

### SignalR Hub

**File:** `Hubs/NotificationHub.cs`

```csharp
[Authorize]
public class NotificationHub : Hub { }
```

Intentionally empty — the hub itself has no custom methods. It just needs to exist as a type so ASP.NET Core's SignalR can:
1. Accept connections at `/hubs/notifications`
2. Authenticate them (via the `[Authorize]` attribute — reads the `token` cookie via the `OnMessageReceived` JWT event configured in `Program.cs`)
3. Associate each connection with a user ID (from `NameIdentifier` claim)

All server→client pushes are sent from `RealtimeNotifier` via `IHubContext<NotificationHub>`.

---

## Frontend Deep Dive

### Entry Point — `main.tsx`

```tsx
<StrictMode>
  <ThemeProvider>
    <Provider store={store}>
      <NotificationsProvider>
        <BrowserRouter>
          <ScrollToTop />
          <RouteProgressBar />
          <App />
          <Toaster position="top-right" />
        </BrowserRouter>
      </NotificationsProvider>
    </Provider>
  </ThemeProvider>
</StrictMode>
```

**`StrictMode`** — React development mode; renders components twice in dev to surface side effects. Removed in production builds.

**`ThemeProvider`** — Wraps the entire app to manage `light`/`dark` theme state, persisted to `localStorage`. Must wrap everything because theme context is needed everywhere.

**`Provider store={store}`** — Makes the Redux store available to every component via `useSelector` / `useDispatch`. Must wrap `NotificationsProvider` and `App` since both use Redux.

**`NotificationsProvider`** — Establishes the SignalR connection and maintains the real-time notification state. Wraps the router so it has access to the current user (via Redux/RTK Query) and can start the SignalR connection once logged in.

**`BrowserRouter`** — Enables client-side routing with the HTML5 History API. All route matching happens in `App.tsx`.

**`ScrollToTop`** — Scrolls the window to the top on every route change (React Router doesn't do this automatically).

**`RouteProgressBar`** — Shows a loading bar at the top of the screen during route transitions.

**`Toaster`** — Global toast notification container from `react-hot-toast`. Positioned top-right. Toast messages are triggered from anywhere in the app via `toast.success(...)` / `toast.error(...)`.

---

### Routing — `App.tsx`

Defines the entire client-side route tree using React Router v7's `<Routes>` + `<Route>`.

**Route Protection Components:**
- `<AdminRoute>` — renders children only if role is `"Admin"`, redirects to login otherwise
- `<TeacherRout>` — renders children only if role is `"Teacher"`
- `<StudentRoute>` — renders children only if role is `"Student"`
- `<RoleRoute allowedRoles={[...]}>` — renders children if role is in the allowed list

**Route organization:**
| Path pattern | Who can access |
|---|---|
| `/` | Everyone (landing page) |
| `/Login`, `/VerifyEmail`, `/ForgotPassword` | Unauthenticated users |
| `/AdminIndex`, `/RegisterTeacher`, `/AddStudents`, `/EditTeacher/:id`, `/EditStudent/:id`, `/ClassSections` | Admin only |
| `/TeacherIndex`, `/MyAssignments` | Teacher only |
| `/StudentIndex`, `/MyAttendance` | Student only |
| `/StudentView`, `/Teachers`, `/GroupsList`, `/CreateGroup`, `/TakeAttendance`, `/AttendanceSheet` | Admin + Teacher |
| `/groups/:id` | All authenticated (filtered by membership server-side) |
| `/GlobalNotices`, `/ViewYourProfile`, `/Student/:id`, `/Teacher/:id` | All authenticated |

---

### Redux Store — `store.ts`

**`combineReducers()`** merges all RTK Query API slice reducers into one root reducer:
```ts
const appReducer = combineReducers({
  [AuthApi.reducerPath]: AuthApi.reducer,
  [GroupApi.reducerPath]: GroupApi.reducer,
  // ... etc
});
```

**Reset-on-logout pattern:**
```ts
const rootReducer = (state, action) => {
  if (action.type === "auth/resetStore") {
    state = undefined;  // wipes the entire store
  }
  return appReducer(state, action);
};
```
When the user's session expires and the token refresh fails (in `baseQueryWithReauth`), the action `"auth/resetStore"` is dispatched. Setting state to `undefined` causes RTK Query to discard all cached data — the user can't see stale data from their previous session after they're redirected to login.

**`setupListeners(store.dispatch)`**
Enables RTK Query's `refetchOnFocus` and `refetchOnReconnect` behaviors — data refreshes when the browser tab regains focus or the network reconnects.

**`AppDispatch` and `RootState` exports** — typed dispatch and state for use with `useDispatch<AppDispatch>()` and `useSelector<RootState>()`.

---

### API Layer (RTK Query)

Every API file creates an RTK Query `createApi` slice. RTK Query handles caching, loading states, invalidation, and deduplication automatically.

#### `baseQueryWithReauth.ts` ⭐ (Shared by all API slices)

**`createBaseQueryWithReauth(apiPath: string)`**
Returns a base query function with transparent token refresh:

1. Makes the API request normally
2. If the response is HTTP 401 and it's not an auth endpoint:
   - Calls `refreshAccessToken()` — a singleton `fetch` call to `/api/Auth/refresh`
   - The singleton pattern (`refreshPromise`) prevents multiple simultaneous 401s from each triggering their own refresh — only one refresh happens, and all parallel requests wait for it
3. If refresh succeeds: retries the original request (the new `token` cookie is now set)
4. If refresh fails: dispatches `"auth/resetStore"` and redirects to `/Login`

This means the entire app handles token expiry silently — users never see a 401 error for expired tokens unless their refresh token itself is expired.

#### `AuthApi.ts`
Endpoints: `registerTeacher`, `addStudent`, `login`, `logout`, `refreshToken`, `getCurrentUser`, `sendVerificationEmail`, `changePendingEmail`, `confirmEmailVerification`, `forgotPassword`, `resetPassword`

`getCurrentUser` provides tag `["CurrentUser", "User"]`. When login invalidates `["User"]`, the `getCurrentUser` cache is automatically cleared and re-fetched, keeping user state fresh.

#### `GroupApi.ts`
The largest API slice — handles all group and post operations.

Tag invalidation strategy:
- `createGroup`, `deleteGroup` invalidate `{type: "Group", id: "LIST"}`
- `addGroupMembers`, `removeGroupMember` invalidate the specific group by ID
- `createGroupPost`, `deleteGroupPost` invalidate the group's post list AND the notices list AND my-assignments

`getAllGroupsLastViewed` returns a `Record<string, string>` (groupId → ISO timestamp) used to compute unread badges on the groups list page.

#### `AttendanceApi.ts`
Fully typed with TypeScript interfaces:
- `AttendanceEntry` — `{studentId, status}`
- `RosterResponse` — class section + date + student list with current status
- `AttendanceSheetResponse` — grid of dates × students with records dictionary
- `StudentAttendanceResponse` — summary counts + full record list

All queries accept optional `from`/`to` date filter params via `URLSearchParams`.

#### `ClassSectionApi.ts`
`getMyClassSections` — called on the "Take Attendance" page to populate the class picker for the logged-in teacher.

#### `GlobalNoticeApi.ts`
Includes read-state endpoints (`getLastViewedGlobalNotices`, `markGlobalNoticesViewed`) that drive the unread badge count in the notification bell.

---

### Key Components

#### `NotificationsProvider.tsx` ⭐

This component creates and manages the SignalR connection for the entire app.

**Connection lifecycle:**
- Established when `user?.id` is truthy (user is logged in)
- Torn down when user logs out (`user?.id` becomes falsy)
- `withAutomaticReconnect()` handles network drops transparently

**Event handlers:**
- `"globalNotice"` → invalidates `GlobalNotice` RTK Query tag → triggers a re-fetch of global notices
- `"groupPost"` → invalidates `GroupPost` and `Group:NOTICES` tags → updates the group's post list and notices bell in real time
- `"assignmentFeedback"` → invalidates `Submission` tag AND adds a rich notification to local state
- `"assignmentSubmission"` → invalidates `Submission` tag AND adds a notification to local state

The `realtimeNotifications` state (feedback + submission events) is kept in local React state (not Redux) because it's ephemeral — it doesn't need to survive page reloads.

**`useNotifications()` hook** — provides `{realtimeNotifications, unreadRealtimeCount, markRealtimeRead}` to any component that needs it.

#### `NotificationBell.tsx`

Aggregates three notification sources into one bell icon:
1. **Unread group notices/assignments** — computed by `getUnreadNotices(groupNotices, groupLastViewedMap)`: compares post timestamps against last-viewed timestamps
2. **Unread global notices** — computed by `getUnreadGlobalNotices(globalNotices, globalLastViewed?.lastViewedAt)`
3. **Real-time notifications** (feedback + submission events) from `useNotifications()`

Total unread count drives the red badge: `totalUnread = unread group + unread global + unread realtime`

Opening the popover shows all three types in a unified list. Clicking navigates to the relevant page.

#### `ThemeProvider.tsx`

Stores theme preference (`"light"` or `"dark"`) in `localStorage`. Applies it as a CSS class on the `<html>` element (`document.documentElement`). Tailwind's dark mode is configured to use the `class` strategy, so this drives all `dark:` utility classes.

#### Route Guards (`components/Routes/`)

`AdminRoute`, `TeacherRout`, `StudentRoute`, `RoleRoute` each:
1. Call `useCurrentUser()` to get the current user and role
2. While loading, show a loading spinner
3. If not logged in, redirect to `/Login`
4. If wrong role, redirect to `/` (home page)
5. If authorized, render children

---

### Hooks & Utilities

#### `useCurrentUser.ts`

```ts
export function useCurrentUser() {
  const { data: user, isLoading, isError } = useGetCurrentUserQuery();
  return {
    user,
    role: user?.role,
    isAdmin: user?.role === "Admin",
    isTeacher: user?.role === "Teacher",
    isStudent: user?.role === "Student",
    isLoading,
    isError,
    isLoggedIn: !!user,
  };
}
```

Called in every route guard and many page components. RTK Query caches the result — only one network request is made regardless of how many components call this hook simultaneously.

#### `lib/config.ts`

**`API_BASE_URL`** — read from `VITE_API_BASE_URL` env var; falls back to `https://localhost:7014` with a console warning if not set. Every API call base URL flows from here.

**`getUploadUrl(fileName?: string | null): string | null`**
Converts a stored filename (`"uuid.jpg"`) to a full URL (`https://api.example.com/uploads/uuid.jpg`). Returns `null` for missing/null filenames so callers can easily show a placeholder avatar.

#### `lib/signalr.ts`

**`createNotificationConnection()`**
Builds a SignalR `HubConnection` to `/hubs/notifications` with:
- `withCredentials: true` — sends the `token` HttpOnly cookie so SignalR is authenticated
- `withAutomaticReconnect()` — reconnects automatically after network drops

#### `lib/utils.ts`

**`cn(...inputs: ClassValue[])`**
Merges Tailwind CSS class names using `clsx` (conditional classes) + `tailwind-merge` (resolves conflicting utility conflicts, e.g., `"p-2 p-4"` → `"p-4"`). Used everywhere a component accepts a `className` prop.

---

## Authentication & Security Flow

```
Browser                          Backend
  │                                │
  ├─── POST /api/Auth/login ───────►│
  │    {email, password}           │  1. Find Teacher or Student by email
  │                                │  2. Verify password hash (PBKDF2)
  │                                │  3. Generate JWT (1 hr) + Refresh Token (7 days)
  │◄── Set-Cookie: token=<JWT>─────┤  4. Store refresh token in DB
  │    Set-Cookie: refreshToken=X  │
  │                                │
  ├─── GET /api/Auth/me ──────────►│  (cookie sent automatically by browser)
  │◄── {id, role, fullName, ...} ──┤  JWT validated; user loaded from DB
  │                                │
  │  [1 hour passes]               │
  │                                │
  ├─── GET /api/Group ────────────►│
  │◄── 401 Unauthorized ───────────┤  JWT expired
  │                                │
  │  [baseQueryWithReauth intercepts]
  ├─── POST /api/Auth/refresh ────►│
  │    (refreshToken cookie sent)  │  1. Find refresh token in DB
  │                                │  2. Rotate: delete old, create new
  │◄── Set-Cookie: token=<new JWT>─┤  3. Issue new JWT + new refresh token
  │    Set-Cookie: refreshToken=Y  │
  │                                │
  ├─── GET /api/Group (retry) ────►│  New JWT works
  │◄── 200 OK ─────────────────────┤
```

If the refresh token is expired or not found (e.g., user logged in elsewhere and that session expired), the refresh returns 401, `baseQueryWithReauth` dispatches `"auth/resetStore"`, and the browser is redirected to `/Login`.

---

## Feature Flows

### User Registration & Login

**Teacher Registration:**
```
Frontend → POST /api/Auth/TeacherRegister {FullName, Email, Password}
Backend:
  1. Check duplicate email
  2. Hash password (PBKDF2)
  3. Insert Teacher with Role = "Teacher"
  4. Return {Id, FullName, Email, Role}
```

**Student Registration (Admin only):**
```
Admin → POST /api/Auth/AddStudent {FullName, Email, Password, Class, Section, RollNumber}
Backend:
  1. Check duplicate email
  2. Normalize + validate class placement
  3. Check roll number uniqueness in class+section
  4. Auto-create ClassSection row if needed
  5. Insert Student
```

### Email Verification & Password Reset (OTP)

```
User clicks "Verify Email"
→ POST /api/Auth/verification/send
→ Backend: enforce 60s cooldown → generate 6-digit code
         → hash with SHA-256 → store in OtpCodes
         → email raw code to user

User enters code
→ POST /api/Auth/verification/confirm {code}
→ Backend: find latest unconsumed OTP
         → check expiry (10 min) and attempts (max 5)
         → hash submitted code → compare
         → if match: mark consumed, set EmailVerified = true
         → if PendingEmail: promote to Email
```

### Group & Post Management

```
Teacher creates group
→ POST /api/Groups {name, description, backgroundImage, studentIds[]}
→ Creates Group + GroupMember records

Teacher posts assignment
→ POST /api/Groups/{id}/posts {type:"Assignment", title, file, dueDate, submissionMode}
→ Saves file to wwwroot/uploads/
→ Creates GroupPost record
→ SignalR pushes "groupPost" event to all group members (except poster)
→ Frontend's NotificationsProvider invalidates GroupPost cache
→ Student's group page auto-updates
```

### Assignment Submission

```
[Student — Online submission]
Student → POST /api/Groups/{id}/posts/{postId}/submissions/online {file}
→ Backend: check mode allows online, check due date not passed
         → save file, update submission record (FileName, OnlineSubmittedAt)
         → SignalR "assignmentSubmission" → teachers notified

[Teacher — Mark as submitted]
Teacher → PUT /api/Groups/{id}/posts/{postId}/submissions/{studentId} {submitted: true}
→ Backend: set Status = Submitted, SubmittedAt = now

[Teacher — Leave feedback]
Teacher → PUT /api/Groups/{id}/posts/{postId}/submissions/{studentId}/feedback {feedback}
→ Backend: save feedback text
         → SignalR "assignmentFeedback" → student notified with toast
```

### Attendance System

```
Admin assigns instructor to class section
→ PUT /api/ClassSections/{id}/instructor {TeacherId}

Teacher takes attendance
→ GET /api/Attendance/roster?classSectionId=X&date=Y
  → Returns student list with existing statuses

Teacher submits
→ POST /api/Attendance/mark {classSectionId, date, records[{studentId, status}]}
→ Backend: validate instructor match
         → upsert AttendanceRecord for each student

View attendance sheet
→ GET /api/Attendance/sheet?classSectionId=X&from=Y&to=Z
→ Returns grid with PresentCount, Absent, Late, Excused, PercentPresent
  (Present + Late both count toward attendance percentage)
```

### Real-Time Notifications

```
Browser connects to SignalR on login:
  WebSocket → /hubs/notifications (authenticated via token cookie)

Server pushes events:
  "globalNotice"        → all connected users → invalidate GlobalNotice cache
  "groupPost"           → specific user IDs   → invalidate GroupPost cache
  "assignmentFeedback"  → one student         → adds bell notification
  "assignmentSubmission"→ group's teachers    → adds bell notification

Bell badge = unread group posts + unread global notices + unread realtime count
```

### Global Notices

School-wide announcements. Any admin or teacher can post; everyone sees them.

```
Admin/Teacher creates notice
→ POST /api/GlobalNotices {title, content, file?, autoDeleteAt?}
→ Saved to DB + file stored
→ SignalR "globalNotice" → Clients.All → everyone's cache invalidated

User reads notices
→ GET /api/GlobalNotices
→ Lazy cleanup: expired notices (AutoDeleteAt < now) deleted first
→ Returns notices ordered newest-first

User marks as read
→ POST /api/GlobalNotices/mark-viewed
→ Saves LastReadAt timestamp
→ Bell badge recalculated
```

### Dashboard

Three separate endpoints, one per role:
- **Admin**: `/api/Dashboard/dashboard`
- **Teacher**: `/api/Dashboard/teacher-dashboard`
- **Student**: `/api/Dashboard/student-dashboard`

Each returns role-relevant statistics, recent activity, and upcoming assignments. No data leaks between roles.

---

## Role-Based Access Control

### Backend (authoritative enforcement)
- `[Authorize]` — must be logged in (valid JWT)
- `[Authorize(Roles = "Admin")]` — admin only
- `[Authorize(Roles = "Admin,Teacher")]` — admin or teacher
- `[Authorize(Roles = "Student")]` — student only
- Service-level: `isAdmin` / `IsStudent` flags passed from controllers enable fine-grained logic (e.g., students can only view their own attendance)

### Frontend (UX convenience — not a security boundary)
- Route guards (`AdminRoute`, `TeacherRout`, `StudentRoute`, `RoleRoute`) prevent unauthorized users from navigating to restricted pages
- UI elements (buttons, menu items) shown/hidden based on `useCurrentUser().isAdmin` etc.
- The backend always validates — frontend restrictions are for UX only

---

## File Storage & Validation

All uploaded files are stored at `backend/wwwroot/uploads/` with UUID-based names.

**Security measures:**
1. Extension whitelist — only safe formats accepted
2. Magic number validation — actual file content verified against expected bytes
3. Size limits — 5 MB for images, 25 MB for documents
4. UUID naming — no user input in stored filenames; not guessable
5. Served as static files by ASP.NET Core (`UseStaticFiles`) — no auth required to access (URLs are non-guessable UUIDs)

**File cleanup:**
- Profile image updates: old file deleted before new one is saved
- Post/notice deletion: associated file deleted with the record
- Auto-expired posts/notices: file deleted during lazy cleanup

---

## Key Design Decisions & Patterns

### 1. HttpOnly Cookies for JWT (not localStorage)
Access tokens in `localStorage` are readable by JavaScript, making them vulnerable to XSS. HttpOnly cookies are invisible to JavaScript — a successful XSS attack can't read or steal the token.

### 2. Refresh Token Rotation
Every token refresh issues a new refresh token and deletes the old one. If an attacker steals a refresh token and uses it, the legitimate user's next refresh will fail (old token is gone), alerting them to the breach. The attacker's subsequent use also fails.

### 3. Soft Deletes for Groups and Memberships
Groups are never deleted — `IsActive = false`. Members are never deleted — `RemovedAt` is set. This preserves data integrity (posts, submissions, attendance records all reference these entities) and audit history.

### 4. OTP Codes Stored as Hashes
The 6-digit code sent to the user is never stored — only its SHA-256 hash. If the database is compromised, the attacker still can't use the codes (they can't reverse SHA-256 to get the original 6 digits fast enough before the 10-minute expiry).

### 5. Service Interface Pattern
Every service is behind an interface (`IAuthService`, `IGroupService`, etc.). This enables:
- Easy unit testing (mock the interface)
- Swapping implementations without touching controllers
- Dependency inversion (controllers depend on abstractions, not concrete classes)

### 6. RTK Query for All Data Fetching
RTK Query provides automatic caching, loading/error states, tag-based cache invalidation, and deduplication. The app never manually manages loading spinners or request deduplication.

### 7. Lazy Auto-Delete for Posts and Notices
Instead of a background job or scheduled task, expired content is deleted on the first read after expiry. This is simpler to reason about (no race conditions with background jobs) and good enough for a school management system where read frequency is high.

### 8. Single Login Endpoint for All Roles
`POST /api/Auth/login` handles teachers, admins, and students. It first checks the Teachers table, then the Students table. This simplifies the frontend (one login form) while still returning role-specific data.

### 9. Attendance: Present + Late = Attended
Both `Present` and `Late` count toward the attendance percentage. Late is tracked separately for display but doesn't penalize the student's attendance score. This is reflected in both the sheet view and the student's personal summary.

### 10. ClassSection Auto-Creation
When a student is assigned a class+section combination that doesn't exist yet, a `ClassSection` row is auto-created. Admins never need to manually create class sections — they appear automatically as students are enrolled.

---

## Configuration & Setup

### Backend Configuration

**`appsettings.json`** (committed — no secrets):
```json
{
  "ConnectionStrings": {
    "ManagementDbConnection": "Server=(localdb)\\MSSQLLocalDB;Database=StudentManagementDb;..."
  },
  "Jwt": { "Issuer": "StudentManagementAPI", "Audience": "StudentManagementClient", "Key": "" },
  "Smtp": { "Host": "smtp.gmail.com", "Port": 587, ... },
  "SeedAdmin": { "Email": "", "Password": "" }
}
```

**Secrets (never committed — use user-secrets in dev, env vars in prod):**
```
Jwt:Key          → strong random secret key (min 32 chars recommended)
Smtp:User        → SMTP username
Smtp:Password    → SMTP password
Smtp:From        → sender email address
SeedAdmin:Email  → initial admin email
SeedAdmin:Password → initial admin password
```

**Setting user-secrets (dev):**
```bash
cd backend/backend
dotnet user-secrets set "Jwt:Key" "your-secret-key"
dotnet user-secrets set "SeedAdmin:Email" "admin@school.com"
dotnet user-secrets set "SeedAdmin:Password" "YourPassword123"
```

**Database setup:**
```bash
cd backend/backend
dotnet ef database update
```

**Run backend:**
```bash
dotnet run
```

### Frontend Configuration

**`.env.local`** (not committed — see `.env.example`):
```
VITE_API_BASE_URL=https://localhost:7014
```

**Install and run:**
```bash
cd frontend
npm install
npm run dev        # development server at http://localhost:5173
npm run build      # production build
```

---

## API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/Auth/TeacherRegister` | None (rate-limited) | Register a new teacher |
| POST | `/api/Auth/AddStudent` | Admin | Add a student |
| POST | `/api/Auth/login` | None (rate-limited) | Login (all roles) |
| POST | `/api/Auth/logout` | Any | Logout + clear cookies |
| POST | `/api/Auth/refresh` | None (rate-limited) | Rotate access + refresh token |
| GET | `/api/Auth/me` | Any | Get current user |
| POST | `/api/Auth/verification/send` | Any | Send email OTP |
| POST | `/api/Auth/verification/change-email` | Any | Change pending email |
| POST | `/api/Auth/verification/confirm` | Any | Confirm email with OTP |
| POST | `/api/Auth/password/forgot` | None (rate-limited) | Request password reset OTP |
| POST | `/api/Auth/password/reset` | None (rate-limited) | Reset password with OTP |

### Students

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/Student/Students?page=N` | Admin,Teacher | Paginated student list |
| GET | `/api/Student/{id}` | Admin,Teacher | Get student by ID |
| GET | `/api/Student/search?search=X&limit=N` | Admin,Teacher | Search students |
| PUT | `/api/Student/student/{id}` | Admin | Update student |
| DELETE | `/api/Student/{id}` | Admin | Delete student |
| PUT | `/api/Student/profile/{id}` | Student (self) | Update own profile |

### Teachers

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/Teacher/Teachers?page=N` | Admin | Paginated teacher list |
| GET | `/api/Teacher/Teacher/{id}` | Admin | Get teacher by ID |
| GET | `/api/Teacher/me` | Teacher | Get own profile |
| GET | `/api/Teacher/searchTeacher?search=X` | Admin,Teacher | Search teachers |
| PUT | `/api/Teacher/teacher/{id}` | Admin | Update teacher |
| DELETE | `/api/Teacher/teacher/{id}` | Admin | Delete teacher |
| PUT | `/api/Teacher/profile/{id}` | Teacher (self) | Update own profile |

### Groups

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/Groups` | Any | List groups (role-filtered) |
| POST | `/api/Groups` | Admin,Teacher | Create group |
| GET | `/api/Groups/{id}` | Any | Get group detail |
| PUT | `/api/Groups/{id}` | Admin,Teacher | Update group |
| DELETE | `/api/Groups/{id}` | Admin,Teacher | Soft-delete group |
| POST | `/api/Groups/{id}/members` | Admin,Teacher | Add members |
| DELETE | `/api/Groups/{id}/members/{studentId}` | Admin,Teacher | Remove member |
| POST | `/api/Groups/{id}/managers` | Admin,Teacher | Add co-teachers |
| DELETE | `/api/Groups/{id}/managers/{teacherId}` | Admin,Teacher | Remove co-teacher |
| GET | `/api/Groups/student/{studentId}` | Admin,Teacher | Groups for a student |
| POST | `/api/Groups/{id}/posts` | Admin,Teacher | Create post/assignment |
| GET | `/api/Groups/{id}/posts` | Any | List group posts |
| DELETE | `/api/Groups/{id}/posts/{postId}` | Admin,Teacher | Delete post |
| GET | `/api/Groups/{id}/posts/{postId}/download` | Any | Download post file |
| GET | `/api/Groups/notices` | Any | Recent notices (all groups) |
| GET | `/api/Groups/my-assignments` | Admin,Teacher | Teacher's own assignments |
| GET/POST | `/api/Groups/{id}/last-viewed` / `mark-viewed` | Any | Read-state tracking |
| GET | `/api/Groups/{id}/posts/{postId}/submissions` | Admin,Teacher | View submissions |
| PUT | `/api/Groups/{id}/posts/{postId}/submissions/{studentId}` | Admin,Teacher | Set submission status |
| PUT | `/api/Groups/{id}/posts/{postId}/submissions/{studentId}/feedback` | Admin,Teacher | Set feedback |
| GET | `/api/Groups/{id}/posts/{postId}/submissions/me` | Student | My submission |
| POST | `/api/Groups/{id}/posts/{postId}/submissions/online` | Student | Upload submission file |
| GET | `/api/Groups/{id}/posts/{postId}/submissions/online/download` | Student | Download own submission |
| GET | `/api/Groups/{id}/posts/{postId}/online-submissions/{studentId}/download` | Admin,Teacher | Download any submission |

### Attendance

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/Attendance/mark` | Admin,Teacher | Mark/update attendance |
| GET | `/api/Attendance/roster?classSectionId=X&date=Y` | Admin,Teacher | Day roster with status |
| GET | `/api/Attendance/sheet?classSectionId=X&from=Y&to=Z` | Admin,Teacher | Full attendance sheet |
| GET | `/api/Attendance/student/{id}?from=Y&to=Z` | Admin,Teacher,Student(self) | Student attendance summary |
| GET | `/api/Attendance/my?from=Y&to=Z` | Student | Own attendance (shortcut) |

### Class Sections

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/ClassSections` | Admin,Teacher | All sections |
| PUT | `/api/ClassSections/{id}/instructor` | Admin | Assign/clear instructor |
| GET | `/api/ClassSections/mine` | Admin,Teacher | My assigned sections |

### Global Notices

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/GlobalNotices` | Any | All notices |
| POST | `/api/GlobalNotices` | Admin,Teacher | Create notice |
| DELETE | `/api/GlobalNotices/{id}` | Admin,Teacher | Delete notice |
| GET | `/api/GlobalNotices/{id}/download` | Any | Download attachment |
| GET | `/api/GlobalNotices/last-viewed` | Any | Get last viewed timestamp |
| POST | `/api/GlobalNotices/mark-viewed` | Any | Mark as viewed |

### Dashboard

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/Dashboard/dashboard` | Admin | Admin statistics |
| GET | `/api/Dashboard/teacher-dashboard` | Teacher | Teacher statistics |
| GET | `/api/Dashboard/student-dashboard` | Student | Student statistics |

### Real-Time (SignalR)

| Endpoint | Auth | Description |
|---|---|---|
| `wss://localhost:7014/hubs/notifications` | JWT cookie | WebSocket hub for push notifications |

**Events received by the client:**

| Event | Payload | Sent to |
|---|---|---|
| `globalNotice` | notice object | All connected users |
| `groupPost` | `{groupId}` | Group members + managers |
| `assignmentFeedback` | `{postId, groupId, title, feedback}` | The specific student |
| `assignmentSubmission` | `{postId, groupId, title, studentName}` | Group's teachers |

---

*This README was auto-generated from source code analysis of StudentGrid v1.0 — last updated September 25, 2026.*
