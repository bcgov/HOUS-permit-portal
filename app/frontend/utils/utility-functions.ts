import { format } from "date-fns"
import { utcToZonedTime } from "date-fns-tz"
import {
  OPTIONS_MAPPER_AUTO_COMPLIANCE_TYPES,
  STEP_CODE_PACKAGE_FILE_REQUIREMENT_CODE,
  VALUE_EXTRACTION_AUTO_COMPLIANCE_TYPES,
  vancouverTimeZone,
} from "../constants"
import { ERequirementType } from "../types/enums"
import { TAutoComplianceModuleConfiguration, TDebouncedFunction } from "../types/types"

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

export function setQueryParam(key: string, value: string | string[]) {
  const searchParams = new URLSearchParams(window.location.search)
  if (!value) {
    searchParams.delete(key)
  } else {
    // @ts-ignore
    searchParams.set(key, value)
  }
  const stringParams = searchParams.toString()
  window.history.replaceState({}, "", `${window.location.pathname}${stringParams ? "?" + stringParams : ""}`)
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

export function startBlobDownload(blobData: BlobPart, mimeType: string, fileName: string) {
  const blob = new Blob([blobData], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = fileName
  a.click()
  window.URL.revokeObjectURL(url)
}

export function isStepCodePackageFileRequirementCode(requirementCode: string) {
  return requirementCode === STEP_CODE_PACKAGE_FILE_REQUIREMENT_CODE
}

export function convertE164PhoneToInputDefault(e164PhoneNumber: string): string {
  if (!e164PhoneNumber) return ""

  // Removes the + from a database formatted number to make it fit in our max lengthed inputs
  return e164PhoneNumber.substring(2)
}

export function convertPhoneNumberToFormioFormat(phoneNumber: string): string {
  // Remove any non-numeric characters, especially the leading '+'
  if (!phoneNumber) return ""

  let digits = phoneNumber.replace(/\D+/g, "")

  // Modified to handle converting both from user input format and database e164 format
  if (digits.length === 11) digits = digits.substring(1)

  // Extract the area code, first three digits, and last four digits
  const areaCode = digits.substring(0, 3)
  const firstThree = digits.substring(3, 6)
  const lastFour = digits.substring(6, 10)

  // Return the formatted phone number
  return `(${areaCode}) ${firstThree}-${lastFour}`
}

export function isValueExtractorModuleConfiguration(moduleConfiguration?: TAutoComplianceModuleConfiguration) {
  return VALUE_EXTRACTION_AUTO_COMPLIANCE_TYPES.includes(moduleConfiguration?.type)
}

export function isOptionsMapperModuleConfiguration(moduleConfiguration?: TAutoComplianceModuleConfiguration) {
  return OPTIONS_MAPPER_AUTO_COMPLIANCE_TYPES.includes(moduleConfiguration?.type)
}

export function removePrefix(str: string, prefix: string) {
  return str.startsWith(prefix) ? str.slice(prefix.length) : str
}

export async function delay(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
}

export const arrayEqualsAsSet = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) return false
  const setA = new Set(a)
  const setB = new Set(b)
  for (let item of setA) {
    if (!setB.has(item)) return false
  }
  return true
}

export function convertResourceArrayToRecord<
  ResourceT extends {
    id: string
  },
>(resources: ResourceT[]): Record<string, ResourceT> {
  return resources.reduce((acc, resource) => {
    acc[resource.id] = resource
    return acc
  }, {})
}

export function getCsrfToken() {
  // csrfToken is set as readable cookie by backend, send it in every request
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("CSRF-TOKEN="))
    ?.split("=")[1]
}

export function convertToDate(property: any) {
  if (!(property instanceof Date)) {
    return new Date(property)
  }
  return property
}

export function formatPidValue(pid?: string) {
  if (!pid) return null

  return pid.replace(/[^a-zA-Z0-9]/g, "")
}

export function formatPidLabel(pid?: string) {
  if (!pid) return null
  // Remove all non-numeric characters
  const numericString = pid.replace(/\D/g, "")

  // Add a dash after every third character
  return numericString.replace(/(\d{3})(?=\d)/g, "$1-")
}

export function urlForPath(path: string): string {
  // Ensure the path starts with a slash for consistent URLs
  const normalizedPath = path.startsWith("/") ? path : `/${path}`

  // Construct the full URL using the base URL from window.location
  const baseUrl = `${window.location.protocol}//${window.location.host}`

  return `${baseUrl}${normalizedPath}`
}

export function isSafari() {
  // Check if the browser is Safari
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
}
