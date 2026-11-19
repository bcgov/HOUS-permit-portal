import { path } from "ramda"
import { FieldErrors } from "react-hook-form"

export const fieldArrayCompatibleErrorMessage = (fieldName: string, errors: FieldErrors): string | undefined => {
  const fieldNameSplit = fieldName.split(".")

  const message = path([...fieldNameSplit, "message"], errors)
  return typeof message === "string" ? message : undefined
}
