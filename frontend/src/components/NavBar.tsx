/* eslint-disable @typescript-eslint/no-explicit-any */
 
import { useState } from "react";
import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useSearchStudentsQuery } from "../api/StudentApi";

import { useSearchTeachersQuery } from "../api/TeacherApi";

import { useGetCurrentUserQuery } from "../api/AuthApi";

import NotificationBell from "./NotificationBell";

interface NavbarProps {
  activeMenu?: string;
  onMenuButtonClick?: () => void; 
  showMenuButton?: boolean; 
}

export default function Navbar({
  onMenuButtonClick,
  showMenuButton,
}: NavbarProps) {
  const navigate = useNavigate();

  // =========================
  // CURRENT USER
  // =========================
  const roleFromStorage = localStorage.getItem("role");

  const { data: currentUser } = useGetCurrentUserQuery(undefined, {
    skip: !roleFromStorage,
  });

  // =========================
  // LOGIN STATUS
  // =========================
  const isLoggedIn = !!currentUser;

  const role = currentUser?.role;

  // =========================
  // SEARCH
  // =========================
  const [search, setSearch] = useState("");

  // =========================
  // SEARCH STUDENTS
  // =========================
  const { data: students = [], isLoading: isSearchingStudents } =
    useSearchStudentsQuery(
      {
        search,
        limit: 20,
      },
      {
        skip: !isLoggedIn || !search.trim(),
      },
    );

  // =========================
  // SEARCH TEACHERS
  // =========================
  const { data: teachers = [], isLoading: isSearchingTeachers } =
    useSearchTeachersQuery(
      {
        search,
        limit: 20,
      },
      {
        skip: !isLoggedIn || !search.trim(),
      },
    );

  const isSearching = isSearchingStudents || isSearchingTeachers;

  // =========================
  // COMBINE SEARCH RESULTS
  // =========================
  const searchResults = [
    ...students.map((student: any) => ({
      ...student,
      resultType: "student",
    })),
    ...teachers.map((teacher: any) => ({
      ...teacher,
      resultType: "teacher",
    })),
  ];

  // =========================
  // LOGO / HOME
  // =========================
  const handleHomeClick = () => {
    if (!isLoggedIn) {
      navigate("/Login");
      return;
    }

    const userRole = role?.toLowerCase();

    if (userRole === "admin") {
      navigate("/AdminIndex");
    } else if (userRole === "teacher") {
      navigate("/TeacherIndex");
    } else if (userRole === "student") {
      navigate("/StudentView");
    } else {
      navigate("/Login");
    }
  };

  // =========================
  // SEARCH RESULT CLICK
  // =========================
  const handleSearchResultClick = (id: string, resultType: string) => {
    setSearch("");

    if (resultType === "student") {
      navigate(`/Student/${id}`);
    } else {
      navigate(`/Teacher/${id}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 flex h-16 items-center gap-2 border-b bg-background px-3 sm:px-6">
      
      {showMenuButton && (
        <button
          onClick={onMenuButtonClick}
          className="rounded-md p-2 hover:bg-muted md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {/* =========================
          LEFT - LOGO
          ========================= */}
      <div className="flex flex-1 items-center">
        <div
          onClick={handleHomeClick}
          className="cursor-pointer text-2xl font-bold tracking-tight"
        >
          Student
          <span className="text-green-500">Grid</span>
        </div>
      </div>

      {/* =========================
          CENTER - SEARCH
          ONLY WHEN LOGGED IN
          ========================= */}
      {isLoggedIn && (
        <div className="relative flex flex-1 justify-center sm:flex">
          <Input
            type="text"
            placeholder="Search students or teachers..."
            className="w-full max-w-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* SEARCH RESULTS */}
          {search.trim() && (
            <div className="absolute top-11 z-50 w-full max-w-sm rounded-md border bg-background shadow-md">
              {/* LOADING */}
              {isSearching ? (
                <p className="px-4 py-3 text-sm text-muted-foreground">
                  Searching...
                </p>
              ) : searchResults.length > 0 ? (
                /* RESULTS */
                searchResults.map((result: any) => (
                  <div
                    key={`${result.resultType}-${result.id}`}
                    onClick={() =>
                      handleSearchResultClick(result.id, result.resultType)
                    }
                    className="flex cursor-pointer items-center gap-3 px-4 py-2 hover:bg-muted"
                  >
                    {/* PROFILE IMAGE */}
                    {result.profile ? (
                      <img
                        src={`https://localhost:7014/uploads/${result.profile}`}
                        alt={result.fullName}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {result.fullName?.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* NAME */}
                    <div className="flex flex-1 flex-col">
                      <span className="text-sm">{result.fullName}</span>

                      {/* RESULT TYPE */}
                      <span className="text-xs text-muted-foreground">
                        {result.resultType === "student"
                          ? "Student"
                          : "Teacher"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                /* NO RESULTS */
                <p className="px-4 py-3 text-sm text-muted-foreground">
                  No students or teachers found
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================
        RIGHT - NOTIFICATIONS + LOGIN
        ========================= */}
      <div className="flex flex-1 items-center justify-end gap-2">
        {isLoggedIn && <NotificationBell />}

        {!isLoggedIn && (
          <Button variant="outline" onClick={() => navigate("/Login")}>
            Log In
          </Button>
        )}
      </div>
    </nav>
  );
}
