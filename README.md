# StudentGrid — Student Management System

A full-stack web application for managing students, teachers, groups, notices, and file sharing in an educational environment. The application is branded as **StudentGrid** and supports three distinct user roles: **Admin**, **Teacher**, and **Student**.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Backend — ASP.NET Core Web API](#4-backend--aspnet-core-web-api)
   - [Entry Point — Program.cs](#41-entry-point--programcs)
   - [Database Context — StudentManagement.cs](#42-database-context--studentmanagementcs)
   - [Data Models (Modules)](#43-data-models-modules)
   - [DTOs (Data Transfer Objects)](#44-dtos-data-transfer-objects)
   - [Controllers](#45-controllers)
5. [Frontend — React + TypeScript](#5-frontend--react--typescript)
   - [Entry Point — main.tsx](#51-entry-point--maintsx)
   - [Redux Store — store.ts](#52-redux-store--storets)
   - [API Services](#53-api-services)
   - [Routing — App.tsx](#54-routing--apptsx)
   - [Route Guards](#55-route-guards)
   - [Pages](#56-pages)
   - [Components](#57-components)
6. [Authentication Flow](#6-authentication-flow)
7. [Role-Based Access Control](#7-role-based-access-control)
8. [File Upload System](#8-file-upload-system)
9. [Database Migrations](#9-database-migrations)
10. [Running the Project Locally](#10-running-the-project-locally)
11. [API Reference](#11-api-reference)

---

## 1. Project Overview

StudentGrid is a management platform designed for educational institutions. It enables:

- **Admins** to register teachers and students, manage all users, and oversee the entire system.
- **Teachers** to create and manage student groups, post notices and files for group members, and assign co-teachers to groups.
- **Students** to view groups they belong to, read notices, and download shared files.

The system uses **JWT authentication** stored in **HTTP-only cookies** so that tokens are never exposed to JavaScript on the client side, making the application secure against XSS attacks. A **refresh token** mechanism keeps users logged in without exposing long-lived credentials.

---

## 2. Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| ASP.NET Core | .NET 10.0 | Web API framework |
| Entity Framework Core | 10.0.11 | ORM — database access and migrations |
| SQL Server (LocalDB) | — | Relational database |
| JWT Bearer Authentication | 10.0.11 | Stateless authentication via JSON Web Tokens |
| ASP.NET Core Identity (PasswordHasher) | Built-in | Secure password hashing (bcrypt-style PBKDF2) |
| Swashbuckle / Swagger | 10.2.3 | Auto-generated API documentation UI |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.2.8 | UI library |
| TypeScript | 6.0.2 | Type-safe JavaScript |
| Vite | 8.2.2 | Build tool and dev server |
| React Router DOM | 7.18.3 | Client-side routing |
| Redux Toolkit (RTK Query) | 2.12.0 | Global state management + data fetching/caching |
| Axios | 1.20.0 | HTTP client (used alongside RTK Query) |
| Tailwind CSS v4 | 4.3.3 | Utility-first CSS framework |
| shadcn/ui + Base UI | — | Accessible pre-built UI components |
| React Hook Form | 7.87.0 | Form state management and validation |
| React Hot Toast | 2.6.0 | Non-blocking toast notifications |
| Lucide React | 1.37.0 | Icon library |
| clsx + tailwind-merge | — | Conditional class name utilities |

---

## 3. Project Structure

```
StudentManagement/
├── backend/
│   └── backend/
│       ├── Controllers/         # HTTP request handlers (API endpoints)
│       │   ├── AuthController.cs
│       │   ├── StudentController.cs
│       │   ├── TeacherController.cs
│       │   └── GroupController.cs
│       ├── Data/
│       │   └── StudentManagement.cs   # EF Core DbContext
│       ├── DTOs/                # Request/response data shapes
│       ├── Migrations/          # EF Core migration history
│       ├── Modules/             # Entity models (database tables)
│       ├── wwwroot/uploads/     # Uploaded profile images and group files
│       ├── appsettings.json     # App config (connection string, JWT settings)
│       ├── Program.cs           # App startup, DI container, middleware pipeline
│       └── backend.csproj       # .NET project file and NuGet dependencies
└── frontend/
    ├── public/                  # Static assets
    └── src/
        ├── api/                 # RTK Query API service definitions
        ├── assets/              # Images and SVG assets
        ├── components/
        │   ├── Routes/          # Route guard components
        │   ├── form/            # Reusable form components
        │   ├── group/           # Group-specific components
        │   ├── layouts/         # Layout wrappers
        │   ├── ui/              # shadcn/ui base components
        │   ├── utils/           # Helper utilities
        │   ├── NavBar.tsx        # Top navigation bar
        │   ├── SlideMenu.tsx     # Sidebar slide-in menu
        │   └── NotificationBell.tsx  # Notices notification bell
        ├── lib/
        │   └── utils.ts         # cn() utility for class names
        ├── pages/
        │   ├── Auth/            # Login, Register pages
        │   ├── Group/           # Group list, detail, create
        │   ├── Student/         # Student pages
        │   └── Teacher/         # Teacher pages
        ├── App.tsx              # Root route definitions
        ├── main.tsx             # React app entry point
        └── store.ts             # Redux store configuration
```

---

## 4. Backend — ASP.NET Core Web API

### 4.1 Entry Point — `Program.cs`

`Program.cs` is the application's startup file. It uses .NET's minimal hosting model to configure all services and the middleware pipeline before the app starts.

#### Services Registered

**`AddControllers()`**
Registers the MVC controller pipeline so that classes decorated with `[ApiController]` are discovered and their action methods are mapped to HTTP routes.

**`AddEndpointsApiExplorer()` + `AddSwaggerGen()`**
Registers Swagger (OpenAPI) services. In Development mode, browsing to `/swagger` gives a live, interactive UI listing all endpoints — useful for manual testing without a frontend.

**`AddDbContext<StudentManagement>(...)`**
Registers the Entity Framework Core database context as a scoped service. Every HTTP request gets its own `StudentManagement` (DbContext) instance. The connection string is read from `appsettings.json` under the key `ManagementDbConnection`.
- `UseSqlServer(...)` — tells EF Core to use the SQL Server provider.
- Why scoped? Because EF Core DbContexts are not thread-safe; a new instance per request prevents data corruption.

**`AddCors("ReactPolicy")`**
Configures Cross-Origin Resource Sharing. The React dev server runs on `http://localhost:5173` while the API runs on `https://localhost:7014`. Without CORS, the browser would block these requests. The policy:
- `WithOrigins("http://localhost:5173")` — only allows the React frontend.
- `AllowAnyHeader()` / `AllowAnyMethod()` — permits all headers and HTTP methods.
- `AllowCredentials()` — required so the browser sends HTTP-only cookies (JWT tokens) across origins.

**`AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(...)`**
Sets up JWT authentication. The `TokenValidationParameters` specify what to check on every incoming JWT:
- `ValidateIssuer` / `ValidateAudience` — ensures the token was issued by this specific API for this specific client, preventing token reuse across different apps.
- `ValidateLifetime` — rejects expired tokens automatically.
- `ValidateIssuerSigningKey` — verifies the HMAC-SHA256 signature using the secret key from `appsettings.json`.
- `OnMessageReceived` event — reads the JWT from the `token` HTTP-only cookie instead of the `Authorization: Bearer` header. This is important because the frontend stores the JWT in a cookie (not in `localStorage`) for XSS protection.

**`AddAuthorization()`**
Enables the `[Authorize]` and `[Authorize(Roles = "...")]` attributes on controller actions.

#### Admin Seeding

After the app is built but before it starts listening for requests, the code creates a default Admin account if none exists. This ensures the system always has at least one admin to log in with on first run.
```
Email: admin@example.com
Password: admin123
```
The password is hashed using `PasswordHasher<Teacher>` before being stored.

#### Middleware Pipeline Order

The order of middleware matters in ASP.NET Core:
1. `UseSwagger()` / `UseSwaggerUI()` — only in Development
2. `UseHttpsRedirection()` — upgrades HTTP to HTTPS
3. `UseCors("ReactPolicy")` — **must come before** UseAuthentication/UseAuthorization
4. `UseStaticFiles()` — serves files from `wwwroot/` (uploaded images)
5. `UseAuthentication()` — reads and validates the JWT cookie
6. `UseAuthorization()` — checks role/policy requirements
7. `MapControllers()` — routes requests to controller actions

---

### 4.2 Database Context — `StudentManagement.cs`

Located in `Data/StudentManagement.cs`. This is the EF Core `DbContext` — the central class for all database interactions.

#### DbSets (Tables)

| DbSet | Table | Description |
|---|---|---|
| `Teachers` | Teachers | Stores Teacher and Admin accounts |
| `Students` | Students | Stores Student accounts |
| `Groups` | Groups | Stores class/study groups |
| `GroupMembers` | GroupMembers | Junction table: student ↔ group membership |
| `GroupManagers` | GroupManagers | Junction table: teacher ↔ group co-management |
| `GroupPosts` | GroupPosts | Notices and file posts within a group |
| `RefreshTokens` | RefreshTokens | Stores active refresh tokens for session management |

#### `OnModelCreating` — Entity Relationships and Constraints

This method is called once when the model is first used and defines all relationship configurations and constraints using the Fluent API (preferred over Data Annotations for complex cases).

**RefreshToken → Teacher relationship**
```csharp
modelBuilder.Entity<RefreshToken>()
    .HasOne(r => r.Teacher)
    .WithMany()
    .HasForeignKey(r => r.TeacherId);
```
A refresh token optionally belongs to a teacher. `WithMany()` with no argument means the `Teacher` model does not have a navigation collection back to refresh tokens (one-way navigation).

**Unique active membership constraint**
```csharp
modelBuilder.Entity<GroupMember>()
    .HasIndex(gm => new { gm.GroupId, gm.StudentId })
    .HasFilter("[RemovedAt] IS NULL")
    .IsUnique();
```
This filtered unique index ensures a student cannot be added to the same group twice while still active. Soft-removed memberships (where `RemovedAt` is set) are excluded from the uniqueness check, so a removed student can be re-added later.

**Group → Teacher (CreatedBy) — Restrict delete**
```csharp
.OnDelete(DeleteBehavior.Restrict)
```
Prevents cascading deletion — deleting a teacher does not automatically delete all groups they created. This is intentional: groups should persist even if the creator account is removed.

**GroupMember → Group and Student — Cascade delete**
```csharp
.OnDelete(DeleteBehavior.Cascade)
```
When a group or student is deleted, their membership records are automatically removed.

**UTC DateTime Converter**
```csharp
var utcConverter = new ValueConverter<DateTime, DateTime>(
    v => v,
    v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
```
SQL Server stores `DateTime` without timezone info. When EF Core reads them back, .NET treats them as `Unspecified` kind, which can cause wrong times when clients convert to local time. This converter applies `DateTimeKind.Utc` to every `DateTime` property on read, so the frontend receives proper UTC timestamps and can convert them correctly.

---

### 4.3 Data Models (Modules)

All entity classes are in the `Modules/` folder. Each class maps directly to a database table via EF Core.

#### `Teacher.cs`

Represents both **Teacher** and **Admin** accounts — admins are just teachers with `Role = "Admin"`.

| Property | Type | Purpose |
|---|---|---|
| `Id` | `Guid` | Primary key. GUIDs are used instead of integers to prevent ID enumeration attacks. |
| `FullName` | `string` | Display name |
| `Email` | `string` | Login identifier, must be unique (enforced in controller) |
| `Password` | `string` | Stores the PBKDF2-hashed password (never plain text) |
| `Number` | `string?` | Optional phone number |
| `Address` | `string?` | Optional address |
| `Gender` | `string?` | Optional gender |
| `Profile` | `string?` | Stored filename of the profile image (e.g., `"abc123.jpg"`) |
| `Role` | `string` | `"Teacher"` by default; set to `"Admin"` for admins |
| `RefreshToken` | `string?` | Legacy field (superseded by the `RefreshTokens` table) |
| `RefreshTokenExpiry` | `DateTime?` | Legacy field |

#### `Student.cs`

Represents a student account, created by admins only.

| Property | Type | Purpose |
|---|---|---|
| `Id` | `Guid` | Primary key |
| `FullName` | `string` | Display name |
| `Email` | `string` | Login identifier |
| `Password` | `string` | Hashed password |
| `Profile` | `string?` | Profile image filename |
| `Gender` | `string?` | Optional |
| `Number` | `long?` | Phone number as a numeric type |
| `Addresh` | `string?` | Address (note the intentional typo in the original code) |
| `Education` | `string?` | Education level/background |
| `Role` | `string` | Always `"Student"` |

#### `Group.cs`

Represents a group (a class or study group).

| Property | Type | Purpose |
|---|---|---|
| `Id` | `int` | Auto-increment primary key |
| `Name` | `string` | Group name, required |
| `Description` | `string?` | Optional description |
| `CreatedById` | `Guid` | FK to `Teacher.Id` |
| `CreatedBy` | `Teacher` | Navigation property — the teacher who created this group |
| `CreatedAt` | `DateTime` | Auto-set to `DateTime.UtcNow` |
| `IsActive` | `bool` | Soft-delete flag; `false` = deleted but record kept for audit |
| `Members` | `ICollection<GroupMember>` | Navigation to all member records |
| `Managers` | `ICollection<GroupManager>` | Navigation to all co-teacher records |

#### `GroupMember.cs`

Junction table tracking which students are in which groups.

| Property | Type | Purpose |
|---|---|---|
| `Id` | `int` | Auto-increment PK |
| `GroupId` | `int` | FK to `Group.Id` |
| `StudentId` | `Guid` | FK to `Student.Id` |
| `AddedById` | `Guid` | FK to `Teacher.Id` — who added this student |
| `AddedAt` | `DateTime` | When the student was added |
| `RemovedAt` | `DateTime?` | **Soft remove** — null means still active; set to UTC now when removed. Keeps audit history. |

#### `GroupManager.cs`

Junction table for co-teachers (additional teachers who can manage a group without being its creator).

| Property | Type | Purpose |
|---|---|---|
| `Id` | `int` | PK |
| `GroupId` | `int` | FK to `Group.Id` |
| `UserId` | `Guid` | FK to `Teacher.Id` — the co-teacher |
| `AssignedAt` | `DateTime` | When the co-teacher was assigned |

#### `GroupPost.cs`

Represents content posted inside a group — either a **Notice** (text) or a **File** (uploaded document).

| Property | Type | Purpose |
|---|---|---|
| `Id` | `int` | PK |
| `GroupId` | `int` | FK to `Group.Id` |
| `Type` | `string` | `"Notice"` or `"File"` — determines which fields are used |
| `Title` | `string` | Post title, required for both types |
| `Content` | `string?` | Body text, required for Notice type; null for File type |
| `FileName` | `string?` | GUID-based stored filename on disk (`"abc123.pdf"`) |
| `OriginalFileName` | `string?` | Original filename as uploaded (`"Assignment.pdf"`) — shown to users |
| `PostedById` | `Guid` | FK to `Teacher.Id` |
| `PostedBy` | `Teacher` | Navigation property |
| `PostedAt` | `DateTime` | Auto-set to UTC now |

The reason for two filename fields: the stored name uses a GUID to prevent filename collisions on disk, while the original name is preserved for display and when users download the file.

#### `RefreshToken.cs`

Stores active refresh tokens for session management.

| Property | Type | Purpose |
|---|---|---|
| `Id` | `Guid` | PK |
| `Token` | `string` | The random Base64 token value (64 random bytes) |
| `TeacherId` | `Guid?` | FK to `Teacher.Id` — null if this belongs to a student |
| `Teacher` | `Teacher?` | Navigation property |
| `StudentId` | `Guid?` | FK to `Student.Id` — null if this belongs to a teacher |
| `Student` | `Student?` | Navigation property |
| `ExpiresAt` | `DateTime` | When the refresh token expires (1 hour after issue) |

Both `TeacherId` and `StudentId` are nullable because a refresh token belongs to either a teacher **or** a student, never both. This single-table design avoids having two separate refresh token tables.

---

### 4.4 DTOs (Data Transfer Objects)

DTOs are simple classes that define the shape of the request body. They decouple the API contract from the internal entity models, preventing over-posting attacks (where a client could set fields like `Role = "Admin"` by sending unexpected properties).

| DTO | Used By | Fields |
|---|---|---|
| `TeacherRegister` | `POST /api/Auth/TeacherRegister` | `FullName`, `Email`, `Password` |
| `TeacherLogin` | `POST /api/Auth/login` | `Email`, `Password` |
| `AddStudent` | `POST /api/Auth/AddStudent` | `FullName`, `Email`, `Password` |
| `UpdateTeacher` | `PUT /api/Teacher/teacher/{id}` | `FullName`, `Email`, `Gender`, `Number`, `Address`, `Role`, `Profile` (IFormFile) |
| `UpdateStudent` | `PUT /api/Student/student/{id}` | `FullName`, `Email`, `Education`, `Gender`, `Number`, `Addresh`, `Profile` (IFormFile) |
| `TeacherProfileUpdate` | `PUT /api/Teacher/profile/{id}` | `FullName`, `Email`, `Gender`, `Number`, `Address`, `Profile` (IFormFile) |
| `StudentProfileUpdate` | `PUT /api/Student/profile/{id}` | `Gender`, `Number`, `Addresh`, `Profile` (IFormFile) |
| `CreateGroupRequest` | `POST /api/Groups` | `Name`, `Description?`, `StudentIds?` |
| `AddGroupMembersRequest` | `POST /api/Groups/{id}/members` | `StudentIds` |
| `AddGroupManagersRequest` | `POST /api/Groups/{id}/managers` | `TeacherIds` |
| `CreateGroupPostRequest` | `POST /api/Groups/{id}/posts` | `Type`, `Title`, `Content?`, `File?` (IFormFile) |

---

### 4.5 Controllers

#### `AuthController`
**Route:** `api/Auth`

Handles everything authentication-related.

---

**`GET /me`** — `[Authorize]`

Returns the currently logged-in user's profile. It reads the user's ID and role from the JWT claims (`ClaimTypes.NameIdentifier` and `ClaimTypes.Role`), then fetches the corresponding record from either the `Teachers` or `Students` table.

Why this endpoint exists: the frontend uses it on app load to restore the authenticated user's data from the server rather than trusting data stored in `localStorage`.

---

**`POST /TeacherRegister`** — Public

Registers a new teacher account. Checks for duplicate emails before creating. Hashes the password with `IPasswordHasher<Teacher>` (ASP.NET Core's built-in PBKDF2 hasher) before saving.

Why `IPasswordHasher`? It automatically handles salt generation, multiple hashing iterations, and algorithm upgrades — far safer than MD5/SHA hashes.

---

**`POST /AddStudent`** — `[Authorize(Roles = "Admin")]`

Only admins can create student accounts. Same flow as teacher registration but writes to the `Students` table. Students cannot self-register; accounts must be provisioned by an admin.

---

**`POST /login`** — Public

Unified login for all user types. The logic:
1. Look up the email in the `Teachers` table.
2. If found, verify the password with `PasswordHasher.VerifyHashedPassword()`.
3. If not found in Teachers, look in the `Students` table.
4. On success, generate a short-lived **access token** (1 hour JWT) and a **refresh token** (64 random bytes stored in the database).
5. Both tokens are written as **HTTP-only cookies** with `Secure = true` and `SameSite = None` (required for cross-origin cookie sending).

The access token is stored in a cookie named `token`; the refresh token in a cookie named `refreshToken`.

---

**`GenerateAccessToken(Teacher)` / `GenerateAccessToken(Student)`** — Private helpers

These two overloaded methods create a signed JWT with the following claims:
- `ClaimTypes.NameIdentifier` → user's GUID (used to identify the user in subsequent requests)
- `ClaimTypes.Name` → full name
- `ClaimTypes.Email` → email
- `ClaimTypes.Role` → `"Admin"`, `"Teacher"`, or `"Student"` (used for role-based authorization)

The token is signed with HMAC-SHA256 using the secret key from config. The token expires in 1 hour.

---

**`SetAccessTokenCookie(string token)`** — Private helper

Writes the access token to the `token` cookie with security options:
- `HttpOnly = true` → JavaScript cannot read this cookie (XSS protection)
- `Secure = true` → cookie only sent over HTTPS
- `SameSite = None` → allows cross-origin cookies (required since frontend and backend run on different ports)

---

**`POST /logout`** — Public

Reads the `refreshToken` cookie, finds and deletes the corresponding `RefreshToken` record from the database (invalidating the session server-side), then clears both cookies from the browser.

---

**`POST /refresh`** — Public

Called automatically by the frontend when an access token has expired. It:
1. Reads the `refreshToken` cookie.
2. Finds the matching record in the `RefreshTokens` table (with its associated Teacher or Student).
3. Verifies it hasn't expired.
4. Issues a new access token by calling `GenerateAccessToken()` and writing it to the cookie.

This flow keeps users logged in across browser sessions without requiring them to log in again every hour, while still maintaining security (the refresh token is stored server-side and can be revoked).

---

#### `StudentController`
**Route:** `api/Student`

Manages student records.

---

**`GET /Students?page={n}`** — Public (paginated)

Returns 10 students per page. Uses LINQ `.Skip((page-1) * pageSize).Take(pageSize)` for server-side pagination. Returns only non-sensitive fields (no password).

---

**`GET /{id}`** — Public

Returns a single student by GUID.

---

**`PUT /student/{id}`** — `[Authorize(Roles = "Admin")]`

Admin-only full update of a student record. Accepts `multipart/form-data` via the `UpdateStudent` DTO because it can include an optional profile image. Handles image replacement by deleting the old file before saving the new one.

---

**`DELETE /{id}`** — `[Authorize(Roles = "Admin")]`

Hard-deletes a student record. Admin only.

---

**`GET /search?search={query}&limit={n}`** — Public

Case-insensitive name search. Returns matching students up to the specified limit. Returns an empty array if the search string is blank (avoids loading all records accidentally).

---

**`PUT /profile/{id}`** — `[Authorize]`

Allows a student to update their own profile (gender, phone, address, profile photo). Includes an ownership check:
```csharp
if (currentId != ID) return Forbid();
```
This prevents Student A from editing Student B's profile even if both are authenticated.

---

#### `TeacherController`
**Route:** `api/Teacher`

Manages teacher records with the same patterns as StudentController.

---

**`GET /me`** — `[Authorize]`

Returns the currently logged-in teacher's profile, identified from JWT claims. Separate from `AuthController /me` — this was an earlier implementation and could be consolidated, but both work.

---

**`PUT /profile/{id}`** — `[Authorize]`

Allows a teacher to update their own profile. Same ownership check pattern as students. Accepts form data with an optional image file.

---

**`GET /Teachers?page={n}`** — Public

Paginated list of all teachers (10 per page).

---

**`GET /Teacher/{id}`** — Public

Single teacher lookup by GUID.

---

**`DELETE /teacher/{id}`** — `[Authorize(Roles = "Admin")]`

Hard-delete a teacher. Admin only.

---

**`PUT /teacher/{id}`** — `[Authorize(Roles = "Admin")]`

Admin-only full update including the ability to change a teacher's `Role` (e.g., promote to Admin or demote to Teacher).

---

**`GET /searchTeacher?search={query}&limit={n}`** — Public

Same case-insensitive search as students but for the Teachers table.

---

#### `GroupsController`
**Route:** `api/Groups`

The most complex controller. All endpoints require authentication (`[Authorize]` at class level), with further role restrictions per action.

##### Helper Properties and Methods

```csharp
private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
private bool IsAdmin => User.IsInRole("Admin");
private bool IsStudent => User.IsInRole("Student");
private bool IsCreatorOrAdmin(Group group) => IsAdmin || group.CreatedById == CurrentUserId;
```

These are computed properties that extract information from the JWT claims on every call. They remove repetition and make authorization checks readable.

```csharp
private async Task<bool> CanManageGroup(int groupId)
```
Returns true if the current user is an Admin, the group's creator, or an assigned co-teacher (GroupManager). Used to gate write operations on groups.

```csharp
private async Task<bool> CanViewGroup(int groupId)
```
Returns true if the user can view a group. Admins see all. Students can view groups they are active members of. Teachers can view groups they created or co-manage.

---

**`POST /`** — `[Authorize(Roles = "Admin,Teacher")]`

Creates a new group. Optionally accepts a list of `StudentIds` to add as initial members in the same request (avoids a second API call).

---

**`GET /`** — `[Authorize]`

Returns groups based on the caller's role:
- **Admin** → all active groups
- **Student** → only groups where they are an active member
- **Teacher** → groups they created or co-manage

Also returns `MemberCount` and `LastPostAt` for display in the group list UI.

---

**`GET /{id}`** — `[Authorize]`

Returns full group detail including the nested `Managers` and `Members` arrays. First checks `CanViewGroup()` — returns 403 Forbidden if the user has no access.

---

**`POST /{id}/members`** — `[Authorize(Roles = "Admin,Teacher")]`

Adds one or more students to a group. Performs several checks:
1. Verifies the caller can manage the group.
2. Validates that the student IDs exist in the database.
3. Skips students who are already active members (prevents duplicate memberships). The unique filtered index in the DB also enforces this at the database level.

Returns a count of `added` and `skipped` students.

---

**`DELETE /{id}/members/{studentId}`** — `[Authorize(Roles = "Admin,Teacher")]`

**Soft-removes** a student from a group by setting `RemovedAt = DateTime.UtcNow`. The record is kept in the database for audit purposes. The unique index only applies to rows where `RemovedAt IS NULL`, so the same student can be re-added in the future.

---

**`DELETE /{id}`** — `[Authorize(Roles = "Admin,Teacher")]`

**Soft-deletes** a group by setting `IsActive = false`. The group data is preserved in the database. Only the creator or an Admin can delete a group.

---

**`GET /student/{studentId}`** — `[Authorize(Roles = "Admin,Teacher")]`

Returns all active groups a specific student belongs to. Used by admin/teacher to view a student's group memberships from the student detail page.

---

**`POST /{id}/managers`** — `[Authorize(Roles = "Admin,Teacher")]`

Assigns additional teachers as co-managers of a group. Only the group creator or an Admin can add managers. The group creator cannot be added as a manager (they already own it).

---

**`DELETE /{id}/managers/{teacherId}`** — `[Authorize(Roles = "Admin,Teacher")]`

Removes a co-teacher from a group. Only the creator or Admin can do this.

---

**`POST /{id}/posts`** — `[Authorize(Roles = "Admin,Teacher")]`

Creates a post (notice or file) in a group. Checks `CanManageGroup()`. Validates that:
- A Notice has content.
- A File type has an actual uploaded file.

Files are saved to `wwwroot/uploads/` with a GUID filename. The original filename is stored separately for display and download.

---

**`GET /{id}/posts`** — `[Authorize]`

Returns all posts in a group, ordered newest first. Checks `CanViewGroup()` first.

---

**`DELETE /{id}/posts/{postId}`** — `[Authorize(Roles = "Admin,Teacher")]`

Deletes a group post. An Admin can delete any post. A teacher can only delete their own posts. If the post has an attached file, it is also deleted from disk.

---

**`GET /{id}/posts/{postId}/download`** — `[Authorize]`

Downloads the file attached to a post. Checks `CanViewGroup()` first. Reads the file bytes from `wwwroot/uploads/` and returns them with the original filename as the download name (`application/octet-stream`).

---

**`GET /notices`** — `[Authorize]`

Returns up to 50 recent Notice-type posts across all groups the user can access. Used by the `NotificationBell` component in the navbar to show unread notices.

---

## 5. Frontend — React + TypeScript

### 5.1 Entry Point — `main.tsx`

The React application is bootstrapped here. It wraps the entire app in several providers:

**`<StrictMode>`**
React's strict mode. In development, it intentionally double-invokes certain functions to help catch side effects and deprecated API usage. Has no effect in production.

**`<Provider store={store}>`**
Makes the Redux store available to all child components via React context. Without this wrapper, `useSelector` and `useDispatch` hooks would not work.

**`<BrowserRouter>`**
Wraps the app in React Router's browser history context, enabling client-side navigation using the browser's History API (clean URLs without hash fragments).

**`<Toaster position="top-right" />`**
The React Hot Toast global toast container. Placed here so toast notifications can be triggered from anywhere in the app and always render in the top-right corner.

---

### 5.2 Redux Store — `store.ts`

The global state is managed with Redux Toolkit. This project uses RTK Query almost exclusively, meaning there is no manually written `createSlice` state — all server state is managed through the API services.

**`combineReducers`**
Combines the four RTK Query API reducers into a single root reducer. Each API gets its own slice of the Redux state (keyed by `reducerPath`).

**`rootReducer`**
A wrapper around `appReducer` that handles the `"auth/resetStore"` action. When this action is dispatched (on logout), the entire Redux state is reset to `undefined`, which causes RTK Query to clear all its caches. This prevents stale data from showing up after a user logs out and a different user logs in.

**`configureStore`**
Creates the Redux store with:
- `reducer: rootReducer` — the combined reducer
- `middleware` — adds all four RTK Query middlewares, which handle the automatic background re-fetching, cache invalidation, and polling features.

**`setupListeners(store.dispatch)`**
Enables RTK Query's `refetchOnFocus` and `refetchOnReconnect` behaviors — automatically re-fetches queries when the user tabs back into the window or reconnects to the internet.

**`RootState` and `AppDispatch` types**
Exported TypeScript types for use with typed `useSelector` and `useDispatch` hooks throughout the app.

---

### 5.3 API Services

Each API service is created with RTK Query's `createApi`. This generates React hooks, handles caching, deduplication of requests, and cache invalidation automatically.

The base URL for all services points to `https://localhost:7014/api/...` with `credentials: "include"` — this is what tells the browser to send the HTTP-only JWT cookie with every request.

#### `AuthApi.ts`

| Hook | Method | Endpoint | Purpose |
|---|---|---|---|
| `useRegisterTeacherMutation` | POST | `/TeacherRegister` | Register a teacher |
| `useAddStudentMutation` | POST | `/AddStudent` | Admin adds a student |
| `useLoginMutation` | POST | `/login` | Login for all roles |
| `useLogoutMutation` | POST | `/logout` | Clear session |
| `useRefreshTokenMutation` | POST | `/refresh` | Silently refresh access token |
| `useGetCurrentUserQuery` | GET | `/me` | Get logged-in user profile |

`refetchOnMountOrArgChange: true` — every time a component mounts, re-fetches the current user to ensure fresh data. Important for the navbar which needs to know who is logged in.

#### `StudentApi.ts`

| Hook | Method | Endpoint | Purpose |
|---|---|---|---|
| `useGetStudentsQuery` | GET | `/Students?page=n` | Paginated student list |
| `useGetStudentQuery` | GET | `/{id}` | Single student |
| `useSearchStudentsQuery` | GET | `/search?search=...` | Name search |
| `useUpdateStudentMutation` | PUT | `/student/{id}` | Admin updates student |
| `useDeleteStudentMutation` | DELETE | `/{id}` | Admin deletes student |
| `useUpdateStudentProfileMutation` | PUT | `/profile/{id}` | Student updates own profile |

#### `TeacherApi.ts`

| Hook | Method | Endpoint | Purpose |
|---|---|---|---|
| `useGetCurrentTeacherQuery` | GET | `/me` | Current teacher's data |
| `useGetTeachersQuery` | GET | `/Teachers?page=n` | Paginated teacher list |
| `useGetTeacherQuery` | GET | `/Teacher/{id}` | Single teacher |
| `useUpdateTeacherProfileMutation` | PUT | `/profile/{id}` | Teacher updates own profile |
| `useUpdateTeacherMutation` | PUT | `/teacher/{id}` | Admin updates a teacher |
| `useDeleteTeacherMutation` | DELETE | `/teacher/{id}` | Admin deletes a teacher |
| `useSearchTeachersQuery` | GET | `/searchTeacher?search=...` | Name search |

#### `GroupApi.ts`

| Hook | Method | Endpoint | Purpose |
|---|---|---|---|
| `useGetGroupsQuery` | GET | `/` | List groups (role-filtered) |
| `useGetGroupByIdQuery` | GET | `/{id}` | Single group with members |
| `useCreateGroupMutation` | POST | `/` | Create a group |
| `useAddGroupMembersMutation` | POST | `/{id}/members` | Add students to group |
| `useRemoveGroupMemberMutation` | DELETE | `/{id}/members/{studentId}` | Remove student |
| `useDeleteGroupMutation` | DELETE | `/{id}` | Soft-delete group |
| `useGetGroupsForStudentQuery` | GET | `/student/{studentId}` | Groups a student belongs to |
| `useAddGroupManagersMutation` | POST | `/{id}/managers` | Add co-teachers |
| `useRemoveGroupManagerMutation` | DELETE | `/{id}/managers/{teacherId}` | Remove co-teacher |
| `useGetGroupPostsQuery` | GET | `/{id}/posts` | Posts in a group |
| `useCreateGroupPostMutation` | POST | `/{id}/posts` | Create notice or file post |
| `useDeleteGroupPostMutation` | DELETE | `/{id}/posts/{postId}` | Delete a post |
| `useGetRecentNoticesQuery` | GET | `/notices` | Recent notices (for bell) |

**Tag-based Cache Invalidation**
RTK Query uses `tagTypes` to automatically invalidate and re-fetch stale data. For example, `createGroup` invalidates `{ type: "Group", id: "LIST" }`, which causes `useGetGroupsQuery` to re-fetch automatically — without manual refresh logic.

---

### 5.4 Routing — `App.tsx`

All client-side routes are defined in `App.tsx` using React Router v7. The default route (`/`) redirects to `/Login`.

Routes are organized into categories:

| Category | Routes |
|---|---|
| Public | `/Login` |
| Common (any authenticated role) | `/Student/:id`, `/Teacher/:id`, `/ViewYourProfile`, `/UpdateTeacherProfile/:id`, `/UpdateStudentProfile/:id` |
| Admin only | `/RegisterTeacher`, `/AddStudents`, `/EditStudent/:id`, `/EditTeacher/:id`, `/AdminIndex` |
| Admin + Teacher | `/Teachers`, `/StudentView`, `/CreateGroup` |
| Teacher only | `/TeacherIndex` |
| Student only | `/StudentIndex` |
| All authenticated | `/GroupsList`, `/groups/:id` |
| Catch-all | `*` → `<NotFound />` |

---

### 5.5 Route Guards

Route guards wrap pages to prevent unauthorized access. They are wrappers using RTK Query hooks to check authentication state.

#### `AdminRoute.tsx`
Allows only users with the `Admin` role. Redirects to `/Login` if not authenticated or not an admin.

#### `TeacherRout.tsx`
Allows only users with the `Teacher` role. Note: the filename has a typo (`Rout` instead of `Route`).

#### `StudentRoute.tsx`
Allows only users with the `Student` role.

#### `RoleRoute.tsx`
A flexible guard that accepts an `allowedRoles` array prop. Used for routes accessible to both Admins and Teachers:
```tsx
<RoleRoute allowedRoles={["Admin", "Teacher"]}>
  <Teachers />
</RoleRoute>
```

How they work: each guard calls `useGetCurrentUserQuery()` to fetch the current user from the backend (using the JWT cookie). If the user's role is not in the allowed list, they are redirected. If the query is still loading, a loading state is shown to prevent flash-of-unauthorized-content.

---

### 5.6 Pages

#### Auth Pages (`pages/Auth/`)

- **`Login.tsx`** — Login form for all user types. Uses `useLoginMutation` and redirects to the appropriate dashboard based on the role returned in the response.
- **`RegisterTeacher.tsx`** — Admin-only form to register a new teacher. Uses `useRegisterTeacherMutation`.
- **`AddStudents.tsx`** — Admin-only form to add a new student. Uses `useAddStudentMutation`.

#### Student Pages (`pages/Student/`)

- **`StudentView.tsx`** — Paginated list of all students. Uses `useGetStudentsQuery`. Accessible to Admins and Teachers.
- **`StudentDetail.tsx`** — Full profile view of a single student. Shows group memberships via `useGetGroupsForStudentQuery`.
- **`EditStudent.tsx`** — Admin form to fully edit a student's information including photo. Uses `useUpdateStudentMutation` with `FormData`.
- **`UpdateStudentProfile.tsx`** — Self-service profile update for students (limited fields). Uses `useUpdateStudentProfileMutation`.

#### Teacher Pages (`pages/Teacher/`)

- **`Teachers.tsx`** — Paginated list of all teachers.
- **`TeacherDetail.tsx`** — Full teacher profile view.
- **`EditTeacher.tsx`** — Admin form to edit teacher info including role change.
- **`ViewYourProfile.tsx`** — The logged-in user's own profile page. Uses `useGetCurrentUserQuery` to identify who is viewing and fetches the full profile.
- **`UpdateTeacherProfile.tsx`** — Self-service profile update for teachers and admins.

#### Group Pages (`pages/Group/`)

- **`GroupList.tsx`** — Displays groups relevant to the current user. Each card shows the group name, member count, and last post time.
- **`CreateGroup.tsx`** — Form to create a new group with an optional initial member selection via the student search. Uses `useCreateGroupMutation`.
- **`GroupDetail.tsx`** — The main group workspace. Shows posts (notices and files), members, and managers. Allows authorized users to add/remove members, post content, and manage co-teachers. The most feature-rich page in the application.

#### Dashboard Pages

- **`AdminIndex.tsx`** — Admin home dashboard.
- **`TeacherIndex.tsx`** — Teacher home dashboard.
- **`StudentIndex.tsx`** — Student home dashboard.
- **`NotFound.tsx`** — 404 page for unmatched routes.

---

### 5.7 Components

#### `NavBar.tsx`

The top navigation bar, sticky at the top of every page. Features:

- **Logo / Home** — Clicking "StudentGrid" navigates the user to their role-appropriate dashboard (Admin → `/AdminIndex`, Teacher → `/TeacherIndex`, Student → `/StudentView`).
- **Live Search** — Searches both students and teachers simultaneously as the user types. Uses `useSearchStudentsQuery` and `useSearchTeachersQuery` with `skip: !search.trim()` to avoid firing requests on empty input. Results show a profile thumbnail, full name, and type label. Clicking a result navigates to the detail page.
- **NotificationBell** — Shows recent notices (only rendered when logged in).
- **Login button** — Shown when not authenticated.
- **Hamburger menu button** — Shown on mobile to toggle the slide menu.

#### `NotificationBell.tsx`

A bell icon in the navbar that shows a red badge with the count of unread notices.

- Uses `useGetRecentNoticesQuery` to fetch the 50 most recent notices from groups the user belongs to.
- Uses `getUnreadNotices(notices)` utility to filter notices the user hasn't seen yet (based on a stored timestamp in `localStorage`).
- Clicking a notice navigates to the relevant group's detail page.
- Uses `@base-ui/react` `Popover` for the accessible dropdown.

#### `SlideMenu.tsx`

A slide-in sidebar for mobile screens. Contains navigation links appropriate to the user's role. Controlled by the `showMenuButton` prop and `onMenuButtonClick` callback in the navbar.

#### Route Guard Components

Described in section 5.5.

#### `lib/utils.ts`

```typescript
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

The `cn()` utility is used throughout the codebase to conditionally combine Tailwind CSS class names. `clsx` handles conditional logic (e.g., `cn("base", isActive && "text-green-500")`). `twMerge` resolves Tailwind class conflicts (e.g., `cn("p-4", "p-2")` → `"p-2"` not `"p-4 p-2"`).

---

## 6. Authentication Flow

```
┌──────────┐                              ┌──────────────┐
│  Browser │                              │  API Server  │
└──────────┘                              └──────────────┘
     │                                            │
     │  POST /api/Auth/login                      │
     │  { email, password }                       │
     │ ─────────────────────────────────────────► │
     │                                            │ Verify password
     │                                            │ Generate JWT (1hr)
     │                                            │ Generate RefreshToken (1hr)
     │                                            │ Store RefreshToken in DB
     │  200 OK + Set-Cookie: token=JWT (HttpOnly) │
     │  Set-Cookie: refreshToken=... (HttpOnly)   │
     │ ◄───────────────────────────────────────── │
     │                                            │
     │  (subsequent requests — cookie sent auto)  │
     │  GET /api/Groups                           │
     │  Cookie: token=JWT                         │
     │ ─────────────────────────────────────────► │
     │                                            │ Validate JWT
     │  200 OK + data                             │
     │ ◄───────────────────────────────────────── │
     │                                            │
     │  (JWT expires after 1 hour)                │
     │  POST /api/Auth/refresh                    │
     │  Cookie: refreshToken=...                  │
     │ ─────────────────────────────────────────► │
     │                                            │ Find RefreshToken in DB
     │                                            │ Verify not expired
     │                                            │ Generate new JWT
     │  200 OK + Set-Cookie: token=new JWT        │
     │ ◄───────────────────────────────────────── │
```

---

## 7. Role-Based Access Control

| Feature | Admin | Teacher | Student |
|---|:---:|:---:|:---:|
| Login | ✅ | ✅ | ✅ |
| Register Teacher | ✅ | ❌ | ❌ |
| Add Student | ✅ | ❌ | ❌ |
| View Students List | ✅ | ✅ | ❌ |
| Edit Any Student | ✅ | ❌ | ❌ |
| Delete Student | ✅ | ❌ | ❌ |
| Edit Own Profile | ✅ | ✅ | ✅ |
| View Teachers List | ✅ | ✅ | ❌ |
| Edit Any Teacher | ✅ | ❌ | ❌ |
| Delete Teacher | ✅ | ❌ | ❌ |
| Create Group | ✅ | ✅ | ❌ |
| Manage Group Members | ✅ | ✅ (own groups) | ❌ |
| Assign Co-Teachers | ✅ | ✅ (own groups) | ❌ |
| Post to Group | ✅ | ✅ (managed groups) | ❌ |
| View Group Posts | ✅ | ✅ (managed groups) | ✅ (member groups) |
| Download Files | ✅ | ✅ (managed groups) | ✅ (member groups) |
| Delete Any Post | ✅ | ❌ | ❌ |
| Delete Own Post | ✅ | ✅ | ❌ |

---

## 8. File Upload System

Uploaded files (profile images and group post attachments) are stored in `backend/wwwroot/uploads/`. ASP.NET Core's `UseStaticFiles()` middleware serves this directory, so files are accessible via:
```
https://localhost:7014/uploads/{filename}
```

**Why GUID filenames?**
Files are saved with a randomly generated GUID as the filename (e.g., `3f2504e0-4f89-11d3-9a0c-0305e82c3301.pdf`). This:
- Prevents filename collisions when multiple users upload files with the same name.
- Prevents path traversal attacks where a malicious filename like `../../appsettings.json` could overwrite important files.
- Hides internal structure from users.

The original filename is preserved in the `GroupPost.OriginalFileName` database column and is used as the download filename.

**Profile image replacement:**
When a new profile image is uploaded, the old image file is deleted from disk before the new one is saved, preventing accumulation of orphaned files.

---

## 9. Database Migrations

EF Core migrations track the evolution of the database schema over time. Each migration file contains `Up()` (apply change) and `Down()` (revert change) methods.

| Migration | Change |
|---|---|
| `20260830082221_int` | Initial tables |
| `20260830082901_UpdateStuddentModel` | Updated student model |
| `20260901090432_UpdateUserModel` | Updated user model |
| `20260901091600_GenderAdd` | Added Gender field |
| `20260903084028_RenameUsersToTeachers` | Renamed Users table to Teachers |
| `20260903091032_MakeTeacherFieldsNullable` | Made optional fields nullable |
| `20260904051541_AddedPasswordInStudent` | Added Password to Student |
| `20260904051906_ChangeNullable` | Nullable adjustments |
| `20260904052452_Role` | Added Role field |
| `20260904090401_Group` | Added Groups, GroupMembers, GroupManagers tables |
| `20260907085643_UpdateStudentModel` | Student model update |
| `20260907103941_Updated RefreshToken Module` | Updated RefreshToken entity |
| `20260908063547_Notification in Group` | Added GroupPost table |
| `20260908094106_Updated Timezone` | Applied UTC DateTime converter |

---

## 10. Running the Project Locally

### Prerequisites
- .NET 10 SDK
- SQL Server LocalDB (included with Visual Studio)
- Node.js 20+ and npm

### Backend Setup

```bash
cd backend/backend

# Restore NuGet packages
dotnet restore

# Add your JWT secret key to user secrets (do NOT put it in appsettings.json)
dotnet user-secrets set "Jwt:Key" "YourSuperSecretKeyHere_AtLeast32Characters"

# Apply database migrations
dotnet ef database update

# Run the API
dotnet run
```

The API will be available at `https://localhost:7014`. Swagger UI: `https://localhost:7014/swagger`.

On first run, the admin seed creates:
- **Email:** `admin@example.com`
- **Password:** `admin123`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### Configuration Notes

The `appsettings.json` has the JWT key commented out intentionally. Use .NET User Secrets for local development:
```json
// appsettings.json — do NOT add the key here
{
  "Jwt": {
    "Issuer": "StudentManagementAPI",
    "Audience": "StudentManagementClient"
  }
}
```

For production, set the `Jwt:Key` environment variable via the hosting platform's secret management.

---

## 11. API Reference

### Base URL
```
https://localhost:7014/api
```

### Authentication
All protected endpoints require the `token` cookie (set automatically after login). No manual header configuration is needed in the browser.

### Auth Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/Auth/TeacherRegister` | Public | Register new teacher |
| POST | `/Auth/AddStudent` | Admin | Add new student |
| POST | `/Auth/login` | Public | Login (all roles) |
| POST | `/Auth/logout` | Public | Logout + clear cookies |
| POST | `/Auth/refresh` | Public | Refresh access token |
| GET | `/Auth/me` | Any | Get current user profile |

### Student Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/Student/Students?page=n` | Public | Paginated student list |
| GET | `/Student/{id}` | Public | Get student by ID |
| GET | `/Student/search?search=&limit=` | Public | Search students by name |
| PUT | `/Student/student/{id}` | Admin | Full update of student |
| DELETE | `/Student/{id}` | Admin | Delete student |
| PUT | `/Student/profile/{id}` | Authenticated | Student updates own profile |

### Teacher Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/Teacher/Teachers?page=n` | Public | Paginated teacher list |
| GET | `/Teacher/Teacher/{id}` | Public | Get teacher by ID |
| GET | `/Teacher/searchTeacher?search=&limit=` | Public | Search teachers by name |
| GET | `/Teacher/me` | Authenticated | Current teacher's data |
| PUT | `/Teacher/profile/{id}` | Authenticated | Teacher updates own profile |
| PUT | `/Teacher/teacher/{id}` | Admin | Admin updates teacher (incl. role) |
| DELETE | `/Teacher/teacher/{id}` | Admin | Delete teacher |

### Group Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/Groups` | Authenticated | List accessible groups |
| POST | `/Groups` | Admin, Teacher | Create group |
| GET | `/Groups/{id}` | Authenticated | Get group details |
| DELETE | `/Groups/{id}` | Admin, Teacher | Soft-delete group |
| GET | `/Groups/student/{studentId}` | Admin, Teacher | Groups a student is in |
| POST | `/Groups/{id}/members` | Admin, Teacher | Add students to group |
| DELETE | `/Groups/{id}/members/{studentId}` | Admin, Teacher | Remove student (soft) |
| POST | `/Groups/{id}/managers` | Admin, Teacher | Add co-teachers |
| DELETE | `/Groups/{id}/managers/{teacherId}` | Admin, Teacher | Remove co-teacher |
| GET | `/Groups/{id}/posts` | Authenticated | List group posts |
| POST | `/Groups/{id}/posts` | Admin, Teacher | Create notice or file post |
| DELETE | `/Groups/{id}/posts/{postId}` | Admin, Teacher | Delete post |
| GET | `/Groups/{id}/posts/{postId}/download` | Authenticated | Download file |
| GET | `/Groups/notices` | Authenticated | Recent notices (for bell) |
