import { Routes, Route } from "react-router-dom";
import Home from "./pages/index";

// Authentication
import Login from "./pages/Auth/Login";
import RegisterTeacher from "./pages/Auth/RegisterTeacher";
import AddStudents from "./pages/Auth/AddStudents";
import GlobalNotices from "./pages/GlobalNotices";

// Common
import StudentDetail from "./pages/Student/StudentDetail";
import TeacherDetail from "./pages/Teacher/TeacherDetail";

// Admin - Students
import StudentView from "./pages/Student/StudentView";
import EditStudent from "./pages/Student/EditStudent";
import UpdateStudentProfile from "./pages/Student/UpdateStudentProfile";

// Admin - Teachers
import Teachers from "./pages/Teacher/Teachers";
import ViewYourProfile from "./pages/Teacher/ViewYourProfile";
import UpdateTeacherProfile from "./pages/Teacher/UpdateTeacherProfile";
import EditTeacher from "./pages/Teacher/EditTeacher";

// Admin
import AdminIndex from "./pages/AdminIndex";

// Teacher
import TeacherIndex from "./pages/TeacherIndex";

//Student
import StudentIndex from "./pages/StudentIndex";

// Other
import NotFound from "./pages/NotFound";

// Route protection
import AdminRoute from "./components/Routes/AdminRoute";
import TeacherRout from "./components/Routes/TeacherRout";
import StudentRoute from "./components/Routes/StudentRoute";

import RoleRoute from "./components/Routes/RoleRoute";

import GroupsList from "./pages/Group/GroupList";
import CreateGroup from "./pages/Group/CreateGroups";
import GroupDetail from "./pages/Group/GroupDetail";
import EditGroup from "./pages/Group/EditGroup";

import MyAssignments from "./pages/Assignment/MyAssignments";

import VerifyEmail from "./pages/Auth/VerifyEmail";
import ForgotPassword from "./pages/Auth/ForgotPassword";

function App() {
  return (
    <Routes>
      {/* =========================
          DEFAULT ROUTE
          ========================= */}
      <Route path="/" element={<Home />} />

      {/* =========================
          AUTHENTICATION
          ========================= */}
      <Route path="/Login" element={<Login />} />
      <Route path="/VerifyEmail" element={<VerifyEmail />} />
      <Route path="/ForgotPassword" element={<ForgotPassword />} />

      {/* =========================
          COMMON ROUTES
          ========================= */}
      <Route path="/Student/:id" element={<StudentDetail />} />

      <Route path="/Teacher/:id" element={<TeacherDetail />} />

      {/* =========================
          ADMIN ROUTES
          ========================= */}

      {/* Teacher Management */}
      <Route
        path="/Teachers"
        element={
          <RoleRoute allowedRoles={["Admin", "Teacher"]}>
            <Teachers />
          </RoleRoute>
        }
      />

      <Route
        path="/RegisterTeacher"
        element={
          <AdminRoute>
            <RegisterTeacher />
          </AdminRoute>
        }
      />

      <Route
        path="/EditTeacher/:id"
        element={
          <AdminRoute>
            <EditTeacher />
          </AdminRoute>
        }
      />

      {/* Student Management */}
      <Route
        path="/StudentView"
        element={
          <RoleRoute allowedRoles={["Admin", "Teacher"]}>
            <StudentView />
          </RoleRoute>
        }
      />

      <Route
        path="/EditStudent/:id"
        element={
          <AdminRoute>
            <EditStudent />
          </AdminRoute>
        }
      />

      <Route
        path="/AddStudents"
        element={
          <AdminRoute>
            <AddStudents />
          </AdminRoute>
        }
      />

      {/* Admin Dashboard */}
      <Route
        path="/AdminIndex"
        element={
          <AdminRoute>
            <AdminIndex />
          </AdminRoute>
        }
      />

      {/* =========================
          TEACHER ROUTES
          ========================= */}
      <Route
        path="/TeacherIndex"
        element={
          <TeacherRout>
            <TeacherIndex />
          </TeacherRout>
        }
      />

      {/* =========================
          PROFILE
          ========================= */}
      <Route path="/ViewYourProfile" element={<ViewYourProfile />} />

      <Route
        path="/UpdateTeacherProfile/:id"
        element={<UpdateTeacherProfile />}
      />

      <Route
        path="/UpdateStudentProfile/:id"
        element={<UpdateStudentProfile />}
      />

      {/* =========================
          UNKNOWN ROUTE
          ========================= */}
      <Route path="*" element={<NotFound />} />

      <Route path="/GroupsList" element={<GroupsList />} />

      <Route path="/groups/:id" element={<GroupDetail />} />

      <Route
        path="/CreateGroup"
        element={
          <RoleRoute allowedRoles={["Admin", "Teacher"]}>
            <CreateGroup />
          </RoleRoute>
        }
      />

      <Route
        path="/EditGroup/:id"
        element={
          <RoleRoute allowedRoles={["Admin", "Teacher"]}>
            <EditGroup />
          </RoleRoute>
        }
      />

      <Route
        path="/MyAssignments"
        element={
          <RoleRoute allowedRoles={["Admin", "Teacher"]}>
            <MyAssignments />
          </RoleRoute>
        }
      />

      <Route
        path="/StudentIndex"
        element={
          <StudentRoute>
            <StudentIndex />
          </StudentRoute>
        }
      />

      <Route path="/GlobalNotices" element={<GlobalNotices />} />
    </Routes>
  );
}

export default App;
