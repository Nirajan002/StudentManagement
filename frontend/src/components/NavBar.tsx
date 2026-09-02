import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {
  useSearchStudentsQuery,
  useLogoutMutation,
  useGetCurrentUserQuery,
} from "../api/api";

export default function Navbar() {
  const navigate = useNavigate();

  // *=========================*
  // *CURRENT USER*
  // *=========================*

  const { data: currentUser } = useGetCurrentUserQuery();

  // *=========================*
  // *LOGIN STATUS*
  // *=========================*

  const [fullName, setFullName] = useState(localStorage.getItem("fullName"));

  const [role, setRole] = useState(localStorage.getItem("role"));

  const isLoggedIn = !!fullName;

  // *=========================*
  // *PROFILE DROPDOWN*
  // *=========================*

  const [profileOpen, setProfileOpen] = useState(false);

  // *=========================*
  // *SEARCH*
  // *=========================*

  const [search, setSearch] = useState("");

  const { data: students = [], isLoading: isSearching } =
    useSearchStudentsQuery(
      {
        search,
        limit: 20,
      },
      {
        skip: !search.trim(),
      },
    );

  // *=========================*
  // *LOGOUT*
  // *=========================*

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
      setProfileOpen(false);

      navigate("/Login");
    }
  };

  // *=========================*
  // *LOGO / HOME*
  // *=========================*

  const handleHomeClick = () => {
    if (!isLoggedIn) {
      navigate("/");
      return;
    }

    if (role?.toLowerCase() === "admin") {
      navigate("/AdminView");
    } else {
      navigate("/Result");
    }
  };

  // *=========================*
  // *VIEW PROFILE*
  // *=========================*

  const handleViewProfile = () => {
    setProfileOpen(false);
    navigate("/ViewYourProfile");
  };

  // *=========================*
  // *STUDENT CLICK*
  // *=========================*

  const handleStudentClick = (id: string) => {
    setSearch("");
    navigate(`/Student/${id}`);
  };

  return (
    <nav className="sticky top-0 z-50 flex h-16 items-center border-b bg-background px-6">
      {/* =========================
          LEFT - LOGO
          ========================= */}

      <div className="flex flex-1 items-center">
        <div onClick={handleHomeClick} className="cursor-pointer">
          <img
            src="/YOUR-LOGO.png"
            alt="Logo"
            className="h-10 w-auto object-contain"
          />
        </div>
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
                      {student.fullName?.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <span className="text-sm">{student.fullName}</span>
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
          RIGHT - PROFILE / AUTH
          ========================= */}

      <div className="relative flex flex-1 justify-end">
        {isLoggedIn ? (
          <div className="relative">
            {/* =========================
                PROFILE BUTTON
                ========================= */}

            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted"
            >
              {/* Profile Circle */}

              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-medium">
                {currentUser?.profile ? (
                  <img
                    src={`https://localhost:7014/uploads/${currentUser.profile}`}
                    alt={fullName || "Profile"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  fullName?.charAt(0).toUpperCase()
                )}
              </div>

              {/* Name */}

              <span className="text-sm font-semibold">{fullName}</span>

              {/* Arrow */}

              <span className="text-xs">{profileOpen ? "▲" : "▼"}</span>
            </button>

            {/* =========================
                DROPDOWN
                ========================= */}

            {profileOpen && (
              <div className="absolute right-0 top-12 z-50 w-44 rounded-md border bg-background p-1 shadow-lg">
                {/* View Profile */}

                <button
                  onClick={handleViewProfile}
                  className="w-full rounded-sm px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  View Profile
                </button>

                {/* Logout */}

                <button
                  onClick={handleLogout}
                  className="w-full rounded-sm px-3 py-2 text-left text-sm text-red-600 hover:bg-muted"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          /* =========================
             NOT LOGGED IN
             ========================= */

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/Login")}>
              Log In
            </Button>

            <Button onClick={() => navigate("/Register")}>Register</Button>
          </div>
        )}
      </div>
    </nav>
  );
}
