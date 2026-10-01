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
/** Selected labels in saved schema order, followed by values no longer in the schema. */
export function selectedOptionLabels(component: FormComponent, value: any): string[] {
  if (isMissing(value)) return []
  const selected =
    component.type === "selectboxes"
      ? Object.keys(value).filter((key) => value[key])
      : Array.isArray(value)
        ? value
        : [value]
  const remaining = new Map(selected.map((entry) => [String(entry), entry]))
  const labels: string[] = []
  for (const option of component.values || component.data?.values || []) {
    const key = String(option.value)
    if (remaining.has(key)) {
      labels.push(optionLabel(component, remaining.get(key)))
      remaining.delete(key)
    }
  }
  return labels.concat(Array.from(remaining.values(), (entry) => optionLabel(component, entry)))
}
export function fieldValue(component: FormComponent, value: any): string {
  if (isMissing(value)) return NOT_PROVIDED
  if (component.type === "selectboxes") return selectedOptionLabels(component, value).join("; ") || NOT_PROVIDED
  if (["select", "radio"].includes(component.type))
    return selectedOptionLabels(component, value).join("; ") || NOT_PROVIDED
  if (["datetime", "date", "day"].includes(component.type) && typeof value === "string") {
    // Preserve date-only values without a timezone shift.
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) return date.toLocaleString("en-CA", { timeZone: "America/Vancouver" })
  }
  const result = displayValue(value)
  return [component.prefix, result, component.suffix].filter((v) => v !== undefined && v !== "").join(" ")
}
