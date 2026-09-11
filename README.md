# StudentGrid — Student Management System

A full-stack web application for managing students, teachers, groups, assignments, and school-wide announcements. Built with a .NET 10 backend and a React/TypeScript frontend.

---

## Table of Contents

1. [What This System Does](#1-what-this-system-does)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [How to Run the Project](#4-how-to-run-the-project)
5. [Database Tables and Their Relationships](#5-database-tables-and-their-relationships)
6. [How Dependency Injection Works in This Project](#6-how-dependency-injection-works-in-this-project)
7. [Backend — Services (Business Logic)](#7-backend--services-business-logic)
8. [Backend — Controllers (API Endpoints)](#8-backend--controllers-api-endpoints)
9. [Backend — Data Models (Modules)](#9-backend--data-models-modules)
10. [Backend — DTOs (Data Transfer Objects)](#10-backend--dtos-data-transfer-objects)
11. [The Notice and Announcement Feature — In Depth](#11-the-notice-and-announcement-feature--in-depth)
12. [Frontend — How the UI is Built](#12-frontend--how-the-ui-is-built)
13. [Frontend — API Layer (RTK Query)](#13-frontend--api-layer-rtk-query)
14. [Authentication — JWT + Cookies](#14-authentication--jwt--cookies)
15. [File Upload and Download](#15-file-upload-and-download)
16. [Role-Based Access Control](#16-role-based-access-control)
17. [The Notification Bell — Unread Count Logic](#17-the-notification-bell--unread-count-logic)
18. [Dashboard](#18-dashboard)
19. [Complete API Reference](#19-complete-api-reference)

---

## 1. What This System Does

StudentGrid is a school management platform with three types of users:

| Role | What they can do |
|---|---|
| **Admin** | Full control: manage teachers, students, groups, post global announcements, view system-wide dashboard |
| **Teacher** | Create and manage their own groups, add/remove students, post notices and assignments, view their own dashboard |
| **Student** | View groups they belong to, read notices and assignments posted for those groups, update their own profile |

The main features are:

- **Teacher & Student management** — add, edit, view, and delete user accounts
- **Groups** — class-like spaces where teachers post content for their students
- **Group Posts** — two types: "Notice" (text message) and "Assignment" (file + optional text, with a due date)
- **Global Announcements** — school-wide messages posted by Admin, visible to everyone
- **Read/Unread tracking** — a notification bell that shows how many new notices have appeared since the user last looked
- **Auto-delete** — notices and announcements can be set to expire and delete themselves automatically
- **File attachments** — files can be attached to any post or announcement and downloaded by members
- **Dashboard** — personalized statistics for each role

---

## 2. Technology Stack

### Backend

| Technology | What it is | Why it's used here |
|---|---|---|
| **.NET 10 / ASP.NET Core** | Microsoft's web framework | Runs the API server, handles HTTP requests and responses |
| **Entity Framework Core 10** | An ORM (Object-Relational Mapper) — lets you work with the database using C# code instead of raw SQL | Reads and writes to SQL Server; manages all the database tables |
| **SQL Server (LocalDB)** | A relational database | Stores all data: users, groups, notices, posts |
| **JWT (JSON Web Tokens)** | A standard way to securely pass identity information | Used for login sessions; after you log in, a JWT token proves who you are on every request |
| **ASP.NET Core Identity PasswordHasher** | A built-in password hashing library | Passwords are never stored as plain text; they are hashed before saving |
| **Swashbuckle / Swagger** | Generates an interactive API documentation page | Available at `/swagger` during development for testing endpoints |

### Frontend

| Technology | What it is | Why it's used here |
|---|---|---|
| **React 19** | A JavaScript library for building user interfaces | Renders all the pages and components the user sees |
| **TypeScript** | JavaScript with type safety | Catches errors before the code runs; makes the codebase easier to maintain |
| **Vite 8** | A fast build tool and development server | Compiles and serves the frontend; hot-reloads on file changes |
| **Redux Toolkit + RTK Query** | State management + data fetching library | Manages all API calls and caches the results; avoids duplicate network requests |
| **React Router DOM 7** | Client-side routing | Handles navigation between pages without full page reloads |
| **Tailwind CSS 4** | A utility-first CSS framework | Applies styles using class names directly in the JSX |
| **shadcn/ui** | A pre-built accessible component library built on Radix UI | Provides ready-made buttons, dialogs, inputs, popovers, etc. |
| **Lucide React** | Icon library | Provides all the icons (bell, trash, megaphone, etc.) |
| **react-hot-toast** | Toast notification library | Shows brief success/error popups in the top-right corner |
| **react-hook-form** | Form state management | Manages form inputs and validation |

---

## 3. Project Structure

```
StudentManagement/
├── backend/
│   └── backend/
│       ├── Controllers/       ← HTTP endpoint handlers (receive requests, return responses)
│       ├── Services/          ← Business logic (the real work happens here)
│       │   └── Interfaces/    ← Contracts (blueprints) that services must follow
│       │   └── Exceptions/    ← Custom error types (NotFoundException, ForbiddenException, etc.)
│       ├── Modules/           ← Database table definitions (C# classes that map to DB tables)
│       ├── DTOs/              ← Data shapes for incoming requests
│       ├── Data/              ← Database context (the bridge between C# and SQL Server)
│       ├── Migrations/        ← Auto-generated database change history
│       ├── wwwroot/uploads/   ← Where uploaded files are stored on disk
│       ├── Program.cs         ← Application startup, service registration, middleware setup
│       └── appsettings.json   ← Configuration (connection string, JWT settings)
│
└── frontend/
    └── src/
        ├── pages/             ← Full page components (one per route)
        │   ├── Auth/          ← Login, Register, Add Student pages
        │   ├── Student/       ← Student list, detail, edit pages
        │   ├── Teacher/       ← Teacher list, detail, edit, profile pages
        │   ├── Group/         ← Group list, detail, create pages
        │   ├── AdminIndex.tsx ← Admin dashboard
        │   ├── TeacherIndex.tsx ← Teacher dashboard
        │   ├── StudentIndex.tsx ← Student dashboard
        │   └── GlobalNotices.tsx ← Announcements page
        ├── components/        ← Reusable UI pieces
        │   ├── NavBar.tsx     ← Top navigation bar with search and notification bell
        │   ├── NotificationBell.tsx ← The bell icon with unread count badge
        │   ├── SlideMenu.tsx  ← Sidebar navigation menu
        │   ├── Routes/        ← Route guards (AdminRoute, TeacherRoute, StudentRoute)
        │   ├── layouts/       ← Page layouts (DashboardLayout wraps all dashboard pages)
        │   ├── form/          ← Reusable form components
        │   ├── group/         ← Group-specific components
        │   ├── utils/         ← Pure helper functions (unread detection logic)
        │   └── ui/            ← shadcn/ui base components (button, input, dialog, etc.)
        ├── api/               ← RTK Query API slices (one file per backend resource)
        ├── store.ts           ← Redux store setup, combines all API reducers
        ├── App.tsx            ← All routes defined here
        └── main.tsx           ← Application entry point
```

---

## 4. How to Run the Project

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org)
- SQL Server LocalDB (comes with Visual Studio)

### Backend

```bash
cd backend/backend

# Restore packages
dotnet restore

# Apply database migrations (creates the database and tables)
dotnet ef database update

# Run the server
dotnet run
```

The API will be available at `https://localhost:7014`.  
Swagger UI: `https://localhost:7014/swagger`

> **First run:** The application automatically creates a default Admin account on startup:
> - Email: `admin@example.com`
> - Password: `admin123`

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## 5. Database Tables and Their Relationships

Think of each table as a spreadsheet. Relationships connect rows in different spreadsheets together. Here is every table and how they connect:

### Teachers

Stores all teacher accounts and the Admin account (Admin is just a Teacher with `Role = "Admin"`).

| Column | Type | Description |
|---|---|---|
| Id | GUID | Unique identifier for this teacher |
| FullName | text | Their full name |
| Email | text | Used to log in |
| Password | text | Hashed password (never plain text) |
| Role | text | Either `"Teacher"` or `"Admin"` |
| Number | text | Phone number (optional) |
| Address | text | Address (optional) |
| Gender | text | Gender (optional) |
| Profile | text | Filename of their uploaded profile photo |
| CreatedAt | datetime | When the account was created |

### Students

Stores all student accounts.

| Column | Type | Description |
|---|---|---|
| Id | GUID | Unique identifier |
| FullName | text | Their full name |
| Email | text | Used to log in |
| Password | text | Hashed password |
| Role | text | Always `"Student"` |
| Class | text | School class (optional) |
| Section | text | Class section (optional) |
| Number | number | Phone number (optional) |
| Addresh | text | Address (note: intentional spelling) |
| Gender | text | Gender (optional) |
| Profile | text | Profile photo filename |
| CreatedAt | datetime | When the account was created |

### Groups

Represents a class or subject group.

| Column | Type | Description |
|---|---|---|
| Id | integer | Auto-incrementing ID |
| Name | text | Group name (e.g. "Class 10-A Maths") |
| Description | text | Optional description |
| CreatedById | GUID | **Foreign key → Teachers.Id** — who created this group |
| CreatedAt | datetime | When created |
| IsActive | boolean | False = soft-deleted (hidden but not erased from database) |

**Relationship:** Each Group belongs to one Teacher (`CreatedById` → `Teachers.Id`).

### GroupMembers

The link between students and groups. When a teacher adds a student to a group, a row is inserted here.

| Column | Type | Description |
|---|---|---|
| Id | integer | Auto-incrementing ID |
| GroupId | integer | **Foreign key → Groups.Id** |
| StudentId | GUID | **Foreign key → Students.Id** |
| AddedById | GUID | **Foreign key → Teachers.Id** — who added this student |
| AddedAt | datetime | When they were added |
| RemovedAt | datetime? | Null = still active. Set to a date = soft-removed (kept for audit history) |

**Relationships:**
- GroupMember → Group (many members belong to one group)
- GroupMember → Student (one student can be in many groups)
- GroupMember → Teacher (records which teacher added the student)

**Important rule:** A student can only appear once as an active member of the same group. There is a unique database index on `(GroupId, StudentId)` where `RemovedAt IS NULL`. This prevents accidental duplicate memberships.

### GroupManagers

Tracks which co-teachers (additional teachers who help manage a group) are assigned to a group.

| Column | Type | Description |
|---|---|---|
| Id | integer | Auto-incrementing ID |
| GroupId | integer | **Foreign key → Groups.Id** |
| UserId | GUID | **Foreign key → Teachers.Id** — the co-teacher |
| AssignedAt | datetime | When they were assigned |

**Relationship:** A Group can have multiple managers; a Teacher can manage multiple groups.

### GroupPosts

Stores both Notices and Assignments posted inside a group.

| Column | Type | Description |
|---|---|---|
| Id | integer | Auto-incrementing ID |
| GroupId | integer | **Foreign key → Groups.Id** |
| Type | text | Either `"Notice"` or `"Assignment"` |
| Title | text | Post heading |
| Content | text | Text body (required for Notice, optional for Assignment) |
| FileName | text | Stored filename on disk (random GUID + extension) |
| OriginalFileName | text | The original file name shown to users |
| PostedById | GUID | **Foreign key → Teachers.Id** |
| PostedAt | datetime | When posted |
| DueDate | datetime? | Only used for Assignments |
| AutoDeleteAt | datetime? | If set, the post deletes itself at this time |

### GlobalNotices

Stores school-wide announcements posted by Admin. Visible to ALL users regardless of group.

| Column | Type | Description |
|---|---|---|
| Id | integer | Auto-incrementing ID |
| Title | text | Announcement heading |
| Content | text | Announcement body (optional if file is attached) |
| FileName | text | Stored filename on disk |
| OriginalFileName | text | Original file name |
| PostedById | GUID | **Foreign key → Teachers.Id** (must be Admin) |
| PostedAt | datetime | When posted |
| AutoDeleteAt | datetime? | Auto-expires at this time if set |

### ReadStates

This is the "have you seen this?" table. Every time a user opens a notice channel (either the Global Announcements page or a Group page), their "last viewed" timestamp is saved here.

| Column | Type | Description |
|---|---|---|
| Id | integer | Auto-incrementing ID |
| UserId | GUID | The user (student or teacher) who viewed it |
| ChannelType | integer | `0` = GlobalNotices, `1` = Group |
| GroupId | integer? | Null for GlobalNotices; the group's Id for group channels |
| LastReadAt | datetime | The last time this user looked at this channel |

**How it works:** When the notification bell checks for unread items, it compares each notice's `PostedAt` against the user's `LastReadAt` for that channel. If `PostedAt > LastReadAt`, the notice is "unread."

**Unique constraint:** Each `(UserId, ChannelType, GroupId)` combination can only appear once — one row per user per channel.

### RefreshTokens

Stores refresh tokens for maintaining login sessions.

| Column | Type | Description |
|---|---|---|
| Id | GUID | Unique ID |
| Token | text | A random 64-byte base64 string |
| TeacherId | GUID? | Linked to a teacher (null if student token) |
| StudentId | GUID? | Linked to a student (null if teacher token) |
| ExpiresAt | datetime | When this token expires (1 hour from issue) |

---

### Visual Relationship Map

```
Teachers ──────────────────────────────────────────────────────┐
  │ (CreatedById)                                               │
  ▼                                                             │
Groups ──────────────── GroupManagers ←── Teachers (UserId)    │
  │                                                             │
  ├──── GroupMembers ←── Students (StudentId)                  │
  │         └── AddedById → Teachers                           │
  │                                                             │
  └──── GroupPosts (PostedById → Teachers)                     │
                                                                │
GlobalNotices (PostedById → Teachers) ─────────────────────────┘

ReadStates ← UserId (either Teachers.Id or Students.Id)
RefreshTokens ← TeacherId or StudentId
```

---

## 6. How Dependency Injection Works in This Project

### What is Dependency Injection? (Simple explanation)

Imagine you run a restaurant. When a waiter needs a pen to take an order, they don't go buy a pen themselves — the manager hands them one. That is dependency injection: instead of an object creating its own tools, someone else provides ("injects") those tools from the outside.

In code, a "dependency" is a helper class that another class needs to do its job. Dependency Injection (DI) means the framework automatically creates and provides those helpers.

### Why use it?

1. **Testability** — You can swap out a real database service with a fake one during tests
2. **Loose coupling** — Classes don't care *how* their dependencies work, only *what* they can do
3. **Single responsibility** — Each class does one job; it delegates everything else to its dependencies

### How it works in this project

#### Step 1 — Define an Interface (the contract)

An interface is like a job description. It says "anything that does this job must be able to do these things." It does not contain any code — just the list of methods required.

```csharp
// IAuthService.cs — the contract
public interface IAuthService
{
    Task<object> RegisterTeacherAsync(TeacherRegister request);
    Task<LoginResult> LoginAsync(TeacherLogin request);
    Task LogoutAsync(string? refreshToken);
    Task<RefreshResult> RefreshAsync(string? refreshToken);
    Task<(bool Conflict, object? Result)> AddStudentAsync(AddStudent request);
}
```

#### Step 2 — Implement the Interface (the real worker)

`AuthService` is the actual class that contains the login/logout code. It says "I fulfill the `IAuthService` contract."

```csharp
// AuthService.cs — the actual implementation
public class AuthService : IAuthService
{
    private readonly StudentManagement dbContext;       // needs the database
    private readonly IJwtTokenService jwtTokenService;  // needs the JWT helper

    // ASP.NET Core automatically provides these when it creates AuthService
    public AuthService(StudentManagement dbContext, IJwtTokenService jwtTokenService)
    {
        this.dbContext = dbContext;
        this.jwtTokenService = jwtTokenService;
    }

    public async Task<LoginResult> LoginAsync(TeacherLogin request) { ... }
}
```

#### Step 3 — Register the service (in Program.cs)

This is where you tell ASP.NET Core: "When someone asks for an `IAuthService`, create an `AuthService` and give it to them."

```csharp
// Program.cs
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IStudentService, StudentService>();
builder.Services.AddScoped<ITeacherService, TeacherService>();
builder.Services.AddScoped<IReadStateService, ReadStateService>();
builder.Services.AddScoped<IGroupService, GroupService>();
builder.Services.AddScoped<IGroupPostService, GroupPostService>();
builder.Services.AddScoped<IGlobalNoticeService, GlobalNoticeService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IFileStorageService, FileStorageService>();
```

`AddScoped` means: create a new instance of this service once per HTTP request. When the request is done, discard it.

#### Step 4 — Receive the service (in a Controller)

Controllers also receive their services automatically. The framework sees what the constructor needs, and injects it.

```csharp
// AuthController.cs
public class AuthController : Controller
{
    private readonly IAuthService authService;  // only knows the interface, not the implementation

    // ASP.NET Core sees this constructor and automatically provides IAuthService
    public AuthController(IAuthService authService, StudentManagement dbContext)
    {
        this.authService = authService;
    }
}
```

#### The full chain for a login request

```
HTTP POST /api/auth/login
    ↓
ASP.NET Core creates AuthController
    → needs IAuthService → creates AuthService
        → needs StudentManagement → creates DB context
        → needs IJwtTokenService → creates JwtTokenService
            → needs IConfiguration → already registered, injected
    → needs StudentManagement → same DB context reused (scoped)
    ↓
AuthController.Login() is called
    ↓
authService.LoginAsync() is called
    ↓
Response returned
    ↓
Scope ends, all scoped services are disposed
```

The key insight: **the controller never calls `new AuthService(...)` itself**. It just declares what it needs and the framework handles the rest.

---

## 7. Backend — Services (Business Logic)

Services are where the real work happens. Controllers just receive HTTP requests and hand them off to services. Services talk to the database, validate input, and return results.

---

### AuthService

**File:** `Services/AuthService.cs`  
**Interface:** `IAuthService`

This service handles everything related to logging in and out.

**Constructor dependencies:**
- `StudentManagement dbContext` — access to the database
- `IJwtTokenService jwtTokenService` — to generate tokens after login

#### `RegisterTeacherAsync(TeacherRegister request)`
Creates a new teacher account.
1. Checks if an account with that email already exists (throws error if yes)
2. Hashes the password using `PasswordHasher<Teacher>` — the raw password is never stored
3. Saves the new Teacher to the database
4. Returns the new teacher's basic info (no password)

#### `AddStudentAsync(AddStudent request)`
Creates a new student account. Only callable by Admin (enforced at the controller level).
1. Checks for duplicate email
2. Hashes password and saves new Student
3. Returns a `(Conflict, Result)` tuple so the controller can decide the HTTP status code

#### `LoginAsync(TeacherLogin request)`
Handles login for both teachers/admins and students — the same login form works for everyone.
1. First looks for a Teacher with that email
2. If found, verifies the hashed password
3. If the Teacher check passes, generates a JWT access token and a refresh token
4. Saves the refresh token to the `RefreshTokens` table
5. Returns both tokens plus user info
6. If no Teacher found, tries the same process for Students
7. If neither found/matched, returns failure

#### `LogoutAsync(string? refreshToken)`
Logs the user out.
1. Finds the refresh token in the database
2. Deletes it (so it can't be used again)

#### `RefreshAsync(string? refreshToken)`
Called automatically by the frontend when the access token expires (every hour). Issues a new access token without requiring the user to log in again.
1. Looks up the refresh token in the database
2. Checks it hasn't expired
3. Generates and returns a fresh access token

---

### JwtTokenService

**File:** `Services/JwtTokenService.cs`  
**Interface:** `IJwtTokenService`

Creates and signs JWT tokens.

**Constructor dependency:**
- `IConfiguration configuration` — to read the secret key and issuer from `appsettings.json`

#### `GenerateAccessToken(Teacher user)` and `GenerateAccessToken(Student user)`
Creates a signed JWT token that contains:
- The user's ID
- Their full name
- Their email
- Their role (`Admin`, `Teacher`, or `Student`)

The token is signed with a secret key using HMAC-SHA256. This means the server can verify the token hasn't been tampered with. The token expires in 1 hour.

#### `GenerateRefreshTokenValue()`
Creates a random 64-byte string encoded as base64. This is just a random secret, not a JWT. It is stored in the database and sent to the user as a cookie.

---

### FileStorageService

**File:** `Services/FileStorageService.cs`  
**Interface:** `IFileStorageService`

Manages saving, reading, and deleting files on the server's disk.

**Constructor dependency:**
- `IWebHostEnvironment env` — to find the correct `wwwroot/uploads` path

Files are stored in `wwwroot/uploads/`. Each file is saved with a new random GUID as its name (e.g., `a3f9b2c1-...-.pdf`) to prevent naming conflicts and to obscure the original file name.

#### `SaveAsync(IFormFile file)`
1. Creates the `uploads` directory if it doesn't exist
2. Generates a new GUID-based filename with the original extension
3. Writes the file to disk
4. Returns the stored filename (used as the reference in the database)

#### `Delete(string? storedFileName)`
Deletes a file from disk. Safe to call even if the file doesn't exist.

#### `ReadAsync(string storedFileName)`
Reads a file from disk and returns it as a byte array. Used when someone downloads a file.

---

### GlobalNoticeService

**File:** `Services/GlobalNoticeService.cs`  
**Interface:** `IGlobalNoticeService`

Manages school-wide announcements. See [Section 11](#11-the-notice-and-announcement-feature--in-depth) for full detail.

**Constructor dependencies:**
- `StudentManagement dbContext`
- `IFileStorageService fileStorage`

#### `GetNoticesAsync()`
1. **Automatically deletes expired notices** (calls `RemoveExpiredAsync()` first)
2. Returns all remaining global notices, sorted newest first, including the poster's name

#### `CreateNoticeAsync(Guid postedById, CreateGlobalNoticeRequest request)`
1. Validates that a title is provided
2. Validates that at least a message or file is attached
3. Validates that the auto-delete date (if set) is in the future
4. Saves the file to disk if one was attached
5. Creates and saves the `GlobalNotice` record in the database
6. Returns the created notice with the poster's name

#### `DeleteNoticeAsync(int id)`
1. Finds the notice (throws `NotFoundException` if not found)
2. Deletes the associated file from disk
3. Deletes the database record

#### `DownloadNoticeAsync(int id)`
1. Finds the notice and its stored filename
2. Reads the file bytes from disk
3. Returns a `FileDownloadResult` containing the raw bytes and the original filename

#### `RemoveExpiredAsync()` (private)
This method runs silently every time notices are fetched. It:
1. Queries all notices where `AutoDeleteAt` is in the past
2. Deletes their files from disk
3. Removes them from the database

This is the auto-delete mechanism. It is lazy — it only cleans up when someone fetches notices, not on a timer.

---

### ReadStateService

**File:** `Services/ReadStateService.cs`  
**Interface:** `IReadStateService`

Tracks when a user last looked at a notice channel (Global Announcements or a specific Group). Powers the notification bell's unread count.

**Constructor dependency:**
- `StudentManagement dbContext`

#### `GetLastViewedAsync(Guid userId, ReadChannelType channelType, int? groupId)`
Looks up the `ReadState` row for this user and channel. Returns the `LastReadAt` timestamp, or `null` if they have never viewed it.

#### `MarkViewedAsync(Guid userId, ReadChannelType channelType, int? groupId)`
Called when a user opens a channel. Either creates a new `ReadState` row or updates the existing one with the current time. Returns the timestamp that was saved.

#### `GetAllGroupLastViewedAsync(Guid userId)`
Returns a dictionary of `{ groupId → lastReadAt }` for all groups the user has ever viewed. Used by the notification bell to check all groups at once.

---

### GroupService

**File:** `Services/GroupService.cs`  
**Interface:** `IGroupService`

Manages groups — creating them, listing them, adding/removing members and co-teachers.

**Constructor dependency:**
- `StudentManagement dbContext`

#### `CreateGroupAsync(Guid creatorId, CreateGroupRequest request)`
1. Validates group name is not empty
2. Creates the `Group` record
3. If initial student IDs were provided, validates them and creates `GroupMember` records for each
4. Returns the new group's info

#### `GetGroupsAsync(Guid userId, bool isAdmin, bool isStudent)`
Returns groups filtered by role:
- **Admin** — sees all active groups
- **Teacher** — sees only groups they created or co-manage
- **Student** — sees only groups they are an active member of

Also includes the member count and the timestamp of the most recent post for each group (used to show unread activity).

#### `GetGroupAsync(int id, Guid userId, bool isAdmin, bool isStudent)`
Returns full group details including the list of managers and active members. Throws `ForbiddenException` if the user is not allowed to view this group.

#### `CanViewGroupAsync(int groupId, Guid userId, bool isAdmin, bool isStudent)`
A permission check helper. Returns `true` if:
- User is Admin, OR
- User is the group creator or co-manager (Teacher), OR
- User is an active member (Student)

#### `CanManageGroupAsync(int groupId, Guid userId, bool isAdmin)`
A stricter permission check. Returns `true` if:
- User is Admin, OR
- User is the group creator or co-manager (Teacher)

Students never pass this check.

#### `AddMembersAsync(int groupId, Guid actingUserId, bool isAdmin, AddGroupMembersRequest request)`
1. Permission check
2. Filters out students already in the group (avoids duplicates)
3. Adds the remaining students as new `GroupMember` records
4. Returns how many were added and how many were skipped (already members)

#### `RemoveMemberAsync(int groupId, Guid studentId, Guid actingUserId, bool isAdmin)`
Soft-removes a student from a group by setting `RemovedAt` to now. The record stays in the database for audit purposes but the student no longer appears as a member.

#### `DeleteGroupAsync(int groupId, Guid actingUserId, bool isAdmin)`
Soft-deletes a group by setting `IsActive = false`. The group and all its posts are hidden but not erased.

#### `AddManagersAsync(int groupId, Guid actingUserId, bool isAdmin, AddGroupManagersRequest request)`
Assigns co-teachers to help manage a group. Skips teachers already assigned and skips the group creator (who is already the owner).

#### `RemoveManagerAsync(int groupId, Guid teacherId, Guid actingUserId, bool isAdmin)`
Removes a co-teacher from a group's manager list.

---

### GroupPostService

**File:** `Services/GroupPostService.cs`  
**Interface:** `IGroupPostService`

Manages posts within groups (both Notices and Assignments).

**Constructor dependencies:**
- `StudentManagement dbContext`
- `IFileStorageService fileStorage`
- `IGroupService groupService` — to check permissions

#### `CreatePostAsync(int groupId, Guid postedById, bool isAdmin, CreateGroupPostRequest request)`
1. Permission check via `groupService.CanManageGroupAsync()`
2. Determines type: `"Notice"` or `"Assignment"`
3. Validates: Notice needs content; Assignment needs a file
4. Saves file to disk if attached
5. Creates the `GroupPost` record
6. Returns the post with the poster's name

#### `GetPostsAsync(int groupId, Guid userId, bool isAdmin, bool isStudent)`
1. Permission check via `groupService.CanViewGroupAsync()`
2. **Auto-deletes expired posts** for this group
3. Returns all remaining posts sorted newest first

#### `DeletePostAsync(int groupId, int postId, Guid actingUserId, bool isAdmin)`
1. Finds the post
2. Checks permission: Admins can delete any post; Teachers can only delete their own
3. Deletes the file from disk
4. Deletes the database record

#### `DownloadPostAsync(int groupId, int postId, Guid userId, bool isAdmin, bool isStudent)`
Permission-checked file download for group post attachments.

#### `GetRecentNoticesAsync(Guid userId, bool isAdmin)`
Returns the 50 most recent group "Notice" type posts from active groups the user can see. Used by the notification bell to show unread group notices.

#### `RemoveExpiredAsync(int? groupId)` (private)
Same lazy auto-delete logic as `GlobalNoticeService`, but for group posts. If `groupId` is provided, only cleans up that group's expired posts.

---

### TeacherService

**File:** `Services/TeacherService.cs`  
**Interface:** `ITeacherService`

CRUD operations for teacher accounts.

**Constructor dependencies:**
- `StudentManagement dbContext`
- `IFileStorageService fileStorage`

#### `GetCurrentAsync(Guid teacherId)`
Returns the full profile of the currently logged-in teacher/admin.

#### `UpdateProfileAsync(Guid id, TeacherProfileUpdate request)`
Updates name, email, gender, phone, address. If a new profile photo is uploaded, deletes the old file and saves the new one.

#### `GetPaged(int page)`
Returns 10 teachers per page (pagination). Page 1 = first 10, page 2 = next 10, etc.

#### `GetById(Guid id)`
Returns a single teacher's full profile.

#### `DeleteAsync(Guid id)`
Permanently deletes a teacher account. (Hard delete — use with caution.)

#### `UpdateAsync(Guid id, UpdateTeacher request)`
Admin-only full update of a teacher's profile, including their role.

#### `Search(string search, int limit)`
Case-insensitive name search. Returns matching teachers up to the limit. Used for the navbar search and for the "add co-teacher" picker.

---

### StudentService

**File:** `Services/StudentService.cs`  
**Interface:** `IStudentService`

CRUD operations for student accounts.

**Constructor dependencies:**
- `StudentManagement dbContext`
- `IFileStorageService fileStorage`

#### `GetPaged(int page)`
Returns 10 students per page.

#### `GetByIdAsync(Guid id)`
Returns a single student's full profile.

#### `UpdateAsync(Guid id, UpdateStudent request)`
Admin-only full update of a student's profile.

#### `DeleteAsync(Guid id)`
Permanently deletes a student account.

#### `Search(string search, int limit)`
Case-insensitive name search for students.

#### `UpdateProfileAsync(Guid id, StudentProfileUpdate request)`
Lets a student update their own gender, phone, address, and profile photo. (Students cannot change their own name, email, class, or section — only Admin can.)

---

### DashboardService

**File:** `Services/DashboardService.cs`  
**Interface:** `IDashboardService`

Computes the statistics shown on each role's dashboard.

**Constructor dependency:**
- `StudentManagement dbContext`

#### `GetAdminDashboardAsync()`
Returns a comprehensive overview of the whole school:
- Total teachers, admins, students
- Active/inactive group counts
- Total notices and assignments
- New students and teachers registered this week
- Student gender breakdown (as a percentage bar chart)
- Groups that have no co-teacher assigned
- Average number of students per group
- 8 most recent activity items (any post, any group)
- 5 upcoming assignments (closest due date first)

#### `GetTeacherDashboardAsync(Guid userId)`
Returns statistics relevant to that specific teacher:
- Their total groups (owned + co-managed), broken down
- Total unique students across all their groups
- Their notice and assignment counts
- 8 recent posts from their groups
- 5 upcoming assignments they posted
- Up to 6 of their groups with member counts

#### `GetStudentDashboardAsync(Guid studentId)`
Returns the student's view:
- How many groups they are in
- Total assignments and notices across those groups
- 8 recent posts from their groups
- 5 upcoming assignments across their groups
- Up to 6 of their groups

---

## 8. Backend — Controllers (API Endpoints)

Controllers receive HTTP requests, extract data, call the appropriate service, and return HTTP responses. They should contain minimal logic — just routing and error translation.

### AuthController — `/api/Auth`

| Method | URL | Auth Required | Who Can Call | What it does |
|---|---|---|---|---|
| GET | `/api/Auth/me` | Yes | Anyone logged in | Returns the current user's profile |
| POST | `/api/Auth/TeacherRegister` | No | Anyone | Creates a new teacher account |
| POST | `/api/Auth/AddStudent` | Yes (Admin only) | Admin | Creates a new student account |
| POST | `/api/Auth/login` | No | Anyone | Logs in, sets `token` and `refreshToken` cookies |
| POST | `/api/Auth/logout` | No | Anyone | Deletes the refresh token, clears cookies |
| POST | `/api/Auth/refresh` | No | Anyone with valid refresh cookie | Issues a new access token |

The `/me` endpoint is important — it is called on every page load to confirm the user is still logged in and to get their current profile data.

### GlobalNoticesController — `/api/GlobalNotices`

| Method | URL | Auth Required | Who Can Call | What it does |
|---|---|---|---|---|
| GET | `/api/GlobalNotices` | Yes | Anyone logged in | Get all global announcements |
| POST | `/api/GlobalNotices` | Yes (Admin only) | Admin | Create a new announcement |
| DELETE | `/api/GlobalNotices/{id}` | Yes (Admin only) | Admin | Delete an announcement |
| GET | `/api/GlobalNotices/{id}/download` | Yes | Anyone logged in | Download the file attached to an announcement |
| GET | `/api/GlobalNotices/last-viewed` | Yes | Anyone logged in | Get when this user last viewed announcements |
| POST | `/api/GlobalNotices/mark-viewed` | Yes | Anyone logged in | Record that the user just viewed announcements now |

### GroupsController — `/api/Groups`

| Method | URL | Auth Required | Who Can Call | What it does |
|---|---|---|---|---|
| GET | `/api/Groups` | Yes | Anyone logged in | List groups (filtered by role) |
| POST | `/api/Groups` | Yes (Admin/Teacher) | Admin, Teacher | Create a new group |
| GET | `/api/Groups/{id}` | Yes | Anyone logged in | Get a single group's details |
| DELETE | `/api/Groups/{id}` | Yes (Admin/Teacher) | Admin, Teacher | Soft-delete a group |
| POST | `/api/Groups/{id}/members` | Yes (Admin/Teacher) | Admin, Teacher | Add students to a group |
| DELETE | `/api/Groups/{id}/members/{studentId}` | Yes (Admin/Teacher) | Admin, Teacher | Remove a student from a group |
| POST | `/api/Groups/{id}/managers` | Yes (Admin/Teacher) | Admin, Teacher | Add co-teachers to a group |
| DELETE | `/api/Groups/{id}/managers/{teacherId}` | Yes (Admin/Teacher) | Admin, Teacher | Remove a co-teacher |
| GET | `/api/Groups/student/{studentId}` | Yes (Admin/Teacher) | Admin, Teacher | Get groups a specific student belongs to |
| POST | `/api/Groups/{id}/posts` | Yes (Admin/Teacher) | Admin, Teacher | Post a notice or assignment to a group |
| GET | `/api/Groups/{id}/posts` | Yes | Anyone logged in | Get all posts in a group |
| DELETE | `/api/Groups/{id}/posts/{postId}` | Yes (Admin/Teacher) | Admin, Teacher | Delete a post |
| GET | `/api/Groups/{id}/posts/{postId}/download` | Yes | Anyone logged in | Download a post's file attachment |
| GET | `/api/Groups/notices` | Yes | Anyone logged in | Get 50 most recent group notices (for bell) |
| GET | `/api/Groups/{id}/last-viewed` | Yes | Anyone logged in | Get last-viewed timestamp for a group |
| POST | `/api/Groups/{id}/mark-viewed` | Yes | Anyone logged in | Mark a group as viewed now |
| GET | `/api/Groups/last-viewed` | Yes | Anyone logged in | Get last-viewed timestamps for all groups |

### StudentController — `/api/Student`

| Method | URL | Auth Required | Who Can Call | What it does |
|---|---|---|---|---|
| GET | `/api/Student/Students` | No | Anyone | List students (paged) |
| GET | `/api/Student/{ID}` | No | Anyone | Get a student by ID |
| PUT | `/api/Student/student/{ID}` | Yes (Admin only) | Admin | Full update of a student |
| DELETE | `/api/Student/{ID}` | Yes (Admin only) | Admin | Delete a student |
| GET | `/api/Student/search` | No | Anyone | Search students by name |
| PUT | `/api/Student/profile/{ID}` | Yes | The student themselves | Update own profile |

### TeacherController — `/api/Teacher`

| Method | URL | Auth Required | Who Can Call | What it does |
|---|---|---|---|---|
| GET | `/api/Teacher/me` | Yes | Anyone logged in | Get current teacher's profile |
| GET | `/api/Teacher/Teachers` | No | Anyone | List teachers (paged) |
| GET | `/api/Teacher/Teacher/{ID}` | No | Anyone | Get a teacher by ID |
| PUT | `/api/Teacher/profile/{ID}` | Yes | The teacher themselves | Update own profile |
| PUT | `/api/Teacher/teacher/{ID}` | Yes (Admin only) | Admin | Full admin update of a teacher |
| DELETE | `/api/Teacher/teacher/{ID}` | Yes (Admin only) | Admin | Delete a teacher |
| GET | `/api/Teacher/searchTeacher` | No | Anyone | Search teachers by name |

### DashboardController — `/api/Dashboard`

| Method | URL | Auth Required | Who Can Call | What it does |
|---|---|---|---|---|
| GET | `/api/Dashboard/dashboard` | Yes (Admin only) | Admin | Admin dashboard statistics |
| GET | `/api/Dashboard/teacher-dashboard` | Yes (Teacher/Admin) | Teacher, Admin | Teacher's personalized stats |
| GET | `/api/Dashboard/student-dashboard` | Yes (Student only) | Student | Student's personalized stats |

---

## 9. Backend — Data Models (Modules)

Data models are C# classes that directly represent database tables. Entity Framework Core uses these classes to create and query the tables.

### `Teacher.cs`
The teacher/admin user. Admins are just teachers with `Role = "Admin"`. Contains login credentials, personal information, and profile photo reference.

### `Student.cs`
The student user. Similar structure to Teacher. Has extra fields for Class and Section.

### `Group.cs`
A class group. Has navigation properties `Members` (list of GroupMembers) and `Managers` (list of GroupManagers) for convenient related data loading.

### `GroupMember.cs`
The join table between Groups and Students. Uses soft-delete (`RemovedAt`) so membership history is preserved.

### `GroupManager.cs`
The join table between Groups and Teachers (for co-management). Hard-deleted when a co-teacher is removed.

### `GroupPost.cs`
Both notices and assignments. The `Type` field distinguishes them. Has optional `DueDate` (for assignments) and `AutoDeleteAt`.

### `GlobalNotice.cs`
School-wide announcements. Same file attachment capability as `GroupPost`.

### `ReadState.cs`
Uses a `ReadChannelType` enum (`GlobalNotices = 0`, `Group = 1`) to identify which type of channel was viewed.

### `RefreshToken.cs`
The persistent token for maintaining sessions. References either a Teacher or a Student (one or the other, never both).

---

## 10. Backend — DTOs (Data Transfer Objects)

DTOs are simple classes that define the shape of data coming into the API from the client. They separate the incoming request shape from the internal database model.

| DTO | Purpose |
|---|---|
| `TeacherRegister` | Name + email + password for registering a new teacher |
| `TeacherLogin` | Email + password for login (works for students too via the same endpoint) |
| `TeacherProfileUpdate` | Fields a teacher can update themselves (name, email, gender, phone, address, photo) |
| `UpdateTeacher` | Admin-level update (same fields + role change) |
| `AddStudent` | Name + email + password for creating a student |
| `StudentProfileUpdate` | Fields a student can update themselves (gender, phone, address, photo) |
| `UpdateStudent` | Admin-level student update (all fields) |
| `CreateGroupRequest` | Group name, description, and optional initial student IDs |
| `AddStudent (for groups)` | List of student GUIDs to add to a group |
| `CreateGroupPostRequest` | Title, type, content, file, due date, auto-delete date |
| `CreateGlobalNoticeRequest` | Title, content, file, auto-delete date |

---

## 11. The Notice and Announcement Feature — In Depth

This is one of the most important features. It has two separate but related systems: **Group Notices** and **Global Announcements**. Both are tied to the **notification bell** that shows unread counts.

### The Two Types

#### Global Announcements
- Posted by **Admin only**
- Visible to **every user** in the system — all teachers and all students, regardless of what groups they are in
- Accessed via the `/GlobalNotices` page (called "Announcements" in the UI)
- Stored in the `GlobalNotices` table
- Can include: text, a file attachment, and/or an auto-delete date

#### Group Notices (inside Groups)
- Posted by **teachers and admins** who manage a group
- Visible only to **members of that specific group** (plus admin who can see everything)
- Accessed via the `/groups/{id}` page (the Group Detail page)
- Stored in the `GroupPosts` table with `Type = "Notice"`
- Can include: text body (required), optional file, optional auto-delete date
- Different from Assignments which require a file and have a due date

---

### How a Global Announcement is Posted (Full Flow)

**Frontend:**
1. Admin opens the `/GlobalNotices` page
2. Clicks "New announcement" — a dialog (modal popup) appears
3. Fills in: Title (required), Message text (optional if file attached), File (optional), Auto-delete date (optional, defaults to "Never")
4. `handleCreate()` runs validation locally first
5. Builds a `FormData` object (used for sending files over HTTP)
6. Calls `createGlobalNotice(formData)` — the RTK Query mutation
7. RTK Query sends `POST /api/GlobalNotices` with the form data
8. On success, `refetch()` is called to reload the list, and `markViewed()` is called so the Admin doesn't see their own post as "unread"

**Backend:**
1. `GlobalNoticesController.CreateGlobalNotice()` receives the request
2. It extracts the Admin's user ID from the JWT token claims
3. Calls `noticeService.CreateNoticeAsync(CurrentUserId, request)`
4. `GlobalNoticeService.CreateNoticeAsync()` runs:
   - Validates title is not empty
   - Validates at least content or file is present
   - Validates auto-delete date is in the future (if provided)
   - Calls `fileStorage.SaveAsync(request.File)` to save the file to disk
   - Creates and saves the `GlobalNotice` record to the database
   - Returns the notice with the admin's name

---

### How Auto-Delete Works

When a notice (either global or group) is created with an `AutoDeleteAt` date, that date is stored in the database. Nothing happens immediately.

The deletion is **lazy** — it runs when notices are next fetched:

```
User opens the Announcements page
    ↓
Frontend calls GET /api/GlobalNotices
    ↓
GlobalNoticeService.GetNoticesAsync() runs
    ↓
RemoveExpiredAsync() is called FIRST
    ↓
Queries: all notices where AutoDeleteAt <= now
    ↓
For each expired notice:
    - fileStorage.Delete(notice.FileName)   ← removes file from disk
    - dbContext.GlobalNotices.Remove(notice) ← marks for DB deletion
    ↓
dbContext.SaveChangesAsync() ← commits deletions to database
    ↓
THEN the remaining (non-expired) notices are returned
```

This means expired content is always cleaned up before it is seen. There is no background job or timer needed.

---

### How the Notification Bell Works

The notification bell (the bell icon in the top-right navbar) shows a red badge with the count of unread notices since the user last visited the relevant page.

**The flow:**

1. The bell component (`NotificationBell.tsx`) makes 4 API calls simultaneously on mount:
   - `GET /api/Groups/notices` → 50 most recent group notices the user can see
   - `GET /api/Groups/last-viewed` → a dictionary of `{ groupId → lastViewedTimestamp }` for all groups
   - `GET /api/GlobalNotices` → all global announcements
   - `GET /api/GlobalNotices/last-viewed` → when this user last viewed the announcements page

2. **For global announcements** — `getUnreadGlobalNotices()` is called:
   ```typescript
   // utils/globalNoticeActivity.ts
   export function getUnreadGlobalNotices(notices, lastViewedAt) {
     if (!lastViewedAt) return notices; // never viewed = everything is unread
     const lastViewedTime = new Date(lastViewedAt).getTime();
     return notices.filter(n => new Date(n.postedAt).getTime() > lastViewedTime);
   }
   ```
   Any announcement posted after `lastViewedAt` is "unread."

3. **For group notices** — `getUnreadNotices()` is called:
   ```typescript
   // utils/groupActivity.ts
   export function getUnreadNotices(notices, lastViewedMap) {
     if (!lastViewedMap) return notices; // never viewed any group
     return notices.filter(n => {
       const lastViewed = lastViewedMap[String(n.groupId)];
       if (!lastViewed) return true; // never viewed this group
       return new Date(n.postedAt).getTime() > new Date(lastViewed).getTime();
     });
   }
   ```
   A notice is "unread" if it was posted after the user last visited that specific group.

4. `totalUnread = unreadGroup.length + unreadGlobal.length`

5. The badge shows this number (capped at "9+" for tidiness)

**Marking as read:**

When the user clicks a notice in the bell popup and navigates to the page:
- For global announcements: `markGlobalViewed()` is called immediately
- For groups: `POST /api/Groups/{id}/mark-viewed` is called when the Group Detail page loads

When the user directly opens the Announcements page (`GlobalNotices.tsx`):
```typescript
// GlobalNotices.tsx
useEffect(() => {
  markViewed(undefined); // runs immediately when the page mounts
}, [markViewed]);
```
This ensures the bell resets even if the user doesn't click the bell first.

---

### How Group Posts (Notices and Assignments) Work

The Group Detail page shows all posts for a group. When a teacher posts:

**For a "Notice":**
- Title required
- Content (text body) required
- File optional
- No due date

**For an "Assignment":**
- Title required
- File required (it is the actual assignment document)
- Content (instructions) optional
- Due date optional
- Auto-delete optional

Both types support auto-deletion. The mechanism is identical to global announcements.

The type distinction matters on the frontend too — notices show with a bell icon, assignments show with a clipboard icon. The dashboard's "Upcoming Assignments" widget only looks at the `"Assignment"` type.

---

## 12. Frontend — How the UI is Built

### Entry Point — `main.tsx`

This is where the React app starts. It wraps the entire app in three providers:
- `<Provider store={store}>` — makes Redux available everywhere
- `<BrowserRouter>` — enables URL-based navigation
- `<Toaster>` — renders toast notifications anywhere in the app

### Routing — `App.tsx`

All URL routes are defined here using React Router. Each route maps a URL path to a page component. Protected routes are wrapped in guard components:

- `<AdminRoute>` — only Admin can access
- `<TeacherRout>` — only Teacher can access
- `<StudentRoute>` — only Student can access
- `<RoleRoute allowedRoles={["Admin", "Teacher"]}>` — multiple roles

These guard components check the user's role. If the user doesn't have the required role, they are redirected to the login page.

### Layout — `DashboardLayout`

Almost all pages inside the app (after login) use `DashboardLayout`. This component provides:
- The top `NavBar` with the search box and notification bell
- The `SlideMenu` sidebar with navigation links appropriate to the user's role
- A responsive layout that collapses the sidebar on mobile

### NavBar — `NavBar.tsx`

The sticky top bar visible on all pages after login. Contains:
- The "StudentGrid" logo that links to the appropriate dashboard by role
- A search box that queries both students and teachers simultaneously as you type
- The `NotificationBell` component
- A "Log In" button when not authenticated

The search uses RTK Query's `skip` option to avoid making API calls when the search box is empty.

### Notification Bell — `NotificationBell.tsx`

A popover (floating panel) triggered by the bell icon. Shows unread notices grouped into global announcements and group notices. Clicking a notice navigates to the relevant page and marks it as read.

---

## 13. Frontend — API Layer (RTK Query)

RTK Query (part of Redux Toolkit) is the data-fetching library. It replaces the need to write manual `useEffect` + `fetch` code.

Each API file creates an "API slice" for one backend resource:

| File | Backend resource | Key exports |
|---|---|---|
| `AuthApi.ts` | `/api/Auth` | `useLoginMutation`, `useLogoutMutation`, `useGetCurrentUserQuery` |
| `GlobalNoticeApi.ts` | `/api/GlobalNotices` | `useGetGlobalNoticesQuery`, `useCreateGlobalNoticeMutation`, `useDeleteGlobalNoticeMutation`, `useGetLastViewedGlobalNoticesQuery`, `useMarkGlobalNoticesViewedMutation` |
| `GroupApi.ts` | `/api/Groups` | All group, member, post, and read-state hooks |
| `StudentApi.ts` | `/api/Student` | Student CRUD hooks |
| `TeacherApi.ts` | `/api/Teacher` | Teacher CRUD hooks |
| `DashboardApi.ts` | `/api/Dashboard` | Dashboard data hooks |

### Key RTK Query concepts used

**Tags (cache invalidation)**

Each query "provides" tags, and each mutation "invalidates" tags. When a mutation invalidates a tag, RTK Query automatically refetches all queries that provide that tag.

Example: When `deleteGlobalNotice` runs, it invalidates `"GlobalNotice"` — so `getGlobalNotices` automatically re-runs and the deleted notice disappears from the UI.

**`credentials: "include"`**

Every API slice sets `credentials: "include"` in its `fetchBaseQuery`. This tells the browser to send cookies (including the JWT `token` cookie) with every request. Without this, the backend would reject all authenticated requests.

**`refetchOnMountOrArgChange: true`**

Every API slice sets this to ensure fresh data is always loaded when a page is first visited, even if the data was previously cached.

### Redux Store — `store.ts`

The store combines all the API reducers and applies their middleware. It also has a special `rootReducer` that handles a `"auth/resetStore"` action — when this action is dispatched (on logout), the entire Redux state is cleared, effectively wiping all cached data and forcing re-authentication.

---

## 14. Authentication — JWT + Cookies

### How login works (simple explanation)

Think of a JWT token like a secure ID badge. When you log in, the server checks your email and password, then hands you a badge. Every time you make a request, you show your badge. The server checks the badge is genuine (using a secret key only the server knows) and reads your name and role from it.

### The two tokens

**Access Token** (JWT)
- A short-lived token (expires in 1 hour)
- Contains your user ID, name, email, and role
- Stored in an HttpOnly cookie named `token`
- Sent automatically with every request

**Refresh Token**
- A long random string stored in the `RefreshTokens` table
- Also stored as an HttpOnly cookie named `refreshToken`
- When the access token expires, the frontend silently calls `POST /api/Auth/refresh` with the refresh token to get a new access token — no need to log in again

### HttpOnly cookies (security)

Both tokens are stored in HttpOnly cookies. "HttpOnly" means JavaScript cannot read them — they are invisible to the browser's JavaScript environment. This prevents XSS (Cross-Site Scripting) attacks from stealing your tokens.

The cookies are also set with `Secure = true` (only sent over HTTPS) and `SameSite = None` (required for cross-origin requests between `localhost:5173` and `localhost:7014`).

### CORS Policy

The backend only accepts requests from `http://localhost:5173` (the frontend). This prevents other websites from making API calls using a user's cookies.

### JWT validation (on every request)

When the backend receives a request:
1. Reads the `token` cookie
2. Verifies the signature with the secret key
3. Checks the token hasn't expired
4. Reads the claims (user ID, role)
5. Makes them available via `User.FindFirstValue(ClaimTypes.NameIdentifier)` in controllers

---

## 15. File Upload and Download

### Uploading

Files are sent as `multipart/form-data` — the standard way browsers send files over HTTP. The frontend uses a `FormData` object:

```typescript
const formData = new FormData();
formData.append("Title", title);
formData.append("File", file); // the actual File object from an <input type="file">
```

On the backend, `IFormFile` in the DTO automatically receives the file. `FileStorageService.SaveAsync()` writes it to `wwwroot/uploads/` with a GUID-based name.

### Downloading

Download links make a GET request to an endpoint like `/api/GlobalNotices/{id}/download`. The backend:
1. Looks up the file's stored name in the database
2. Reads the raw bytes from disk with `FileStorageService.ReadAsync()`
3. Returns them as `File(bytes, "application/octet-stream", originalFileName)`

The `application/octet-stream` content type tells the browser to treat it as a downloadable binary file. The `originalFileName` is what the user sees as the suggested save name.

### Serving profile photos

Profile photos (uploaded via the profile edit pages) are served directly as static files. The URL is `https://localhost:7014/uploads/{storedFileName}`. This works because `app.UseStaticFiles()` in `Program.cs` serves everything under `wwwroot/` publicly.

---

## 16. Role-Based Access Control

There are three roles: `Admin`, `Teacher`, `Student`.

### Backend enforcement

At the controller level, `[Authorize(Roles = "Admin")]` means only a user whose JWT token contains `Role = "Admin"` can call that endpoint. If anyone else tries, they get a `403 Forbidden` response.

At the service level, additional checks are made. For example in `GroupPostService.DeletePostAsync()`:
```csharp
if (!isAdmin && post.PostedById != actingUserId)
    throw new ForbiddenException(); // Teacher can only delete their OWN posts
```

### Frontend enforcement

Route guards check the user's role before rendering a page. If the role doesn't match, the user is redirected.

For UI elements (like the "New announcement" button), conditional rendering is used:
```typescript
const isAdmin = currentUser?.role === "Admin";
{isAdmin && <button>New announcement</button>}
```

The button simply doesn't appear for non-Admin users. However, the backend also enforces this — even if someone bypassed the UI, the API would reject the request.

---

## 17. The Notification Bell — Unread Count Logic

The bell shows a combined count of:
1. Global announcements posted after the user's last visit to the Announcements page
2. Group notices posted after the user's last visit to each group

This is a pure client-side calculation. The backend provides:
- The notices themselves (with `postedAt` timestamps)
- The user's last-viewed timestamps (from `ReadStates`)

The frontend subtracts: `unread = notices where postedAt > lastViewedAt`

This approach is efficient because:
- No special "has the user seen this?" flag is needed on each notice
- One timestamp per channel is all that's needed
- The calculation is instant (just date comparisons in JavaScript)
- It works correctly for retroactively old notices (if a notice was posted before you first registered, your `lastViewedAt` being null means you'd count it as unread — but this is handled by returning all notices when `lastViewedAt` is null, which is functionally correct for a "what's new?" UI)

---

## 18. Dashboard

Three separate dashboards, one per role, all using the same `DashboardController` but different endpoints.

### Admin Dashboard (`/AdminIndex`)
Shows a bird's-eye view of the school:
- Total students, teachers, active groups
- Notices and assignments count
- New registrations this week
- Average group size
- Groups with no co-teacher
- Student gender distribution (bar chart)
- 8 recent activity items (any post)
- 5 upcoming assignments (closest deadline)

### Teacher Dashboard (`/TeacherIndex`)
Shows the teacher's own slice of the school:
- Their groups (owned vs co-managed)
- Total unique students across their groups
- Their post statistics
- Recent activity in their groups
- Their upcoming assignments
- Quick list of their groups

### Student Dashboard (`/StudentIndex`)
Shows the student's perspective:
- How many groups they're in
- Total assignments and notices posted to their groups
- Recent activity in their groups
- Upcoming assignments
- Their group list

---

## 19. Complete API Reference

### Base URL
```
https://localhost:7014/api
```

### Authentication
All authenticated endpoints require a valid `token` cookie (JWT). Obtained by calling `POST /api/Auth/login`.

### Response format
All responses are JSON. Errors include a `message` field:
```json
{ "message": "Error description here" }
```

### HTTP Status Codes used

| Code | Meaning |
|---|---|
| 200 OK | Success |
| 400 Bad Request | Validation failed (e.g., missing required field) |
| 401 Unauthorized | Not logged in, or invalid/expired token |
| 403 Forbidden | Logged in but not allowed (wrong role, or not your resource) |
| 404 Not Found | The requested resource doesn't exist |
| 409 Conflict | Duplicate data (e.g., email already taken) |

---

*This README was generated to document the StudentGrid project as it exists at the time of writing (September 2026).*
