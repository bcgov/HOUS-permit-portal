import validationComponents from "formiojs/components/datetime/editForm/DateTime.edit.validation"
import common from "../../Common/Advanced.edit.validation.js"
import { reArrangeComponents } from "../../Common/function.js"
const neededposition = [
  "validate.isUseForCopy",
  "validateOn",
  "validate.required",
  "enableMinDateInput",
  "datePicker.minDate",
  "enableMaxDateInput",
  "datePicker.maxDate",
  "unique",
  "errorLabel",
  "validate.customMessage",
  "custom-validation-js",
  "json-validation-json",
  "errors",
]
const newPosition = reArrangeComponents(neededposition, [...validationComponents, ...common])
export default newPosition
