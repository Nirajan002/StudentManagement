import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Result from "./pages/Result";
import StudentDetail from "./pages/StudentDetail";
import EditStudent from "./pages/EditStudent";
import ViewYourProfile from "./pages/ViewYourProfile";
import UpdateTeacherProfile from "./pages/UpdateTeacherProfile";
import AddStudents from "./pages/AddStudents";
import Teachers from "./pages/Teachers";
import Index from "./pages/Index";
import EditTeacher from "./pages/EditTeacher";
import TeacherDetail from "./pages/TeacherDetail";

import AdminRoute from "./components/AdminRoute";
import StudentView from "./pages/StudentView";

function App() {
  return (
    <Routes>
      {/* Default route */}
      <Route path="/" element={<Navigate to="/Login" replace />} />

      {/* Authentication */}
      <Route path="/Login" element={<Login />} />

      <Route path="/Register" element={<Register />} />

      {/* Students - Everyone can access */}
      <Route path="/Result" element={<Result />} />

      <Route path="/Teachers" element={<Teachers />} />
      {/* Student Details - Everyone can access */}
      <Route path="/Student/:id" element={<StudentDetail />} />
      <Route path="/Teacher/:id" element={<TeacherDetail />} />

      {/* Admin View - Admin only */}
      <Route
        path="/StudentView"
        element={
          <AdminRoute>
            <StudentView />
          </AdminRoute>
        }
      />

      <Route
        path="/Index"
        element={
          <AdminRoute>
            <Index />
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

      {/* Edit Student - Admin only */}
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

      <Route path="ViewYourProfile" element={<ViewYourProfile />} />

      <Route path="UpdateTeacherProfile/:id" element={<UpdateTeacherProfile />} />

      {/* Unknown route */}
      <Route path="*" element={<Navigate to="/Login" replace />} />
    </Routes>
  );
}

export default App;
