import { format } from "date-fns"
import { utcToZonedTime } from "date-fns-tz"
import { STEP_CODE_PACKAGE_FILE_REQUIREMENT_CODE, vancouverTimeZone } from "../constants"
import { ERequirementType } from "../types/enums"
import { TDebouncedFunction } from "../types/types"

export function isUUID(str) {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return regex.test(str)
}

export function generateUUID() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (parseInt(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (parseInt(c) / 4)))).toString(16)
  )
}

/**
 * Prevent users from triggering the provided function multiple times within a the specified {delay} time period.
 */
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
  const multiOptionRequirementFields = [
    ERequirementType.radio,
    ERequirementType.select,
    ERequirementType.multiOptionSelect,
  ]
  return multiOptionRequirementFields.includes(requirementType)
}

export function isContactRequirement(requirementType: ERequirementType): boolean {
  const contactRequirementFields = [ERequirementType.generalContact, ERequirementType.professionalContact]
  return contactRequirementFields.includes(requirementType)
}

export function isQuillEmpty(value: string) {
  if (!value || (value.replace(/<(.|\n)*?>/g, "").trim().length === 0 && !value.includes("<img"))) {
    return true
  }
  return false
}

export function parseBoolean(value: string): boolean {
  return value.toLowerCase() === "true"
}

export function handleScrollToTop() {
  document.documentElement.scrollTo({
    top: 0,
    behavior: "instant",
  })
  document.body.scrollTop = 0 // For Safari
}

export function handleScrollToBottom() {
  window.scrollTo(0, document.body.scrollHeight)
}

export function formatTemplateVersion(versionDate: Date) {
  const timeZonedDate = utcToZonedTime(versionDate, vancouverTimeZone)
  return `v.${format(timeZonedDate, "yyyy.MM.dd")}`
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

export function renameKeys(keysMap, obj) {
  return Object.keys(obj).reduce(
    (acc, key) => ({
      ...acc,
      ...{ [keysMap[key] || key]: obj[key] },
    }),
    {}
  )
}

export function isStepCodePackageFileRequirementCode(requirementCode: string) {
  return requirementCode === STEP_CODE_PACKAGE_FILE_REQUIREMENT_CODE
}
