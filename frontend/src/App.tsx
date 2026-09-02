import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Result from "./pages/Result";
import StudentDetail from "./pages/StudentDetail";
import EditStudent from "./pages/EditStudent";
import ViewYourProfile from "./pages/ViewYourProfile";
import UpdateUserProfile from "./pages/UpdateUserProfile";
import AddStudents from "./pages/AddStudents";
import Users from "./pages/Users"
import AdminDashboard from "./pages/AdminDashboard";
import EditUser from "./pages/EditUser";
import UserDetail from "./pages/UserDetail";

import AdminRoute from "./components/AdminRoute";
import AdminView from "./pages/AdminView";

function App() {
  return (
    <Routes>
      {/* Default route */}
      <Route path="/" element={<Navigate to="/Result" replace />} />

      {/* Authentication */}
      <Route path="/Login" element={<Login />} />

      <Route path="/Register" element={<Register />} />

      {/* Students - Everyone can access */}
      <Route path="/Result" element={<Result />} />

      <Route path="/Users" element={<Users />} />
      {/* Student Details - Everyone can access */}
      <Route path="/Student/:id" element={<StudentDetail />} />
      <Route path="/User/:id" element={<UserDetail />} />

      {/* Admin View - Admin only */}
      <Route
        path="/AdminView"
        element={
          <AdminRoute>
            <AdminView />
          </AdminRoute>
        }
      />

      <Route
        path="/AdminDashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />    

      <Route
        path="/EditUser/:id"
        element={
          <AdminRoute>
            <EditUser />
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

      <Route path="UpdateUserProfile/:id" element={<UpdateUserProfile />} />

      {/* Unknown route */}
      <Route path="*" element={<Navigate to="/Result" replace />} />
    </Routes>
  );
}

export default App;
