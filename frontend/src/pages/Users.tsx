import { useSearchParams } from "react-router-dom";
import { useGetUsersQuery } from "../api/api";
import UserTable from "../components/UserTable";

export default function Users() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;

  const {
    data: users,
    isLoading,
    isError,
    refetch,
  } = useGetUsersQuery(page, {
    refetchOnMountOrArgChange: true,
  });

  const handlePrevious = () => {
    if (page > 1) {
      setSearchParams({ page: String(page - 1) });
    }
  };

  const handleNext = () => {
    if (users && users.length === 10) {
      setSearchParams({ page: String(page + 1) });
    }
  };

  return (
    <div className="min-h-screen bg-background">

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            User Management
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage all registered users
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="py-10 text-center text-muted-foreground">
            Loading users...
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="py-10 text-center text-destructive">
            Failed to load users.
          </div>
        )}

        {/* Table */}
        {!isLoading && !isError && (
          <>
            <div className="rounded-lg border bg-card">
              <UserTable
                users={users ?? []}
                refetch={refetch}
              />
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={page === 1}
                className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
              >
                Previous
              </button>

              <span className="text-sm text-muted-foreground">
                Page {page}
              </span>

              <button
                onClick={handleNext}
                disabled={!users || users.length < 10}
                className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}