import { isMissing } from "../../../../form/field-values"

export const numberValue = (value: unknown) =>
  isMissing(value) || !Number.isFinite(Number(value)) ? "-" : Number(value).toFixed(2)
export const complianceValue = (value: unknown) => {
  if (isMissing(value)) return "-"
  return value ? "Yes" : "No"
}
