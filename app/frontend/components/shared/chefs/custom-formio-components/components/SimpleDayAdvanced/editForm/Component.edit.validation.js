import validationComponents from "formiojs/components/day/editForm/Day.edit.validation"
import { interopDefault } from "../../../../../../../utils/interop-default"
import common from "../../Common/Advanced.edit.validation.js"
import { reArrangeComponents } from "../../Common/function.js"

const neededposition = [
  "validate.isUseForCopy",
  "validateOn",
  "fields.day.required",
  "fields.month.required",
  "fields.year.required",
  "maxDate",
  "minDate",
  "unique",
  "errorLabel",
  "validate.customMessage",
  "custom-validation-js",
  "json-validation-json",
  "errors",
]
const validationComponentItems = interopDefault(validationComponents)

const newPosition = reArrangeComponents(neededposition, [...validationComponentItems, ...common])
export default newPosition
