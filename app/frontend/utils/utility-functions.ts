import { format } from "date-fns"
import { utcToZonedTime } from "date-fns-tz"
import {
  OPTIONS_MAPPER_AUTO_COMPLIANCE_TYPES,
  VALUE_EXTRACTION_AUTO_COMPLIANCE_TYPES,
  vancouverTimeZone,
} from "../constants"
import {
  EEnergyStepCodeDependencyRequirementCode,
  EEnergyStepCodePart3DependencyRequirementCode,
  ERequirementType,
} from "../types/enums"
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

export function keysToCamelCase(obj) {
  const correctCamelCaseKey = (key: string) =>
    key
      .split(/[-_]/)
      .map((part, index) => {
        if (index === 0) {
          return part
        }
        return part.charAt(0).toUpperCase() + part.slice(1)
      })
      .join("")

  if (Array.isArray(obj)) {
    return obj.map((v) => keysToCamelCase(v))
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [correctCamelCaseKey(key)]: keysToCamelCase(obj[key]),
      }),
      {}
    )
  }
  return obj
}

export function setQueryParam(key: string, value: string | string[]) {
  const searchParams = new URLSearchParams(window.location.search)
  const isEmptyArray = Array.isArray(value) && value.length === 0
  const isEmptyString = typeof value === "string" && value.trim() === ""

  if (!value || isEmptyArray || isEmptyString) {
    searchParams.delete(key)
  } else {
    const serialized = Array.isArray(value) ? value.join(",") : value
    searchParams.set(key, serialized)
  }
  const stringParams = searchParams.toString()
  const newUrl = `${window.location.pathname}${stringParams ? "?" + stringParams : ""}`
  window.history.replaceState({}, "", newUrl)
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

/**
 * Checks if editor HTML content is empty (only whitespace/empty tags).
 */
export function isTipTapEmpty(value: string) {
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

export function isArchitecturalDrawingRequirement(inputType?: ERequirementType): boolean {
  return inputType === ERequirementType.architecturalDrawing
}

export function isEnergyStepCodeDependencyRequirementCode(
  requirementCode?: string | null,
  inputType?: ERequirementType
): requirementCode is EEnergyStepCodeDependencyRequirementCode | EEnergyStepCodePart3DependencyRequirementCode {
  if (inputType === ERequirementType.energyStepCodePart9 || inputType === ERequirementType.energyStepCodePart3) {
    return true
  }

  if (!requirementCode) return false

  return (
    Object.values(EEnergyStepCodeDependencyRequirementCode).includes(
      requirementCode as EEnergyStepCodeDependencyRequirementCode
    ) ||
    Object.values(EEnergyStepCodePart3DependencyRequirementCode).includes(
      requirementCode as EEnergyStepCodePart3DependencyRequirementCode
    )
  )
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

export function getCurrentSandboxId() {
  const sandboxStore = localStorage.getItem("SandboxStore")
  if (!sandboxStore) return null // Return null if SandboxStore is not found

  try {
    const parsedStore = JSON.parse(sandboxStore)
    // Return currentSandboxId or null if not set
    return parsedStore.currentSandboxId || null
  } catch (error) {
    console.error("Failed to parse SandboxStore from localStorage:", error)
    return null
  }
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

export async function downloadFileFromStorage(options: {
  model: string
  modelId?: string
  filename: string
}): Promise<void> {
  const { model, modelId, filename } = options
  console.log("[DownloadDebug] Attempting to download:", { model, modelId, filename })
  try {
    const response = await fetch(`/api/s3/params/download?model=${model}&modelId=${modelId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("[DownloadDebug] Received data from API:", data)
    if (!data.url) throw new Error("No URL found in response")

    console.log("[DownloadDebug] S3 URL:", data.url)
    // Preferred: fetch as Blob and force a download (works regardless of Content-Disposition)
    try {
      const fileResp = await fetch(data.url)
      if (!fileResp.ok) throw new Error(`File GET failed: ${fileResp.status}`)
      const blob = await fileResp.blob()
      const mimeType = fileResp.headers.get("content-type") || "application/octet-stream"
      startBlobDownload(blob, mimeType, filename || "download")
      return
    } catch (e) {
      console.warn("[DownloadDebug] Blob fetch failed, falling back to anchor navigation", e)
      // Fallback: navigate via anchor – relies on server's Content-Disposition: attachment
      const a = document.createElement("a")
      a.href = data.url
      a.download = filename
      a.rel = "noopener"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  } catch (error) {
    console.error("Failed to download file:", error)
    throw error
  }
}

/**
 * Downloads a file from a URL by creating a temporary anchor element
 * @param url - The URL to download from
 * @param filename - The filename for the downloaded file
 */
export function downloadFileFromUrl(url: string, filename: string): void {
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.rel = "noopener"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function isSafari() {
  // Check if the browser is Safari
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
}

/**
 * Converts a number to a localized string representation (defaults to en-CA)
 * @param value - Number to format
 * @param options - Intl.NumberFormatOptions for additional formatting options
 * @param locale - BCP 47 language tag (e.g., 'en-CA', 'fr-CA')
 * @returns Formatted string or empty string if value is null/undefined
 */
export function numberToFormattedString(
  value: number | null | undefined,
  options: Intl.NumberFormatOptions = {},
  locale: string = "en-CA"
): string {
  if (value === null || value === undefined) return ""

  return value.toLocaleString(locale, {
    maximumFractionDigits: 3,
    ...options,
  })
}

/**
 * Converts a formatted string back to a number
 * @param value - Formatted string to parse (e.g., "1,234.56")
 * @returns Parsed number or 0 if input is empty/invalid
 */
export function formattedStringToNumber(value: string): number {
  const rawValue = value.replace(/,/g, "")?.trim()

  if (!rawValue) return 0

  const parsedValue = Number(rawValue)
  return !isNaN(parsedValue) ? parsedValue : 0
}

// Step Code helpers (shared across PDF and HTML components)
export function getStepCodeOccupancies(checklist: any) {
  const stepCodeOccs = Array.isArray(checklist?.stepCodeOccupancies) ? checklist.stepCodeOccupancies : []
  const baselineOccs = Array.isArray(checklist?.baselineOccupancies) ? checklist.baselineOccupancies : []
  return { stepCodeOccs, baselineOccs }
}

export function isMixedUseChecklist(checklist: any): boolean {
  const { stepCodeOccs, baselineOccs } = getStepCodeOccupancies(checklist)
  return stepCodeOccs.length + baselineOccs.length > 1
}

export function isBaselineChecklist(checklist: any): boolean {
  const { stepCodeOccs } = getStepCodeOccupancies(checklist)
  return stepCodeOccs.length === 0
}

/**
 * Escapes a string for use inside a single-quoted JavaScript string literal.
 * It escapes backslashes first, then single quotes.
 */
export function escapeForSingleQuotedJsString(str: string | null | undefined): string {
  if (!str) return ""
  return str.replace(/\\/g, "\\\\").replace(/'/g, "\\'")
}
