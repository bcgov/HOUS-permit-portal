import NumberEditValidation from "formiojs/components/number/editForm/Number.edit.validation"
import common from "../../Common/Advanced.edit.validation.js"
import { reArrangeComponents } from "../../Common/function.js"
const neededposition = [
  "validate.isUseForCopy",
  "validateOn",
  "validate.required",
  "validate.min",
  "validate.max",
  "errorLabel",
  "validate.customMessage",
  "errors",
  "custom-validation-js",
  "json-validation-json",
]
const newPosition = reArrangeComponents(neededposition, [...NumberEditValidation, ...common])
export default newPosition
