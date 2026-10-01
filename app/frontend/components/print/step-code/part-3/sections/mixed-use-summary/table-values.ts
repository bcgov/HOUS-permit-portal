import { isMissing } from "../../../../form/field-values"

export const numberValue = (value: unknown) =>
  isMissing(value) || !Number.isFinite(Number(value)) ? "-" : Number(value).toFixed(2)
export const complianceValue = (value: unknown) => (isMissing(value) ? "-" : value ? "Yes" : "No")
