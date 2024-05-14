export const fieldArrayCompatibleErrorMessage = (fieldName, errors) => {
  // Used to capture different behaviour for errors in basic use of useFieldArray
  // For more deeply nested field arrays, please use a custom component
  const fieldNameSplit = fieldName.split(".")
  const fieldNameRoot = fieldNameSplit[0]
  const fieldNameIndexStr = fieldNameSplit[1]
  const fieldNameIndex = fieldNameIndexStr && parseInt(fieldNameIndexStr)
  const fieldNameSuffix = fieldNameSplit[2]
  const isFieldArray = !!fieldNameSuffix

  return isFieldArray
    ? errors?.[fieldNameRoot]?.[fieldNameIndex]?.[fieldNameSuffix]?.message
    : (errors?.[fieldName]?.message as string)
}
