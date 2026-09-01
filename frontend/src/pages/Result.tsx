import { useGetStudentsQuery } from "../api/api";
import StudentTable from "../components/StudentTable";
import Navbar from "../components/NavBar";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";

export default function Result() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;

  const {
    data: students = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetStudentsQuery(page);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <h2>Loading...</h2>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <h2>Failed to load students</h2>
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <div className="container mx-auto p-6">
        <h1 className="mb-6 text-2xl font-bold">
          Student Management
        </h1>

        <StudentTable
          students={students}
          refetch={refetch}
          page={page}
        />

        <div className="flex items-center justify-center gap-4 p-4">
          {/* Previous */}
          <Button
            variant="outline"
            onClick={() =>
              setSearchParams({
                page: String(page - 1),
              })
            }
            disabled={page === 1 || isFetching}
          >
            Previous
          </Button>

          {/* Page number */}
          <span className="text-sm font-medium">
            Page {page}
          </span>

          {/* Next */}
          <Button
            variant="outline"
            onClick={() =>
              setSearchParams({
                page: String(page + 1),
              })
            }
            disabled={students.length < 10 || isFetching}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}