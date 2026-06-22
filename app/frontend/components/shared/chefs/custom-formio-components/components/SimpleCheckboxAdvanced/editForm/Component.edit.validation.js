import validationComponents from "formiojs/components/checkbox/editForm/Checkbox.edit.validation"
import { interopDefault } from "../../../../../../../utils/interop-default"
import common from "../../Common/Advanced.edit.validation.js"
import { reArrangeComponents } from "../../Common/function.js"

const neededposition = [
  "validate.isUseForCopy",
  "validate.required",
  "errorLabel",
  "validate.customMessage",
  "custom-validation-js",
  "json-validation-json",
  "errors",
]
const validationComponentItems = interopDefault(validationComponents)

const newPosition = reArrangeComponents(neededposition, [...validationComponentItems, ...common])
export default newPosition
