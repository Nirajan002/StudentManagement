import { useNavigate } from "react-router-dom";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";

interface Student {
  id: string;
  fullName: string;
  email: string;
  gender: string;
  number: string;
  addresh: string;
  profile?: string | null;
  education: string;
}

interface StudentTableProps {
  students: Student[];
  page: number;
}

export default function StudentTable({
  students,
  page,
}: StudentTableProps) {
  const navigate = useNavigate();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Gender</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {students?.length > 0 ? (
          students.map((student) => (
            <TableRow key={student.id}>
              {/* Student */}
              <TableCell>
                <div className="flex items-center gap-3">
                  {student.profile ? (
                    <img
                      src={`https://localhost:7014/uploads/${student.profile}`}
                      alt={student.fullName}
                      className="h-10 w-10 rounded-full border object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                      {student.fullName
                        ?.charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  <span className="font-medium">
                    {student.fullName}
                  </span>
                </div>
              </TableCell>

              {/* Email */}
              <TableCell>{student.email}</TableCell>

              {/* Gender */}
              <TableCell>{student.gender}</TableCell>

              {/* Actions */}
              <TableCell>
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate(
                      `/Student/${student.id}?page=${page}`
                    )
                  }
                >
                  View More
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={6}
              className="h-24 text-center"
            >
              No students found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}