import validationComponents from "formiojs/components/radio/editForm/Radio.edit.validation"
import common from "../../Common/Advanced.edit.validation.js"
import { reArrangeComponents } from "../../Common/function.js"
const neededposition = [
  "validate.isUseForCopy",
  "validate.required",
  "validate.onlyAvailableItems",
  "errorLabel",
  "validate.customMessage",
  "custom-validation-js",
  "json-validation-json",
  "errors",
]
const newPosition = reArrangeComponents(neededposition, [...validationComponents, ...common])
export default newPosition
