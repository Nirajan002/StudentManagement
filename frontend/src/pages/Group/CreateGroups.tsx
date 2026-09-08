import { useState } from "react";
import { useNavigate } from "react-router-dom"; // swap for your router if different
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import { StudentPicker, type PickedStudent } from "@/components/group/StudentPicker";
import { useCreateGroupMutation } from "../../api/GroupApi";
import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function CreateGroup() {
  const navigate = useNavigate();
  const [createGroup, { isLoading }] = useCreateGroupMutation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [students, setStudents] = useState<PickedStudent[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Group name is required.");
      return;
    }

    setError(null);

    try {
      const group = await createGroup({
        name: name.trim(),
        description: description.trim() || undefined,
        studentIds: students.map((s) => s.id),
      }).unwrap();

      navigate(`/groups/${group.id}`);
    } catch {
      setError("Couldn't create the group. Try again.");
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-lg p-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2 text-muted-foreground"
          onClick={() => navigate("/groups")}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to groups
        </Button>

        <h1 className="mb-1 text-2xl font-semibold tracking-tight">
          Create a group
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Give it a name and add students now, or add them later.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="group-name">Name</Label>
            <Input
              id="group-name"
              placeholder="e.g. Grade 10 - Section B"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="group-description">Description (optional)</Label>
            <Textarea
              id="group-description"
              placeholder="What's this group for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Add students</Label>
            <StudentPicker selected={students} onChange={setStudents} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create group
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
