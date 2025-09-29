import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Maps workflow status to progress modal step index
 */
export function statusToStepIndex(status: string): 0 | 1 | 2 | 3 {
  switch (status) {
    case "running":
    case "address-start":
    case "lookup-start":
      return 0
    case "scrape-start":
      return 1
    case "appraise-start":
      return 2
    case "done":
      return 3
    default:
      return 0
  }
}
