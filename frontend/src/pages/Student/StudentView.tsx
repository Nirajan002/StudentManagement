import React from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

import { useGetStudentsQuery } from "../../api/StudentApi";
import { useGetCurrentTeacherQuery } from "../../api/TeacherApi";

import StudentTable from "@/components/layouts/StudentTable";

import { Button } from "@/components/ui/button";

import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function StudentView() {
  // =========================
  // PAGE
  // =========================

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const page = Number(searchParams.get("page")) || 1;

  // =========================
  // GET CURRENT USER
  // =========================

  const {
    data: currentUser,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useGetCurrentTeacherQuery();

  // Check role from database
  const isAdmin = currentUser?.role === "Admin";

  // =========================
  // GET STUDENTS
  // =========================

  const {
    data: students = [],
    isLoading: isStudentsLoading,
    isFetching,
    isError: isStudentsError,
    refetch,
  } = useGetStudentsQuery(page, {
    refetchOnMountOrArgChange: true,
  });

  // =========================
  // LOADING
  // =========================

  if (isUserLoading || isStudentsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <h2>Loading students...</h2>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (isUserError || isStudentsError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <h2>Failed to load students</h2>
      </div>
    );
  }

  // =========================
  // PAGE CHANGE
  // =========================

  const goToPreviousPage = () => {
    if (page > 1) {
      setSearchParams({
        page: String(page - 1),
      });
    }
  };

  const goToNextPage = () => {
    if (students.length >= 10) {
      setSearchParams({
        page: String(page + 1),
      });
    }
  };

  // =========================
  // UI
  // =========================

  return (
    <DashboardLayout activeMenu="Students">
      <div className="p-6">

        {/* =========================
            HEADER
        ========================= */}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Student Management
            </h1>

            <p className="text-sm text-muted-foreground">
              Manage all students
            </p>
          </div>

          {/* =========================
              ADD STUDENT - ADMIN ONLY
          ========================= */}

          {isAdmin && (
            <Button onClick={() => navigate("/AddStudents")}>
              Add Student
            </Button>
          )}
        </div>

        {/* =========================
            STUDENT TABLE
        ========================= */}

        <StudentTable
          students={students}
          refetch={refetch}
          page={page}
          isAdmin={isAdmin}
        />

        {/* =========================
            PAGINATION
        ========================= */}

        <div className="flex items-center justify-center gap-4 p-6">
          <Button
            variant="outline"
            onClick={goToPreviousPage}
            disabled={page === 1 || isFetching}
          >
            Previous
          </Button>

          <span className="text-sm font-medium">
            Page {page}
          </span>

          <Button
            variant="outline"
            onClick={goToNextPage}
            disabled={students.length < 10 || isFetching}
          >
            Next
          </Button>
        </div>

      </div>
    </DashboardLayout>
  );
}