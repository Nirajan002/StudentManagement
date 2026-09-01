import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  useSearchStudentsQuery,
  useLogoutMutation,
} from "../api/api";

export default function Navbar() {
  const navigate = useNavigate();

  // =========================
  // LOGIN STATUS
  // =========================

  const [fullName, setFullName] = useState(
    localStorage.getItem("fullName")
  );

  const [role, setRole] = useState(
    localStorage.getItem("role")
  );

  const isLoggedIn = !!fullName;

  // =========================
  // SEARCH
  // =========================

  const [search, setSearch] = useState("");

  const {
    data: students = [],
    isLoading: isSearching,
  } = useSearchStudentsQuery(
    {
      search,
      limit: 20,
    },
    {
      skip: !search.trim(),
    }
  );

  // =========================
  // LOGOUT
  // =========================

  const [logoutUser] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("fullName");
      localStorage.removeItem("role");
      localStorage.removeItem("token");

      setFullName(null);
      setRole(null);

      navigate("/Login");
    }
  };

  // =========================
  // HOME
  // =========================

  const handleHomeClick = () => {
    if (role?.toLowerCase() === "admin") {
      navigate("/AdminView");
    } else {
      navigate("/Result");
    }
  };

  // =========================
  // STUDENT CLICK
  // =========================

  const handleStudentClick = (id: string) => {
    setSearch("");
    navigate(`/Student/${id}`);
  };

  return (
    <nav className="sticky top-0 z-50 flex h-16 items-center border-b bg-background px-6">

      {/* =========================
          LEFT
      ========================= */}

      <div className="flex flex-1 items-center">
        {isLoggedIn ? (
          <div
            onClick={handleHomeClick}
            className="flex cursor-pointer items-center gap-2"
          >
            {/* Default Profile */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
              {fullName?.charAt(0).toUpperCase()}
            </div>

            {/* Name */}
            <span className="text-lg font-semibold">
              {fullName}
            </span>
          </div>
        ) : (
          <span className="text-lg font-semibold">
            Welcome!
          </span>
        )}
      </div>

      {/* =========================
          CENTER - SEARCH
      ========================= */}

      <div className="relative flex flex-1 justify-center">
        <Input
          type="text"
          placeholder="Search students..."
          className="w-full max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {search.trim() && (
          <div className="absolute top-11 z-50 w-full max-w-sm rounded-md border bg-background shadow-md">

            {isSearching ? (
              <p className="px-4 py-3 text-sm text-muted-foreground">
                Searching...
              </p>
            ) : students.length > 0 ? (
              students.map((student: any) => (
                <div
                  key={student.id}
                  onClick={() => handleStudentClick(student.id)}
                  className="flex cursor-pointer items-center gap-3 px-4 py-2 hover:bg-muted"
                >
                  {student.profile ? (
                    <img
                      src={`https://localhost:7014/uploads/${student.profile}`}
                      alt={student.fullName}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {student.fullName
                        ?.charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  <span className="text-sm">
                    {student.fullName}
                  </span>
                </div>
              ))
            ) : (
              <p className="px-4 py-3 text-sm text-muted-foreground">
                No students found
              </p>
            )}
          </div>
        )}
      </div>

      {/* =========================
          RIGHT
      ========================= */}

      <div className="flex flex-1 justify-end">
        {isLoggedIn ? (
          <Button onClick={handleLogout}>
            Logout
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/Login")}
            >
              Log In
            </Button>

            <Button
              onClick={() => navigate("/Register")}
            >
              Register
            </Button>
          </div>
        )}
      </div>

    </nav>
  );
}