export const numberValue = (value: unknown) =>
  value == null || value === "" || !Number.isFinite(Number(value)) ? "Not provided" : Number(value).toFixed(2)
export const complianceValue = (value: unknown) => (value == null ? "Not provided" : value ? "Yes" : "No")
