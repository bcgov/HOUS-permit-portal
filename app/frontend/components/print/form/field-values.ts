export const NOT_PROVIDED = "Not provided"
export type FormComponent = Record<string, any>
export function isMissing(value: unknown): boolean {
  return (
    value == null || (typeof value === "string" && value.trim() === "") || (Array.isArray(value) && value.length === 0)
  )
}
export function displayValue(value: any): string {
  if (isMissing(value)) return NOT_PROVIDED
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (Array.isArray(value)) return value.map(displayValue).join("; ")
  if (typeof value === "object") {
    const address = value.properties?.fullAddress || value.display_name || value.displayName || value.formatted_address
    if (address) return address
    if (Object.keys(value).length === 0) return NOT_PROVIDED
    return Object.entries(value)
      .map(([key, entry]) => `${key}: ${displayValue(entry)}`)
      .join("\n")
  }
  return String(value)
}
export function optionLabel(component: FormComponent, value: any): string {
  const options = component.values || component.data?.values || []
  const selected = options.find((option: any) => String(option.value) === String(value))
  return selected?.label ?? displayValue(value)
}
export function fieldValue(component: FormComponent, value: any): string {
  if (isMissing(value)) return NOT_PROVIDED
  if (component.type === "selectboxes") {
    const selected = Object.keys(value)
      .filter((key) => value[key])
      .map((key) => optionLabel(component, key))
    return selected.length ? selected.join("; ") : NOT_PROVIDED
  }
  if (["select", "radio"].includes(component.type))
    return Array.isArray(value) ? value.map((v) => optionLabel(component, v)).join("; ") : optionLabel(component, value)
  if (["datetime", "date", "day"].includes(component.type) && typeof value === "string") {
    // Preserve date-only values without a timezone shift.
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) return date.toLocaleString("en-CA", { timeZone: "America/Vancouver" })
  }
  const result = displayValue(value)
  return [component.prefix, result, component.suffix].filter((v) => v !== undefined && v !== "").join(" ")
}
