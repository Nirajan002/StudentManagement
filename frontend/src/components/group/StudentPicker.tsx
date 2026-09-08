import { useState } from "react";

import { ChevronsUpDown, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useSearchStudentsQuery } from "../../api/StudentApi";

export interface PickedStudent {
  id: string;
  fullName: string;
  email: string;
  profile?: string | null;
}

interface StudentPickerProps {
  selected: PickedStudent[];
  onChange: (students: PickedStudent[]) => void;
  excludeIds?: string[];
  placeholder?: string;
}

export function StudentPicker({
  selected,
  onChange,
  excludeIds = [],
  placeholder = "Search students by name or email...",
}: StudentPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const {
    data: students = [],
    isLoading,
    isError,
  } = useSearchStudentsQuery(
    {
      search,
      limit: 20,
    },
    {
      skip: !search.trim(),
    }
  );

  const availableStudents: PickedStudent[] = students.filter(
    (student: PickedStudent) => !excludeIds.includes(student.id)
  );

  const toggleStudent = (student: PickedStudent) => {
    const isSelected = selected.some((s) => s.id === student.id);

    if (isSelected) {
      onChange(selected.filter((s) => s.id !== student.id));
    } else {
      onChange([...selected, student]);
    }
  };

  const removeStudent = (id: string) => {
    onChange(selected.filter((student) => student.id !== id));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          type="button"
          role="combobox"
          aria-expanded={open}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm font-normal shadow-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="truncate">
            {selected.length > 0
              ? `${selected.length} student${
                  selected.length > 1 ? "s" : ""
                } selected`
              : placeholder}
          </span>

          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-[--radix-popover-trigger-width] p-0"
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search students..."
              value={search}
              onValueChange={setSearch}
            />

            <CommandList>
              {!search.trim() && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Start typing to search students...
                </div>
              )}

              {isLoading && search.trim() && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Searching students...
                </div>
              )}

              {isError && search.trim() && (
                <div className="py-6 text-center text-sm text-destructive">
                  Couldn't load students.
                </div>
              )}

              {!isLoading &&
                !isError &&
                search.trim() &&
                availableStudents.length === 0 && (
                  <CommandEmpty>No student found.</CommandEmpty>
                )}

              {!isLoading &&
                !isError &&
                search.trim() &&
                availableStudents.length > 0 && (
                  <CommandGroup>
                    {availableStudents.map((student) => {
                      const isSelected = selected.some(
                        (s) => s.id === student.id
                      );

                      return (
                        <CommandItem
                          key={student.id}
                          value={student.id}
                          data-checked={isSelected}
                          onSelect={() => toggleStudent(student)}
                        >
                          <div className="flex flex-col">
                            <span>{student.fullName}</span>

                            <span className="text-xs text-muted-foreground">
                              {student.email}
                            </span>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((student) => (
            <Badge
              key={student.id}
              variant="secondary"
              className="gap-1 pr-1"
            >
              {student.fullName}

              <button
                type="button"
                aria-label={`Remove ${student.fullName}`}
                onClick={() => removeStudent(student.id)}
                className="ml-1 rounded-full outline-none hover:bg-muted-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}