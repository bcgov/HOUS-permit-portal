import validationComponents from "formiojs/components/radio/editForm/Radio.edit.validation"
import { interopDefault } from "../../../../../../../utils/interop-default"
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
const validationComponentItems = interopDefault(validationComponents)

const newPosition = reArrangeComponents(neededposition, [...validationComponentItems, ...common])
export default newPosition
