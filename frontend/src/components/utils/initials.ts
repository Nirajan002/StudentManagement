export function initials(name: string) {
  return (name || "")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function isImageFile(name?: string | null) {
  if (!name) return false;

  return /\.(jpe?g|png|gif|webp|svg)$/i.test(name);
}