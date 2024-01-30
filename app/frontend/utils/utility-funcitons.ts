import { ERequirementType } from "../types/enums"
import { TDebouncedFunction } from "../types/types"

export function isUUID(str) {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return regex.test(str)
}

export function debounce<T extends (...args: any[]) => any>(func: T, delay: number): TDebouncedFunction<T> {
  let timeoutId: NodeJS.Timeout

  return function (...args: Parameters<T>): void {
    clearTimeout(timeoutId)

    timeoutId = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

export function toCamelCase(input: string): string {
  return (
    input
      // Split the string by '-' (for kebab-case) or '_' (for snake_case)
      .split(/[-_]/)
      // Transform each part: capitalize the first letter of each part except the first one
      .map((part, index) => {
        if (index === 0) {
          // The first part remains in lower case
          return part.toLowerCase()
        }
        // Capitalize the first letter of each subsequent part
        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      })
      // Join all parts back together
      .join("")
  )
}

export function setQueryParam(key: string, value: string) {
  const searchParams = new URLSearchParams(window.location.search)
  if (!value) {
    searchParams.delete(key)
  } else {
    searchParams.set(key, encodeURIComponent(value))
  }
  window.history.replaceState({}, "", `${window.location.pathname}?${searchParams.toString()}`)
}

export function isMultiOptionRequirement(requirementType: ERequirementType): boolean {
  const multiOptionRequirementFields = [ERequirementType.radio, ERequirementType.checkbox, ERequirementType.select]
  return multiOptionRequirementFields.includes(requirementType)
}

export function isQuillEmpty(value: string) {
  if (!value || (value.replace(/<(.|\n)*?>/g, "").trim().length === 0 && !value.includes("<img"))) {
    return true
  }
  return false
}
