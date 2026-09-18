export type AutoDeleteOption =
  | "never"
  | "1d"
  | "3d"
  | "1w"
  | "2w"
  | "1m"
  | "custom";

/**
 * The choices rendered in the auto-delete <Select>. Kept next to
 * computeAutoDeleteAt so a new option can't be added to the UI without
 * also being handled by the date math.
 */
export const AUTO_DELETE_OPTIONS: {
  value: AutoDeleteOption;
  label: string;
}[] = [
  { value: "never", label: "Never" },
  { value: "1d", label: "After 1 day" },
  { value: "3d", label: "After 3 days" },
  { value: "1w", label: "After 1 week" },
  { value: "2w", label: "After 2 weeks" },
  { value: "1m", label: "After 1 month" },
  { value: "custom", label: "Custom date" },
];

/**
 * Resolves an auto-delete choice into an absolute ISO timestamp, or null
 * when the content should never expire.
 *
 * Pure and side-effect free — `now` is injectable so this can be unit
 * tested without freezing the clock.
 */
export function computeAutoDeleteAt(
  option: AutoDeleteOption,
  custom: string,
  now: Date = new Date(),
): string | null {
  const shifted = (apply: (date: Date) => void): string => {
    const date = new Date(now.getTime());
    apply(date);
    return date.toISOString();
  };

  switch (option) {
    case "never":
      return null;

    case "1d":
      return shifted((d) => d.setDate(d.getDate() + 1));

    case "3d":
      return shifted((d) => d.setDate(d.getDate() + 3));

    case "1w":
      return shifted((d) => d.setDate(d.getDate() + 7));

    case "2w":
      return shifted((d) => d.setDate(d.getDate() + 14));

    case "1m":
      return shifted((d) => d.setMonth(d.getMonth() + 1));

    case "custom":
      return custom ? new Date(custom).toISOString() : null;

    default:
      return null;
  }
}