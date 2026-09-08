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

import { useGetTeachersQuery } from "../../api/TeacherApi";

export interface PickedTeacher {
  id: string;
  fullName: string;
  email: string;
  profile?: string | null;
}

interface TeacherPickerProps {
  selected: PickedTeacher[];
  onChange: (teachers: PickedTeacher[]) => void;
  excludeIds?: string[];
  placeholder?: string;
}

export function TeacherPicker({
  selected,
  onChange,
  excludeIds = [],
  placeholder = "Search teachers by name...",
}: TeacherPickerProps) {
  const [open, setOpen] = useState(false);

  const { data: teachers, isLoading, isError } = useGetTeachersQuery(undefined);

  const availableTeachers: PickedTeacher[] = (teachers ?? []).filter(
    (teacher: PickedTeacher) => !excludeIds.includes(teacher.id),
  );

  const toggleTeacher = (teacher: PickedTeacher) => {
    const isSelected = selected.some((t) => t.id === teacher.id);

    if (isSelected) {
      onChange(selected.filter((t) => t.id !== teacher.id));
    } else {
      onChange([...selected, teacher]);
    }
  };

  const removeTeacher = (id: string) => {
    onChange(selected.filter((teacher) => teacher.id !== id));
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
              ? `${selected.length} teacher${
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
          <Command>
            <CommandInput placeholder="Search teachers..." />

            <CommandList>
              {isLoading && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Loading teachers...
                </div>
              )}

              {isError && (
                <div className="py-6 text-center text-sm text-destructive">
                  Couldn't load teachers.
                </div>
              )}

              {!isLoading && !isError && (
                <>
                  <CommandEmpty>No teacher found.</CommandEmpty>

                  <CommandGroup>
                    {availableTeachers.map((teacher) => {
                      const isSelected = selected.some(
                        (t) => t.id === teacher.id,
                      );

                      return (
                        <CommandItem
                          key={teacher.id}
                          value={`${teacher.fullName} ${teacher.email}`}
                          data-checked={isSelected}
                          onSelect={() => toggleTeacher(teacher)}
                        >
                          <div className="flex items-center gap-2">
                            {teacher.profile ? (
                              <img
                                src={`https://localhost:7014/uploads/${teacher.profile}`}
                                alt={teacher.fullName}
                                className="h-6 w-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-medium">
                                {teacher.fullName?.charAt(0).toUpperCase()}
                              </div>
                            )}

                            <div className="flex flex-col">
                              <span>{teacher.fullName}</span>
                              <span className="text-xs text-muted-foreground">
                                {teacher.email}
                              </span>
                            </div>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((teacher) => (
            <Badge key={teacher.id} variant="secondary" className="gap-1 pr-1">
              {teacher.fullName}

              <button
                type="button"
                aria-label={`Remove ${teacher.fullName}`}
                onClick={() => removeTeacher(teacher.id)}
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
