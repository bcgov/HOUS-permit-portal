import { path } from "ramda"

export const fieldArrayCompatibleErrorMessage = (fieldName, errors) => {
  const fieldNameSplit = fieldName.split(".")

  return path([...fieldNameSplit, "message"], errors)
}
