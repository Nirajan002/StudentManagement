import React from "react";
import { useSearchParams } from "react-router-dom";

import { useGetStudentsQuery } from "../api/api";
import ViewTable from "../components/ViewTable";
import Navbar from "../components/NavBar";
import { Button } from "@/components/ui/button";

export default function AdminView() {
  // =========================
  // PAGE
  // =========================
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;

  // =========================
  // GET STUDENTS
  // =========================
  const {
    data: students = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetStudentsQuery(page, {
    refetchOnMountOrArgChange: true,
  });

  // =========================
  // LOADING
  // =========================
  if (isLoading) {
    return (
      <div>
        <Navbar />

        <div className="flex min-h-screen items-center justify-center">
          <h2>Loading students...</h2>
        </div>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================
  if (isError) {
    return (
      <div>
        <Navbar />

        <div className="flex min-h-screen items-center justify-center">
          <h2>Failed to load students</h2>
        </div>
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
    <div>
      <Navbar />

      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            Admin - Student Management
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage all students
          </p>
        </div>

        {/* Student Table */}
        <ViewTable
          students={students}
          refetch={refetch}
          page={page}
        />

        {/* Pagination */}
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
    </div>
  );
}