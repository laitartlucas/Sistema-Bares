// Lightweight class merging utility (replaces clsx + tailwind-merge)
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
